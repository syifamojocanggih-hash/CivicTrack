import pypdfium2 as pdfium
import pypdf
from pypdf.generic import ArrayObject, FloatObject, NumberObject, NameObject, DictionaryObject
from PIL import Image, ImageDraw
import os

def get_line_rects(textpage, line_substring):
    # Find all occurrences of line_substring in textpage
    search = textpage.search(line_substring)
    match = search.get_next()
    rects = []
    while match:
        start_idx, count = match
        n_rects = textpage.count_rects(start_idx, count)
        for i in range(n_rects):
            r = textpage.get_rect(i) # left, bottom, right, top
            rects.append(r)
        match = search.get_next()
    return rects

def main():
    pdf_in = 'paper/latex/main.pdf'
    pdf_out = 'paper/latex/main.pdf'
    temp_out = 'paper/latex/main_temp.pdf'
    
    # We reload original clean backup if available, or work on main.pdf
    reader = pypdf.PdfReader(pdf_in)
    writer = pypdf.PdfWriter()
    for page in reader.pages:
        # Strip existing annotations to reapply clean highlights
        if "/Annots" in page:
            # Keep links, remove old highlights if any
            new_annots = ArrayObject()
            for a in page["/Annots"]:
                obj = a.get_object()
                if obj.get("/Subtype") != "/Highlight":
                    new_annots.append(a)
            page[NameObject("/Annots")] = new_annots
        writer.add_page(page)
        
    doc_pdfium = pdfium.PdfDocument(pdf_in)
    
    # Target search phrases per page corresponding to the user's questions and fixes:
    # 1. Condition A delay badge & bundled treatment honesty (Abstract p1, Stimulus p7, Discussion p11, Limitations p14)
    # 2. Satu Data Lamongan citation and verification (p2)
    # 3. Duration-as-progress fallacy & Stale/Missing data ambiguity (p2)
    # 4. Task 2 delay identification clarification & key uniqueness (p9)
    # 5. Task 3 contract deadline verification (p9)
    # 6. Factorial experiment future work (p11, p14)
    page_targets = {
        0: [ # Page 1
            "explicit variance cues",
            "delay identification accuracy",
            "duration-work equivalence"
        ],
        1: [ # Page 2
            "Satu Data Lamongan",
            "Duration-as-Progress Fallacy",
            "75% elapsed duration",
            "60% physical progress",
            "15% execution delay",
            "Ambiguity over Stale and Missing Data",
            "3–5 months",
            "missing progress fields"
        ],
        2: [ # Page 3
            "CivicTrack, including its explicit variance cues",
            "discrete attribute lookups"
        ],
        4: [ # Page 5
            "bundled with explicit variance cues and delay badges",
            "absence of multi-view spatial navigation"
        ],
        5: [ # Page 6
            "Analytical Engine calculating elapsed duration",
            "schedule variance"
        ],
        6: [ # Page 7
            "Condition A (List-Based View Baseline)",
            "Condition B (Map-and-Timeline Explorer)",
            "explicit deviation badges",
            "Feature Parity and Equivalence",
            "explicit delay tags",
            "Terlambat",
            "Condition B is therefore a bundled treatment",
            "evaluates whether citizens can detect delays"
        ],
        7: [ # Page 8
            "Schedule variance",
            "Strict Priority Classification Rules",
            "Overdue Finish",
            "Stale Data Flag"
        ],
        8: [ # Page 9
            "Task 2 (Schedule Delay Identification)",
            "SGO-GND-001",
            "SMB-RDR-001",
            "Task 3 (Update Recency Lookup)",
            "10/10/2024",
            "30/11/2024",
            "Task 4 (Physical vs. Time Progress)",
            "Delayed by -17.1%"
        ],
        10: [ # Page 11
            "Schedule Delay Detection with Bundled Variance Cues",
            "paired t(15) = 16.79",
            "exact McNemar tests",
            "duration-work equivalence heuristic",
            "explicit “Terlambat” delay badge",
            "factorial design"
        ],
        11: [ # Page 12
            "Table 3. Qualitative Failure Modes",
            "Duration heuristic",
            "Cognitive substitution",
            "Negative default inference",
            "Study 3 (N = 16)",
            "active freshness badges"
        ],
        12: [ # Page 13
            "overall mean SUS score of 82.50",
            "90.88%",
            "UI Aesthetics",
            "Temporal Clarity"
        ],
        13: [ # Page 14
            "bundled timeline condition with explicit variance cues",
            "Complexity Penalty",
            "Data Latency Vulnerabilities",
            "Boundaries of Claims and Limitations",
            "explicit delay badges (“Terlambat”)",
            "deploy factorial designs isolating timeline graphics"
        ],
        14: [ # Page 15
            "Jaelani, Y., Manar, D.",
            "Pelaksanaan layanan pengadaan barang dan jasa",
            "Hyzy, M.",
            "System usability scale benchmarking"
        ]
    }
    
    total_added = 0
    highlight_coords_by_page = {}
    
    for page_idx, phrases in page_targets.items():
        if page_idx >= len(doc_pdfium):
            continue
        page_pdfium = doc_pdfium[page_idx]
        tp = page_pdfium.get_textpage()
        page_pypdf = writer.pages[page_idx]
        
        highlight_coords_by_page[page_idx] = []
        print(f"Processing Page {page_idx + 1}...")
        
        for phrase in phrases:
            rects = get_line_rects(tp, phrase)
            if not rects:
                # Fallback to subwords
                for sub in phrase.split():
                    if len(sub) > 5:
                        sub_rects = get_line_rects(tp, sub)
                        if sub_rects:
                            rects.extend(sub_rects)
                            break
            
            if rects:
                for r in rects:
                    left, bottom, right, top = r
                    highlight_coords_by_page[page_idx].append((left, bottom, right, top))
                    
                    # Highlight annotation
                    annot = DictionaryObject()
                    annot.update({
                        NameObject("/Type"): NameObject("/Annot"),
                        NameObject("/Subtype"): NameObject("/Highlight"),
                        NameObject("/Rect"): ArrayObject([FloatObject(left - 1), FloatObject(bottom - 1), FloatObject(right + 1), FloatObject(top + 1)]),
                        NameObject("/QuadPoints"): ArrayObject([
                            FloatObject(left), FloatObject(top),
                            FloatObject(right), FloatObject(top),
                            FloatObject(left), FloatObject(bottom),
                            FloatObject(right), FloatObject(bottom)
                        ]),
                        NameObject("/C"): ArrayObject([FloatObject(1.0), FloatObject(0.92), FloatObject(0.25)]), # Stabilo Yellow
                        NameObject("/CA"): FloatObject(0.55),
                        NameObject("/F"): NumberObject(4)
                    })
                    if "/Annots" not in page_pypdf:
                        page_pypdf[NameObject("/Annots")] = ArrayObject()
                    page_pypdf["/Annots"].append(annot)
                    total_added += 1
                print(f"  [OK] Highlighted '{phrase}' ({len(rects)} box)")
            else:
                print(f"  [Skip] Text not found: '{phrase}'")

    with open(temp_out, 'wb') as f:
        writer.write(f)
        
    print(f"\nTotal highlight annotations added: {total_added}")
    
    # Now let's also create high-resolution preview images of the pages with yellow stabilo drawn
    # using PIL with multiply blend mode so that they look 100% like real stabilo marker!
    doc_rendered = pdfium.PdfDocument(temp_out)
    os.makedirs('paper/latex/preview_pages', exist_ok=True)
    
    for page_idx in range(len(doc_rendered)):
        page = doc_rendered[page_idx]
        # render at 2x resolution (144 dpi)
        scale = 2.0
        pil_img = page.render(scale=scale).to_pil().convert('RGBA')
        
        # Draw translucent yellow highlighter on the image
        if page_idx in highlight_coords_by_page and highlight_coords_by_page[page_idx]:
            overlay = Image.new('RGBA', pil_img.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(overlay)
            
            p_width, p_height = page.get_size()
            
            for (left, bottom, right, top) in highlight_coords_by_page[page_idx]:
                # In PDF, origin is bottom-left. In PIL, origin is top-left.
                img_x0 = left * scale
                img_x1 = right * scale
                img_y0 = (p_height - top) * scale
                img_y1 = (p_height - bottom) * scale
                
                # Yellow stabilo color: R=255, G=240, B=50, Alpha=120
                draw.rectangle([img_x0 - 2, img_y0 - 1, img_x1 + 2, img_y1 + 1], fill=(255, 242, 60, 115))
                
            # Composite overlay
            pil_img = Image.alpha_composite(pil_img, overlay)
            
        preview_path = f'paper/latex/preview_pages/page_{page_idx+1:02d}_stabilo.png'
        pil_img.convert('RGB').save(preview_path, quality=92)
        print(f"Saved visual preview: {preview_path}")

    # Replace main.pdf with the highlighted version
    import shutil
    shutil.copyfile(temp_out, pdf_out)
    print(f"\nSuccessfully updated {pdf_out} with {len(doc_rendered)} pages (Strictly <= 15 pages) and stabilo highlights!")

if __name__ == '__main__':
    main()
