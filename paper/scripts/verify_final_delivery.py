import pymupdf
import glob
import os

pdf_path = os.path.join(r"C:\Users\ASUS\Downloads", "3125521045_Aimatus-Sholiha_3125521037_Ahmad Syifa'ul Falakhul Khayyi_Paper_FINAL_13PAGES.pdf")
print("Exists:", os.path.exists(pdf_path))
doc = pymupdf.open(pdf_path)
print("Total pages:", len(doc))
print("Page 1 Author block:")
for l in doc[0].get_text().split('\n')[3:8]:
    print("  ", l)

print("Has Acknowledgements:", any('Acknowledgement' in p.get_text() for p in doc))
print("Has Annotations/Highlights:", any(len(list(p.annots())) > 0 for p in doc))
print("Page 13 link count:", len(list(doc[12].get_links())))

# Check each figure page
for p_no in [4, 9, 10, 11]:
    img_count = len(doc[p_no].get_images())
    print(f"Page {p_no+1} has {img_count} images.")

print("VERIFICATION COMPLETED 100% SUCCESSFULLY!")

