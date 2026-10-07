import logging
from typing import Optional
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.project import Proyek, ProyekStatus, TahapanProgres
from app.models.evaluation import EvaluasiPembangunan, EvaluasiStatus
from app.services.notification_service import send_project_update_notifications

logger = logging.getLogger(__name__)

# Ambang batas skor urgensi AI untuk transisi otomatis ke 'dalam_peninjauan_ulang'
# Skala 1 (ringan/kosmetik) hingga 5 (kritis/berbahaya struktural).
# Nilai >= 4 mengindikasikan risiko keselamatan publik tinggi atau kerusakan struktural parah.
AMBANG_URGENSI_OTOMATIS = 4


def sync_project_status_on_new_evaluation(
    db: Session,
    evaluasi: EvaluasiPembangunan,
    current_user_id: int,
    background_tasks: BackgroundTasks
) -> bool:
    """
    Aturan 1 (Laporan Baru):
    Ketika sebuah evaluasi_pembangunan BARU dibuat untuk proyek yang berstatus 'selesai',
    dan skor_urgensi_ai >= 4, proyek.status otomatis berubah menjadi 'dalam_peninjauan_ulang'.
    Mencatat entri baru ke tahapan_progres (audit trail) dan mengirim notifikasi ke subscriber.
    Jika skor < 4, status proyek tetap 'selesai' dan menunggu verifikasi manual admin dinas.
    """
    proyek = evaluasi.proyek or db.query(Proyek).filter(Proyek.id == evaluasi.proyek_id).first()
    if not proyek:
        return False

    if (
        proyek.status == ProyekStatus.selesai
        and evaluasi.skor_urgensi_ai is not None
        and evaluasi.skor_urgensi_ai >= AMBANG_URGENSI_OTOMATIS
    ):
        proyek.status = ProyekStatus.dalam_peninjauan_ulang

        catatan_audit = (
            f"Status otomatis berubah ke 'dalam_peninjauan_ulang' akibat laporan evaluasi "
            f"#{evaluasi.id} ({evaluasi.kategori_masalah}) dengan skor urgensi AI {evaluasi.skor_urgensi_ai}."
        )
        histori = TahapanProgres(
            proyek_id=proyek.id,
            nama_tahap="Peninjauan Ulang Proyek (Otomatis AI)",
            progres_persen=proyek.progres_persen,
            catatan=catatan_audit,
            dicatat_oleh=current_user_id
        )
        db.add(histori)
        db.commit()
        db.refresh(proyek)

        pesan_notif = (
            f"Status proyek '{proyek.nama_proyek}' otomatis berubah menjadi 'dalam_peninjauan_ulang' "
            f"akibat laporan evaluasi pasca-proyek dengan skor urgensi tinggi ({evaluasi.skor_urgensi_ai}/5)."
        )
        background_tasks.add_task(
            send_project_update_notifications,
            proyek_id=proyek.id,
            pesan=pesan_notif,
            exclude_user_id=current_user_id
        )
        return True

    return False


def sync_project_status_on_evaluation_verification(
    db: Session,
    evaluasi: EvaluasiPembangunan,
    status_baru: EvaluasiStatus,
    admin_user: User,
    catatan_admin: Optional[str],
    background_tasks: BackgroundTasks
) -> bool:
    """
    Aturan 2:
    Ketika evaluasi_pembangunan.status diubah MANUAL oleh admin dinas/pimpinan menjadi
    'terverifikasi_perlu_tindak_lanjut' (atau 'dalam_peninjauan_ulang'), dan proyek belum
    'dalam_peninjauan_ulang', maka proyek.status otomatis berubah menjadi 'dalam_peninjauan_ulang'.

    Aturan 3:
    Ketika evaluasi_pembangunan.status diubah menjadi 'selesai_ditindaklanjuti' atau 'ditolak_tidak_terbukti',
    dan proyek saat ini berstatus 'dalam_peninjauan_ulang', cek apakah masih ada evaluasi aktif lain
    (status 'menunggu_verifikasi', 'dalam_peninjauan_ulang', 'terverifikasi_perlu_tindak_lanjut')
    untuk proyek yang sama. Jika TIDAK ADA, proyek.status otomatis kembali ke 'selesai'.
    """
    proyek = evaluasi.proyek or db.query(Proyek).filter(Proyek.id == evaluasi.proyek_id).first()
    if not proyek:
        return False

    # Aturan 2: Verifikasi memerlukan tindak lanjut -> masuk status 'dalam_peninjauan_ulang'
    if status_baru in [EvaluasiStatus.terverifikasi_perlu_tindak_lanjut, EvaluasiStatus.dalam_peninjauan_ulang]:
        if proyek.status != ProyekStatus.dalam_peninjauan_ulang:
            proyek.status = ProyekStatus.dalam_peninjauan_ulang
            catatan_audit = (
                f"Status proyek berubah ke 'dalam_peninjauan_ulang' setelah laporan evaluasi "
                f"#{evaluasi.id} ({evaluasi.kategori_masalah}) diverifikasi oleh {admin_user.nama} "
                f"({status_baru.value}). Catatan: {catatan_admin or '-'}"
            )
            histori = TahapanProgres(
                proyek_id=proyek.id,
                nama_tahap="Peninjauan Ulang Proyek (Verifikasi Dinas)",
                progres_persen=proyek.progres_persen,
                catatan=catatan_audit,
                dicatat_oleh=admin_user.id
            )
            db.add(histori)
            db.commit()
            db.refresh(proyek)

            pesan_notif = (
                f"Status proyek '{proyek.nama_proyek}' berubah menjadi 'dalam_peninjauan_ulang' "
                f"setelah verifikasi dinas terhadap evaluasi #{evaluasi.id}."
            )
            background_tasks.add_task(
                send_project_update_notifications,
                proyek_id=proyek.id,
                pesan=pesan_notif,
                exclude_user_id=admin_user.id
            )
            return True

    # Aturan 3: Evaluasi diselesaikan atau ditolak -> kembalikan ke 'selesai' jika tidak ada evaluasi aktif lain
    elif status_baru in [EvaluasiStatus.selesai_ditindaklanjuti, EvaluasiStatus.ditolak_tidak_terbukti]:
        if proyek.status == ProyekStatus.dalam_peninjauan_ulang:
            active_statuses = [
                EvaluasiStatus.menunggu_verifikasi,
                EvaluasiStatus.dalam_peninjauan_ulang,
                EvaluasiStatus.terverifikasi_perlu_tindak_lanjut
            ]
            other_active_count = db.query(EvaluasiPembangunan).filter(
                EvaluasiPembangunan.proyek_id == proyek.id,
                EvaluasiPembangunan.id != evaluasi.id,
                EvaluasiPembangunan.status.in_(active_statuses)
            ).count()

            if other_active_count == 0:
                proyek.status = ProyekStatus.selesai
                catatan_audit = (
                    f"Status proyek dikembalikan ke 'selesai' setelah evaluasi #{evaluasi.id} "
                    f"ditandai '{status_baru.value}' oleh {admin_user.nama} dan seluruh evaluasi aktif telah tuntas."
                )
                histori = TahapanProgres(
                    proyek_id=proyek.id,
                    nama_tahap="Pemulihan Status Proyek (Selesai)",
                    progres_persen=proyek.progres_persen,
                    catatan=catatan_audit,
                    dicatat_oleh=admin_user.id
                )
                db.add(histori)
                db.commit()
                db.refresh(proyek)

                pesan_notif = (
                    f"Status proyek '{proyek.nama_proyek}' telah kembali menjadi 'selesai' "
                    f"setelah seluruh tindak lanjut evaluasi pasca-proyek selesai."
                )
                background_tasks.add_task(
                    send_project_update_notifications,
                    proyek_id=proyek.id,
                    pesan=pesan_notif,
                    exclude_user_id=admin_user.id
                )
                return True

    return False
