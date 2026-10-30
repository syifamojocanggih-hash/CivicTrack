import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

os.makedirs('paper/latex/figures', exist_ok=True)

# Side-by-side comparison: Width 12 inches, Height 5.6 inches
fig, (ax0, ax1) = plt.subplots(1, 2, figsize=(12, 5.6), dpi=300)
plt.subplots_adjust(wspace=0.08, left=0.02, right=0.98, top=0.92, bottom=0.04)

# ==============================================================================
# PANEL A: CONDITION A (LIST-BASED VIEW BASELINE)
# ==============================================================================
ax0.axis('off')
ax0.set_xlim(0, 100)
ax0.set_ylim(0, 100)

# Browser Container
rect_frame_a = patches.FancyBboxPatch((0, 2), 100, 96, boxstyle="round,pad=0.5,rounding_size=1.5",
                                     facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1.5)
ax0.add_patch(rect_frame_a)

# Header Bar
rect_hdr_a = patches.Rectangle((0, 83), 100, 15, facecolor='#F8FAFC', edgecolor='#CBD5E1', linewidth=1.0)
ax0.add_patch(rect_hdr_a)
ax0.text(3, 91.5, "CivicTrack Public Works Directory — Condition A",
         fontsize=12.5, fontweight='bold', color='#1E293B', va='center')
ax0.text(3, 86.5, "Tabular Baseline Modeled on LPSE / Satu Data Lamongan",
         fontsize=10.0, color='#64748B', va='center')

# Controls (Search & Filter)
rect_search = patches.FancyBboxPatch((3, 71), 40, 8, boxstyle="round,pad=0.2,rounding_size=0.8",
                                    facecolor='#FFFFFF', edgecolor='#94A3B8', linewidth=1.2)
ax0.add_patch(rect_search)
ax0.text(5, 75.0, "Search: Jalan / Jembatan...", fontsize=9.2, color='#64748B', va='center')

rect_filter = patches.FancyBboxPatch((45, 71), 32, 8, boxstyle="round,pad=0.2,rounding_size=0.8",
                                    facecolor='#FFFFFF', edgecolor='#94A3B8', linewidth=1.2)
ax0.add_patch(rect_filter)
ax0.text(47, 75.0, "Semua Kecamatan ▼", fontsize=9.2, color='#1E293B', fontweight='bold', va='center')

rect_btn = patches.FancyBboxPatch((79, 71), 18, 8, boxstyle="round,pad=0.2,rounding_size=0.8",
                                  facecolor='#2563EB', edgecolor='#1D4ED8', linewidth=1.2)
ax0.add_patch(rect_btn)
ax0.text(88, 75.0, "Filter", fontsize=9.5, fontweight='bold', color='white', ha='center', va='center')

# Table Header
headers = ["Kode", "Nama Proyek", "Deadline", "Waktu", "Fisik", "Update", "Status"]
col_x = [3, 16, 42, 56, 68, 78, 89]

rect_th = patches.Rectangle((1, 60), 98, 8.5, facecolor='#F1F5F9', edgecolor='#CBD5E1', linewidth=1.0)
ax0.add_patch(rect_th)
for i, h in enumerate(headers):
    ax0.text(col_x[i], 64.2, h, fontsize=9.2, fontweight='bold', color='#334155', va='center')

# Rows with verified contract deadlines matching ground truth and Task 3 keys
rows_data = [
    ("SKD-001", "Peningkatan Sukodadi", "30/11/24", "83.2%", "82.0%", "10/10/24", "In-Prog", "#FEF3C7", "#92400E"),
    ("SGO-001", "Rekonstruksi Sugio", "31/10/24", "94.1%", "75.0%", "08/10/24", "In-Prog", "#FEF3C7", "#92400E"),
    ("SMB-001", "Rekonstruksi Sambeng", "30/11/24", "84.1%", "67.0%", "05/10/24", "In-Prog", "#FEF3C7", "#92400E"),
    ("TKG-001", "Peningkatan Tikung", "30/09/24", "100%", "92.0%", "02/10/24", "In-Prog", "#FEF3C7", "#92400E"),
    ("KBN-001", "Pintu Air Kuro", "31/07/24", "100%", "100%", "25/07/24", "Selesai", "#D1FAE5", "#065F46"),
    ("KTG-001", "Normalisasi Asin", "30/11/24", "84.8%", "—", "10/05/24", "In-Prog", "#F1F5F9", "#475569")
]

y_row = 51.5
for r in rows_data:
    rect_row = patches.Rectangle((1, y_row), 98, 7.8, facecolor='#FFFFFF', edgecolor='#E2E8F0', linewidth=0.8)
    ax0.add_patch(rect_row)
    ax0.text(col_x[0], y_row + 3.9, r[0], fontsize=8.8, fontfamily='monospace', fontweight='bold', color='#0F172A', va='center')
    ax0.text(col_x[1], y_row + 3.9, r[1], fontsize=8.8, color='#0F172A', va='center')
    ax0.text(col_x[2], y_row + 3.9, r[2], fontsize=8.8, color='#0F172A', fontweight='bold', va='center')
    ax0.text(col_x[3], y_row + 3.9, r[3], fontsize=8.8, color='#0F172A', va='center')
    ax0.text(col_x[4], y_row + 3.9, r[4], fontsize=8.8, fontweight='bold', color='#1E3A8A', va='center')
    ax0.text(col_x[5], y_row + 3.9, r[5], fontsize=8.8, color='#475569', va='center')
    
    # Status Pill
    rect_pill = patches.FancyBboxPatch((col_x[6] - 1, y_row + 1.2), 10, 5.4, boxstyle="round,pad=0.2,rounding_size=1.0",
                                       facecolor=r[7], edgecolor='none')
    ax0.add_patch(rect_pill)
    ax0.text(col_x[6] + 4.0, y_row + 3.9, r[6], fontsize=8.0, fontweight='bold', color=r[8], ha='center', va='center')
    y_row -= 8.1

ax0.text(50, 4.0, "Showing 6 of 20 Projects | Pagination: [1] 2 3 4",
         fontsize=9.0, color='#64748B', ha='center', va='center', fontweight='medium')

ax0.set_title("(a) Condition A: Tabular List View (Baseline)", fontsize=13.0, fontweight='bold', color='#1E3A8A', pad=10)


# ==============================================================================
# PANEL B: CONDITION B (MAP-AND-TIMELINE VIEW)
# ==============================================================================
ax1.axis('off')
im_map = Image.open('paper/latex/figures/real_web_map_explorer.png')
ax1.imshow(im_map)
ax1.set_title("(b) Condition B: Map & Timeline View (CivicTrack)", fontsize=13.0, fontweight='bold', color='#1E3A8A', pad=10)

plt.savefig('paper/latex/figures/fig_system_interface_comparison.png', dpi=300, bbox_inches='tight')
plt.savefig('paper/latex/figures/fig_system_interface_comparison.pdf', bbox_inches='tight')
plt.close()
print("Saved bold, crystal clear fig_system_interface_comparison.png and .pdf")
