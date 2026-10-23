// What an action newly revealed, so the UI can say so. Pure, no React.
// Unlocks are monotone (nothing ever becomes hidden again), so comparing the
// state before and after one action finds exactly what is new; repeating an
// action that reveals nothing announces nothing.
import {
  availableTopics,
  isMet,
  visibleHotspots,
  type CaseData,
  type GameState,
  type HotspotDef,
  type LocationDef,
  type SuspectDef,
  type TopicDef,
} from '../engine';

export interface RevealedHotspots {
  location: LocationDef;
  hotspots: HotspotDef[];
}

/**
 * Hotspots that became visible in locations that were already open. Hotspots
 * in a newly unlocked location are not listed: the location unlock is
 * announced on its own.
 */
export function newlyRevealedHotspots(data: CaseData, prev: GameState, next: GameState): RevealedHotspots[] {
  const out: RevealedHotspots[] = [];
  for (const location of data.locations) {
    if (!isMet(location.requires, prev) || !isMet(location.requires, next)) continue;
    const before = new Set(visibleHotspots(location, prev).map((h) => h.id));
    const hotspots = visibleHotspots(location, next).filter((h) => !before.has(h.id));
    if (hotspots.length > 0) out.push({ location, hotspots });
  }
  return out;
}

/** Topics this suspect can now be asked about that were not available before. */
export function newlyAvailableTopics(suspect: SuspectDef, prev: GameState, next: GameState): TopicDef[] {
  const before = new Set(availableTopics(suspect, prev).map((t) => t.id));
  return availableTopics(suspect, next).filter((t) => !before.has(t.id));
}

/** "Something new to examine in the Study: Desk blotter." */
export function revealMessage({ location, hotspots }: RevealedHotspots): string {
  const where = location.name.replace(/^The /, 'the ');
  return `Something new to examine in ${where}: ${hotspots.map((h) => h.label).join(', ')}.`;
}
