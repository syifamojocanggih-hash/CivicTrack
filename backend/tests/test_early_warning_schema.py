import pytest
from datetime import date, datetime, timedelta
from app.models.user import User, UserRole, WilayahAdministratif, WilayahLevel, Dinas
from app.models.project import Proyek, ProyekStatus, ProyekKategori

def test_early_warning_model_and_lead_time(db_session):
    # Setup prerequisite records
    wilayah = WilayahAdministratif(
        kode_wilayah="35.24.18",
        nama_wilayah="Kecamatan Sukodadi",
        level=WilayahLevel.kecamatan
    )
    db_session.add(wilayah)
    dinas = Dinas(nama_dinas="Dinas PU Bina Marga")
    db_session.add(dinas)
    user = User(
        nama="Admin Dinas Test",
        email="admindinas_test@lamongankab.go.id",
        password_hash="test",
        role=UserRole.admin_dinas
    )
    db_session.add(user)
    db_session.commit()

    today = date.today()
    contract_date = today - timedelta(days=10)
    planned_start = today + timedelta(days=50)

    # 1. Test Planned Project
    proyek_planned = Proyek(
        nama_proyek="Pembangunan Flyover Simpang Sukodadi",
        kategori=ProyekKategori.jembatan,
        deskripsi="Pembangunan flyover perlintasan sebidang JPL 293 Sukodadi",
        latitude=-7.1152,
        longitude=112.3324,
        wilayah_id=wilayah.id,
        dinas_id=dinas.id,
        anggaran=45000000000,
        status=ProyekStatus.planned,
        progres_persen=0,
        tanggal_mulai=planned_start,
        estimasi_selesai=planned_start + timedelta(days=360),
        tanggal_kontrak_terbit=contract_date,
        tanggal_mulai_rencana=planned_start,
        radius_dampak_meter=1500,
        jalur_terdampak='["Jl. Raya Sukodadi - Babat", "Perlintasan KA Sukodadi"]',
        dibuat_oleh=user.id,
        kode_proyek="SKD-FLY-001",
        kode_akses="PJ-12345"
    )
    db_session.add(proyek_planned)
    db_session.commit()
    db_session.refresh(proyek_planned)

    assert proyek_planned.status == ProyekStatus.planned
    assert proyek_planned.radius_dampak_meter == 1500
    assert proyek_planned.tanggal_kontrak_terbit == contract_date
    assert proyek_planned.tanggal_mulai_rencana == planned_start
    assert proyek_planned.lead_time_hari is not None
    # lead_time_hari = planned_start - tanggal_input_sistem.date() == 50 days
    assert proyek_planned.lead_time_hari >= 49

    # 2. Test Scheduled Project
    scheduled_start = today + timedelta(days=7)
    proyek_scheduled = Proyek(
        nama_proyek="Rekonstruksi Drainase Jl. Suwoko",
        kategori=ProyekKategori.drainase,
        deskripsi="Normalisasi drainase perkotaan",
        latitude=-7.1205,
        longitude=112.4150,
        wilayah_id=wilayah.id,
        dinas_id=dinas.id,
        anggaran=3500000000,
        status=ProyekStatus.scheduled,
        progres_persen=0,
        tanggal_mulai=scheduled_start,
        estimasi_selesai=scheduled_start + timedelta(days=90),
        tanggal_kontrak_terbit=today - timedelta(days=20),
        tanggal_mulai_rencana=scheduled_start,
        radius_dampak_meter=1200,
        jalur_terdampak='["Jl. Suwoko", "Simpang Jl. KH Ahmad Dahlan"]',
        dibuat_oleh=user.id,
        kode_proyek="LMG-DRN-001",
        kode_akses="PJ-54321"
    )
    db_session.add(proyek_scheduled)
    db_session.commit()
    db_session.refresh(proyek_scheduled)

    assert proyek_scheduled.status == ProyekStatus.scheduled
    assert proyek_scheduled.radius_dampak_meter == 1200
    assert proyek_scheduled.lead_time_hari >= 6

def test_proyek_status_enum_mapping():
    assert ProyekStatus("direncanakan") == ProyekStatus.planned
    assert ProyekStatus("planned") == ProyekStatus.planned
    assert ProyekStatus("akan_dimulai") == ProyekStatus.scheduled
    assert ProyekStatus("scheduled") == ProyekStatus.scheduled
    assert ProyekStatus("in_progress") == ProyekStatus.in_progress
    assert ProyekStatus("berjalan") == ProyekStatus.berjalan
    assert ProyekStatus("completed") == ProyekStatus.completed
    assert ProyekStatus("selesai") == ProyekStatus.selesai
    assert ProyekStatus("suspended") == ProyekStatus.suspended
    assert ProyekStatus("ditangguhkan") == ProyekStatus.ditangguhkan
