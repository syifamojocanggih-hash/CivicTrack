import urllib.request
import json
import os

url = 'https://raw.githubusercontent.com/cahyadsn/wilayah/master/db/wilayah.sql'
print("Mengunduh data wilayah dari raw repository Kemendagri...")
req = urllib.request.urlopen(url)
content = req.read().decode('utf-8')

desa_list = []
for line in content.splitlines():
    if '35.24.' in line and "'" in line:
        parts = line.split("'")
        if len(parts) >= 4:
            code = parts[1]
            raw_name = parts[3].strip()
            # 35.24.xx.xxxx
            code_parts = code.split('.')
            if len(code_parts) == 4:
                kec_code = '.'.join(code_parts[:3])
                desa_num = code_parts[3]
                # In Kemendagri: 1xxx = Kelurahan, 2xxx = Desa
                if desa_num.startswith('1'):
                    prefix = 'Kelurahan ' if not raw_name.lower().startswith('kelurahan') else ''
                else:
                    prefix = 'Desa ' if not raw_name.lower().startswith('desa') else ''
                nama_wilayah = f"{prefix}{raw_name.title()}"
                desa_list.append({
                    'kode_wilayah': code,
                    'nama_wilayah': nama_wilayah,
                    'kecamatan_kode': kec_code
                })

print(f"Berhasil mem-parse {len(desa_list)} desa/kelurahan di Kabupaten Lamongan.")

out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'database', 'lamongan_desa_kemendagri.json'))
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(desa_list, f, indent=2, ensure_ascii=False)

print(f"Data disimpan ke: {out_path}")
