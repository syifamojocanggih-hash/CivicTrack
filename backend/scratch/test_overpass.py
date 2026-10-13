import httpx
import time

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter"
]

def test_overpass():
    lat = -6.5000
    lon = 112.4000
    # Bounding box sekitar 2km (di laut utara)
    s = lat - 0.02
    n = lat + 0.02
    w = lon - 0.02
    e = lon + 0.02
    
    query = f"""
    [out:json][timeout:15];
    way["highway"]["name"]({s},{w},{n},{e});
    out tags;
    """
    
    headers = {
        "User-Agent": "CivicTrackApp/1.0 (contact@civictrack.id)"
    }
    
    for url in ENDPOINTS:
        print(f"\nTesting endpoint: {url}...")
        t0 = time.time()
        try:
            resp = httpx.post(url, data={"data": query}, headers=headers, timeout=6.0)
            dt = time.time() - t0
            print(f"Status Code: {resp.status_code} in {dt:.2f}s")
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                names = set()
                for el in elements:
                    tags = el.get("tags", {})
                    if "name" in tags:
                        names.add(tags["name"])
                
                sorted_names = sorted(list(names))
                print(f"Total elemen jalan: {len(elements)}")
                print(f"Total nama jalan unik: {len(sorted_names)}")
                print("Contoh nama jalan:")
                for n in sorted_names[:10]:
                    print(f" - {n}")
                return
            else:
                print(f"HTTP Error: {resp.status_code} - {resp.text[:150]}")
        except Exception as e:
            print(f"Failed with {url}: {e}")

if __name__ == "__main__":
    test_overpass()
