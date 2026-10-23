// The Ashgrove Manor Affair: full case data.
// Source of truth: docs/solution-bible.md (v2.1). Ids follow the bible:
// E1–E18 evidence, T-A–T-F testimony, C1–C8 contradictions.
// CONTAINS SPOILERS.
import type { CaseData, EvidenceDef } from '../engine';

const item = (id: string, name: string, description: string[]): EvidenceDef => ({
  id,
  name,
  kind: 'item',
  description,
});

const testimony = (id: string, name: string, description: string[]): EvidenceDef => ({
  id,
  name,
  kind: 'testimony',
  description,
});

const evidence: Record<string, EvidenceDef> = Object.fromEntries(
  [
    // --- Starting file -----------------------------------------------------
    item('E1', "Inspector Gale's Summary", [
      'Weather: dry all week. Rain began at half past seven on Thursday evening, as the dressing gong sounded.',
      'Seating: Sir Edmund at the head, his tonic glass at his right hand. Mr. Lyle at the far foot of the table.',
      "8.00 dinner bell. 8.05 Sir Edmund drank his tonic: 'Bitter tonight, Agnes.' 8.40 Miss Clara left the table for some ten minutes. 9.00 Sir Edmund unwell; collapsed 9.15.",
      '9.25 Mr. Lyle telephoned Dr. Harlow from the hall. 9.40 Sir Edmund died. 9.50 Dr. Harlow arrived and locked the dining room and the study.',
      "Sir Edmund's own keys were found in his waistcoat pocket. The household has not been told of any findings.",
    ]),
    item('E2', "Dr. Harlow's Report", [
      "Cause of death: poisoning by digitalis, at many times Sir Edmund's prescribed dose.",
      'Effects begin roughly an hour after the dose is taken.',
      'A concentrated residue remains in the tonic glass at his place. I set the glass aside and had both rooms locked.',
      'His heart was weaker than he admitted, but this was not a natural failure.',
    ]),
    item('E3', 'Ground Floor Plan', [
      'The dining room has three doors: main doors to the front hall, at the foot of the stairs; a service door to the servants’ passage, which runs past the pantry to the kitchen; and a hidden door in the wall, papered over to match (a ‘jib door’). A spring makes it swing shut by itself.',
      'The hidden door opens only into the study. The study’s other door opens onto the hall.',
    ]),

    // --- Dining Room -------------------------------------------------------
    item('E4', 'Tonic Glass', [
      'The small glass at the head of the table, where Mrs. Pell sets Sir Edmund’s tonic each evening.',
      'A thick yellow-green residue clings to the bottom: far more than one measured dose would leave.',
    ]),
    item('E5', 'Prescription Bottle', [
      'Sir Edmund’s regular tincture on its silver tray. It is nearly full.',
      "The label reads: 'Tinct. Digitalis. Yellow-green, bitter-smelling; stains linen. Measured dose only.'",
      "Digitalis is Sir Edmund's heart medicine.",
      'Whatever killed him did not come from this bottle.',
    ]),
    item('E6', 'Empty Tincture Bottle', [
      'A small brown medicine bottle, pushed down among the fern roots where no one would look.',
      'It is empty. A dried yellow-green dribble runs down one side, as if it were poured in a hurry.',
      "Hartley's Chemist label: 'Tinct. Digitalis. Lady V. Ashgrove. Collected in person, 11 Oct.'",
    ]),

    // --- Study -------------------------------------------------------------
    item('E7', 'Forced Right Drawer', [
      'The right-hand drawer of Sir Edmund’s desk has been forced. Bright, raw splinters stand out around the lock.',
      'Whoever opened it had no key.',
    ]),
    item('E8', 'Draft Will', [
      'Changes to his will, in Sir Edmund’s own hand, dated 13 October.',
      "Julian's debts are to be paid 'one last time'. Lady Ashgrove's share, and Mrs. Pell's yearly allowance, remain as before.",
      "Clause 7, the money left to T. Lyle, is crossed out. In the margin: 'See B.L.'",
    ]),
    item('E9', 'Left Drawer', [
      'Locked and undamaged. Inspector Gale opens it with Sir Edmund’s own keys.',
      'Inside: a Hartley’s Chemist wrapper, and an empty space the size of a medicine bottle.',
      'No scratches anywhere. Whoever took the bottle used a key.',
    ]),
    item('E10', 'Evening Cufflink', [
      "An onyx-and-gold evening cufflink, engraved 'J.A.'",
      'It lies on top of the splinters beneath the forced drawer. It fell there when the drawer was forced, or after.',
    ]),
    item('E11', 'Telephone Pad', ["In Sir Edmund's hand: 'Brandt. Fri 10. New will. Bank matter: show him B.L.'"]),
    item('E12', 'Bank Letter', [
      'Kingsbridge & County Bank, to Sir Edmund, marked ‘Private’. In reply to his enquiry: a list of eight cheques drawn on his account, totalling £1,850, each signed in his name.',
      "Pencilled beneath, in Sir Edmund's hand: 'None of these are mine. T.? Ask Brandt.'",
    ]),

    // --- Servants' Hall ----------------------------------------------------
    item('E13', 'Back Step', [
      "Mud on the back step, from the servants' door to the garden gate and back: a man's heavy work boots and a woman's flat shoes.",
      "The man's prints stop at the step. He never came inside.",
      "Mrs. Pell's flat shoes stand drying by the stove, caked in the same mud.",
    ]),
    item('E14', 'Household Book', [
      "The cover reads: 'Household expenses. Kept by T. Lyle.'",
      "'11 Oct. Hartley's: digitalis, 2nd btl, for Sir E. Study desk, left drawer. T.L.'",
      "In plain words: a second bottle of digitalis, Sir Edmund's heart medicine, bought from Hartley's on 11 October and kept in the left-hand drawer of the study desk. The entry is initialled 'T.L.'",
    ]),
    item('E17', 'Laundry Hamper', [
      "Last night's dress shirts, set out this morning for the laundress, as they are after every wearing. Each carries a stitched laundry mark.",
      "The shirt marked 'T.L.' has a faint yellow-green spatter on the right cuff, with a bitter smell. The others are clean.",
      "No chemist has tested it, but the colour and smell match the tincture's label.",
    ]),

    // --- Upstairs ----------------------------------------------------------
    item('E15', 'Nursing Manual', [
      "A nurse's manual stamped with the crest of St Thomas's Hospital, inscribed 'C. Ashgrove'.",
      "The page on digitalis is dog-eared. In the margin: 'Father: pulse 48? Ask Dr H.'",
    ]),
    item('E16', "Bookmaker's IOU", ['An IOU for £600, signed by Julian Ashgrove, payable to Sid Marlow, a bookmaker.']),
    item('E18', "Specialist's Letter", [
      'Harley Street, to Sir Edmund: his heart has weakened. Increase the tincture, and keep a second bottle in the house.',
      'Lady Ashgrove took it from her writing case.',
    ]),

    // --- Testimony ---------------------------------------------------------
    testimony('T-A', 'Mrs. Pell: The Jib Door', [
      "'Just before the dinner bell I looked in. The room was empty, and the little door to the study was swinging shut.'",
    ]),
    testimony('T-B', 'Mrs. Pell: The Keys', ["'Only the master and Mr. Lyle carry keys to that desk.'"]),
    testimony('T-C', 'Julian: The Empty Study', [
      "'Just after a quarter to eight I went into the study. Nobody there, and the typewriter was covered. I heard someone moving next door. I called \"Agnes?\" but nobody answered.'",
    ]),
    testimony('T-D', 'Victoria: Locked Away', ["'Edmund locked it in his desk himself. I've never had a key.'"]),
    testimony('T-E', 'Clara: The Landing', [
      "'From a quarter to eight I was with Victoria, with the door open. Just before the dinner bell, Julian walked past, swearing at his collar stud.'",
    ]),
    testimony('T-F', 'Theo: Spare Keys', ["'Naturally I hold a spare set. They've never left my pocket.'"]),
  ].map((e) => [e.id, e]),
);

export const ashgrove: CaseData = {
  id: 'ashgrove',
  title: 'The Ashgrove Manor Affair',
  startingEvidence: ['E1', 'E2', 'E3'],
  startingCredibility: 5,
  evidence,

  locations: [
    {
      id: 'dining',
      name: 'The Dining Room',
      hotspots: [
        { id: 'tonicGlass', label: "Sir Edmund's place", gives: ['E4'] },
        { id: 'tonicTray', label: 'Tonic tray', gives: ['E5'] },
        { id: 'fernPlanter', label: 'Fern planter', gives: ['E6'] },
        {
          id: 'jibDoor',
          label: 'Seam in the wallpaper',
          note: 'A hidden door, papered over to match the wall. A spring pulls it shut. It leads to the study.',
        },
        {
          id: 'window',
          label: 'Window',
          note: "Last night's rain has left the panes streaked.",
        },
      ],
    },
    {
      id: 'study',
      name: 'The Study',
      hotspots: [
        { id: 'forcedDrawer', label: 'Right-hand drawer', gives: ['E7'] },
        { id: 'draftWill', label: 'Papers in the drawer', requires: { evidence: ['E7'] }, gives: ['E8'] },
        { id: 'leftDrawer', label: 'Left-hand drawer', gives: ['E9'] },
        { id: 'deskFloor', label: 'Floor beneath the desk', gives: ['E10'] },
        { id: 'telephone', label: 'Telephone', gives: ['E11'] },
        {
          id: 'blotter',
          label: 'Desk blotter',
          requires: { anyOf: [{ evidence: ['E8'] }, { evidence: ['E11'] }] },
          gives: ['E12'],
        },
      ],
    },
    {
      id: 'servants',
      name: "The Servants' Hall",
      requires: { interviewed: ['pell'] },
      hotspots: [
        { id: 'backStep', label: 'Back step', gives: ['E13'] },
        { id: 'householdBook', label: 'Pantry shelf', gives: ['E14'] },
        { id: 'laundryHamper', label: 'Laundry hamper', gives: ['E17'] },
      ],
    },
    {
      id: 'upstairs',
      name: 'Upstairs',
      requires: { interviewed: ['victoria', 'julian', 'clara'] },
      hotspots: [
        { id: 'claraRoom', label: "Clara's room", gives: ['E15'] },
        { id: 'julianRoom', label: "Julian's room", gives: ['E16'] },
        {
          id: 'victoriaRoom',
          label: "Victoria's room",
          note: 'Her writing case is locked. Lady Ashgrove keeps her private letters to herself.',
        },
        {
          id: 'landing',
          label: 'The landing',
          note: "From Lady Ashgrove's door you can see the whole landing and the head of the stairs.",
        },
      ],
    },
  ],

  suspects: [
    {
      id: 'victoria',
      name: 'Lady Victoria Ashgrove',
      defaultWrongResponse: "I'm sorry, Detective. Is that supposed to mean something to me?",
      statements: [
        { id: 'room', text: 'I was dressing in my room from the dressing gong until the dinner bell.' },
        { id: 'clasp', text: 'Clara came in at a quarter to eight, to help with my necklace clasp.' },
        {
          id: 'medicine',
          text: "I've never bought medicine for Edmund. That was Agnes's business.",
          contradiction: {
            id: 'C3',
            accepts: ['E6'],
            response: [
              '(She stares at her own name on the label.) Edmund’s heart was failing. He made me promise not to tell the children. And I knew how this bottle would look.',
              'The specialist said to keep a second bottle in the house. I collected it from Hartley’s on Tuesday and gave it straight to Edmund.',
              'He locked it in his desk himself. I have never had a key to that desk.',
              '(She takes a letter from her writing case and hands it to you.)',
            ],
            gives: ['T-D', 'E18'],
          },
        },
      ],
      topics: [
        {
          id: 'edmund',
          label: 'Sir Edmund',
          lines: [
            'Edmund was gruff, proud and terribly old-fashioned. I loved him, whatever they say in the village.',
            "He'd been tired lately. He wouldn't hear a word about it.",
          ],
        },
        {
          id: 'will',
          label: 'The new will',
          lines: [
            'Everyone thinks I married him for his money. They always will.',
            'Edmund never discussed the will with me. Theo would know. Theo knows everything about the estate.',
          ],
        },
        {
          id: 'secret',
          label: 'His illness',
          requires: { contradictions: ['C3'] },
          lines: [
            'He hated to be pitied. That is why he kept the second bottle locked away instead of on the tray.',
          ],
        },
      ],
    },
    {
      id: 'julian',
      name: 'Julian Ashgrove',
      defaultWrongResponse: "Is that it? I've had worse from my bookmaker.",
      statements: [
        { id: 'dressing', text: 'I went up to dress after the dressing gong, and I was at the table for the dinner bell.' },
        {
          id: 'study',
          text: "I haven't been in Father's study for days.",
          contradiction: {
            id: 'C2',
            accepts: ['E10'],
            response: [
              '...All right. Yes. I went into the study just after a quarter to eight. I had to know whether Father had cut me off.',
              "The drawer was locked and I haven't a key, so I forced it. Rather badly.",
              "The study was empty. Typewriter under its cover. I heard someone moving next door in the dining room. I called 'Agnes?' Nobody answered, so I got out.",
              "And the will? He was going to pay my debts. One last time. It's Theo who's struck out.",
            ],
            gives: ['T-C'],
          },
        },
        { id: 'argument', text: "Father and I had words in the library at six. That's all it was." },
      ],
      topics: [
        {
          id: 'argument',
          label: 'The argument at six',
          lines: [
            'We had words in the library at six. I was still in my riding tweeds.',
            "He said 'Not one more penny!' He said that every quarter.",
          ],
        },
        {
          id: 'will',
          label: 'The new will',
          lines: ['Father would never cut me off. Shout, yes. Cut me off, never.'],
        },
        {
          id: 'secret',
          label: 'The break-in',
          requires: { contradictions: ['C2'] },
          lines: [
            "I'm not proud of it. But I never touched the other drawer. I couldn't have. I had no key to that one either.",
          ],
        },
      ],
    },
    {
      id: 'clara',
      name: 'Clara Ashgrove',
      defaultWrongResponse: "I don't see what that has to do with what I said.",
      statements: [
        { id: 'alibi', text: 'From a quarter to eight I was with Victoria, fixing her necklace clasp.' },
        {
          id: 'medicine',
          text: 'I know nothing about medicine, Inspector.',
          contradiction: {
            id: 'C4',
            accepts: ['E15'],
            response: [
              "(She meets your eye at last.) I trained at St Thomas's. Father never knew. Nor did he know I'm married.",
              "I'd noticed his pulse. Slow. I meant to ask Dr. Harlow.",
              'From a quarter to eight I was with Victoria, with the door open. Just before the dinner bell, Julian walked past on the landing, swearing at his collar stud.',
              "At twenty to nine I telephoned my husband. That's all.",
            ],
            gives: ['T-E'],
          },
        },
        { id: 'telephone', text: 'I stepped out at twenty to nine to make a telephone call. I was gone ten minutes.' },
      ],
      topics: [
        {
          id: 'father',
          label: 'Sir Edmund',
          lines: ['Father liked people to be useful and quiet. I was both, so he never looked at me twice.'],
        },
        {
          id: 'evening',
          label: 'The evening',
          lines: [
            "Victoria's necklace clasp had broken. I went to her room as the clock struck a quarter to eight, and stayed until the dinner bell.",
          ],
        },
        {
          id: 'secret',
          label: 'Your marriage',
          requires: { contradictions: ['C4'] },
          lines: [
            'Daniel teaches at the village school. Father would have called it a disgrace. I meant to tell him this weekend.',
          ],
        },
      ],
    },
    {
      id: 'pell',
      name: 'Mrs. Agnes Pell',
      defaultWrongResponse: "Begging your pardon, Detective, but I don't follow.",
      statements: [
        { id: 'tonic', text: "I set the master's tonic at his place as the hall clock struck a quarter to eight." },
        {
          id: 'indoors',
          text: "I didn't go outside once, from the dressing gong until the dinner bell.",
          contradiction: {
            id: 'C1',
            accepts: ['E13'],
            response: [
              '(Her hands twist in her apron.) It’s my boy, Tom. Two weeks out of prison and nowhere to go.',
              'I took him a basket at the gate, a minute or two after I’d laid the tonic. He never set foot inside. I swear it.',
              'When I came back, just before the dinner bell, I looked into the dining room. Empty. But the little door to the study was swinging shut.',
              'And before you ask: nobody can get at the master’s desk but him and Mr. Lyle. They’re the only ones with keys.',
            ],
            gives: ['T-A', 'T-B'],
          },
        },
        { id: 'dose', text: "One glass, one measured dose. I've done it the same way for two years." },
      ],
      topics: [
        {
          id: 'tonic',
          label: 'The tonic',
          lines: [
            'One measured dose in a glass, every night before dinner, set at his right hand.',
            "The mixing's done in my pantry, in the Servants' Hall. You're welcome to look.",
          ],
        },
        {
          id: 'household',
          label: 'The household',
          lines: [
            "Mr. Lyle keeps the books, the keys and the master's diary. The house would fall down without him, he says.",
            'He sorts the post, too. Every letter goes through his hands.',
            "Except yesterday's from the bank. The master took that one himself.",
          ],
        },
        {
          id: 'secret',
          label: 'Tom',
          requires: { contradictions: ['C1'] },
          lines: ["Tom's no murderer. He's a poacher who got caught. He never came past the step."],
        },
      ],
    },
    {
      id: 'theo',
      name: 'Theodore Lyle',
      defaultWrongResponse: 'With respect, Detective, that proves nothing at all.',
      statements: [
        {
          id: 'alibi',
          text: 'I was in the study from half past seven until the dinner bell, at my typewriter. No one came in or out.',
          contradiction: {
            id: 'C5',
            accepts: ['T-C', 'T-A'],
            response: [
              '(For the first time, Theo hesitates.) I... may have stepped out for a moment. For some papers.',
              "I really can't account for every minute, Detective.",
            ],
          },
        },
        {
          id: 'medicines',
          text: "Where Uncle kept his medicines? I've no idea. Agnes saw to all that.",
          contradiction: {
            id: 'C6',
            accepts: ['E14'],
            response: ["I write a hundred things in those books. I can't remember every line.", '(He straightens his cuffs.)'],
          },
        },
        {
          id: 'tonic',
          text: "I never went near Uncle's tonic. Not last night, not ever.",
          contradiction: {
            id: 'C7',
            accepts: ['E17'],
            response: ['Claret, surely. Dinner is a messy business.', '(Inspector Gale notes it down for the record.)'],
          },
        },
        {
          id: 'accounts',
          text: 'The estate accounts are in perfect order. Uncle had no complaint.',
          contradiction: {
            id: 'C8',
            accepts: ['E12'],
            response: [
              "(Theo's face goes very still.) I think I would prefer to say nothing more until Mr. Brandt arrives.",
            ],
          },
        },
      ],
      topics: [
        {
          id: 'uncle',
          label: 'Sir Edmund',
          lines: [
            'Uncle took me in when my mother died. I owe him everything.',
            "I'm sure you'll find it was his heart.",
          ],
        },
        {
          id: 'evening',
          label: 'Last night',
          lines: ['When Uncle collapsed I telephoned Dr. Harlow from the hall. Someone had to keep a clear head.'],
        },
        {
          id: 'desk',
          label: 'The desk keys',
          requires: { evidence: ['E9'] },
          lines: ["Naturally I hold a spare set. I'm his secretary. They've never left my pocket."],
          gives: ['T-F'],
        },
      ],
    },
  ],

  accusation: {
    culpritId: 'theo',
    slots: {
      motive: {
        accepts: ['E12'],
        failMessage: "I can't see why he would do it. A jury will want a reason.",
        nearMisses: {
          E8: "That shows what he'd lose, but why was he cut out of the will?",
          E11: "A telephone note, Detective. What was the 'bank matter'?",
        },
      },
      means: {
        accepts: ['E14', 'T-B', 'T-F'],
        failMessage: "I can't see how he got hold of the poison.",
        nearMisses: {
          E6: "That's the bottle. How did he get at it?",
          E9: 'A key opened that drawer. Whose key?',
        },
      },
      opportunity: {
        accepts: ['T-C', 'T-A'],
        failMessage: 'When could he have done it? He says he was in the study the whole time.',
        nearMisses: { E3: 'The plan shows the hidden door. Who used it?' },
      },
      physical: {
        accepts: ['E17'],
        failMessage: 'Nothing physical ties him to the poison.',
        nearMisses: {
          E5: 'That tells us what the tincture looks like. Where have we seen it since?',
          E6: 'That bottle proves the poison was there, not who poured it.',
          E4: 'The glass shows how he died, not who stood beside it.',
        },
      },
    },
    rebuttals: {
      victoria:
        'The bottle bears her name, but Sir Edmund locked it in his desk, and she never had a key. Miss Clara was with her from a quarter to eight until dinner.',
      julian:
        'Julian had to force a drawer. Whoever took that bottle had a key. And Miss Clara heard him upstairs just before the dinner bell.',
      clara:
        'Sir Edmund drank the poison at five past eight. Miss Clara left the table at twenty to nine, too late to matter, and she was with Lady Ashgrove before the dinner bell.',
      pell: 'Mrs. Pell had no key to that desk, and the mud puts her out at the gate. Her allowance is the same in both wills.',
    },
    readyWhen: {
      evidence: ['E12', 'E14', 'E17'],
      anyOf: [{ evidence: ['T-A'] }, { evidence: ['T-C'] }],
    },
  },

  hints: [
    {
      id: 'draftWill',
      doneWhen: { evidence: ['E8'] },
      tiers: [
        "Dr. Harlow locked the study too. Someone has been at Sir Edmund's desk.",
        'Look at the desk drawers in the study.',
        'Examine the forced right-hand drawer, then the papers inside it.',
      ],
    },
    {
      id: 'bankLetter',
      doneWhen: { evidence: ['E12'] },
      tiers: [
        "Sir Edmund's notes mention a 'B.L.' What was he planning to show Brandt?",
        'He would have kept it close at hand, on the desk itself.',
        'Look under the blotter in the study.',
      ],
    },
    {
      id: 'pellInterview',
      doneWhen: { interviewed: ['pell'] },
      tiers: [
        'Mrs. Pell mixed the tonic. We should hear from her.',
        'Speak to Mrs. Pell. She can show us the Servants’ Hall.',
        'Ask Mrs. Pell about the tonic.',
      ],
    },
    {
      id: 'householdBook',
      doneWhen: { evidence: ['E14'] },
      tiers: [
        'Somebody in this house writes everything down.',
        'The household book is kept in the pantry.',
        "Examine the pantry shelf in the Servants' Hall.",
      ],
    },
    {
      id: 'opportunity',
      doneWhen: { anyOf: [{ evidence: ['T-A'] }, { evidence: ['T-C'] }] },
      tiers: [
        'Someone is lying about where they were between a quarter to eight and the dinner bell.',
        "Mrs. Pell's muddy shoes, or that evening cufflink in the study: neither fits what we were told.",
        'Show Mrs. Pell the Back Step, or show Julian the Evening Cufflink.',
      ],
    },
    {
      id: 'laundry',
      doneWhen: { evidence: ['E17'] },
      tiers: [
        "Last night's clothes might have something to tell us.",
        "Mrs. Pell sets out the dress shirts for the laundress every morning.",
        "Examine the laundry hamper in the Servants' Hall.",
      ],
    },
  ],

  story: {
    intro: [
      'Sir Edmund Ashgrove collapsed at his own dinner table last night and died before the doctor arrived. He was due to sign a new will at ten o’clock this morning.',
      'Dr. Harlow suspects poison. He locked the dining room and the study before anyone could tidy them. Nobody in the household has been told what he found.',
      'Mr. Brandt, the family solicitor, arrives at ten. Before then, you must identify the killer and build a convincing case: why they did it, how they carried it out, when they had the opportunity, and what physical evidence connects them to the crime.',
      'Besides Sir Edmund, five people were in the house. At least one of them is lying to us. Start in the dining room.',
    ],
    readyLine: "I think we're ready, Detective. Whenever you are, Mr. Brandt will hear the case.",
    confrontation: {
      motive: [
        "Brandt lays the bank letter on the table. 'Eight cheques, Mr. Lyle. Sir Edmund signed none of them, and he knew it.'",
        "'At ten o'clock this morning he meant to say so.'",
      ],
      means: [
        "'The second bottle was locked in his desk. You knew exactly where it was, and you carry the only other key.'",
      ],
      opportunity: [
        "'Between a quarter to eight and the dinner bell, the study was empty. You were next door, with the glass.'",
        "Theo stares at the tablecloth. 'I could have walked out of any door in that room,' he says quietly. 'I didn't dare.'",
      ],
      physical: [
        "'And the cuff of the shirt you wore last night carries a stain that matches the tincture.'",
        "Brandt: 'A stain alone proves little. Alongside the bank letter, the keys and that empty study, it's damning.'",
      ],
    },
    epilogue: [
      'Theodore Lyle had been signing his uncle’s name to estate cheques to cover his own losses on shares. Sir Edmund noticed money missing and wrote to his bank. On Thursday afternoon Theo sorted the post as usual, and saw a private letter from the bank that Sir Edmund opened alone. It made him uneasy. That evening he saw the note on the telephone pad: Brandt at ten, a new will, the bank matter. Then he understood: by morning he would be found out.',
      'Soon after the dressing gong Theo took the second bottle from the locked drawer with his spare keys. When Mrs. Pell set down the tonic at a quarter to eight, he slipped through the hidden door and poured.',
      'Then Julian walked into the study. Theo could have left by any door, but every one of them risked being seen, so he stood still. When Julian called out, he pushed the bottle into the fern to keep his hands empty. Pell’s returning footsteps drove him back through the hidden door before he could retrieve it.',
      'Sir Edmund drank at five past eight. He meant the tonic to pass for heart failure, and the bottle to go back into the drawer after dinner. But Dr. Harlow locked the rooms, and the bottle stayed in the fern.',
    ],
  },
};
