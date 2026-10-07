import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, query, orderBy, limit,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// ─── USER PROFILE ────────────────────────────────────────────────────────────

/**
 * Create a new user profile on first login.
 * Called when auth state changes and user doc doesn't exist.
 */
export async function createUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: "Player" + Math.floor(Math.random() * 9000 + 1000),
      nameChanged: false,
      streak: 0,
      maxStreak: 0,
      totalGames: 0,
      totalWins: 0,
      createdAt: serverTimestamp()
    });
  }
  return (await getDoc(ref)).data();
}

/**
 * Fetch user profile by uid.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Update display name — only allowed ONCE.
 * Throws if already changed.
 */
export async function updateDisplayName(uid, newName) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("User not found");
  const data = snap.data();
  if (data.nameChanged) throw new Error("Display name can only be changed once.");
  if (!newName || newName.trim().length < 2) throw new Error("Name must be at least 2 characters.");
  if (newName.trim().length > 20) throw new Error("Name must be 20 characters or fewer.");

  await updateDoc(ref, {
    displayName: newName.trim(),
    nameChanged: true
  });
}

// ─── DAILY RESULTS ───────────────────────────────────────────────────────────

/**
 * Get today's date string: "2025-03-16"
 */
export function todayString() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Save the result of today's challenge.
 * @param {string} uid
 * @param {object} result - { attempts, won, guesses, timeMs }
 */
export async function saveDailyResult(uid, result) {
  const date = todayString();
  const resultRef = doc(db, "users", uid, "dailyResults", date);
  const existing = await getDoc(resultRef);
  if (existing.exists()) return; // Don't overwrite — result is immutable

  await setDoc(resultRef, {
    date,
    attempts: result.attempts,   // number 1–6, or 7 if lost
    won: result.won,             // boolean
    guesses: result.guesses,     // array of 5-letter strings
    timeMs: result.timeMs,       // milliseconds taken
    savedAt: serverTimestamp()
  });

  // Update profile stats
  await updateUserStats(uid, result);
}

/**
 * Check if user has already played today.
 */
export async function getTodayResult(uid) {
  const snap = await getDoc(doc(db, "users", uid, "dailyResults", todayString()));
  return snap.exists() ? snap.data() : null;
}

/**
 * Get last N daily results for stats screen.
 */
export async function getRecentResults(uid, count = 30) {
  const col = collection(db, "users", uid, "dailyResults");
  const q = query(col, orderBy("date", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

// ─── STATS ───────────────────────────────────────────────────────────────────

/**
 * Recalculate and update streak + totals after a game.
 */
async function updateUserStats(uid, result) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const profile = snap.data();

  const newTotalGames = (profile.totalGames || 0) + 1;
  const newTotalWins  = (profile.totalWins  || 0) + (result.won ? 1 : 0);

  let newStreak    = profile.streak    || 0;
  let newMaxStreak = profile.maxStreak || 0;

  if (result.won) {
    newStreak = newStreak + 1;
    if (newStreak > newMaxStreak) newMaxStreak = newStreak;
  } else {
    newStreak = 0;
  }

  await updateDoc(ref, {
    totalGames: newTotalGames,
    totalWins:  newTotalWins,
    streak:     newStreak,
    maxStreak:  newMaxStreak
  });
}

/**
 * Calculate guess distribution (how many games won in 1–6 tries).
 */
export function calcDistribution(results) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  results.forEach(r => {
    if (r.won && r.attempts >= 1 && r.attempts <= 6) {
      dist[r.attempts]++;
    }
  });
  return dist;
}
