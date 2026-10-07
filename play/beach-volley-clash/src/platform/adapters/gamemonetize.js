// GameMonetize. Same engine as GameDistribution, separate account and CDN.
// Docs: https://github.com/GameMonetize/GameMonetize.com-SDK

import { GdFamilyAdapter } from './gd-family.js';

export class GameMonetizeAdapter extends GdFamilyAdapter {
  static id = 'gamemonetize';
  static label = 'GameMonetize';
  static instanceGlobal = 'sdk';
  static optionsGlobal = 'SDK_OPTIONS';
}
