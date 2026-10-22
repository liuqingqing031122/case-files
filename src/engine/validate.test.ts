import { describe, expect, it } from 'vitest';
import { miniCase } from './__fixtures__/miniCase';
import type { CaseData } from './types';
import { validateCase } from './validate';

const clone = (): CaseData => structuredClone(miniCase);

describe('validateCase', () => {
  it('accepts the fixture', () => {
    expect(validateCase(miniCase)).toEqual([]);
  });

  it('reports unknown ids in gives, accepts, conditions and slots', () => {
    const bad = clone();
    bad.locations[0].hotspots[0].gives = ['ghost'];
    bad.locations[1].requires = { interviewed: ['nobody'], anyOf: [{ examined: ['nowhere'] }] };
    bad.suspects[1].statements[0].contradiction!.accepts = ['phantom'];
    bad.accusation.slots.physical.accepts = ['missing'];
    expect(validateCase(bad)).toEqual(
      expect.arrayContaining([
        'hotspot coatStand: unknown evidence "ghost"',
        'location pantry: unknown suspect "nobody"',
        'location pantry: unknown hotspot "nowhere"',
        'contradiction cMaid accepts: unknown evidence "phantom"',
        'slot physical: unknown evidence "missing"',
      ]),
    );
  });

  it('reports duplicates, missing rebuttals and an unknown culprit', () => {
    const bad = clone();
    bad.locations[1].hotspots[0].id = 'coatStand';
    delete bad.accusation.rebuttals.cook;
    bad.accusation.culpritId = 'gardener';
    const errors = validateCase(bad);
    expect(errors).toContain('Duplicate hotspot id "coatStand"');
    expect(errors).toContain('Culprit "gardener" is not a suspect');
    expect(errors).toContain('No rebuttal for innocent suspect "cook"');
  });
});
