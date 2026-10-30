import pymupdf

doc = pymupdf.open('paper/latex/test_main.pdf')
print("Total pages:", len(doc))
for i, page in enumerate(doc):
    text = page.get_text()
    figs = [l for l in text.split('\n') if l.strip().startswith(('Fig.', 'Table '))]
    print(f"Page {i+1} ({len(text)} chars): {figs}")

