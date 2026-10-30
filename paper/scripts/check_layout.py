import pymupdf
import sys

doc = pymupdf.open('paper/latex/main.pdf')
print("Total pages:", len(doc))
for i, page in enumerate(doc):
    text = page.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    first_line = lines[0] if lines else ''
    last_line = lines[-1] if lines else ''
    print(f"Page {i+1} (chars: {len(text)}):")
    print(f"   First: {first_line[:60]}")
    print(f"   Last:  {last_line[:60]}")

