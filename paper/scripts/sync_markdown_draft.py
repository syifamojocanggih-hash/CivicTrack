with open('paper/draft_paper_CivicTrack_ICLAMP2027.md', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update statutory disclosures and LPSE/Satu Data Lamongan citations
old_p2 = '''In regional administrations such as Lamongan Regency, East Java, statutory disclosures published via municipal e-procurement portals (e.g., LPSE Kabupaten Lamongan) and open government data repositories (e.g., Satu Data Lamongan) sequester public works data in static tabular registries, fragmented spreadsheets, or dense PDF tender documents [11, 18].'''
new_p2 = '''In regional administrations such as Lamongan Regency, East Java, statutory disclosures published via municipal e-procurement portals (LPSE Kabupaten Lamongan) [Jaelani & Manar, 2024] and the official open data repository (Satu Data Lamongan) [Pemerintah Kabupaten Lamongan, 2024; https://satudata.lamongankab.go.id, accessed 15 October 2024] sequester public works data in static tabular registries, fragmented spreadsheets, or dense PDF tender documents [Matheus et al., 2021; Zhao et al., 2023].'''
text = text.replace(old_p2, new_p2)

# 2. Update preliminary field observation sentence
old_p3 = '''A more acute cognitive and usability bottleneck identified during preliminary field observations is the prevalent conflation among three distinct operational dimensions: physical milestone progress, calendar duration elapsed, and field reporting recency [12, 18].'''
new_p3 = '''A more acute operational bottleneck identified during our preliminary field observations in Lamongan is the prevalent conflation among three distinct dimensions: physical milestone progress, calendar duration elapsed, and field reporting recency.'''
text = text.replace(old_p3, new_p3)

# 3. Disambiguate Task 2 & Task 3 in Section 3.5
old_t2 = '''- **Task 2 (Schedule Delay Identification):** "Identify which project in the assigned set is experiencing an execution delay relative to its scheduled milestone target." (Set A Key: `SGO-GND-001`; Set B Key: `SMB-RDR-001`).'''
new_t2 = '''- **Task 2 (Schedule Delay Identification):** Identify the delayed road infrastructure project located in Kecamatan Sugio (Set A, Key: `SGO-GND-001`) / Kecamatan Sambeng (Set B, Key: `SMB-RDR-001`) that is failing to meet its physical milestone baseline (disambiguating the designated regional target from the 4 delayed works per set).'''
text = text.replace(old_t2, new_t2)

old_t3 = '''- **Task 3 (Update Recency Lookup):** "State the calendar date of the latest field inspection update for Project [Code] and verify whether this date matches the contract deadline." (Set A Key: 10/10/2024 $\neq$ 30/11/2024; Set B Key: 11/10/2024 $\neq$ 31/10/2024).'''
new_t3 = '''- **Task 3 (Update Recency Lookup):** State the calendar date of the latest field inspection update for Project [Code] and verify whether this date matches the contract deadline displayed in the interface (Set A Key: 10/10/2024 $\neq$ 30/11/2024; Set B Key: 11/10/2024 $\neq$ 31/10/2024).'''
text = text.replace(old_t3, new_t3)

with open('paper/draft_paper_CivicTrack_ICLAMP2027.md', 'w', encoding='utf-8') as f:
    f.write(text)

print("Successfully synchronized draft_paper_CivicTrack_ICLAMP2027.md!")

