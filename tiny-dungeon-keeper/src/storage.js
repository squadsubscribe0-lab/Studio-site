/**
 * Save storage. On portals with cloud saves (CrazyGames Data Module) the
 * adapter exposes Platform.storage once its SDK is ready; everywhere else
 * this is plain localStorage. Older local saves are still read as a fallback,
 * so progress carries over the first time cloud saves are used.
 */
const local = () => { try { return window.localStorage; } catch (e) { return null; } };
const cloud = () => { try { return window.Platform?.storage || null; } catch (e) { return null; } };

export const kv = {
  get(k) {
    let v = null;
    try { v = cloud()?.getItem(k) ?? null; } catch (e) {}
    if (v == null) try { v = local()?.getItem(k) ?? null; } catch (e) {}
    return v;
  },
  set(k, v) {
    try { cloud()?.setItem(k, v); } catch (e) {}
    try { local()?.setItem(k, v); } catch (e) {}
  },
};
