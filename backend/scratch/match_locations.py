import sys
sys.path.insert(0, '/app')
from app.core.database import SessionLocal
from app.models.user import WilayahAdministratif
import json
from scratch.generate_civictrack_dataset import projects_data

db = SessionLocal()
kecs = db.query(WilayahAdministratif).filter(WilayahAdministratif.level == 'kecamatan').all()
kec_by_name = {}
for k in kecs:
    clean = k.nama_wilayah.lower().replace('kecamatan ', '').replace(' (kota)', '').strip()
    kec_by_name[clean] = (k.id, k.nama_wilayah)

desas = db.query(WilayahAdministratif).filter(WilayahAdministratif.level == 'desa').all()

# Mapping OPD to dinas_id
# 1: Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan
# 2: Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan
# 3: Dinas Lingkungan Hidup Kabupaten Lamongan
# 4: Dinas Sumber Daya Air Kabupaten Lamongan
# 5: Dinas Kesehatan Kabupaten Lamongan
def get_dinas_id(opd_name):
    opd = opd_name.lower()
    if "sumber daya air" in opd or "sda" in opd:
        return 4
    elif "kesehatan" in opd or "rsud" in opd:
        return 5
    elif "perumahan" in opd or "cipta karya" in opd or "perkim" in opd:
        return 2
    elif "lingkungan hidup" in opd:
        return 3
    else: # Bina marga, bbpjn, dispora default to PU Bina Marga
        return 1

print(f"Mapping {len(projects_data)} projects...")
mapped = []
for p in projects_data:
    w_str = p['wilayah'].lower()
    matched_k_id = None
    matched_k_name = None
    # Prioritize first mentioned kecamatan
    for k_key, (kid, kname) in kec_by_name.items():
        if k_key in w_str:
            matched_k_id = kid
            matched_k_name = kname
            break
            
    matched_d_id = None
    matched_d_name = None
    if matched_k_id:
        kec_desas = [d for d in desas if d.parent_id == matched_k_id]
        for d in kec_desas:
            d_clean = d.nama_wilayah.lower().replace('desa ', '').replace('kelurahan ', '').strip()
            if d_clean in w_str:
                matched_d_id = d.id
                matched_d_name = d.nama_wilayah
                break
        if not matched_d_id and kec_desas:
            matched_d_id = kec_desas[0].id
            matched_d_name = kec_desas[0].nama_wilayah
            
    din_id = get_dinas_id(p['opd'])
    mapped.append({
        "no": p["no"],
        "nama": p["nama"],
        "kategori": p["kategori"],
        "kec_id": matched_k_id,
        "kec_name": matched_k_name,
        "desa_id": matched_d_id,
        "desa_name": matched_d_name,
        "dinas_id": din_id
    })
    print(f"#{p['no']:02d}: {p['nama'][:30]:<30} | Kec: {matched_k_name} (ID: {matched_k_id}) | Desa: {matched_d_name} (ID: {matched_d_id}) | Dinas: {din_id}")
