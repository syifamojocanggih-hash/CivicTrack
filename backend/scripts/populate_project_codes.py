import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.models import Proyek, WilayahAdministratif

KECAMATAN_CODE_MAP = {
    'Kecamatan Sukorame': 'SKR',
    'Kecamatan Bluluk': 'BLK',
    'Kecamatan Modo': 'MDO',
    'Kecamatan Ngimbang': 'NGB',
    'Kecamatan Babat': 'BBT',
    'Kecamatan Kedungpring': 'KDP',
    'Kecamatan Brondong': 'BRD',
    'Kecamatan Laren': 'LRN',
    'Kecamatan Sekaran': 'SKN',
    'Kecamatan Maduran': 'MDR',
    'Kecamatan Sambeng': 'SMB',
    'Kecamatan Sugio': 'SGO',
    'Kecamatan Pucuk': 'PCK',
    'Kecamatan Paciran': 'PCR',
    'Kecamatan Solokuro': 'SLK',
    'Kecamatan Mantup': 'MTP',
    'Kecamatan Sukodadi': 'SKD',
    'Kecamatan Karanggeneng': 'KGN',
    'Kecamatan Kembangbahu': 'KBH',
    'Kecamatan Kalitengah': 'KTG',
    'Kecamatan Turi': 'TUR',
    'Kecamatan Lamongan (Kota)': 'LMG',
    'Kecamatan Tikung': 'TKG',
    'Kecamatan Karangbinangun': 'KBN',
    'Kecamatan Deket': 'DKT',
    'Kecamatan Glagah': 'GLG',
    'Kecamatan Sarirejo': 'SRJ',
}

def abbreviate_desa(desa_name: str) -> str:
    if not desa_name:
        return 'DES'
    clean = desa_name.replace('Kelurahan', '').replace('Desa', '').strip().upper()
    consonants = ''.join([c for c in clean if c in 'BCDFGHJKLMNPQRSTVWXYZ'])
    if len(consonants) >= 3:
        return consonants[:3]
    letters = ''.join([c for c in clean if c.isalpha()])
    return (letters + 'XXX')[:3]

# Fixed preset codes for consistency with UI examples & PRD
PRESET_CODES = {
    1: ('SKD-SKD-001', 'PJ-17409'),
    2: ('PCK-PCK-002', 'PJ-28315'),
    3: ('SGO-GDL-003', 'PJ-39142'),
    4: ('BBT-BBT-004', 'PJ-41850'),
    5: ('DKT-SDR-005', 'PJ-52671'),
    6: ('TUR-TUR-006', 'PJ-63782'),
    7: ('BRD-BRD-007', 'PJ-74893'),
    8: ('SMB-ARD-008', 'PJ-85904'),
    9: ('SKR-SKR-009', 'PJ-96015'),
    10: ('LRN-PLG-010', 'PJ-10234'),
    11: ('TKG-WNK-011', 'PJ-21345'),
    12: ('MDO-MJR-012', 'PJ-32456'),
    13: ('KBN-KUR-013', 'PJ-43567'),
    14: ('KBN-KUR-014', 'PJ-54678'),
    15: ('KTG-PCG-015', 'PJ-65789'),
    16: ('LMG-SKR-016', 'PJ-76890'),
    17: ('SGO-KDB-017', 'PJ-87901'),
    18: ('KGN-KGN-018', 'PJ-98012'),
    19: ('BBT-BBT-019', 'PJ-19123'),
    20: ('KBN-KUR-020', 'PJ-20234'),
    21: ('BRD-BRD-021', 'PJ-31345'),
    22: ('LMG-BNJ-022', 'PJ-42456'),
    23: ('LMG-SKR-023', 'PJ-53567'),
    24: ('DKT-SDR-024', 'PJ-64678'),
    25: ('LMG-JTS-025', 'PJ-75789'),
    26: ('BBT-BBT-026', 'PJ-86890'),
    27: ('MDR-PNG-027', 'PJ-97901'),
    28: ('SLK-SLK-028', 'PJ-18012'),
    29: ('BRD-BRD-029', 'PJ-29123'),
    30: ('NGB-NGB-030', 'PJ-30234'),
    31: ('SKD-SKD-031', 'PJ-41345'),
    32: ('KBN-BLW-032', 'PJ-52456'),
    33: ('SKR-SKR-033', 'PJ-63567'),
    34: ('PCR-PCR-034', 'PJ-74678'),
    35: ('LMG-PLW-035', 'PJ-85789'),
}

def main():
    db = SessionLocal()
    try:
        projects = db.query(Proyek).order_by(Proyek.id).all()
        print(f"Found {len(projects)} projects in database.")
        
        updated_count = 0
        for p in projects:
            if p.id in PRESET_CODES:
                kode, pin = PRESET_CODES[p.id]
            else:
                kec_name = p.wilayah.nama_wilayah if p.wilayah else 'Kecamatan Lamongan (Kota)'
                desa_name = p.desa.nama_wilayah if p.desa else ''
                kec_code = KECAMATAN_CODE_MAP.get(kec_name, 'LMG')
                desa_code = abbreviate_desa(desa_name)
                kode = f"{kec_code}-{desa_code}-{str(p.id).padStart(3, '0')}"
                pin = f"PJ-{10000 + (p.id * 1111) % 90000}"
            
            p.kode_proyek = kode
            p.kode_akses = pin
            updated_count += 1
            print(f"Proyek #{p.id} [{p.nama_proyek[:30]}]: {kode} | {pin}")
            
        db.commit()
        print(f"Successfully populated kode_proyek & kode_akses for {updated_count} projects!")
    except Exception as e:
        db.rollback()
        print("Error updating projects:", e)
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    main()
