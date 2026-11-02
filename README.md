# Catatan Keuangan

Personal finance web app built with **React 19 + Redux Toolkit (RTK Query)**, **Firebase Firestore** as the
database and **Google Sign-In** via Firebase Auth.

## Features

| Feature | Where | Notes |
| --- | --- | --- |
| Google login | `/` (when signed out) | Firebase Auth popup, profile synced to `users/{uid}` |
| Dashboard | `/` | Monthly balance, income/expense, 6‑month trend chart, expense by category, **where money is spent** (top places), split-bill receivables |
| Transactions | `/transactions` | Income/expense with category, **place (where spent)**, payment method, note; edit/delete; month navigation; share to feed |
| Search by date range | `/search` | Date range + presets, keyword, type, category, min/max amount, CSV export |
| Reports | `/reports` | Create a frozen snapshot report for any date range: totals, per category/place/method/month, transaction list, print/PDF, CSV |
| Split bill | `/split` | Equal, per‑item, or custom split with tax & service; registered users or guests; mark paid (optimistic); copy summary for WhatsApp; open group chat; optionally log your share as an expense |
| Chat | `/chat` | Real-time direct & group chats between users |
| Social feed | `/feed` | Post stories/tips with mood, amount, category, image URL; likes (optimistic), real-time comments, load more |

## Caching system (3 layers)

1. **Firestore IndexedDB persistence** (`src/firebase.js`) – `persistentLocalCache` with multi-tab manager.
   Reads work offline, writes are queued and synced when back online.
2. **RTK Query in-memory cache** (`src/services/api.js`) – every read is cached by endpoint + args,
   kept 5 min after last use, refetched in the background when older than 2 min or on reconnect, and
   invalidated by tag after mutations. Real-time endpoints (chat, feed, comments) keep the cache live via
   `onSnapshot` (`src/services/stream.js`) and remove their listeners automatically.
3. **localStorage snapshot** (`src/app/cachePersistence.js`) – fulfilled queries for transactions, reports,
   split bills and the user directory are saved per user (24h TTL) and rehydrated on load through RTK
   Query's `extractRehydrationInfo`, so a refresh shows data instantly while fresh data loads
   (stale‑while‑revalidate). Cleared on logout.

## Project structure

```
src/
  app/            store + cache persistence
  features/auth   auth slice & thunks (Google login, listener)
  features/ui     toasts, shared UI state
  services/       RTK Query endpoints per domain (transactions, reports, splitBills, chat, posts, users)
  components/     layout, forms, lists, modal, pickers
  pages/          route pages (lazy-loaded)
  utils/          finance calculations (tested), dates, formatting
firestore.rules   security rules
```

### Firestore data model

```
users/{uid}                       public profile (directory for chat/split bill)
users/{uid}/transactions/{id}     type, amount, category, place, paymentMethod, note, date(ms)
users/{uid}/reports/{id}          title, from, to, notes, summary, transactions[]
splitBills/{id}                   ownerId, memberUids[], participants[], items[], total...
chats/{id}                        members[], memberInfo, lastMessage, updatedAt
chats/{id}/messages/{id}          text, senderId, createdAt
posts/{id}                        text, authorId, likes[], likeCount, commentCount, createdAt
posts/{id}/comments/{id}          text, authorId, createdAt
```

No composite indexes are required (multi-field sorting is done client-side).

## Setup

1. Create a Firebase project → add a **Web app**.
2. **Authentication → Sign-in method → Google** → enable. Add your domain under *Authorized domains*
   (`localhost` is there by default).
3. **Firestore Database** → create database.
4. Configure env:
   ```bash
   cp .env.example .env.local   # fill in the web app config values
   ```
5. Install & run:
   ```bash
   npm install
   npm run dev
   ```
6. Deploy security rules (and optionally hosting):
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use --add
   firebase deploy --only firestore:rules
   npm run build && firebase deploy --only hosting
   ```

## Scripts

- `npm run dev` – dev server
- `npm run build` – production build to `dist/`
- `npm test` – unit tests for finance logic (split bill math, summaries, filters)
