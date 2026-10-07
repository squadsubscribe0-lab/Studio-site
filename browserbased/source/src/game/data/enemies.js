/**
 * The bestiary. `shape` picks the instanced mesh; the Director scales hp and
 * damage with the run clock. `radius` is the collision circle in metres.
 */
export const ENEMIES = {
  slime: { shape: 'blob', hp: 10, speed: 2.3, radius: 0.45, damage: 6, xp: 1, scale: 0.9, color: '#4fbf5a', glow: '#e6ff8a' },
  wisp: { shape: 'wisp', hp: 7, speed: 3.6, radius: 0.35, damage: 4, xp: 1, scale: 0.8, color: '#5a90ff', glow: '#dff2ff' },
  ghoul: { shape: 'ghoul', hp: 26, speed: 1.9, radius: 0.5, damage: 9, xp: 2, scale: 1.0, color: '#7f8f78', glow: '#ffe45a' },
  imp: { shape: 'ghoul', hp: 20, speed: 3.0, radius: 0.42, damage: 8, xp: 2, scale: 0.8, color: '#c0402f', glow: '#ffd07a' },
  magma: { shape: 'blob', hp: 45, speed: 1.7, radius: 0.65, damage: 12, xp: 3, scale: 1.4, color: '#d9501f', glow: '#fff0a0' },
  brute: { shape: 'golem', hp: 110, speed: 1.4, radius: 0.9, damage: 18, xp: 6, scale: 1.3, color: '#766b62', glow: '#ff8a3a' },
  wraith: { shape: 'wisp', hp: 40, speed: 2.6, radius: 0.55, damage: 12, xp: 4, scale: 1.4, color: '#8a5aff', glow: '#f2e0ff' },

  // Bosses: `boss` turns on the slam attack and the boss health bar.
  warden: { shape: 'golem', hp: 2200, speed: 1.6, radius: 1.8, damage: 28, xp: 60, scale: 2.6, color: '#667882', glow: '#5fe8ff', boss: true, title: 'Stone Warden' },
  broodmother: { shape: 'blob', hp: 4200, speed: 1.9, radius: 2.0, damage: 30, xp: 90, scale: 4.2, color: '#3f8f32', glow: '#e6ff8a', boss: true, title: 'Broodmother', spawns: 'slime' },
  heart: { shape: 'golem', hp: 9000, speed: 1.7, radius: 2.3, damage: 36, xp: 0, scale: 3.4, color: '#533872', glow: '#ff4a9a', boss: true, title: 'The Dungeon Heart', final: true }
};
