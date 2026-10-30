import os

main_tex_path = 'paper/latex/main.tex'
with open(main_tex_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Author block
old_author_snippet = """\\author{Ahmad Syifa'ul Falakhul Khayyi\\inst{1} \\and Aimatus Sholiha\\inst{1}}
%
\\authorrunning{A. S. F. Khayyi and A. Sholiha}
%
\\institute{Department of Informatics and Computer Engineering, \\\\
Electronic Engineering Polytechnic Institute of Surabaya, Surabaya 60111, Indonesia \\\\
\\email{\\{khayyi, aimatus\\}@student.pens.ac.id}}"""

new_author_snippet = """\\author{Ahmad Syifa'ul Falakhul Khayyi\\inst{1} \\and Aimatus Sholiha\\inst{1}}
%
\\authorrunning{A. S. F. Khayyi and A. Sholiha}
%
\\institute{Dept. of Informatics and Computer Engineering, Politeknik Elektronika Negeri Surabaya, Surabaya, Indonesia\\\\
\\email{khayyi@it.student.pens.ac.id, aimatus@it.student.pens.ac.id}}"""

# Normalize CRLF/LF for safe replacement
content_norm = content.replace('\r\n', '\n')
old_author_norm = old_author_snippet.replace('\r\n', '\n')
new_author_norm = new_author_snippet.replace('\r\n', '\n')

assert old_author_norm in content_norm, "Old author block not found!"
content_norm = content_norm.replace(old_author_norm, new_author_norm)

# 2. Disable highlights
old_soul = "\\usepackage{soul}\n\\sethlcolor{yellow}"
new_soul = "\\newcommand{\\hl}[1]{#1}"
assert old_soul in content_norm, "Old soul snippet not found!"
content_norm = content_norm.replace(old_soul, new_soul)

# 3. Figure widths
content_norm = content_norm.replace('[width=0.55\\textwidth]{figures/fig3_system_architecture.png}', '[width=0.60\\textwidth]{figures/fig3_system_architecture.png}')
content_norm = content_norm.replace('[width=0.55\\textwidth]{figures/fig_system_interface_comparison.png}', '[width=0.62\\textwidth]{figures/fig_system_interface_comparison.png}')
content_norm = content_norm.replace('[width=0.55\\textwidth]{figures/fig1_task_performance.png}', '[width=0.60\\textwidth]{figures/fig1_task_performance.png}')
content_norm = content_norm.replace('[width=0.40\\textwidth]{figures/fig2_missing_stale_perception.png}', '[width=0.46\\textwidth]{figures/fig2_missing_stale_perception.png}')
content_norm = content_norm.replace('[width=0.40\\textwidth]{figures/fig4_combined_usability_quality.png}', '[width=0.46\\textwidth]{figures/fig4_combined_usability_quality.png}')

# 4. Remove Acknowledgments
old_credits = """\\begin{credits}\\vspace{-8pt}
\\subsubsection*{\\ackname}\\vspace{-4pt}
\\noindent\\small The authors thank the Department of Informatics and Computer Engineering, PENS, and Diskominfo Kabupaten Lamongan for providing administrative and spatial data references.

\\vspace{-6pt}
\\subsubsection*{\\discintname}\\vspace{-4pt}
\\noindent\\small The authors have no competing interests to declare that are relevant to the content of this article.
\\end{credits}"""
old_credits_norm = old_credits.replace('\r\n', '\n')
assert old_credits_norm in content_norm, "Old credits block not found!"
content_norm = content_norm.replace(old_credits_norm, '')

# Write back with CRLF or LF (native)
with open(main_tex_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content_norm.replace('\n', '\r\n'))

print("Successfully updated paper/latex/main.tex!")

