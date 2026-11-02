import { onSnapshot } from 'firebase/firestore';
import { serializeDoc } from '../utils/serialize.js';

/**
 * Helper for real-time endpoints: keeps an RTK Query cache entry in sync with
 * a Firestore onSnapshot listener for as long as any component uses it.
 * When the last subscriber unmounts (plus keepUnusedDataFor) the listener is removed.
 */
export async function streamInto(q, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }, transform = (x) => x) {
  let unsubscribe = () => {};
  try {
    await cacheDataLoaded;
    unsubscribe = onSnapshot(
      q,
      (snap) => updateCachedData(() => transform(snap.docs.map(serializeDoc))),
      (err) => console.error('Realtime listener error', err),
    );
  } catch {
    // cache entry removed before the first load finished
  }
  await cacheEntryRemoved;
  unsubscribe();
}
