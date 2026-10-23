# Ashgrove Manor: Solution Bible v2.2 (approved)

> ## ⚠️ Full solution: play the game first
> This document reveals the culprit, the complete timeline and every deduction in *The Ashgrove Manor Affair*. If you plan to play, stop reading here.

> Source of truth for the case. `src/case/ashgrove.ts` must stay consistent with this document.

## v2.2 narrative changes (approved)
Story, timeline, evidence relationships, contradictions and accusation rules are unchanged. Only explanations and wording changed:
- **How Theo knew (growing suspicion, not certainty).** Edmund had noticed money missing and *asked* his bank for a list of cheques. Theo, who sorts the post, saw a private letter from the bank that Edmund opened alone, and it made him uneasy. At 6:30 the telephone note (bank matter, new will, Brandt at ten) made him realise exposure was coming the next morning. Supported in-game by E12 ("marked 'Private'… in reply to his enquiry") and Mrs. Pell's "The household" topic ("He sorts the post…").
- **B.L. = Bank Letter, never explained in-game.** The phone note now reads "show him B.L." (Edmund's reminder to show Brandt the letter he already holds); "bring" was inconsistent.
- **Onboarding (M7).** The briefing now states the goal ("Mr. Brandt, the family solicitor, arrives at ten… why they did it, how they carried it out, when they had the opportunity, and what physical evidence connects them to the crime") and a "Detective Rating" note explains credibility: it only affects the final rating, and reaching 0 never prevents solving the case (unlimited retries are unchanged). The Accuse screen repeats this briefly, and the feedback distinguishes a normal drop, the first drop to 0, and "remains at 0/5". Physical-slot near-misses added for E6 and E4; accepted cards are unchanged. No change to the mystery.
- **Plainer English.** "The three-quarters" → "a quarter to eight"; "the gong / the bell" → "the dressing gong / the dinner bell" (Mrs. Pell's C1 lie deliberately keeps "dressing gong" *without* a time, so the player must still link it to E1's 7:30 rain); jib door → "hidden door" (the term "jib door" is introduced once, in E3); annuity → yearly allowance; bequest → "the money left to"; hobnail → heavy work; turf accountant → bookmaker; E5 and E14 gain a plain-English line (E14 does **not** say who "T.L." is); a few indirect lines made direct, and Victoria's C3 reply now explains why she lied ("I knew how this bottle would look").


## Context
Approved direction: concept C (Ashgrove Manor) with the "Press the Statement" mechanic. Classic and atmospheric with no graphic violence. A 20–30 min case, soft penalties, desk-noir visuals built from CSS/SVG, no sound. React + TS + Vite + CSS + localStorage + Vitest, and you handle Git.
v1 was reviewed and five issues were raised. This version fixes them and adds two clarifications: Theo's exits were open (he feared being seen), and the cuff stain is consistent with the tincture, not a scientific identification.

## What changed from v1, and why
| Issue | Change | Why |
|---|---|---|
| 1. Timeline | Every movement is re-timed against one shared anchor: the **hall clock striking the three-quarters (7:45)** (worded "a quarter to eight" in-game since v2.2). Witnesses now speak in anchors ("as the clock struck", "before the bell") rather than precise minutes they couldn't know. Theo's 7:46–7:57 is spelled out minute by minute, including **why he dares not use any of the three exits** (none is physically blocked; each risks being seen) and **what finally drives him out** (Pell's footsteps), which is also why he leaves the bottle behind. The jib door is now **sprung** (it swings shut on its own), which explains what Pell sees. | v1 had loose minute-precise claims (7:48 / 7:50 / 7:56) that witnesses couldn't verify, and it didn't explain why Theo abandoned the bottle when he had time afterwards. |
| 2. Fair deduction | New physical clue **E17 Laundry Hamper**: Theo's dress shirt from last night has a **yellow-green, bitter-smelling spatter on the right cuff**. It only means something once the player knows the tincture's colour and smell (E5) and that Theo never went near Edmund's place at dinner (E1 seating). A new Theo statement (C7) lets the player confront him with it. | It is physical evidence *consistent with* Theo handling the tincture that evening. It is not a lab identification, so it carries weight only together with motive, means and opportunity. It sits in a laundry basket among other shirts, so it's subtle. |
| 3. Reliability | Each contradiction is reworded so the evidence **logically excludes** the statement (§5, with a "why it holds" column). Specific fixes:<br>• Pell's statement now starts at the gong, and Gale's summary says it was **dry all week until the 7:30 rain**, so mud means after 7:30.<br>• Julian's statement is now "not in the study for days", disproved by the cufflink lying **on the fresh splinters** of a drawer holding a will dated that afternoon.<br>• Theo's alibi is disproved by Julian's presence alone ("no one came in"), with no reliance on exact times.<br>• Keys are corroborated by Theo's own admission (new T-F), not just Pell. | v1 relied on assumptions such as "the cufflink must be recent", "her mud must be from tonight" and witnesses' exact minutes. |
| 4. Accusation | **Guessing ≠ proving.** Success requires the right culprit **and** accepted evidence in **four** slots (Motive, Means, Opportunity, Physical Evidence). Right culprit with weak proof gives "won't stand up": Brandt names which slots are unsupported, and the case reopens. Unlimited retries; the cost is credibility and rating only. | It meets your requirement that players need sufficient evidence, while never blocking them permanently. |
| 5. Solvability | New rules: **every pressable statement appears in the suspect's first account** (never behind a branch); **no topic is ever lost**; every required card has a documented path from case start (§9 audit table). | So no dialogue branch or guess can block the solution. |

---

## 0. Setting and cast
**Ashgrove Manor, Kent.** The dinner is on **Thursday 13 October 1932**. The player, a consulting detective, arrives at 8:00 a.m. on Friday 14 October. The solicitor, Mr. Brandt, is due at 10:00 that morning.

| Character | Role |
|---|---|
| **Sir Edmund Ashgrove** (68) | Victim. Failing heart, kept secret. Takes a measured digitalis tonic before dinner nightly. |
| **Lady Victoria Ashgrove** (41) | Second wife, former actress, rumoured fortune hunter. |
| **Julian Ashgrove** (34) | Son, gambler. |
| **Clara Ashgrove** (27) | Daughter, quiet. |
| **Theodore "Theo" Lyle** (31) | Nephew and private secretary. **Culprit.** |
| **Mrs. Agnes Pell** (58) | Housekeeper for 30 years. |
| Inspector Gale | The player's partner and hint-giver. |
| Dr. Harlow | Family doctor. |
| Mr. Brandt | Solicitor. Judges the final case. |

**House layout (E3 Floor Plan):**
- The **Dining Room** has three exits:
  - **main doors** to the front hall, at the foot of the main staircase
  - a **service door** to the servants' passage, which runs past the pantry to the kitchen
  - a **hidden door** (a "jib door": papered over to match the wall, with a spring that swings it shut) leading **only** to the Study
- The **Study** has the jib door and a **hall door**.
- **Seating** (E1): Edmund at the head, Pell's tonic glass at his right hand. Theo sits at the **far foot** of the table.

---

## 1. True sequence of events

**Before Thursday evening**
- **Tue 11 Oct.** On a specialist's advice, Victoria collects a second tincture bottle from Hartley's, dispensed in her name. Edmund locks it in the **left** desk drawer. Theo records it, with its location, in the household book.
- **Earlier that week.** Edmund notices money missing and writes to his bank asking for a list of recent cheques.
- **Thu 3:00 pm.** The bank's reply arrives, marked "Private": eight cheques, £1,850, each signed in Edmund's name. **Theo sorts the post as usual**, sees the private bank envelope, and notices Edmund opens it alone. Theo knows what he has done, so this makes him uneasy. Edmund pencils *"None of these are mine. T.?"* and slides the letter under the blotter.
- **4:00 pm.** Edmund writes a dated draft of will amendments and locks it in the **right** drawer.
- **6:00 pm.** Edmund and Julian argue in the **library** over Julian's IOU.
- **6:30 pm.** Edmund telephones Brandt and writes on the pad: *"Brandt. Fri 10. New will. Bank matter: show him B.L."* (B.L. = the bank letter.) Theo sees the pad. With the private bank letter still on his mind, his unease becomes certainty: the forgeries will come out at ten tomorrow, and he will be cut from the will.

**The critical window (anchors in bold)**
| Time | Theo | Everyone else |
|---|---|---|
| **7:30 gong.** Rain begins after a dry week. | Already dressed, in the study. | Family go up to dress. Edmund dresses in his room next to Victoria's (she hears him through the connecting door until the bell). |
| ~7:35 | Unlocks the left drawer with his **spare keys**, pockets the bottle, relocks. Waits by the jib door. | |
| **7:45, the hall clock strikes a quarter to eight** | Hears Pell set the glass and leave by the service door. | **Pell** lays the tonic "as the clock struck". **Clara** crosses the landing to Victoria's room "as the clock struck" and stays there, door ajar, until the bell. |
| ~7:46 | Through the jib door into the **dining room**. Hurriedly pours the concentrate into the glass in the half-light, **spattering his right cuff**. | |
| ~7:47 | **Afraid to move.** He hears the study's hall door open: Julian. **No door is blocked. Every exit is open, but each one risks being seen:**<br>1. **Jib door**: Julian is now in the study and would watch him step out of the wall.<br>2. **Main doors**: they open onto the staircase as the family come down, and to be seen leaving the room where the tonic stands could hang him.<br>3. **Service door**: it passes the pantry and kitchen, where he believes Pell is. He doesn't know she's gone out.<br>He **chooses** to stand still and wait. In the final confrontation he says: *"I could have walked out of any door in that room. I didn't dare."* | **Pell** slips out of the back door to meet her son Tom at the garden gate. **Julian** comes down "just after a quarter to eight", enters the study by the hall door, **forces the right drawer** (he has no key), and reads the will. His cufflink falls into the splinters. |
| ~7:54 | Julian hears movement next door and calls "Agnes?" Theo, afraid Julian will open the jib door, **shoves the bottle into the fern planter** to have his hands empty, meaning to retrieve it in a moment. | |
| ~7:55 | Hears Julian leave by the hall door. | Julian goes upstairs. Clara hears him on the landing "cursing his collar stud, before the bell". |
| ~7:57 | Before he can dig the bottle out, he hears **footsteps in the servants' passage** (Pell returning) and **flees through the jib door** into the empty study, leaving the bottle. | **Pell** comes in, glances into the dining room, and sees it **empty, with the jib door swinging shut**. |
| **8:00 bell** | Takes his seat at the foot of the table. | Edmund and the four family members are seated, with Pell serving, all in full view of each other. |

**After the bell**
- **8:05.** Edmund drinks the tonic: *"Bitter tonight, Agnes."*
- **8:40.** Clara leaves for about 10 minutes to telephone her husband in secret.
- **9:00.** Edmund becomes unwell. He collapses at 9:15.
- **9:25.** Theo telephones Dr. Harlow from the hall.
- **9:40.** Edmund dies.
- **9:50.** Harlow arrives, sets aside the glass, and **locks** the dining room and study.

From 8:00 until the rooms were locked, Theo was never alone in the dining room, so the bottle stayed in the fern. At 7 a.m. Friday, Pell sets out last night's dress shirts for the laundress, as she does after every wearing.

**Theo's plan:** the bottle was to go back, empty, into the left drawer after dinner. Then a known heart patient's death would read as heart failure, or as an accidental double dose from "Victoria's" new bottle.

---

## 2. Culprit, motive, method, opportunity
- **Culprit:** Theodore Lyle.
- **Motive:** Edmund had discovered the forged cheques, and the will change and police matter were set for 10 a.m.
- **Means:** the second bottle, taken from a **locked** drawer. Only Edmund and Theo held keys, and Edmund's keys stayed in his waistcoat all evening.
- **Opportunity:** the glass sat in an empty dining room from the 7:45 chime until the 8:00 bell. This is the only window, because the poison takes about an hour and Edmund drank at 8:05. Theo claims he was in the study the whole time, but Julian was in the study and found it empty.
- **Physical link:** a fresh stain on the cuff of the shirt Theo wore that evening, **consistent with** the tincture in colour and smell. It has not been chemically identified (no lab in 1932 Kent overnight). It corroborates the rest of the case but proves nothing alone. **The solution rests on all four strands together.**

---

## 3. Suspects
| Suspect | Secret | First-account alibi | Truth |
|---|---|---|---|
| **Victoria** | Edmund's failing heart. She bought the second bottle for him. | "Dressing in my room." | True. Clara was with her from a quarter to eight. No key. |
| **Julian** | £600 debt to Sid Marlow. Broke into the desk. | "I went up to dress after the dressing gong, and I was at the table for the dinner bell." (Technically true; hides the study visit, which C2 exposes.) | In the study, then upstairs. No key. |
| **Clara** | Trained nurse (St Thomas's), secretly married to Daniel Reyes. | "From a quarter to eight I was with Victoria, fixing her necklace clasp." | True. Her 8:40 absence came after the poison was drunk. |
| **Mrs. Pell** | Feeds her son Tom, just out of prison, at the gate. | "I didn't go outside once, from the dressing gong until the dinner bell." | False. Outside about 10 minutes. Saw the jib door closing. |
| **Theo** | Forgery, then murder. | "I was in the study from half past seven until the dinner bell, at my typewriter. No one came in or out." | False. In the dining room from the chime until just before the bell. |

---

## 4. Evidence
**Starting file**
| # | Item | Shows |
|---|---|---|
| E1 | **Gale's Summary**: dry week, rain from 7:30; seating plan; tonic drunk at 8:05 ("Bitter tonight, Agnes"); Clara out at 8:40; collapse 9:15; Theo telephoned from the hall; death 9:40; Edmund's keys found in his waistcoat; rooms locked at 9:50; household not told any findings. | Vehicle, seating, keys |
| E2 | **Harlow's Report**: digitalis at many times the dose; effects about an hour after taking; residue in the glass. | Poisoned before 8:05 |
| E3 | **Floor Plan** | Jib door connects only the dining room and study |

**Dining Room**
| E4 | **Tonic Glass** | Concentrated residue |
| E5 | **Prescription Bottle** on the tray, nearly full. Tincture described as *"yellow-green, bitter-smelling; stains linen"*. | Poison not from the normal bottle. Tells the player how a spill looks. |
| E6 | **Empty Bottle** in the fern planter, a dribble down its side. Hartley's label: *"Lady V. Ashgrove, collected in person, 11 Oct"*. | Poison source. Hidden, not spilled, so deliberate (rules out accident). |

**Study**
| E7 | **Forced Right Drawer**, with bright, raw splinters | Opened by someone **without a key** |
| E8 | **Draft Will**, dated *13 Oct* (inside E7): Julian's debts to be paid; Victoria and Pell unchanged; *"Clause 7, the money left to T. Lyle, is crossed out. In the margin: 'See B.L.'"* (Mrs. Pell's "yearly allowance" unchanged) | Clears Julian's motive. The forcing happened after Thursday afternoon. |
| E9 | **Left Drawer**: locked, undamaged, Hartley's wrapper, an empty space | Bottle taken **with a key** |
| E10 | **Cufflink "J.A."** lying **on top of the splinters** under E7 | Julian was there when the drawer was forced, on Thursday at the earliest |
| E11 | **Telephone Pad**: *"Brandt. Fri 10. New will. Bank matter: show him B.L."* | Something set for Friday 10 a.m.; "B.L." points to the blotter |
| E12 | **Bank Letter** under the blotter, marked "Private", sent in reply to Edmund's enquiry, with *"T.?"* | Theo's motive |

**Servants' Hall**
| E13 | **Back Step**: a man's boot prints and a woman's flat-shoe prints in the mud, to the gate and back. The man's prints stop at the step. Pell's flat shoes are drying by the stove, caked in it. | Pell went out after 7:30. No intruder came in. |
| E14 | **Household Book** (cover: "kept by T. Lyle"). Entry: *"11 Oct. Hartley's: digitalis, 2nd btl, for Sir E. Study desk, left drawer. T.L."*, plus a plain-English line explaining the medicine and the drawer (but not who "T.L." is) | Theo knew where the bottle was |
| E17 | **Laundry Hamper**: last night's dress shirts set out for the laundress, each with a stitched mark. **T.L.**: a faint yellow-green spatter on the right cuff, bitter smell. Others are clean. | A stain **consistent with** the tincture on Theo's shirt from that evening. Corroborating, not conclusive alone. |

**Upstairs**
| E15 | **Nursing Manual** (Clara's name), digitalis page with *"Father — pulse 48? Ask Dr H."* | Training, and worry |
| E16 | **Bookmaker's IOU**, £600 | Julian's apparent motive |
| E18 | **Specialist's Letter** (given by Victoria after C3) | Why she bought the bottle |

**Testimony cards** (presentable like evidence)
| T-A | **Pell: The Jib Door**: "Just before the dinner bell I looked in. The room was empty, and the little door to the study was swinging shut." | Someone went from the dining room into the study |
| T-B | **Pell: The Keys**: "Only the master and Mr. Lyle carry keys to that desk." | Access |
| T-C | **Julian: The Empty Study**: "Just after a quarter to eight I went into the study. Nobody there, and the typewriter was covered. I heard someone moving next door. I called 'Agnes?' but nobody answered." | Theo absent. Someone in the dining room. |
| T-D | **Victoria: Locked Away**: "Edmund locked it in his desk himself. I've never had a key." | Clears Victoria |
| T-E | **Clara: The Landing**: "From a quarter to eight I was with Victoria, with the door open. Just before the dinner bell, Julian walked past, swearing at his collar stud." | Alibis Victoria and Clara. Julian upstairs. |
| T-F | **Theo: Spare Keys** (topic "The desk", after E9): "Naturally I hold a spare set. They've never left my pocket." | Access, in his own words |

---

## 5. Contradictions, each checked for reliability
All statements below are part of each suspect's **first account** and are visible in their testimony panel from the first interview.

| # | Statement | Present | Why it holds (no unverifiable assumption) | Yields |
|---|---|---|---|---|
| C1 | Pell: "I didn't go outside once, from the dressing gong until the dinner bell." | E13 | E1: dry all week, rain from 7:30. Mud on her shoes, and prints from the servants' door, can only date from after the gong. | T-A, T-B |
| C2 | Julian: "I haven't been in Father's study for days." | E10 | The cufflink lies **on** splinters from a drawer that holds a will dated *that afternoon*. He was there on Thursday. | T-C |
| C3 | Victoria: "I've never bought medicine for Edmund." | E6 | The label says collected in person by her. | T-D, E18 |
| C4 | Clara: "I know nothing about medicine." | E15 | Her name, her school, her notes. | T-E |
| C5 | Theo: "I was in the study from half past seven until the dinner bell, at my typewriter. No one came in or out." | T-C *or* T-A | Julian *came in*. That's false even if Theo had been there. T-A independently shows someone entering the study from the dining room. | Theo shaken |
| C6 | Theo: "Where Uncle kept his medicines? No idea." | E14 | His own initialled entry names the drawer. | Theo shaken |
| C7 | Theo: "I never went near Uncle's tonic. Not last night, not ever." | E17 | His shirt from last night (laundered after every wearing) bears a stain matching the tincture's colour and smell (E5). He sat at the far end and telephoned from the hall (E1), so he had no innocent reason to be near the tonic. This doesn't identify the stain scientifically. It shows his flat denial has no innocent explanation. | Theo offers a weak excuse ("Claret, surely"). Gale notes it for the record. |
| C8 | Theo: "The accounts are in perfect order. Uncle had no complaint." | E12 | Edmund's own note: "None of these are mine. T.?" | Theo stops talking until Brandt arrives |

Wrong presentation: a short in-character rebuff and −1 credibility. Nothing is locked.

---

## 6. Unlocks
| Trigger | Unlocks |
|---|---|
| Start | Dining Room, Study. All five interviews (first accounts). E1–E3. |
| Examine E7 | E8 |
| Read E8 or E11 ("B.L.") | Blotter hotspot → E12 |
| Examine E9 | Theo topic "The desk" → T-F |
| Interview Mrs. Pell | **Servants' Hall** ("the tonic's mixed in my pantry") |
| Interview Victoria, Julian and Clara | **Upstairs** (Gale: "The family consent to a search.") |
| C1–C4 | Testimony cards plus a "Your secret" topic for each suspect |
| Hold E12 + E14 + E17 + (T-A or T-C) | Gale: "I think we're ready, Detective." The Accuse tab is highlighted, though it is always available. Includes E17 because v2 made Physical Evidence a required slot. |

**Interviewed** means the player has asked a suspect at least one available topic, or pressed one of their statements (even with the wrong card). Opening a suspect's page does not count. Every suspect has topics that are always available, so this can never deadlock.

**Dialogue rules:** statements without a contradiction are technically true, so pressing them is only ever a wrong guess, never a missed lie. Topics add new lines and never close. Every topic can be asked again. Every statement can be pressed again. No choice can be missed.
**Hints (Gale):** three tiers, keyed to the next missing *required* card. Example: "That shirt's cuff…", then "Compare it with the tonic bottle's label", then "Show Theo the shirt."

---

## 7. Red herrings
| Herring | Cleared by |
|---|---|
| Bottle in **Victoria's** name; she inherits | E18, T-D, T-B (no key), T-E (with Clara), E8 (her share unchanged) |
| **Julian's** row, debt and break-in | E8 (debts to be *paid*). E7: he **forced** a drawer, so he had no key for the locked left one (E9). T-E puts him upstairs. |
| **Clara's** nursing and 8:40 absence | E2 + E1: the poison was drunk at 8:05. T-E gives her alibi. The manual note shows worry. |
| **Pell** poured the tonic; "Bitter tonight, *Agnes*" | T-B (no key). E13 shows her outside. E8: her yearly allowance is unchanged. |
| An **intruder** at the gate | E13: the prints stop at the step. C1 explains it was Tom. |
| **Accident** (Edmund double-dosed himself) | E6 was *hidden* in a planter. Victoria heard Edmund dressing upstairs until the bell. |

---

## 8. Final accusation
The player picks a **culprit**, then one card for each of four slots. Accepted cards:

| Slot | Accepted |
|---|---|
| Motive | E12 |
| Means | E14, T-B, T-F |
| Opportunity | T-C, T-A |
| Physical Evidence | E17 |

Near-misses get tailored feedback. For example, E8 in Motive: "That shows what he'd lose, but *why* was he struck out?"

**Outcomes (always recoverable):**
1. **Wrong culprit.** Brandt rebuts with that suspect's key exoneration (e.g. "Julian had to *force* a drawer. Whoever took that bottle had a key."). −1 credibility, and the case reopens.
2. **Right culprit, any slot unsupported: "It won't stand up."** Brandt names *which* slots fail (e.g. "I can't see how he got the poison") without naming the missing card. −1 credibility, and the case reopens.
   No single slot proves the case. Brandt's verdict lines make that explicit, e.g. for E17: *"A stain alone proves little. Alongside the bank letter, the keys and that empty study, it's damning."*
3. **Right culprit, all four supported: Case Proven.** A confrontation scene plays with one beat per slot as Theo breaks, then the epilogue retells §1.

**Rating (proven cases only):**
| Result | Rating |
|---|---|
| Proven on the first submission, credibility ≥ 4 | **Master Detective** |
| Proven with ≤ 1 failed submission | **Chief Inspector Material** |
| Proven after more attempts | **Dogged Detective** |

The results screen also shows **Contradictions found: x/8** and **Secrets uncovered: x/4** (C1–C4: an innocent's lie exposed. This does not by itself prove them innocent.) as bonus stats. Credibility starts at 5 and has a floor of 0, and it never blocks play.

---

## 9. Solvability audit
| Required card | Where | Prerequisite | Branch-safe? |
|---|---|---|---|
| E12 Bank Letter | Study | Examine E7→E8, or E11 (both open at start) | Yes |
| E14 Household Book | Servants' Hall | Interview Mrs. Pell | Yes |
| T-B / T-F (alt. means) | Pell after C1, or Theo topic after E9 | E13, or E9 | Yes |
| T-A or T-C (opportunity) | C1 (E13 + Pell's first account) or C2 (E10 + Julian's first account) | As listed | Yes, two independent routes |
| E17 Laundry | Servants' Hall | Interview Mrs. Pell | Yes |

- Every inference uses only in-game text. The window comes from E1 + E2 + Pell's "as the clock struck". The jib-door geometry comes from E3. The tincture's appearance comes from E5. The shirt being from that night comes from E17's own description.
- Each innocent can be cleared with in-game evidence (§7).
- At build time a Vitest test will walk the unlock graph from start and assert every required card and every C1–C8 is reachable. A second test will assert that each accusation outcome is produced by the expected inputs.

