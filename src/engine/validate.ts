// Structural checks for case data: catches typos in the script (unknown ids,
// duplicates, missing rebuttals) before they become in-game bugs.
import { allContradictions } from './selectors';
import { SLOT_IDS, type CaseData, type Condition } from './types';

export function validateCase(data: CaseData): string[] {
  const errors: string[] = [];
  const evidenceIds = new Set(Object.keys(data.evidence));
  const hotspotIds = data.locations.flatMap((l) => l.hotspots.map((h) => h.id));
  const suspectIds = data.suspects.map((s) => s.id);
  const contradictionIds = allContradictions(data).map((c) => c.contradiction.id);

  const checkDuplicates = (what: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`Duplicate ${what} id "${id}"`);
      seen.add(id);
    }
  };
  const checkEvidence = (where: string, ids: string[] = []) => {
    for (const id of ids) if (!evidenceIds.has(id)) errors.push(`${where}: unknown evidence "${id}"`);
  };
  const checkCondition = (where: string, c: Condition | undefined) => {
    if (!c) return;
    checkEvidence(where, c.evidence);
    for (const id of c.examined ?? []) if (!hotspotIds.includes(id)) errors.push(`${where}: unknown hotspot "${id}"`);
    for (const id of c.interviewed ?? []) if (!suspectIds.includes(id)) errors.push(`${where}: unknown suspect "${id}"`);
    for (const id of c.contradictions ?? [])
      if (!contradictionIds.includes(id)) errors.push(`${where}: unknown contradiction "${id}"`);
    c.anyOf?.forEach((sub) => checkCondition(where, sub));
  };

  for (const [key, def] of Object.entries(data.evidence)) {
    if (key !== def.id) errors.push(`Evidence key "${key}" does not match its id "${def.id}"`);
  }
  checkDuplicates('location', data.locations.map((l) => l.id));
  checkDuplicates('hotspot', hotspotIds);
  checkDuplicates('suspect', suspectIds);
  checkDuplicates('contradiction', contradictionIds);
  checkEvidence('startingEvidence', data.startingEvidence);

  for (const location of data.locations) {
    checkCondition(`location ${location.id}`, location.requires);
    for (const h of location.hotspots) {
      checkCondition(`hotspot ${h.id}`, h.requires);
      checkEvidence(`hotspot ${h.id}`, h.gives);
    }
  }

  for (const suspect of data.suspects) {
    checkDuplicates(`statement (${suspect.id})`, suspect.statements.map((s) => s.id));
    checkDuplicates(`topic (${suspect.id})`, suspect.topics.map((t) => t.id));
    for (const t of suspect.topics) {
      checkCondition(`topic ${suspect.id}:${t.id}`, t.requires);
      checkEvidence(`topic ${suspect.id}:${t.id}`, t.gives);
    }
    for (const s of suspect.statements) {
      if (!s.contradiction) continue;
      checkEvidence(`contradiction ${s.contradiction.id} accepts`, s.contradiction.accepts);
      checkEvidence(`contradiction ${s.contradiction.id} gives`, s.contradiction.gives);
    }
  }

  const { culpritId, slots, rebuttals } = data.accusation;
  if (!suspectIds.includes(culpritId)) errors.push(`Culprit "${culpritId}" is not a suspect`);
  for (const slot of SLOT_IDS) {
    if (slots[slot].accepts.length === 0) errors.push(`Slot ${slot} accepts no cards`);
    checkEvidence(`slot ${slot}`, slots[slot].accepts);
    checkEvidence(`slot ${slot} nearMisses`, Object.keys(slots[slot].nearMisses ?? {}));
  }
  for (const id of suspectIds) {
    if (id !== culpritId && !rebuttals[id]) errors.push(`No rebuttal for innocent suspect "${id}"`);
  }
  checkCondition('accusation readyWhen', data.accusation.readyWhen);

  checkDuplicates('hint', data.hints.map((h) => h.id));
  for (const hint of data.hints) {
    checkCondition(`hint ${hint.id}`, hint.requires);
    checkCondition(`hint ${hint.id} doneWhen`, hint.doneWhen);
    if (hint.tiers.length === 0) errors.push(`Hint ${hint.id} has no tiers`);
  }
  for (const slot of SLOT_IDS) {
    if (!data.story.confrontation[slot]?.length) errors.push(`No confrontation beat for slot ${slot}`);
  }

  return errors;
}
