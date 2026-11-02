import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { api, run } from './api.js';
import { serializeDoc } from '../utils/serialize.js';

export function upsertProfile(user) {
  return setDoc(
    doc(db, 'users', user.uid),
    {
      displayName: user.displayName || user.email,
      displayNameLower: (user.displayName || user.email || '').toLowerCase(),
      email: user.email,
      photoURL: user.photoURL || null,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Small user directory used by chat and split bill pickers.
    getUsers: builder.query({
      queryFn: () =>
        run(async () => {
          const snap = await getDocs(query(collection(db, 'users'), limit(500)));
          return snap.docs
            .map(serializeDoc)
            .map(({ id, displayName, email, photoURL }) => ({ uid: id, displayName, email, photoURL }));
        }),
      providesTags: [{ type: 'User', id: 'LIST' }],
      keepUnusedDataFor: 900,
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
