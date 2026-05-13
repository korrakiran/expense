# iOS Expense Tracker (Next.js + Firebase + PWA)

## Setup

1. Copy env template:

```bash
cp .env.example .env.local
```

2. Fill Firebase client env vars in `.env.local`.

3. Install and run:

```bash
npm install
npm run dev
```

4. Open `http://localhost:3000`.

## Firebase structure

- `users/{userId}/expenses/{expenseId}`
- `users/{userId}/settings/preferences`
- `users/{userId}/feedback/{feedbackId}`

## Features

- Email/password + Google auth
- Expense CRUD with Firestore sync
- Search with indexed title
- Settings sync (currency, week start, smart suggestions)
- iOS-style dashboard/search/settings UI
- PWA manifest + service worker + standalone metadata
- Zustand state + Framer Motion transitions + Recharts analytics
