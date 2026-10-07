// GameDistribution (Azerion). Syndicates to thousands of downstream portals.
// Docs: https://github.com/GameDistribution/GD-HTML5/wiki/SDK-Implementation

import { GdFamilyAdapter } from './gd-family.js';

export class GameDistributionAdapter extends GdFamilyAdapter {
  static id = 'gamedistribution';
  static label = 'GameDistribution';
  static instanceGlobal = 'gdsdk';
  static optionsGlobal = 'GD_OPTIONS';
}
