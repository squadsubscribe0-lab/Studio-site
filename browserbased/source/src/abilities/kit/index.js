import { TideAbility } from './TideAbility.js';
import { GaleAbility } from './GaleAbility.js';
import { DragonAbility } from './DragonAbility.js';
import { BoulderAbility } from './BoulderAbility.js';
import { ArcaneAbility } from './ArcaneAbility.js';
import { VenomAbility } from './VenomAbility.js';
import { SolarAbility } from './SolarAbility.js';
import { VineAbility } from './VineAbility.js';
import { CycloneAbility } from './CycloneAbility.js';
import { SingularityAbility } from './SingularityAbility.js';
import { SunstrikeAbility } from './SunstrikeAbility.js';
import { StarfallAbility } from './StarfallAbility.js';
import { MiasmaAbility } from './MiasmaAbility.js';
import { GeyserAbility } from './GeyserAbility.js';
import { AegisAbility } from './AegisAbility.js';

/** Registry spread into `AbilityManager`'s type table. */
export const KIT_ABILITIES = {
  tide: TideAbility,
  gale: GaleAbility,
  dragon: DragonAbility,
  boulder: BoulderAbility,
  arcane: ArcaneAbility,
  venom: VenomAbility,
  solar: SolarAbility,
  vine: VineAbility,
  cyclone: CycloneAbility,
  singularity: SingularityAbility,
  sunstrike: SunstrikeAbility,
  starfall: StarfallAbility,
  miasma: MiasmaAbility,
  geyser: GeyserAbility,
  aegis: AegisAbility
};
