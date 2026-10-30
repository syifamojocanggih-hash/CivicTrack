with open('paper/draft_paper_CivicTrack_ICLAMP2027.md', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Intro cross-reference
old_intro = 'Preliminary field observations conducted between August and September 2024 involved 12 civic community members and local residents in Lamongan examining municipal public works information'
new_intro = 'Preliminary field observations conducted between August and September 2024 involved 12 civic community members and local residents in Lamongan (detailed as Study 0 in Section 3.5) examining municipal public works information'
text = text.replace(old_intro, new_intro)

# 2. Add Study 0
old_s1 = '### 3.5 Experimental Protocols\n\n#### Study 1: Baseline Information Validation (Systemic Audit)'
new_s0 = '''### 3.5 Experimental Protocols

#### Study 0: Formative Field Inquiry (Needs Assessment)
Prior to experimental testing, an exploratory field inquiry with 12 local citizens in Lamongan (detailed in Section 1) identified the two core cognitive breakdowns motivating CivicTrack: the *Duration-as-Progress Fallacy* (conflating elapsed duration with execution progress, 75.0%) and reporting staleness ambiguity. These observations directly established the interface requirements and hypotheses evaluated in Studies 1--3.

#### Study 1: Baseline Information Validation (Systemic Audit)'''

if old_s1 in text:
    text = text.replace(old_s1, new_s0)
    print('Added Study 0')
else:
    old_s1_crlf = old_s1.replace('\n', '\r\n')
    new_s0_crlf = new_s0.replace('\n', '\r\n')
    if old_s1_crlf in text:
        text = text.replace(old_s1_crlf, new_s0_crlf)
        print('Added Study 0 (CRLF)')

# 3. Update SUS
old_sus = 'evaluated using the 10-item System Usability Scale (SUS) [17]'
new_sus = 'evaluated using the 10-item System Usability Scale (SUS) [Brooke, 1996]'
text = text.replace(old_sus, new_sus)

old_bench = 'ranks at the **92.5th percentile** of evaluated software systems, and garners an adjective rating of **"Excellent"**.'
new_bench = 'ranks at the **92.5th percentile** of evaluated software systems under empirical benchmark curves [Bangor et al., 2009; Sauro, 2011], and garners an adjective rating of **"Excellent"**.'
text = text.replace(old_bench, new_bench)

with open('paper/draft_paper_CivicTrack_ICLAMP2027.md', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated markdown draft successfully')

