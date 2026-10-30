import pypdf
import sys
import os

pdf_path = os.path.join(r"c:\Users\ASUS\Downloads", "3125521045_Aimatus-Sholiha_3125521037_Ahmad Syifa'ul Falakhul Khayyi_Paper.pdf")
print("Target exists:", os.path.exists(pdf_path))
if os.path.exists(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    print("Num pages:", len(reader.pages))
    text = reader.pages[0].extract_text()
    for line in text.split('\n')[:40]:
        sys.stdout.buffer.write((line + '\n').encode('utf-8'))

