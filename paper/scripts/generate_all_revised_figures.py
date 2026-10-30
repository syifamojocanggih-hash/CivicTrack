import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

os.makedirs('paper/latex/figures', exist_ok=True)

# Publication styling with enhanced legibility and bold labels
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Arial', 'Helvetica'],
    'font.size': 12,
    'axes.labelsize': 13,
    'axes.titlesize': 14,
    'xtick.labelsize': 12,
    'ytick.labelsize': 12,
    'legend.fontsize': 11,
    'figure.titlesize': 15,
    'lines.linewidth': 2.2,
    'figure.dpi': 300
})

print("Generating revised high-resolution figures with maximum legibility...")

# ==============================================================================
# 1. FIGURE 1: Task Completion Time and Accuracy Comparison (LARGE, CRISP, READABLE)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.6), dpi=300)

tasks = ['Task 1:\nLocation Retrieval', 'Task 2:\nDelay Detection', 'Task 3:\nRecency Lookup', 'Task 4:\nProgress vs. Time']
x = np.arange(len(tasks))
width = 0.36

# Panel 1: Completion Time
list_time = [32.83, 44.22, 12.82, 48.51]
list_sd = [13.75, 12.97, 5.83, 13.26]
map_time = [15.42, 28.57, 22.40, 34.12]
map_sd = [3.12, 4.82, 4.63, 5.52]

rects1 = ax1.bar(x - width/2, list_time, width, yerr=list_sd, capsize=5,
                 label='Condition A: List-Based', color='#3B82F6', edgecolor='#1D4ED8', alpha=0.92, lw=1.4)
rects2 = ax1.bar(x + width/2, map_time, width, yerr=map_sd, capsize=5,
                 label='Condition B: Map-Timeline (+Badge in T2/T4)', color='#F97316', edgecolor='#C2410C', alpha=0.92, lw=1.4)

ax1.set_ylabel('Mean Completion Time (seconds)', fontweight='bold', fontsize=12.5)
ax1.set_title('(a) Task Completion Time ($N=16$, Mean $\\pm$ SD)', fontweight='bold', fontsize=13.5, pad=10)
ax1.set_xticks(x)
ax1.set_xticklabels(tasks, fontsize=11.5, fontweight='bold')
ax1.set_ylim(0, 72)
ax1.grid(axis='y', linestyle='--', alpha=0.5)
ax1.legend(loc='upper right', framealpha=0.95, facecolor='white', edgecolor='#CBD5E1', fontsize=10.5)

# Bold, distinct value labels
for rect in rects1:
    h = rect.get_height()
    ax1.annotate(f'{h:.1f}s', xy=(rect.get_x() + rect.get_width()/2, h + 3.8),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=11.0, fontweight='bold', color='#1E3A8A')
for rect in rects2:
    h = rect.get_height()
    ax1.annotate(f'{h:.1f}s', xy=(rect.get_x() + rect.get_width()/2, h + 3.0),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=11.0, fontweight='bold', color='#7C2D12')

# Panel 2: Accuracy
list_acc = [81.2, 50.0, 93.8, 43.8]
list_counts = ['13/16', '8/16', '15/16', '7/16']
map_acc = [100.0, 93.8, 81.2, 93.8]
map_counts = ['16/16', '15/16', '13/16', '15/16']

rects3 = ax2.bar(x - width/2, list_acc, width,
                 label='Condition A: List-Based', color='#3B82F6', edgecolor='#1D4ED8', alpha=0.92, lw=1.4)
rects4 = ax2.bar(x + width/2, map_acc, width,
                 label='Condition B: Map-Timeline (+Badge in T2/T4)', color='#F97316', edgecolor='#C2410C', alpha=0.92, lw=1.4)

ax2.set_ylabel('Comprehension Accuracy Rate (%)', fontweight='bold', fontsize=12.5)
ax2.set_title('(b) Information Accuracy Rate ($N=16$, % & Counts)', fontweight='bold', fontsize=13.5, pad=10)
ax2.set_xticks(x)
ax2.set_xticklabels(tasks, fontsize=11.5, fontweight='bold')
ax2.set_ylim(0, 122)
ax2.grid(axis='y', linestyle='--', alpha=0.5)
ax2.legend(loc='lower left', framealpha=0.95, facecolor='white', edgecolor='#CBD5E1', fontsize=10.5)

for i, rect in enumerate(rects3):
    h = rect.get_height()
    ax2.annotate(f'{h:.1f}%\n({list_counts[i]})', xy=(rect.get_x() + rect.get_width()/2, h + 2.0),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=10.0, fontweight='bold', color='#1E3A8A')
for i, rect in enumerate(rects4):
    h = rect.get_height()
    ax2.annotate(f'{h:.1f}%\n({map_counts[i]})', xy=(rect.get_x() + rect.get_width()/2, h + 2.0),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=10.0, fontweight='bold', color='#7C2D12')

plt.tight_layout()
plt.savefig('paper/latex/figures/fig1_task_performance.png', dpi=300)
plt.savefig('paper/latex/figures/fig1_task_performance.pdf')
plt.close()
print("Saved fig1_task_performance.png and .pdf")


# ==============================================================================
# 2. FIGURE 2: Study 3 Missing and Stale Data Perception (LARGE, CRISP)
# ==============================================================================
fig, ax = plt.subplots(figsize=(10.5, 4.5), dpi=300)

cases = [
    'Case 1: KTG-PCN-001\n(Missing physical progress, >150d lag)',
    'Case 2: LMG-SKR-001\n(68% progress, 117d lag, T_elap=81%)',
    'Case 3: KGN-KRN-001\n(55% progress on 15 Jun, 122d lag)'
]

correct_rates = [68.8, 62.5, 75.0]
zero_or_abandoned = [31.2, 0.0, 6.2]
stale_accepted = [0.0, 37.5, 18.8]

y = np.arange(len(cases))
height = 0.44

p1 = ax.barh(y, correct_rates, height,
             label='Correct Critical Assessment (Unverifiable without Fresh Inspection)',
             color='#10B981', edgecolor='#047857', alpha=0.92, lw=1.3)
p2 = ax.barh(y, zero_or_abandoned, height, left=correct_rates,
             label='Misattributed to Project Cancellation or 0% Work',
             color='#EF4444', edgecolor='#B91C1C', alpha=0.92, lw=1.3)
p3 = ax.barh(y, stale_accepted, height, left=np.array(correct_rates) + np.array(zero_or_abandoned),
             label='Accepted Stale Figures as Current Reality / Overlooked Timestamp',
             color='#F59E0B', edgecolor='#B45309', alpha=0.92, lw=1.3)

ax.set_xlabel('Proportion of Participant Cognitive Interpretations (%)', fontweight='bold', fontsize=12.5)
ax.set_title('Citizen Cognitive Interpretation of Missing and Stale Data (Study 3, $N=16$)', fontweight='bold', fontsize=13.5, pad=12)
ax.set_yticks(y)
ax.set_yticklabels(cases, fontsize=11.5, fontweight='bold')
ax.set_xlim(0, 100)
ax.grid(axis='x', linestyle='--', alpha=0.5)
ax.legend(loc='lower center', bbox_to_anchor=(0.5, -0.36), ncol=1, frameon=True, fontsize=10.0, facecolor='white', edgecolor='#CBD5E1')

for i in range(len(cases)):
    c_val = correct_rates[i]
    if c_val > 0:
        ax.text(c_val / 2, i, f'{c_val:.1f}% ({int(round(c_val*16/100))}/16)', ha='center', va='center', color='white', fontweight='bold', fontsize=11.0)
    z_val = zero_or_abandoned[i]
    if z_val > 0:
        ax.text(c_val + z_val / 2, i, f'{z_val:.1f}% ({int(round(z_val*16/100))}/16)', ha='center', va='center', color='white', fontweight='bold', fontsize=11.0)
    s_val = stale_accepted[i]
    if s_val > 0:
        ax.text(c_val + z_val + s_val / 2, i, f'{s_val:.1f}% ({int(round(s_val*16/100))}/16)', ha='center', va='center', color='white', fontweight='bold', fontsize=11.0)

plt.tight_layout()
plt.savefig('paper/latex/figures/fig2_missing_stale_perception.png', dpi=300)
plt.savefig('paper/latex/figures/fig2_missing_stale_perception.pdf')
plt.close()
print("Saved fig2_missing_stale_perception.png and .pdf")


# ==============================================================================
# 3. FIGURE 3: Complete System Architecture and Dataflow Diagram (ENHANCED READABILITY)
# ==============================================================================
fig, ax = plt.subplots(figsize=(12.0, 7.0), dpi=300)
ax.axis('off')
ax.set_xlim(0, 100)
ax.set_ylim(100)

c_client = '#EFF6FF'
c_client_border = '#3B82F6'
c_api = '#F5F3FF'
c_api_border = '#8B5CF6'
c_engine = '#FEF3C7'
c_engine_border = '#F59E0B'
c_data = '#ECFDF5'
c_data_border = '#10B981'
c_qa = '#FFF1F2'
c_qa_border = '#F43F5E'

def draw_box(x, y, w, h, bg, border, title, items, subtitle=""):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=1.0,rounding_size=2.0",
                                  facecolor=bg, edgecolor=border, linewidth=2.2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h - 4.5, title, ha='center', va='center', fontsize=12.5, fontweight='bold', color='#0F172A')
    if subtitle:
        ax.text(x + w/2, y + h - 8.8, subtitle, ha='center', va='center', fontsize=10.0, fontstyle='italic', fontweight='bold', color='#475569')
        start_y = y + h - 13.8
    else:
        start_y = y + h - 10.2
    
    for i, item in enumerate(items):
        ax.text(x + 3.5, start_y - i*4.4, f"• {item}", ha='left', va='center', fontsize=10.2, fontweight='medium', color='#1E293B')

# Client Presentation Layer (Top)
draw_box(4, 54, 43, 36, c_client, c_client_border,
         "Condition A: Tabular List Explorer",
         ["HTML5 / React 18 Table Component",
          "Linear Data Grid (Code, Name, Budget, Dates)",
          "Textual Progress & Calendar Percentages",
          "Search Input & Kecamatan Dropdown Filter",
          "Standard Status Text Pills (In-Progress, Selesai)"],
         subtitle="Conventional Baseline (LPSE / Satu Data Style)")

draw_box(53, 54, 43, 36, c_client, c_client_border,
         "Condition B: Map & Timeline Explorer",
         ["Leaflet.js + GeoJSON Administrative Polygons",
          "Interactive Spatial Clusters & Color-Coded Markers",
          "Synchronized Dual Gantt Milestone Bars (EVM)",
          "Contractual Deadline vs. Field Update Timestamps",
          "Dynamic Staleness Badges & Delay Tags"],
         subtitle="CivicTrack Integrated Visual Interface")

# API & Analytical Layer (Middle)
draw_box(4, 15.5, 43, 33, c_engine, c_engine_border,
         "Analytical Engine & Business Logic",
         ["Time Elapsed Engine: T_elap = min(100, (T_ref-T_start)/(T_end-T_start))",
          "Milestone Physical Progress: P_physical = sum(w_k * c_k)",
          "Schedule Variance: Delta = P_physical - T_elapsed",
          "Strict Priority Classifier (Overdue, Delayed, On-Track)",
          "Staleness Detection Engine (Alert when Delta_t > 90 days)"],
         subtitle="Earned Value Management (EVM) Core")

draw_box(53, 15.5, 43, 33, c_api, c_api_border,
         "FastAPI Backend & Geospatial Services",
         ["Python 3.11 High-Performance REST API",
          "Strict Pydantic v2 Schema Validation",
          "GeoJSON Spatial Boundary Endpoints (27 Kecamatans)",
          "Project Repository & Query Optimization",
          "Audit Logging & Data Integrity Safeguards"],
         subtitle="Server Layer & Telemetry Engine")

# Storage & Standards (Bottom Strip)
rect_qa = patches.FancyBboxPatch((4, 1.5), 92, 10.5, boxstyle="round,pad=0.8,rounding_size=1.5",
                                facecolor=c_qa, edgecolor=c_qa_border, linewidth=2.0)
ax.add_patch(rect_qa)
ax.text(50, 7.5, "ISO/IEC/IEEE 29119 Software Testing & ISO/IEC 25010 Quality Standards", ha='center', va='center',
        fontsize=12.0, fontweight='bold', color='#9F1239')
ax.text(50, 3.8, "Automated Verification: 38 Backend Pytest Suites + 57 Frontend Vitest Suites (100% Pass Rate across 95 Test Cases)",
        ha='center', va='center', fontsize=10.2, fontweight='bold', color='#881337')

# Connector Arrows
arrow_style = dict(arrowstyle="<->", color="#334155", lw=2.4)
ax.annotate("", xy=(25.5, 49.5), xytext=(25.5, 53.5), arrowprops=arrow_style)
ax.annotate("", xy=(74.5, 49.5), xytext=(74.5, 53.5), arrowprops=arrow_style)
ax.annotate("", xy=(47.5, 32.0), xytext=(52.5, 32.0), arrowprops=arrow_style)

# Overall Title
ax.text(50, 96.5, "CivicTrack System Architecture and Experimental Workflow",
        ha='center', va='center', fontsize=15.0, fontweight='bold', color='#0F172A')

plt.tight_layout()
plt.savefig('paper/latex/figures/fig3_system_architecture.png', dpi=300)
plt.savefig('paper/latex/figures/fig3_system_architecture.pdf')
plt.close()
print("Saved fig3_system_architecture.png and .pdf")


# ==============================================================================
# 4. FIGURE 4: Usability (SUS) and ISO 25010 Quality Profile (LARGE, CRISP)
# ==============================================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.8), dpi=300)

participants = [f'P{i+1:02d}' for i in range(16)]
sus_scores = [65.0, 80.0, 85.0, 67.5, 87.5, 77.5, 72.5, 85.0, 80.0, 82.5, 70.0, 90.0, 82.5, 75.0, 85.0, 75.0]
mean_sus = np.mean(sus_scores)

bars = ax1.bar(participants, sus_scores, color='#0284C7', edgecolor='#0369A1', width=0.68, alpha=0.92, lw=1.3)
ax1.axhline(mean_sus, color='#DC2626', linestyle='--', linewidth=2.2, label=f'CivicTrack Mean: {mean_sus:.2f} (Grade A-)')
ax1.axhline(68.0, color='#64748B', linestyle=':', linewidth=2.0, label='Industry Average: 68.0')

ax1.set_ylabel('System Usability Scale (SUS) Score', fontweight='bold', fontsize=12.5)
ax1.set_xlabel('Pilot Study Participants ($N=16$)', fontweight='bold', fontsize=12.5)
ax1.set_title('(a) Individual Participant SUS Usability Scores', fontweight='bold', fontsize=13.5, pad=10)
ax1.set_ylim(40, 105)
ax1.set_xticklabels(participants, rotation=45, ha='right', fontsize=11.0, fontweight='bold')
ax1.grid(axis='y', linestyle='--', alpha=0.5)
ax1.legend(loc='lower right', framealpha=0.95, facecolor='white', edgecolor='#CBD5E1', fontsize=10.5)

for bar in bars:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2, yval + 1.2, f'{yval:.0f}', ha='center', va='bottom', fontsize=10.0, fontweight='bold', color='#0F172A')

dimensions = [
    'UI Aesthetics',
    'Status Recogniz.',
    'Temporal Clarity',
    'Learnability',
    'Completeness',
    'Overall Satisf.',
    'Correctness',
    'Error Protect.',
    'Appropriateness',
    'Operability'
]
percentages = [95.0, 93.8, 92.5, 92.5, 91.3, 91.3, 90.0, 88.8, 87.5, 86.3]
y_pos = np.arange(len(dimensions))

bars2 = ax2.barh(y_pos, percentages, height=0.62, color='#10B981', edgecolor='#047857', alpha=0.92, lw=1.3)
ax2.axvline(80.0, color='#DC2626', linestyle='--', linewidth=2.0, label='Eligibility Threshold (80% Sangat Layak)')

ax2.set_xlabel('Quality Compliance Rate (%)', fontweight='bold', fontsize=12.5)
ax2.set_title('(b) ISO/IEC 25010 UAT Compliance ($N=16$, Mean 90.88%)', fontweight='bold', fontsize=13.5, pad=10)
ax2.set_yticks(y_pos)
ax2.set_yticklabels(dimensions, fontsize=11.0, fontweight='bold')
ax2.set_xlim(50, 102)
ax2.grid(axis='x', linestyle='--', alpha=0.5)
ax2.legend(loc='lower right', framealpha=0.95, facecolor='white', edgecolor='#CBD5E1', fontsize=10.5)

for bar in bars2:
    wval = bar.get_width()
    ax2.text(wval + 0.8, bar.get_y() + bar.get_height()/2, f'{wval:.1f}%', ha='left', va='center', fontsize=10.0, fontweight='bold', color='#065F46')

plt.tight_layout()
plt.savefig('paper/latex/figures/fig4_combined_usability_quality.png', dpi=300)
plt.savefig('paper/latex/figures/fig4_combined_usability_quality.pdf')
plt.close()
print("Saved fig4_combined_usability_quality.png and .pdf")

print("All figures successfully regenerated with high legibility!")
