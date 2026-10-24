import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

os.makedirs('paper/latex/figures', exist_ok=True)

# Styling configuration for Springer LNCS academic publications
plt.rcParams.update({
    'font.family': 'serif',
    'font.size': 10,
    'axes.labelsize': 11,
    'axes.titlesize': 12,
    'xtick.labelsize': 9.5,
    'ytick.labelsize': 9.5,
    'legend.fontsize': 9.5,
    'figure.titlesize': 13,
    'lines.linewidth': 1.5,
    'figure.dpi': 300
})

# ==========================================
# FIGURE 1: Task Completion Time & Accuracy Comparison
# ==========================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2))

tasks = ['Task 1\nLocation', 'Task 2\nDelay', 'Task 3\nUpdate Date', 'Task 4\nProg. vs Time']
x = np.arange(len(tasks))
width = 0.35

# Panel 1: Completion Time (s)
list_time = [33.15, 44.79, 12.28, 49.67]
list_time_sd = [3.22, 4.47, 1.49, 4.38]
map_time = [14.53, 27.87, 22.97, 34.44]
map_time_sd = [1.76, 2.34, 2.33, 2.99]

rects1 = ax1.bar(x - width/2, list_time, width, yerr=list_time_sd, capsize=4,
                 label='Condition A: List-Based', color='#4A6FA5', edgecolor='#1F3A60', alpha=0.9)
rects2 = ax1.bar(x + width/2, map_time, width, yerr=map_time_sd, capsize=4,
                 label='Condition B: Map-Timeline', color='#E07A5F', edgecolor='#8C3D28', alpha=0.9)

ax1.set_ylabel('Mean Completion Time (seconds)')
ax1.set_title('(a) Task Completion Time ($N=16$, Mean $\\pm$ SD)')
ax1.set_xticks(x)
ax1.set_xticklabels(tasks)
ax1.set_ylim(0, 60)
ax1.grid(axis='y', linestyle='--', alpha=0.4)
ax1.legend(loc='upper right')

# Value annotations
for rect in rects1:
    h = rect.get_height()
    ax1.annotate(f'{h:.1f}s', xy=(rect.get_x() + rect.get_width()/2, h + 3.2),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=8)
for rect in rects2:
    h = rect.get_height()
    ax1.annotate(f'{h:.1f}s', xy=(rect.get_x() + rect.get_width()/2, h + 2.5),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=8)

# Panel 2: Accuracy Rate (%)
list_acc = [81.2, 50.0, 93.8, 43.8]
map_acc = [100.0, 93.8, 81.2, 93.8]

rects3 = ax2.bar(x - width/2, list_acc, width,
                 label='Condition A: List-Based', color='#4A6FA5', edgecolor='#1F3A60', alpha=0.9)
rects4 = ax2.bar(x + width/2, map_acc, width,
                 label='Condition B: Map-Timeline', color='#E07A5F', edgecolor='#8C3D28', alpha=0.9)

ax2.set_ylabel('Comprehension Accuracy Rate (%)')
ax2.set_title('(b) Information Accuracy Rate ($N=16$)')
ax2.set_xticks(x)
ax2.set_xticklabels(tasks)
ax2.set_ylim(0, 115)
ax2.grid(axis='y', linestyle='--', alpha=0.4)
ax2.legend(loc='lower left')

for rect in rects3:
    h = rect.get_height()
    ax2.annotate(f'{h:.1f}%', xy=(rect.get_x() + rect.get_width()/2, h + 1.5),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=8)
for rect in rects4:
    h = rect.get_height()
    ax2.annotate(f'{h:.1f}%', xy=(rect.get_x() + rect.get_width()/2, h + 1.5),
                 xytext=(0, 0), textcoords="offset points", ha='center', va='bottom', fontsize=8)

plt.tight_layout()
plt.savefig('paper/latex/figures/fig1_task_performance.png', dpi=300)
plt.savefig('paper/latex/figures/fig1_task_performance.pdf')
plt.close()
print('Generated fig1_task_performance.png and .pdf')


# ==========================================
# FIGURE 2: Uji 3 Missing and Stale Data Perception
# ==========================================
fig, ax = plt.subplots(figsize=(8.5, 4.0))

cases = [
    'Case 1: KTG-PCN-001\n(Null Progress, >150d lag)',
    'Case 2: LMG-SKR-001\n(68% Progress, 117d lag)',
    'Case 3: KGN-KRN-001\n(55% Progress, 122d lag)'
]

correct_rates = [68.8, 62.5, 75.0]
zero_or_abandoned = [31.2, 0.0, 6.2]
stale_accepted = [0.0, 37.5, 18.8]

y = np.arange(len(cases))
height = 0.45

p1 = ax.barh(y, correct_rates, height, label='Correct Critical Interpretation (Identified Latency/Deficiency)', color='#2A9D8F', edgecolor='#16544D')
p2 = ax.barh(y, zero_or_abandoned, height, left=correct_rates, label='Inferred 0% Work / Abandoned / Canceled', color='#E76F51', edgecolor='#943C25')
p3 = ax.barh(y, stale_accepted, height, left=np.array(correct_rates) + np.array(zero_or_abandoned), label='Accepted Stale Data as Current Reality / Overlooked Timestamp', color='#F4A261', edgecolor='#A65D24')

ax.set_xlabel('Proportion of Participant Responses (%)')
ax.set_title('Citizen Cognitive Interpretation of Missing and Stale Infrastructure Data ($N=16$)')
ax.set_yticks(y)
ax.set_yticklabels(cases)
ax.set_xlim(0, 100)
ax.grid(axis='x', linestyle='--', alpha=0.4)
ax.legend(loc='lower center', bbox_to_anchor=(0.5, -0.32), ncol=1, frameon=True)

# Add text percentage labels
for i in range(len(cases)):
    c_val = correct_rates[i]
    if c_val > 0:
        ax.text(c_val / 2, i, f'{c_val:.1f}%', ha='center', va='center', color='white', fontweight='bold', fontsize=8.5)
    z_val = zero_or_abandoned[i]
    if z_val > 0:
        ax.text(c_val + z_val / 2, i, f'{z_val:.1f}%', ha='center', va='center', color='white', fontweight='bold', fontsize=8.5)
    s_val = stale_accepted[i]
    if s_val > 0:
        ax.text(c_val + z_val + s_val / 2, i, f'{s_val:.1f}%', ha='center', va='center', color='white', fontweight='bold', fontsize=8.5)

plt.tight_layout()
plt.savefig('paper/latex/figures/fig2_missing_stale_perception.png', dpi=300)
plt.savefig('paper/latex/figures/fig2_missing_stale_perception.pdf')
plt.close()
print('Generated fig2_missing_stale_perception.png and .pdf')


# ==========================================
# FIGURE 3: Conceptual Interface & Architectural Flow
# ==========================================
fig, ax = plt.subplots(figsize=(9, 4.2))
ax.axis('off')

# Draw boxes for Architecture flow
props_box1 = dict(boxstyle='round,pad=0.5', facecolor='#EAEFF5', edgecolor='#4A6FA5', linewidth=1.5)
props_box2 = dict(boxstyle='round,pad=0.5', facecolor='#FDF0ED', edgecolor='#E07A5F', linewidth=1.5)
props_box3 = dict(boxstyle='round,pad=0.6', facecolor='#E8F5E9', edgecolor='#2E7D32', linewidth=1.5)

ax.text(0.24, 0.76, "Condition A: Tabular List\n- Linear Data Rows\n- Progress & Calendar %\n- Serial Search & Filters",
        ha="center", va="center", bbox=props_box1, fontsize=9.5)

ax.text(0.76, 0.76, "Condition B: Map & Timeline\n- Leaflet Sub-district Boundaries\n- Planned vs Actual Gantt Bars\n- Spatial Cluster Inspection",
        ha="center", va="center", bbox=props_box2, fontsize=9.5)

ax.text(0.50, 0.28, "CivicTrack Platform Core & Backend Services\n"
                    "- FastAPI REST API (Python 3.11) with Strict Data Validation\n"
                    "- Municipal Infrastructure Repository (27 Kecamatans of Lamongan)\n"
                    "- Analytical Metrics Engine: $T_{elapsed}$, $P_{physical} = \sum w_k c_k$, $\Delta = P_{phys} - T_{elap}$\n"
                    "- ISO/IEC/IEEE 29119 System & ISO/IEC 25010 Quality Assured",
        ha="center", va="center", bbox=props_box3, fontsize=9)

# Draw arrows
ax.annotate("", xy=(0.24, 0.58), xytext=(0.38, 0.44),
            arrowprops=dict(arrowstyle="<->", color="#4A6FA5", lw=1.8))
ax.annotate("", xy=(0.76, 0.58), xytext=(0.62, 0.44),
            arrowprops=dict(arrowstyle="<->", color="#E07A5F", lw=1.8))

ax.text(0.50, 0.96, "CivicTrack Comparative Evaluation Architecture",
        ha="center", va="center", fontsize=12, fontweight='bold', color='#1F3A60')

plt.tight_layout()
plt.savefig('paper/latex/figures/fig3_system_architecture.png', dpi=300)
plt.savefig('paper/latex/figures/fig3_system_architecture.pdf')
plt.close()
print('Generated fig3_system_architecture.png and .pdf')
