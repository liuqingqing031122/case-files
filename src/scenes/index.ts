import type { ComponentType } from 'react';
import DiningScene from './DiningScene';
import ServantsScene from './ServantsScene';
import StudyScene from './StudyScene';
import UpstairsScene from './UpstairsScene';

export const SCENES: Record<string, ComponentType> = {
  dining: DiningScene,
  study: StudyScene,
  servants: ServantsScene,
  upstairs: UpstairsScene,
};
