import re

with open('paper/latex/main.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update RQ to include "(CivicTrack, including its explicit variance cues)"
content = content.replace(
    r"\emph{Does an integrated map-and-timeline interface improve citizen accuracy and efficiency in understanding project locations, physical progress, and schedule delays compared to a conventional list-based presentation?}",
    r"\emph{Does an integrated map-and-timeline interface (CivicTrack, including its explicit variance cues) improve citizen accuracy and efficiency in understanding project locations, physical progress, and schedule delays compared to a conventional list-based presentation?}"
)

# 2. Update H2 in Methodology
h2_old = r"\item \textbf{$H_2$ (Schedule Pacing):} For schedule delay detection, the dual-bar timeline interface with visual variance cues will yield significantly faster completion times ($H_{2a}$) and significantly higher delay identification accuracy ($H_{2b}$) by mitigating the duration-work equivalence heuristic."
h2_new = r"\item \textbf{$H_2$ (Schedule Pacing):} \hl{For schedule delay detection, the CivicTrack timeline condition (a dual-bar timeline bundled with explicit variance cues and delay badges) will yield significantly faster completion times ($H_{2a}$) and significantly higher delay identification accuracy ($H_{2b}$) than the list condition, which exposes the same underlying numeric fields but no derived variance indicator; the design does not isolate the timeline graphic from the delay badge.}"
content = content.replace(h2_old, h2_new)

# 3. Update Section 3.3 title and bold heading
content = content.replace(
    r"\subsection{Stimulus Design and Feature Parity Analysis}",
    r"\subsection{Stimulus Design and Information Parity Analysis}"
)
content = content.replace(
    r"\textbf{Feature Parity and Equivalence:}",
    r"\textbf{Information Parity and Known Asymmetry:}"
)

# 4. Update Table 2 labels for Condition B in Task 2 and Task 4
content = content.replace(
    r"& Condition B (Timeline) & 15 / 16 & 93.8\% &",
    r"& Condition B (Timeline+Badge) & 15 / 16 & 93.8\% &"
)

# 5. Clarify SUS in Section 4.5
sus_old = r"Usability of the CivicTrack integrated platform (Condition~B compared to baseline portal experience) was evaluated using the 10-item System Usability Scale (SUS)"
sus_new = r"Usability of the CivicTrack integrated platform (\hl{Condition~B; the SUS was not used to compare conditions}) was evaluated using the 10-item System Usability Scale (SUS)"
content = content.replace(sus_old, sus_new)

# 6. Update Conclusion point 2
c2_old = r"\item \textbf{Schedule Comprehension:} Synchronized dual-bar timelines with explicit variance cues significantly reduce completion time ($p < 0.001$) and statistically elevate delay detection accuracy from 50.0\% to 93.8\% ($p = 0.016$)."
c2_new = r"\item \textbf{Schedule Comprehension:} \hl{A bundled timeline condition with explicit variance cues significantly reduced completion time ($p < 0.001$) and increased delay detection accuracy from 50.0\% to 93.8\% ($p = 0.016$); because explicit delay badges were absent in Condition A, these gains cannot be attributed to the timeline graphic alone.}"
content = content.replace(c2_old, c2_new)

with open('paper/latex/main.tex', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully harmonized main.tex with explicit parity claims and labels!")

