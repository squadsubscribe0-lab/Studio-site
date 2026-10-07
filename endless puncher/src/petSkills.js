// Signature skills for the slime heroes. Each entry:
//   cd       – seconds between casts
//   range    – target must be this close to the pet (ignored when selfCast)
//   cast(b, pet, target, power) – fires the skill; may return a channel
//            { dur, update(dt, t), end() } that runs every frame while it lasts.
import * as THREE from 'three';
import { Audio } from './audio.js';

// Skill strength grows with the hero's attack, the pet's level and its rarity.
export function petPower(atk, def, lvl) {
  return atk * (1 + 0.15 * (lvl - 1)) * (1 + 0.25 * def.rarity);
}

const V = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function mouth(pet) {
  return pet.root.position.clone().setY(0.45);
}

function dirTo(pet, target) {
  return V.subVectors(target.f.root.position, pet.root.position).setY(0).normalize().clone();
}

function inCone(b, origin, dir, length, cosHalf) {
  return b.enemies.filter((e) => {
    if (!e.alive) return false;
    const d = V.subVectors(e.f.root.position, origin).setY(0);
    const len = d.length();
    return len < length && (len < 0.6 || d.divideScalar(len).dot(dir) > cosHalf);
  });
}

function ball(radius, color, emissive = true) {
  const mat = emissive
    ? new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.7 })
    : new THREE.MeshLambertMaterial({ color });
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), mat);
}

function disc(radius, color, opacity = 0.55) {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 36),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  return m;
}

export const PET_SKILLS = {
  // Drip: cone wave that shoves enemies away.
  water: {
    cd: 5, range: 4.5,
    cast(b, pet, target, pw) {
      const origin = pet.root.position.clone();
      const dir = dirTo(pet, target);
      for (let i = 0; i < 26; i++) {
        const spread = (Math.random() - 0.5) * 1.3;
        const v = dir.clone().applyAxisAngle(UP, spread).multiplyScalar(7 + Math.random() * 4);
        v.y = 1.5 + Math.random() * 2;
        b.puff(mouth(pet), v, i % 3 ? '#4fc3ff' : '#d8f6ff', 0.18, 0.55);
      }
      for (const e of inCone(b, origin, dir, 5.5, Math.cos(0.7))) {
        b.damageEnemy(e, pw * 0.8, 'zap', false);
        e.knock.addScaledVector(dir, e.def.boss ? 1.5 : 12);
      }
      Audio.play('splash', 0.1);
    },
  },

  // Pebble: lobbed boulder, area damage + stun where it lands.
  rock: {
    cd: 5.5, range: 8,
    cast(b, pet, target, pw) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), new THREE.MeshLambertMaterial({ color: '#8a7a66' }));
      Audio.play('throw', 0.1);
      b.launch({
        mesh: rock, from: mouth(pet), to: target.f.root.position.clone().setY(0.4), dur: 0.75, arc: 3.2,
        onHit: (pos) => {
          b.ringBlast(pos.setY(0.05), 2.2, '#d9b98a');
          b.spawnSparks(pos, 8, '#c9a27a');
          b.shake = Math.max(b.shake, 0.2);
          Audio.play('slam', 0.1);
          for (const e of b.enemiesNear(pos, 2.2)) {
            b.damageEnemy(e, pw * 1.4, 'hit', true);
            b.stunEnemy(e, 1.3, 'rock');
          }
        },
      });
    },
  },

  // Sprout: heals the hero and roots nearby enemies in vines (slow).
  leaf: {
    cd: 7, selfCast: true,
    cast(b, pet, target, pw) {
      const p = b.player.root.position;
      b.heal(b.maxHp * 0.06 + pw * 0.5);
      b.ringBlast(p, 3, '#7be34a');
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.puff(p.clone().add(new THREE.Vector3(Math.cos(a) * 0.8, 0.3, Math.sin(a) * 0.8)), new THREE.Vector3(Math.cos(a) * 2, 3, Math.sin(a) * 2), i % 2 ? '#7be34a' : '#ff9ad5', 0.14, 0.7);
      }
      for (const e of b.enemiesNear(p, 3.5)) b.slowEnemy(e, 3);
      Audio.play('heal', 0.2);
      Audio.play('grow', 0.2);
    },
  },

  // Ember: channelled flamethrower cone with burn.
  fire: {
    cd: 4.5, range: 5,
    cast(b, pet, target, pw) {
      let tick = 0;
      Audio.play('whoosh', 0.1);
      return {
        dur: 1.4,
        update(dt) {
          const t = target.alive ? target : b.nearest;
          if (!t) return;
          const dir = dirTo(pet, t);
          pet.root.rotation.y = Math.atan2(dir.x, dir.z);
          for (let i = 0; i < 3; i++) {
            const v = dir.clone().applyAxisAngle(UP, (Math.random() - 0.5) * 0.7).multiplyScalar(8 + Math.random() * 3);
            v.y = 0.6 + Math.random() * 1.2;
            b.puff(mouth(pet), v, ['#ff5a1a', '#ffb02e', '#ffe066'][i], 0.16, 0.45);
          }
          tick -= dt;
          if (tick <= 0) {
            tick = 0.2;
            Audio.play('sizzle', 0.15);
            for (const e of inCone(b, pet.root.position, dir, 5.2, Math.cos(0.45))) {
              b.damageEnemy(e, pw * 0.22, 'burn', false);
              e.burn = 2.5;
              e.burnDps = Math.max(e.burnDps, pw * 0.25);
            }
          }
        },
      };
    },
  },

  // Frosty: freezes every enemy around it.
  ice: {
    cd: 6, range: 3.8,
    cast(b, pet, target, pw) {
      const p = pet.root.position;
      b.ringBlast(p, 4, '#bff4ff');
      b.ringBlast(p, 2.5, '#ffffff');
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        b.puff(p.clone().setY(0.4), new THREE.Vector3(Math.cos(a) * 7, 0.8, Math.sin(a) * 7), i % 2 ? '#bff4ff' : '#ffffff', 0.15, 0.5);
      }
      for (const e of b.enemiesNear(p, 4)) {
        b.damageEnemy(e, pw * 0.6, 'zap', false);
        b.stunEnemy(e, 2, 'ice');
      }
      Audio.play('freeze', 0.1);
    },
  },

  // Zappy: lightning that jumps between enemies.
  spark: {
    cd: 3.2, range: 7,
    cast(b, pet, target, pw) {
      b.damageEnemy(target, pw * 0.9, 'zap', true);
      b.chainLightning(target, pw * 0.8, 4);
      b.spawnSparks(target.f.root.position.clone().setY(1.2), 6, '#8ff3ff');
    },
  },

  // Toxi: poison cloud that damages and slows everything inside.
  poison: {
    cd: 6, range: 7,
    cast(b, pet, target, pw) {
      const pos = target.f.root.position.clone().setY(0.05);
      const g = new THREE.Group();
      g.add(disc(2.3, '#7bff3a', 0.35));
      const cloud = new THREE.Mesh(new THREE.SphereGeometry(2.1, 18, 10), new THREE.MeshBasicMaterial({ color: '#9b6bff', transparent: true, opacity: 0.22, depthWrite: false }));
      cloud.scale.y = 0.35;
      cloud.position.y = 0.5;
      g.add(cloud);
      b.addZone({
        pos, radius: 2.3, life: 4, interval: 0.4, mesh: g,
        onTick: (e) => { b.damageEnemy(e, pw * 0.2, 'poison', false); b.slowEnemy(e, 0.6); },
        onFrame: (z, k) => {
          cloud.scale.set(1 + Math.sin(k * 20) * 0.04, 0.35, 1 + Math.cos(k * 20) * 0.04);
          if (Math.random() < 0.3) b.puff(z.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, 0.2, (Math.random() - 0.5) * 3)), new THREE.Vector3(0, 1.5, 0), '#8dff5a', 0.12, 0.8);
        },
      });
      Audio.play('bubble', 0.1);
      Audio.play('sizzle', 0.1);
    },
  },

  // Bubbly: traps the target in a floating bubble that pops for damage.
  bubble: {
    cd: 5, range: 7,
    cast(b, pet, target, pw) {
      const shot = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), b.bubbleMat);
      b.launch({
        mesh: shot, from: mouth(pet), to: target.f.root.position.clone().setY(1), target, dur: 0.5,
        onHit: () => { if (target.alive) b.trapInBubble(target, 2.4, pw * 1.7); },
      });
      Audio.play('pop', 0.1);
    },
  },

  // Nebby: five meteors rain down around the target.
  cosmic: {
    cd: 7, range: 8,
    cast(b, pet, target, pw) {
      const center = target.f.root.position.clone();
      let fired = 0;
      return {
        dur: 1.3,
        update(dt, t) {
          while (fired < 5 && t > fired * 0.22) {
            fired++;
            const near = b.enemiesNear(center, 4);
            const spot = near.length ? near[Math.floor(Math.random() * near.length)].f.root.position.clone()
              : center.clone().add(new THREE.Vector3((Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4));
            spot.y = 0.1;
            const rock = ball(0.35, '#ffb347');
            Audio.play('meteor', 0.05);
            b.launch({
              mesh: rock, from: spot.clone().add(new THREE.Vector3(-3, 11, -3)), to: spot, dur: 0.45,
              onHit: (pos) => {
                b.ringBlast(pos.setY(0.05), 1.6, '#ffd6a0');
                b.spawnSparks(pos, 6, '#ffe066');
                b.shake = Math.max(b.shake, 0.12);
                Audio.play('slam', 0.08);
                for (const e of b.enemiesNear(pos, 1.6)) b.damageEnemy(e, pw * 0.75, 'crit', false);
              },
            });
          }
        },
      };
    },
  },

  // Magmo: burning lava pool on the ground.
  lava: {
    cd: 6, range: 7,
    cast(b, pet, target, pw) {
      const pos = target.f.root.position.clone().setY(0.04);
      const g = new THREE.Group();
      const pool = disc(2, '#ff5a1a', 0.75);
      g.add(pool);
      g.add(disc(1.2, '#ffcf4a', 0.6));
      b.addZone({
        pos, radius: 2, life: 4.5, interval: 0.35, mesh: g,
        onTick: (e) => { b.damageEnemy(e, pw * 0.22, 'burn', false); e.burn = 2; e.burnDps = Math.max(e.burnDps, pw * 0.2); },
        onFrame: (z, k) => {
          pool.material.opacity = 0.6 + Math.sin(k * 30) * 0.15;
          g.scale.setScalar(Math.min(1, k * 8) * (k > 0.9 ? (1 - k) * 10 : 1));
          if (Math.random() < 0.25) b.puff(z.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.5, 0.1, (Math.random() - 0.5) * 2.5)), new THREE.Vector3(0, 2.2, 0), '#ffb347', 0.1, 0.5);
          if (Math.random() < 0.04) Audio.play('sizzle', 0.3);
        },
      });
      Audio.play('sizzle', 0.1);
      Audio.play('bubble', 0.1);
    },
  },

  // Aurum: golden strike, heavy damage and a shower of coins.
  gold: {
    cd: 4, range: 8,
    cast(b, pet, target, pw) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 18), new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#8a5a00' }));
      b.launch({
        mesh: coin, from: mouth(pet), to: target.f.root.position.clone().setY(1), target, dur: 0.4,
        onHit: (pos) => {
          b.spawnSparks(pos, 10, '#ffe066');
          Audio.play('bell', 0.05);
          Audio.play('coin', 0.05);
          if (target.alive) b.damageEnemy(target, pw * 2.2, 'gold', true);
          for (let i = 0; i < 2; i++) b.spawnDrop('coin', pos, Math.ceil(3 * Math.pow(1.18, b.stage - 1)));
        },
      });
    },
  },

  // Voidling: black hole that drags enemies in, then detonates.
  void: {
    cd: 8, range: 8,
    cast(b, pet, target, pw) {
      const pos = target.f.root.position.clone().setY(1);
      const g = new THREE.Group();
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 12), new THREE.MeshBasicMaterial({ color: '#07020f' }));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 8, 32), new THREE.MeshBasicMaterial({ color: '#d06bff' }));
      ring.rotation.x = Math.PI / 2.4;
      g.add(core, ring);
      b.addZone({
        pos, radius: 4.8, life: 2.2, interval: 0.05, mesh: g,
        onTick: (e, z) => {
          if (e.def.boss) return;
          V.subVectors(z.pos, e.f.root.position).setY(0);
          e.knock.addScaledVector(V.normalize(), 1.4);
          b.stunEnemy(e, 0.1, 'void');
        },
        onFrame: (z, k) => {
          ring.rotation.z += 0.3;
          g.scale.setScalar(0.6 + k * 0.7);
          if (Math.random() < 0.6) {
            const a = Math.random() * Math.PI * 2;
            const from = z.pos.clone().add(new THREE.Vector3(Math.cos(a) * 3.5, -0.6, Math.sin(a) * 3.5));
            b.puff(from, V.subVectors(z.pos, from).multiplyScalar(2).clone(), '#b04dff', 0.1, 0.45);
          }
        },
        onEnd: (z) => {
          b.ringBlast(z.pos.clone().setY(0.05), 3, '#d06bff');
          b.shake = Math.max(b.shake, 0.35);
          Audio.play('slam');
          for (const e of b.enemiesNear(z.pos, 3)) {
            b.damageEnemy(e, pw * 2.4, 'crit', true);
            V.subVectors(e.f.root.position, z.pos).setY(0).normalize();
            e.knock.addScaledVector(V, e.def.boss ? 1 : 10);
          }
        },
      });
      Audio.play('hum', 0.3);
    },
  },
};
