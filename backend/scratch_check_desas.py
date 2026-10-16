import json
import re

with open('backend/database/seed.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

matches = re.findall(r"\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'desa',\s*(\d+)", sql)
print('Total desas in seed.sql:', len(matches))
kec_map = {}
for mid, code, name, pid in matches:
    kec_map.setdefault(pid, []).append((int(mid), code, name))
print('Total parent kecamatan with desas:', len(kec_map))
for pid in sorted(kec_map.keys(), key=lambda x: int(x))[:5]:
    print(f'Kec ID {pid}: {len(kec_map[pid])} desas (e.g. {kec_map[pid][0][2]})')
