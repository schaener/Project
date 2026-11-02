import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.js';
import { authChanged, authError } from './authSlice.js';
import { api, REHYDRATE_CACHE } from '../../services/api.js';
import { upsertProfile } from '../../services/usersApi.js';
import { clearPersistedCache, loadPersistedCache } from '../../app/cachePersistence.js';

const pickUser = (u) =>
  u && { uid: u.uid, displayName: u.displayName || u.email, email: u.email, photoURL: u.photoURL || null };

/** Starts the Firebase auth listener and keeps Redux in sync. */
export const listenToAuth = () => (dispatch) => {
  if (!auth) {
    dispatch(authChanged(null));
    return () => {};
  }
  return onAuthStateChanged(auth, (fbUser) => {
    const user = pickUser(fbUser);
    if (user) {
      // Restore last session's cached data for this user before UI renders it.
      const cached = loadPersistedCache(user.uid);
      if (cached) dispatch({ type: REHYDRATE_CACHE, payload: cached });
      upsertProfile(user).catch((e) => console.warn('Profile sync failed', e));
    }
    dispatch(authChanged(user));
  });
};

export const loginWithGoogle = () => async (dispatch) => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e) {
    if (e?.code !== 'auth/popup-closed-by-user') dispatch(authError(e.message));
  }
};

export const logout = () => async (dispatch, getState) => {
  const uid = getState().auth.user?.uid;
  await signOut(auth);
  if (uid) clearPersistedCache(uid);
  dispatch(api.util.resetApiState());
};
