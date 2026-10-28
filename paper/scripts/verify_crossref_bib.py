import urllib.request
import json
import ssl

dois = [
    ('ambituuni2025infrastructure', '10.1108/ECAM-02-2025-0273'),
    ('ansari2022enhancing', '10.1016/j.giq.2021.101657'),
    ('ayalew2024developing', '10.1080/23311916.2024.2348210'),
    ('bacic2022advancing', '10.1016/j.dss.2022.113862'),
    ('chokki2022engaging', '10.1145/3558099'),
    ('johnson2024enhancing', '10.1016/j.landurbplan.2024.105197'),
    ('kempeneer2023rethinking', '10.3233/IP-239008'),
    ('kytta2023prioritizing', '10.1016/j.landurbplan.2023.104868'),
    ('lehto2022landscape', '10.1016/j.landurbplan.2022.104519'),
    ('matheus2021design', '10.1016/j.giq.2020.101550'),
    ('nikiforova2021open', '10.1016/j.tele.2020.101539'),
    ('saelawong2024transparency', '10.1108/JFC-10-2023-0282'),
    ('fernstad2022explore', '10.1109/TVCG.2021.3065124'),
    ('soni2024survey', '10.1016/j.visinf.2024.01.002'),
    ('bina2023incorporating', '10.1016/j.dss.2023.113979'),
    ('zhao2023digital', '10.1016/j.giq.2023.101868'),
    ('zytek2022sibyl', '10.1109/TVCG.2021.3114864')
]

headers = {'User-Agent': 'CivicTrackBibValidator/1.0 (mailto:khayyi@student.pens.ac.id)'}
ctx = ssl.create_default_context()

print(f"Total DOIs to check: {len(dois)}")
results = []
for key, doi in dois:
    url = f"https://api.crossref.org/works/{doi}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            data = json.loads(resp.read().decode('utf-8'))['message']
            title = data.get('title', [''])[0]
            container = data.get('container-title', [''])[0]
            authors_list = data.get('author', [])
            authors_str = "; ".join([f"{a.get('family', '')}, {a.get('given', '')}" for a in authors_list[:4]])
            if len(authors_list) > 4:
                authors_str += " et al."
            vol = data.get('volume', 'N/A')
            issue = data.get('issue', 'N/A')
            pages = data.get('page', 'N/A')
            date_parts = data.get('published', {}).get('date-parts', [[None]])[0]
            pub_year = date_parts[0] if date_parts else 'N/A'
            results.append({
                'key': key,
                'doi': doi,
                'valid': True,
                'title': title,
                'journal': container,
                'authors': authors_str,
                'volume': vol,
                'issue': issue,
                'pages': pages,
                'year': pub_year
            })
            print(f"[VALID] {key} -> {doi}")
            msg1 = f"        {authors_str} ({pub_year}). {title[:80]}..."
            msg2 = f"        Journal: {container} | Vol: {vol} | Issue: {issue} | Pages: {pages}"
            print(msg1.encode('ascii', 'replace').decode('ascii'))
            print(msg2.encode('ascii', 'replace').decode('ascii'))
    except Exception as e:
        results.append({'key': key, 'doi': doi, 'valid': False, 'error': str(e)})
        print(f"[FAILED] {key} ({doi}): {e}")

with open('paper/references/crossref_verification_report.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print("Saved report to paper/references/crossref_verification_report.json")
