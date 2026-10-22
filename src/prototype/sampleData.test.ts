import { describe, expect, it } from 'vitest';
import { diningRoomHotspots, evidence } from './sampleData';

describe('prototype sample data', () => {
  it('every hotspot either reveals known evidence or shows a note', () => {
    for (const spot of diningRoomHotspots) {
      if (spot.evidenceId) {
        expect(evidence[spot.evidenceId], spot.id).toBeDefined();
      } else {
        expect(spot.note, spot.id).toBeTruthy();
      }
    }
  });

  it('hotspots sit inside the scene', () => {
    for (const spot of diningRoomHotspots) {
      expect(spot.x).toBeGreaterThanOrEqual(0);
      expect(spot.x).toBeLessThanOrEqual(100);
      expect(spot.y).toBeGreaterThanOrEqual(0);
      expect(spot.y).toBeLessThanOrEqual(100);
    }
  });
});
