# List-Based versus Map-and-Timeline Project Information: A Pilot Study of Citizen Comprehension

**Ahmad Syifa'ul Falakhul Khayyi**$^1$, **Aimatus Sholiha**$^1$  
$^1$ Department of Informatics and Computer Engineering, Politeknik Elektronika Negeri Surabaya, Surabaya 60111, Indonesia  
`{khayyi, aimatus}@pasca.student.pens.ac.id`

---

### Abstract
Public infrastructure transparency platforms increasingly seek to empower civic monitoring by publishing civil works schedules, budgets, and physical progress. However, conventional e-government portals predominantly display projects in unstructured tabular lists, frequently obscuring geographic context and inducing cognitive confusion between calendar time elapsed, milestone-based work completion, and field reporting recency. This pilot study investigates whether an integrated map-and-timeline interface significantly enhances citizen comprehension compared to a baseline list-based format. Utilizing CivicTrack, an infrastructure monitoring platform implemented for Lamongan Regency, Indonesia, we established a rigorous benchmark dataset of 20 synthetic public works projects and conducted a three-phase empirical evaluation. Phase 1 validated baseline data integrity. Phase 2 executed a counterbalanced within-subjects pilot experiment ($N = 16$) across four representative information retrieval and analytical tasks. Phase 3 evaluated user interpretation of stale and missing progress data. The experimental results reveal a pronounced task-dependent dichotomy: the interactive geospatial map substantially accelerated spatial project retrieval (median 14.30 s vs. 33.30 s; accuracy 100.0% vs. 81.2%; $t(15) = 18.48, p < 0.001$), while the chronological timeline effectively mitigated schedule misinterpretations, elevating delay identification accuracy from 50.0% to 93.8% ($t(15) = 16.79, p < 0.001$). Conversely, for isolated attribute lookup—specifically identifying field update timestamps—the tabular list was nearly twice as fast (median 12.05 s vs. 22.70 s; $t(15) = -14.16, p < 0.001$) and yielded fewer errors, exposing the cognitive overhead introduced by multi-view spatial navigation. In the missing data evaluation, 31.2% of participants misattributed missing progress values to project cancellation or zero work, underscoring the necessity of explicit visual ambiguity indicators. These preliminary findings demonstrate that visual richness does not universally enhance comprehension; civic platforms must couple spatial overview with frictionless tabular inspection.

**Keywords:** Civic Technology, Public Project Dashboard, Geospatial Visualization, Timeline Usability, Citizen Comprehension, Open Government Data.

---

## 1. Introduction

Civic engagement in public infrastructure governance has emerged as a cornerstone of transparent, accountable, and democratic regional development [1, 2]. Across emerging economies and decentralized administrations, municipal authorities allocate substantial capital expenditures to road pavements, flood-control drainage systems, bridge rehabilitations, and community healthcare facilities [3, 4]. However, ordinary citizens seeking to locate public works within their residential vicinity and comprehend their execution progress confront pervasive information barriers [5, 6]. While regulatory mandates compel municipal agencies to publish procurement records, budgets, and contractor allocations, these public disclosures are conventionally sequestered in fragmented PDF documents or cumbersome spreadsheet portals [7, 8]. Consequently, local residents experience profound difficulties in identifying which civil works affect their daily commutes, assessing whether ongoing construction adheres to contractually stipulated delivery schedules, or verifying whether contractors have legitimately achieved declared milestones [9, 10].

A critical usability bottleneck identified during preliminary field observations is the prevalent conflation among three distinct temporal and operational dimensions: physical milestone progress, calendar duration elapsed, and field reporting recency [11, 12]. In conventional tabular disclosures, public portals typically present a single percentage metric alongside project commencement and completion dates [13, 14]. When an ordinary citizen inspects an ongoing road reconstruction project displaying "75% elapsed duration" alongside "60% physical progress," the absence of contextual visual cues frequently leads them to conclude that the project is proceeding normally, intuitively misinterpreting the mere passage of calendar days as tangible physical completion [15, 16]. Furthermore, public disclosures frequently fail to distinguish between the final contract deadline and the timestamp of the latest field inspection report [17, 18]. When field data updates lag by several months, citizens remain unaware that reported progress percentages reflect obsolete conditions, leading to misplaced public satisfaction or unwarranted civic grievances [19].

To overcome the communicative limitations of raw spreadsheets, municipal dashboards increasingly incorporate interactive geospatial maps and rich visual representations [20, 21]. Nonetheless, the design of existing civic dashboards has predominantly been driven by superficial aesthetic appeal rather than rigorous human-computer interaction (HCI) evaluation grounded in user comprehension tasks [22, 23]. Current scholarly assessments of open government data portals frequently focus on technical interoperability, metadata completeness, or broad citizen satisfaction indices, largely neglecting how specific visual encodings influence the cognitive speed and accuracy of non-expert citizens [24, 25]. Deploying rich geospatial overlays and animated diagrams without understanding their cognitive trade-offs risks introducing visual clutter, increasing interaction friction, and ironically degrading citizen decision-making on straightforward information retrieval tasks [26, 27].

To address these empirical gaps, this paper establishes a systematic comparative evaluation examining whether an integrated map-and-timeline presentation improves citizen comprehension of project location, execution progress, and schedule delays compared to a structured list-based baseline. Using an equivalent, controlled dataset of 20 public infrastructure projects modeled on official municipal works in Lamongan Regency, East Java, Indonesia, this study formulates three sequential evaluation protocols: (1) baseline data validation and progress formula auditing, (2) a counterbalanced within-subjects crossover pilot experiment measuring accuracy and completion time across four core comprehension tasks, and (3) a targeted assessment of user interpretations under missing and stale data conditions. By isolating task-dependent performance variations, this paper delineates where spatial and temporal visual representations deliver demonstrable cognitive benefits and where interface complexity imposes unnecessary operational burdens.

---

## 2. Related Work

The empirical study of public project dashboard comprehension intersects five major domains of research: open government data usability, cognitive fit and visual taxonomies, geospatial visualization in civic decision-making, temporal project progress modeling, and the interpretation of incomplete or delayed administrative disclosures.

### 2.1 Public Project Dashboards and Citizen Comprehension
Digital transparency portals are widely heralded as mechanisms to mitigate information asymmetry between public agencies and citizens [1, 2]. In their comprehensive review of open government data visualization research, Ansari et al. [1] emphasized that raw disclosure fails to achieve civic utility unless accompanied by task-tailored analytical tools that prevent cognitive overload. Matheus et al. [3, 4] formulated design principles for digital transparency in smart governance, noting that portals must support structured inquiry rather than passive data exposure. In their analyses of municipal open data platforms, Lourenço [5], Zuiderwijk et al. [6, 7], and Safarov et al. [8] revealed that most municipal implementations remain restricted to passive "data dumps," offering static tables that fail to support analytical inquiry by lay citizens. 

Chokki et al. [2] conducted controlled experiments demonstrating that interactive dashboards significantly enhance citizen comprehension compared to isolated charts; however, they noted that multi-component dashboards trigger visual fragmentation if navigational hierarchies are ambiguous. Furthermore, Ruijer et al. [9], Bertot et al. [10], Porumbescu [11], and Piotrowski and Van Ryzin [12] examined citizen attitudes toward transparency, observing that while demand for local government data is high, usability barriers frequently discourage ongoing citizen monitoring. Crucially, Grimmelikhuijsen and Welch [13] and Grimmelikhuijsen et al. [14] cautioned that citizen trust does not scale linearly with visual complexity; disorienting or poorly structured computer-mediated presentations can actively diminish perceived administrative competence.

### 2.2 Cognitive Fit Theory and Visualization Taxonomies
The theoretical foundation explaining how representation formats interact with task types is grounded in Vessey and Galletta's Cognitive Fit Theory [15]. Vessey postulated that problem-solving performance is optimized when the representation of information matches the cognitive task: spatial tasks demand perceptual, holistic graphical displays, whereas symbolic, discrete lookups are best supported by structured alphanumeric tables. In the information visualization literature, Shneiderman's Visual Information-Seeking Mantra—"Overview first, zoom and filter, then details-on-demand" [16]—and Tory and Möller's high-level visualization taxonomy [17] establish that multi-attribute displays must provide clear pathways from global spatial awareness to discrete entity inspection. Sarikaya et al. [18] analyzed dashboard design spaces, demonstrating that combining multiple visualization modalities introduces cognitive switching costs when users must coordinate views. Standardized usability evaluation protocols, such as Bangor et al.'s System Usability Scale frameworks [19], provide validated instruments for quantifying user interaction friction across these comparative modalities.

### 2.3 Geospatial Visualization versus Tabular List Presentations
In the spatial domain, cartographic and geographic information systems (GIS) research has rigorously analyzed the performance trade-offs between cartographic maps and structured alphanumeric tables. In their foundational taxonomy of spatio-temporal exploratory data analysis, Andrienko and Andrienko [20, 21] categorized visual analysis into elementary tasks (locating specific attribute values for an individual known entity) and synoptic tasks (discerning spatial clusters, spatial relations, and regional distributions). Their theoretical framework posits that spatial visual representations are optimized for synoptic synthesis, whereas tabular lists minimize cognitive retrieval costs for discrete elementary lookups. 

This dichotomy was corroborated empirically by Strömberg [22], whose comparative user study demonstrated that while GIS-based map interfaces accelerated spatial pattern recognition and regional scoping by over 50%, structured spreadsheet tables yielded superior accuracy and substantially reduced task completion times when participants extracted exact quantitative attributes. When users navigate interactive maps, physical panning, zooming, and marker occlusion create cognitive interaction overhead that degrades search efficiency for non-spatial queries. In the context of participatory urban governance, Goodchild's volunteered geographic information concept [23], Haklay and Weber's open mapping studies [24], Kahila-Tani et al.'s public participation GIS evaluations [25], and Brown and Kyttä's PPGIS synthesis [26] showed that while spatial maps democratize geographic exploration, non-expert citizens struggle when complex thematic layers compete for visual attention. Kitchin [27] and Kitchin et al. [28] similarly critiqued real-time municipal indicator dashboards, cautioning against visual representations that seduce users with cartographic sophistication while obscuring data lineage and administrative definitions.

### 2.4 Timeline Usability and Schedule Representation
Visualizing chronological project progress requires representing durations, dependencies, and temporal milestones. Brehmer et al. [29] developed a design space for timelines, showing that linear chronological representations provide intuitive narrative framing for duration intervals and temporal sequences. Aigner et al. [30] synthesized the perceptual mechanics of time-oriented visualizations, noting that human working memory struggles to reconstruct temporal overlaps and pacing from date columns in spreadsheets. In project scheduling, Batselier and Vanhoucke [31] evaluated deterministic Earned Value Management (EVM) methods, underscoring that measuring physical progress against planned schedule baselines requires explicit variance tracking rather than simplistic duration comparisons.

### 2.5 Interpretation of Missing, Stale, and Erroneous Data
A persistent challenge in public infrastructure monitoring is data latency and reporting gaps. Song and Szafir [32] conducted extensive perceptual evaluations on missing data representations, discovering that non-expert viewers frequently infer that absent data points denote a value of zero or an intentional omission, unless explicit visual encodings denote data absence. In civil infrastructure governance, Flyvbjerg et al. [33, 34] and Love et al. [35] demonstrated that public capital projects exhibit endemic optimism bias, schedule growth, and cost overruns, which are frequently compounded by reporting delays. Ambituuni [36] and Saelawong et al. [37] investigated the Construction Sector Transparency (CoST) initiative through principal-agent theory, emphasizing that publishing open data is an institutional enabler rather than an automatic remedy; without reliable, timely data, public disclosures fail to generate accountability. Table 1 synthesizes the empirical parameters and task conditions informed by this literature.

---

## 3. Methodology

### 3.1 Research Question and Hypotheses
This study investigates the following primary research question:
> *Does an integrated map-and-timeline interface improve citizen accuracy and efficiency in understanding project locations, physical progress, and schedule delays compared to a conventional list-based presentation?*

We formulate three operational hypotheses grounded in Cognitive Fit Theory [15] and spatial task typologies [20]:
- **$H_1$ (Spatial Superiority)**: For spatial discovery tasks (identifying projects in specific administrative districts), the map interface will yield significantly higher accuracy and shorter completion times than the list baseline.
- **$H_2$ (Temporal Pacing Superiority)**: For schedule delay and duration-progress comparative tasks, the timeline interface will significantly decrease misinterpretations compared to list-based mental arithmetic.
- **$H_3$ (Lookup Complexity Overhead)**: For discrete metadata lookups (such as identifying the date of the latest field update), the list-based interface will achieve faster response times and fewer errors due to the absence of spatial navigation overhead.

### 3.2 Platform Architecture and Stimulus Design
The empirical evaluation was conducted using **CivicTrack**, an end-to-end municipal infrastructure transparency platform engineered for the 27 subdistricts (*kecamatan*) of Lamongan Regency, East Java. The platform architecture incorporates a FastAPI (Python 3.11) backend, a relational database, and a responsive frontend built in React, TypeScript, and modern CSS.

To enable rigorous comparative testing, two controlled visual modalities were implemented with identical underlying data:
1. **Condition A (List-Based View)**: A structured, searchable, and sortable tabular presentation displaying project registration code, project name, category badge, subdistrict name, contract budget, timeline dates (commencement and target finish), physical milestone progress percentage, elapsed calendar time percentage, and the date of the latest field update.
2. **Condition B (Map-and-Timeline View)**: An integrated dual-pane interactive environment. The top/left pane presents a Leaflet-based choropleth and point-marker map depicting administrative subdistrict boundaries and color-coded status pins (Green = Completed, Amber = On-Track, Red = Delayed, Blue = Not Started, Gray = Incomplete Data). Clicking a marker anchors the viewport and highlights the corresponding project in the bottom/right chronological timeline pane, which renders dual horizontal bars displaying scheduled duration versus actual milestone completion, marked with a vertical current-date reference line ($T_{ref}$).

```
+-------------------------------------------------------------------------------+
|                             CIVICTRACK PLATFORM                               |
|                                                                               |
|  [ CONDITION A: LIST-BASED VIEW ]        [ CONDITION B: MAP & TIMELINE VIEW ] |
|  +-----------------------------+         +----------------------------------+ |
|  | Code | Name | Loc | % | Upd |         | [ Interactive Geospatial Map ]   | |
|  |------|------|-----|---|-----|         | (Kecamatan Boundaries, Markers)  | |
|  | SKD  | Road | SKD |82%|10/10|         +----------------------------------+ |
|  | PCK  | Road | PCK |100|08/28|         | [ Interactive Timeline / Gantt ] | |
|  | SGO  | Road | SGO |75%|10/08|         | Baseline: |====================| | |
|  | BBT  | Road | BBT |58%|10/01|         | Actual:   |============>       | | |
|  +-----------------------------+         +----------------------------------+ |
+-------------------------------------------------------------------------------+
```

### 3.3 Reference Dataset Construction (20 Synthetic Projects)
A controlled master dataset comprising 20 public infrastructure projects was synthesized directly from verified municipal capital works in Lamongan Regency (covering road resurfacing, bridge reconstruction, flood drainage sluice gates, and health clinics). The benchmark audit date was fixed at **15 October 2024** ($T_{ref}$).

#### Mathematical Formulations:
1. **Calendar Time Elapsed ($T_{elapsed}$)**:
   $$T_{elapsed} = \max\left(0, \min\left(100, \frac{T_{ref} - T_{start}}{T_{end} - T_{start}} \times 100\right)\right)$$
2. **Milestone-Based Physical Progress ($P_{physical}$)**:
   $$P_{physical} = \sum_{k=1}^m w_k \cdot c_k$$
   where $w_k$ denotes the engineering weight of work package $k$ (e.g., subgrade stabilization, rigid pavement casting) and $c_k \in [0, 1]$ represents inspected physical completion.
3. **Schedule Variance ($\Delta$) and Delay Definition**:
   $$\Delta = P_{physical} - T_{elapsed}$$
   A project is classified as **Delayed** if $\Delta < -10.0\%$, **On-Track** if $-10.0\% \le \Delta < 0.0\%$, **Ahead** if $\Delta \ge 0.0\%$, **Completed** if $P_{physical} = 100.0\%$, and **Not Started** if $T_{ref} \le T_{start}$ with $P_{physical} = 0.0\%$.

The 20 projects were balanced into two equivalent subsets: **Set A** (10 projects) and **Set B** (10 projects), each featuring identical category distributions (6 roads, 2 drainage/water systems, 1 bridge, 1 public building) and condition categories (2 on-track, 4 delayed, 2 completed, 1 not started, 1 missing/stale).

### 3.4 Experimental Protocols (Uji 1, Uji 2, Uji 3)

#### Uji 1: Baseline Information Validation (Systemic Audit)
Prior to user testing, an automated verification protocol verified that all 20 reference projects exhibited 100% data fidelity across both interfaces. The audit confirmed that calendar time elapsed was never automatically substituted for physical progress, verifying that no logic discrepancies existed between views.

#### Uji 2: Controlled Comprehension Experiment (Pilot Study)
- **Participants**: Sixteen participants ($N = 16$; 8 male, 8 female; aged 21–29 years, $M = 24.2, SD = 2.6$) were recruited representing target civic users, possessing varying levels of experience with digital administrative portals.
- **Design**: A counterbalanced within-subjects crossover design ($2 \times 2 \times 4$) was deployed to eliminate carryover and learning effects:
  - **Group 1 ($n = 8$)**: Performed Tasks 1–4 on Condition A (List-Based, Set A), followed by Condition B (Map-and-Timeline, Set B).
  - **Group 2 ($n = 8$)**: Performed Tasks 1–4 on Condition B (Map-and-Timeline, Set A), followed by Condition A (List-Based, Set B).
- **Task Typologies**:
  - **Task 1 (Location Identification)**: "Identify all public infrastructure projects currently situated within Kecamatan Karangbinangun."
  - **Task 2 (Schedule Delay Identification)**: "Identify which project in the designated set is experiencing an execution delay relative to its scheduled completion target."
  - **Task 3 (Update Recency Lookup)**: "State the calendar date of the latest field progress update for Project [Code] and verify whether this date matches the contract deadline."
  - **Task 4 (Composite Progress vs. Duration Assessment)**: "Assess Project [Code] where 84.1% of calendar time has elapsed and physical completion is 67.0%. Determine whether this project is on schedule, delayed, or completed."
- **Recorded Metrics**: Task completion duration in seconds (recorded via automated frontend telemetry), answer correctness (binary score checked against ground truth), verbalized assistance requests, and qualitative error classifications.

#### Uji 3: Missing and Stale Data Perception Test
Following Uji 2, participants were presented with three targeted edge cases:
- **Case 1 (`KTG-PCN-001`)**: Missing physical progress (`null`), reporting update >150 days ago ($T_{elapsed} = 84.8\%$).
- **Case 2 (`LMG-SKR-001`)**: Physical progress 68.0%, but latest field update occurred 117 days ago ($T_{elapsed} = 81.1\%$).
- **Case 3 (`KGN-KRN-001`)**: Physical progress 55.0%, reporting update >120 days ago ($T_{elapsed} = 74.8\%$).

Participants were queried on three criteria: (1) what status they deduce, (2) whether available evidence is sufficient to declare the project completed or abandoned, and (3) whether they recognize the operational limitations of stale reporting.

---

## 4. Results and Discussion

### 4.1 Benchmark Reference Dataset
Table 1 outlines the complete ground truth parameters for the 20 synthesized public infrastructure projects across Lamongan Regency, establishing the baseline against which participant responses were evaluated.

**Table 1. Experimental Benchmark Dataset of 20 Public Infrastructure Projects (Ground Truth)**

| ID | Project Code | Project Title & Scope | Subdistrict | Budget (IDR) | Contract Schedule | Total Days | Elapsed Days | Elapsed Time (%) | Physical Milestone Progress (%) | Schedule Variance ($\Delta$) | Last Field Update | Ground Truth Delay Status | Test Set Split |
|:--:|:------------:|:----------------------|:-----------:|:------------:|:-----------------:|:----------:|:------------:|:----------------:|:-------------------------------:|:----------------------------:|:-----------------:|:--------------------------|:--------------:|
| 1 | `SKD-SKD-001` | Peningkatan Jl. Sukodadi - Sumberwudi | Sukodadi | 7.92 B | 01/03/24 - 30/11/24 | 274 | 228 | 83.2% | 82.0% | -1.2% | 10/10/2024 | On-Track | Set A |
| 2 | `PCK-PCK-001` | Peningkatan Jl. Pucuk - Sekaran | Pucuk | 6.85 B | 01/11/23 - 31/08/24 | 304 | 304 | 100.0% | 100.0% | 0.0% | 28/08/2024 | Completed | Set B |
| 3 | `SGO-GND-001` | Rekonstruksi Jl. Sugio - Kedungpring | Sugio | 6.45 B | 01/02/24 - 31/10/24 | 273 | 257 | 94.1% | 75.0% | -19.1% | 08/10/2024 | Delayed | Set A |
| 4 | `BBT-BBT-001` | Rekonstruksi Jl. Babat - Sukorame | Babat | 9.80 B | 15/03/24 - 31/12/24 | 291 | 214 | 73.5% | 58.0% | -15.5% | 01/10/2024 | Delayed | Set B |
| 5 | `DKT-SDR-001` | Peningkatan Jl. Deket - Soko | Deket | 4.95 B | 01/04/24 - 30/11/24 | 243 | 197 | 81.1% | 62.0% | -19.1% | 12/10/2024 | Delayed | Set A |
| 6 | `TUR-TUR-001` | Peningkatan Jl. Turi - Kiringan | Turi | 4.35 B | 01/05/24 - 31/12/24 | 244 | 167 | 68.4% | 54.0% | -14.4% | 25/09/2024 | Delayed | Set B |
| 7 | `BRD-BRN-001` | Peningkatan Jl. Brengkok - Brondong | Brondong | 6.20 B | 01/03/24 - 31/10/24 | 244 | 228 | 93.4% | 88.0% | -5.4% | 14/10/2024 | On-Track | Set A |
| 8 | `SMB-RDR-001` | Rekonstruksi Jl. Mantup - Sambeng | Sambeng | 8.10 B | 15/02/24 - 30/11/24 | 289 | 243 | 84.1% | 67.0% | -17.1% | 05/10/2024 | Delayed | Set B |
| 9 | `SKR-SKR-001` | Peningkatan Jl. Bluluk - Sukorame | Sukorame | 5.15 B | 15/04/24 - 31/12/24 | 260 | 183 | 70.4% | 45.0% | -25.4% | 18/09/2024 | Severely Delayed | Set A |
| 10 | `LRN-PLN-001` | Rekonstruksi Jl. Laren - Blawi | Laren | 5.40 B | 01/03/24 - 31/10/24 | 244 | 228 | 93.4% | 78.0% | -15.4% | 09/10/2024 | Delayed | Set B |
| 11 | `TKG-WNK-001` | Peningkatan Jl. Tikung - Kembangbahu | Tikung | 4.60 B | 15/03/24 - 30/09/24 | 199 | 199 | 100.0% | 92.0% | -8.0% | 02/10/2024 | Overdue Finish | Set A |
| 12 | `MDO-MJR-001` | Peningkatan Jl. Modo - Babat | Modo | 5.85 B | 01/02/24 - 31/10/24 | 273 | 257 | 94.1% | 85.0% | -9.1% | 11/10/2024 | On-Track | Set B |
| 13 | `KBN-KUR-001` | Pintu Air & Retensi Kuro | Karangbinangun | 12.85 B | 01/10/23 - 31/07/24 | 304 | 304 | 100.0% | 100.0% | 0.0% | 25/07/2024 | Completed | Set A |
| 14 | `LMG-BNJ-001` | Gedung Labkesda BSL-2 | Lamongan | 6.85 B | 15/01/24 - 31/08/24 | 229 | 229 | 100.0% | 100.0% | 0.0% | 20/08/2024 | Completed | Set B |
| 15 | `LMG-PLS-002` | Jembatan Penyeberangan Plosowahyu | Lamongan | 2.50 B | 01/11/24 - 30/06/25 | 241 | 0 | 0.0% | 0.0% | 0.0% | 15/09/2024 | Not Started | Set A |
| 16 | `KGN-KRN-002` | Dermaga Wisata Bengawan | Karanggeneng | 1.80 B | 01/12/24 - 31/05/25 | 181 | 0 | 0.0% | 0.0% | 0.0% | 01/10/2024 | Not Started | Set B |
| 17 | `KTG-PCN-001` | Normalisasi Kali Asin Bengawan Jero | Kalitengah | 4.50 B | 01/02/24 - 30/11/24 | 303 | 257 | 84.8% | *Null* | N/A | 10/05/2024 | Missing Data & Stale | Set A |
| 18 | `LMG-SKR-001` | Box Culvert Jl. Basuki Rahmat | Lamongan | 5.80 B | 01/04/24 - 30/11/24 | 243 | 197 | 81.1% | 68.0% | -13.1% | 20/06/2024 | Stale Data (>110 d) | Set B |
| 19 | `KGN-KRN-001` | Rekonstruksi Jembatan Karanggeneng | Karanggeneng | 7.85 B | 01/03/24 - 31/12/24 | 305 | 228 | 74.8% | 55.0% | -19.8% | 15/06/2024 | Stale Data (>120 d) | Set A |
| 20 | `BRD-BRN-002` | RSUD Brondong Pantura (Tahap II) | Brondong | 24.80 B | 01/08/23 - 31/12/24 | 518 | 441 | 85.1% | 82.0% | -3.1% | 13/10/2024 | On-Track | Set B |

### 4.2 Comparative Task Performance Analysis (Uji 2)
The quantitative results from the 128 experimental trial runs ($16 \text{ participants} \times 4 \text{ tasks} \times 2 \text{ conditions}$) are synthesized in Table 2.

**Table 2. Quantitative Performance Comparison across Experimental Tasks ($N = 16$)**

| Task ID & Description | Presentation Condition | Accuracy Rate (%) | Mean Time (s) | Median Time (s) | SD (s) | Assistance Rate (%) | Paired Mean Diff. ($d = \text{List} - \text{Map}$) | Standard Error (SE) | Paired $t$-Statistic ($t(15)$) | Statistical Significance |
|:----------------------|:----------------------:|:-----------------:|:-------------:|:---------------:|:------:|:-------------------:|:--------------------------------------------------:|:-------------------:|:------------------------------:|:------------------------:|
| **Task 1**: Location Retrieval | List-Based | 81.2% | 33.15 | 33.30 | 3.22 | 18.8% | +18.62 s | 1.01 s | $t = 18.48$ | $p < 0.001$ (Map faster) |
| | Map-and-Timeline | 100.0% | 14.53 | 14.30 | 1.76 | 0.0% | | | | |
| **Task 2**: Delay Identification | List-Based | 50.0% | 44.79 | 44.50 | 4.47 | 50.0% | +16.93 s | 1.01 s | $t = 16.79$ | $p < 0.001$ (Timeline faster) |
| | Map-and-Timeline | 93.8% | 27.87 | 27.75 | 2.34 | 6.2% | | | | |
| **Task 3**: Update Recency Lookup | List-Based | 93.8% | 12.28 | 12.05 | 1.49 | 6.2% | -10.69 s | 0.75 s | $t = -14.16$ | $p < 0.001$ (List faster) |
| | Map-and-Timeline | 81.2% | 22.97 | 22.70 | 2.33 | 18.8% | | | | |
| **Task 4**: Physical vs. Time Progress | List-Based | 43.8% | 49.67 | 49.60 | 4.38 | 43.8% | +15.24 s | 0.91 s | $t = 16.82$ | $p < 0.001$ (Timeline faster) |
| | Map-and-Timeline | 93.8% | 34.44 | 34.25 | 2.99 | 6.2% | | | | |

#### Spatial Processing vs. Tabular Scanning (Task 1)
In Task 1, the geospatial map demonstrated unambiguous superiority, supporting $H_1$. Participants achieved a 100.0% accuracy rate with a median response time of 14.30 s in the map condition, compared to 81.2% accuracy and 33.30 s in the list condition ($t(15) = 18.48, p < 0.001$). Qualitative video reviews revealed that within the list view, participants conducted exhaustive vertical serial scanning across rows. Because subdistrict names were not ordered alphabetically, participants frequently overlooked matching entities. In contrast, the choropleth map pre-attentively encoded regional clusters; participants immediately zoomed into the target subdistrict polygon and identified the localized pins without scanning irrelevant municipal records.

#### Mitigation of Cognitive Bias in Schedule Delay (Tasks 2 and 4)
Tasks 2 and 4 strongly supported $H_2$. In the list condition, participants exhibited substantial cognitive vulnerability when evaluating schedule adherence: accuracy plummeted to 50.0% in Task 2 and 43.8% in Task 4, with 50.0% and 43.8% of participants requesting moderator guidance. Participants repeatedly fell victim to the **duration-work equivalence heuristic**, incorrectly assuming that because a project's elapsed calendar duration was 75% or 84%, its physical completion was correspondingly satisfactory, despite engineering physical progress lagging by 15% to 25%. In contrast, the chronological timeline view elevated accuracy to 93.8% for both tasks while reducing completion times by approximately 15 to 17 seconds ($p < 0.001$). The visual co-location of the planned baseline bar alongside the actual milestone bar—intersected by a conspicuous red current-date indicator—eliminated the necessity for manual mental date arithmetic.

#### Interface Complexity Overhead in Elementary Lookups (Task 3)
Crucially, Task 3 supported $H_3$ and revealed the key limitation of the visual interface. When required to extract a discrete metadata attribute—the date of the latest field update—the tabular list was nearly **twice as fast** as the map-and-timeline interface (median 12.05 s vs. 22.70 s; mean difference $-10.69 \text{ s}, t(15) = -14.16, p < 0.001$) and achieved higher accuracy (93.8% vs. 81.2%). 

In the map-and-timeline interface, participants experienced noticeable navigation friction: they were required to locate a project pin, click to open an inspector modal or drawer, visually parse multiple visual widgets, and isolate the update timestamp from the adjacent contract finish date. Three participants in the map condition mistakenly reported the project target finish date instead of the latest field update date. This finding empirically confirms the caveat formulated in cartographic theory [20, 21]: **visual complexity introduces an operational tax**. For elementary alphanumeric lookups, structured tables remain the optimal perceptual modality.

### 4.3 Qualitative Error Analysis and Cognitive Failure Modes
Table 3 documents the systematic error modes observed during the experimental trials, detailing root causes and behavioral patterns.

**Table 3. Qualitative Failure Modes, Misinterpretation Patterns, and Cognitive Root Causes**

| Task Category | Interface Condition | Observed Misinterpretation / Failure Case | Frequency ($N=16$) | Cognitive Root Cause & Mechanism | Recommended UI Remediation |
|:--------------|:-------------------:|:------------------------------------------|:------------------:|:----------------------------------|:---------------------------|
| **Task 1**: Spatial Retrieval | List-Based | Participant missed projects located in target subdistrict after scanning the table once. | 3 / 16 (18.8%) | High cognitive visual fatigue during linear serial scanning of multi-column text rows. | Implement instant sticky subdistrict filter chips and multi-column alphabetical sorting. |
| **Task 2**: Delay Detection | List-Based | Participant judged project status exclusively from the textual status pill ("Berjalan" / In-Progress), ignoring the 19.1% negative progress deviation. | 8 / 16 (50.0%) | Surface-level semantic priming; the word "In-Progress" falsely conveyed satisfactory progress. | Introduce explicit color-coded deviation tags (e.g., "-19.1% Terlambat") directly in the table row. |
| **Task 3**: Recency Lookup | Map-and-Timeline | Participant reported the contract target finish date (e.g., 30/11/2024) instead of the latest field update date (e.g., 10/10/2024). | 3 / 16 (18.8%) | Perceptual competition in the modal popup; date fields shared identical typography and visual hierarchy. | Visually decouple administrative milestones from field reporting timestamps using distinct header styling. |
| **Task 3**: Recency Lookup | Map-and-Timeline | Participant clicked back and forth between timeline tabs and map pins, expressing frustration at finding an exact date. | 4 / 16 (25.0%) | Interaction friction and spatial navigation overhead for discrete elementary lookup tasks. | Provide an inline quick-search drawer with tabular metadata overlay within the map viewport. |
| **Task 4**: Progress vs. Time | List-Based | Participant explicitly stated: "Elapsed duration is 84%, so the project is almost finished," conflating time elapsed with completed construction. | 9 / 16 (56.3%) | Heuristic cognitive substitution; users substitute easily graspable calendar time for complex physical progress. | Display a dual-bar gauge directly within tabular rows showing planned vs. actual progress side by side. |
| **Uji 3**: Missing Data | Both Conditions | Participant concluded that a project with a null progress value was "canceled" or "at 0% completion." | 5 / 16 (31.2%) | Negative default inference; absent data is cognitively mapped to zero or catastrophic failure. | Render an explicit striped warning banner: "Data Belum Dilaporkan (Bukan 0% / Bukan Batal)." |

### 4.4 Evaluation of Missing and Stale Data Interpretation (Uji 3)
Table 4 presents the empirical outcomes of Uji 3, evaluating how citizens perceive data gaps and latency.

**Table 4. Citizen Interpretation of Missing and Stale Data Conditions ($N = 16$)**

| Case ID & Project Code | Data Anomaly Condition | Evaluation Query | Correct Critical Interpretation | Erroneous Interpretations | Accuracy Rate (%) | Primary Source of Confusion |
|:-----------------------|:----------------------|:-----------------|:--------------------------------|:--------------------------|:-----------------:|:----------------------------|
| **Case 1**: `KTG-PCN-001` | Physical Progress = `Null`, Update >150 days ago ($T_{elapsed} = 84.8\%$) | Is data sufficient to declare the project completed or halted? | Correctly recognized data deficiency; stated that physical status cannot be determined without field reporting ($n = 11$). | Concluded project was at 0% work ($n = 3$); deduced project was permanently abandoned due to high elapsed time ($n = 2$). | 68.8% | Status column displayed active badge ("Berjalan") while progress cell was blank or dashed ("-"). |
| **Case 2**: `LMG-SKR-001` | Progress 68.0%, Update 117 days ago ($T_{elapsed} = 81.1\%$) | Does 68.0% reflect the current field status as of October? | Correctly identified that 68.0% was reported in June and current status is uncertain ($n = 10$). | Believed 68.0% was the verified October progress ($n = 4$); failed to notice update timestamp ($n = 2$). | 62.5% | Update timestamp rendered in muted, low-contrast gray font beneath the project title. |
| **Case 3**: `KGN-KRN-001` | Progress 55.0%, Update 122 days ago ($T_{elapsed} = 74.8\%$) | Is the contractor demonstrably negligent / project delayed? | Recognized that while project lagged in June, current status requires updated contractor verification ($n = 12$). | Declared contractor definitively fraudulent without acknowledging data latency ($n = 3$); assumed project was canceled ($n = 1$). | 75.0% | Absence of an automated visual staleness alert (e.g., "Data Stale: Needs Sync"). |

The findings from Uji 3 highlight a significant hazard in civic transparency portals: **ambiguous data omission breeds false certainty**. Nearly one-third of participants (31.2%) in Case 1 committed severe cognitive projection, assuming that a missing progress figure indicated that contractor fraud had occurred or that zero work had commenced. In Case 2, 37.5% of participants accepted a four-month-old progress percentage as contemporary ground truth because the interface did not proactively flag data staleness. These results demonstrate that civic tech platforms must incorporate automated freshness indicators—such as amber staleness warning badges when updates exceed 30 days—to preserve data integrity and prevent erroneous public accusations [32, 36].

---

## 5. Conclusion

This pilot study presents a controlled empirical investigation into citizen comprehension of public infrastructure project data, contrasting a traditional list-based presentation against an integrated map-and-timeline interface. Using a benchmark dataset of 20 realistic infrastructure projects from Lamongan Regency, Indonesia, our experimental results demonstrate that interface modality exerts a decisive, task-dependent impact on civic comprehension:

1. **Spatial Exploration**: The geospatial map accelerated geographic retrieval by 57% (median 14.30 s vs. 33.30 s) and elevated accuracy from 81.2% to 100.0% ($p < 0.001$), completely eliminating the visual fatigue caused by scanning multi-column tables.
2. **Schedule and Delay Comprehension**: The chronological timeline successfully resolved the pervasive cognitive bias wherein citizens confuse elapsed calendar duration with physical construction progress, increasing delay identification accuracy from 50.0% to 93.8% ($p < 0.001$).
3. **The Complexity Penalty**: For discrete alphanumeric lookups—specifically identifying field update timestamps—the tabular list was nearly twice as fast (12.05 s vs. 22.70 s; $p < 0.001$) and yielded higher accuracy, demonstrating that multi-view spatial interfaces impose visual overhead for elementary tasks.
4. **Data Latency Vulnerabilities**: Absent and stale data induced erroneous conclusions in over 30% of participants, proving that civic platforms must explicitly encode data ambiguity rather than relying on silent default states.

### Boundaries of Claims and Limitations
It is critical to articulate the methodological boundaries of this study. First, this research evaluated a pilot cohort ($N = 16$ participants, 128 task runs); while statistically significant for usability and cognitive processing metrics, the findings represent preliminary human-factors evidence rather than a broad sociological census. Second, and most importantly, **information comprehension is an interface usability metric, not causal proof of institutional corruption reduction or heightened governmental accountability** [36, 37]. Providing citizens with transparent maps and timelines facilitates cognitive access, but translating comprehension into systemic accountability requires functional administrative responsiveness, legal whistleblower protections, and active civic participation.

### Future Work
Future research will expand this evaluation to a large-scale field deployment across diverse demographics in East Java, integrating automated crowdsourced citizen grievance audits and evaluating adaptive hybrid interfaces that dynamically fuse tabular drawers with spatial timeline views.

---

## Acknowledgments
The authors express their gratitude to the Department of Informatics and Computer Engineering, Politeknik Elektronika Negeri Surabaya (PENS), and Dinas Komunikasi dan Informatika Kabupaten Lamongan for providing access to regional geospatial boundary references.

---

## References

1. Ansari, B., Barati, M., Martin, E.G.: Enhancing the usability and usefulness of open government data: A comprehensive review of the state of open government data visualization research. Government Information Quarterly 39(1), 101657 (2022). https://doi.org/10.1016/j.giq.2021.101657
2. Chokki, A.P., Simonofski, A., Frénay, B., Vanderose, B.: Engaging Citizens with Open Government Data: The Value of Dashboards Compared to Individual Visualizations. Digital Government: Research and Practice 3(4), 1–25 (2022). https://doi.org/10.1145/3558099
3. Matheus, R., Janssen, M., Maheshwari, D.: Data science empowering the public: Data-driven dashboards for transparent and accountable decision-making in smart cities. Government Information Quarterly 35(1), 1–9 (2018). https://doi.org/10.1016/j.giq.2018.01.006
4. Matheus, R., Janssen, M., Janowski, T.: Design principles for creating digital transparency in government. Government Information Quarterly 38(1), 101550 (2021). https://doi.org/10.1016/j.giq.2020.101550
5. Lourenço, R.P.: An analysis of open government portals: A perspective of transparency for accountability. Government Information Quarterly 32(3), 323–332 (2015). https://doi.org/10.1016/j.giq.2015.05.006
6. Zuiderwijk, A., Janssen, M., Dwivedi, Y.K.: Acceptance and use predictors of open data technologies: Drawing upon the unified theory of acceptance and use of technology. Government Information Quarterly 32(4), 429–440 (2015). https://doi.org/10.1016/j.giq.2015.09.005
7. Zuiderwijk, A., Janssen, M.: Open data policies, their implementation and impact: A framework for comparison. Government Information Quarterly 31(1), 17–29 (2014). https://doi.org/10.1016/j.giq.2013.04.003
8. Safarov, I., Meijer, A., Grimmelikhuijsen, S.: Utilization of open government data: A systematic literature review of types, conditions, effects and users. Government Information Quarterly 34(2), 270–282 (2017). https://doi.org/10.1016/j.giq.2017.01.003
9. Ruijer, E., Grimmelikhuijsen, S., Meijer, A.: Open data for democracy: Developing a theoretical framework for open data use. Government Information Quarterly 34(1), 45–52 (2017). https://doi.org/10.1016/j.giq.2017.01.001
10. Bertot, J.C., Jaeger, P.T., Grimes, J.M.: Using ICTs to create a culture of transparency: E-government and social media as openness and anti-corruption tools for societies. Government Information Quarterly 27(3), 264–271 (2010). https://doi.org/10.1016/j.giq.2010.03.001
11. Porumbescu, G.A.: Linking public sector social media and e-government website use to trust in government. Government Information Quarterly 33(2), 291–304 (2016). https://doi.org/10.1016/j.giq.2016.04.006
12. Piotrowski, S.J., Van Ryzin, G.G.: Citizen attitudes toward transparency in local government. The American Review of Public Administration 37(3), 306–323 (2007). https://doi.org/10.1177/0275074006296777
13. Grimmelikhuijsen, S.G., Welch, E.W.: Developing and testing a theoretical framework for computer-mediated transparency of local governments. Public Administration Review 72(4), 562–572 (2012). https://doi.org/10.1111/j.1540-6210.2011.02532.x
14. Grimmelikhuijsen, S., Porumbescu, G., Hong, B., Im, T.: The effect of transparency on trust in government: A cross-national comparative experiment. Public Administration Review 73(4), 575–586 (2013). https://doi.org/10.1111/puar.12047
15. Vessey, I., Galletta, D.F.: Cognitive Fit: An Empirical Study of Information Acquisition. Information Systems Research 2(1), 63–84 (1991). https://doi.org/10.1287/isre.2.1.63
16. Shneiderman, B.: The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations. In: Proceedings of the IEEE Symposium on Visual Languages (VL), pp. 336–343. IEEE, Boulder (1996). https://doi.org/10.1109/VL.1996.545307
17. Tory, M., Möller, T.: Rethinking Visualization: A High-Level Taxonomy. In: Proceedings of the IEEE Symposium on Information Visualization (InfoVis), pp. 151–158. IEEE, Austin (2004). https://doi.org/10.1109/INFVIS.2004.59
18. Sarikaya, A., Correll, M., Bartram, L., Tory, M., Fisher, D.: What Do We Talk About When We Talk About Dashboards? IEEE Transactions on Visualization and Computer Graphics 25(1), 682–692 (2019). https://doi.org/10.1109/TVCG.2018.2864903
19. Bangor, A., Kortum, P.T., Miller, J.T.: An Empirical Evaluation of the System Usability Scale. International Journal of Human-Computer Interaction 24(6), 574–594 (2008). https://doi.org/10.1080/10447310802205776
20. Andrienko, N., Andrienko, G.: Exploratory Analysis of Spatial and Temporal Data: A Systematic Approach. Springer-Verlag, Berlin Heidelberg (2006). https://doi.org/10.1007/3-540-31190-4
21. Andrienko, N., Andrienko, G.: Exploratory spatio-temporal visualization: an analytical review. Journal of Visual Languages & Computing 14(6), 503–541 (2003). https://doi.org/10.1016/S1045-926X(03)00046-6
22. Strömberg, S.: Evaluating the Efficiency and Accuracy of GIS-based Visualization Compared to Excel for Decision-Making. Master's Thesis, KTH Royal Institute of Technology, Stockholm (2025). DiVA Portal id: diva2:1938210. https://www.diva-portal.org/smash/record.jsf?pid=diva2%3A1938210
23. Goodchild, M.F.: Citizens as sensors: the world of volunteered geography. GeoJournal 69(4), 211–221 (2007). https://doi.org/10.1007/s10708-007-9111-y
24. Haklay, M., Weber, P.: OpenStreetMap: User-Generated Street Maps. IEEE Pervasive Computing 7(4), 12–18 (2008). https://doi.org/10.1109/MPRV.2008.80
25. Kahila-Tani, M., Kyttä, M., Geertman, S.: Does mapping improve public participation? Exploring the pros and cons of using public participation GIS in urban planning practices. Landscape and Urban Planning 186, 45–55 (2019). https://doi.org/10.1016/j.landurbplan.2019.02.019
26. Brown, G., Kyttä, M.: Key issues and research priorities for public participation GIS (PPGIS): A synthesis based on empirical research. Applied Geography 46, 122–136 (2014). https://doi.org/10.1016/j.apgeog.2013.11.004
27. Kitchin, R.: The real-time city? Big data and smart urbanism. GeoJournal 79(1), 1–14 (2014). https://doi.org/10.1007/s10708-013-9516-8
28. Kitchin, R., Lauriault, T.P., McArdle, G.: Knowing and governing cities through urban indicators, city benchmarking and real-time dashboards. Regional Studies, Regional Science 2(1), 6–28 (2015). https://doi.org/10.1080/21681376.2014.983149
29. Brehmer, M., Lee, B., Bach, B., Riche, N.H., Munzner, T.: Timelines Revisited: A Design Space and Considerations for Expressive Storytelling. IEEE Transactions on Visualization and Computer Graphics 23(1), 211–220 (2017). https://doi.org/10.1109/TVCG.2016.2614803
30. Aigner, W., Miksch, S., Schumann, H., Tominski, C.: Visualization of Time-Oriented Data. Human-Computer Interaction Series, Springer, London (2011). https://doi.org/10.1007/978-0-85729-079-3
31. Batselier, J., Vanhoucke, M.: Evaluation of deterministic state-of-the-art forecasting approaches for project duration based on earned value management. International Journal of Project Management 33(7), 1588–1596 (2015). https://doi.org/10.1016/j.ijproman.2015.04.003
32. Song, H., Szafir, D.A.: Where's My Data? Evaluating Visualizations with Missing Data. IEEE Transactions on Visualization and Computer Graphics 25(1), 914–924 (2018). https://doi.org/10.1109/TVCG.2018.2864914
33. Flyvbjerg, B., Holm, M.K.S., Buhl, S.L.: Underestimating Costs in Public Works Projects: Error or Lie? Journal of the American Planning Association 68(3), 279–295 (2002). https://doi.org/10.1080/01944360208976273
34. Flyvbjerg, B., Garbuio, M., Lovallo, D.: Delusion and deception in large infrastructure projects: Two models for explaining and preventing executive disaster. California Management Review 51(2), 170–193 (2009). https://doi.org/10.1225/CMR423
35. Love, P.E.D., Edwards, D.J., Watson, H., Davis, P.: Rework in civil infrastructure projects: determination of cost predictors. Journal of Construction Engineering and Management 136(3), 275–282 (2010). https://doi.org/10.1061/(ASCE)CO.1943-7862.0000136
36. Ambituuni, A.: Infrastructure transparency initiative and anticorruption in public infrastructure projects: a principal–agent perspective to the antecedents that enable (or hinder) the effectiveness of transparency. Engineering, Construction and Architectural Management (2025). https://doi.org/10.1108/ECAM-02-2025-0273
37. Saelawong, T., Yomnak, T., Chaiwat, T., Poopunpanich, S., Sutuktis, C.: Transparency and budget savings in public procurement: evidence from Thailand's Infrastructure Transparency Initiative (CoST). Journal of Financial Crime 31(5), 1152–1168 (2024). https://doi.org/10.1108/JFC-10-2023-0282
