# College Clubs & Events

A React Native (Expo) app that brings a college's club events into one place. Students discover,
search and register for events. Students who manage a club get a dashboard to publish events and
track registrations.

## Features

**Students**
- Home feed of published events, with search by title, club or category
- Event calendar and event history
- One-tap registration (with capacity limits and registration deadlines) and cancellation
- Club pages and profile editing

**Club managers**
- Any student listed as a club manager gets the club dashboard automatically
- Create, edit, publish and cancel events with cover images
- Manage club details and track registrations and event counts

Events have a category (academic, social, sports, cultural, workshop, other) and a lifecycle of
`draft → published → completed / cancelled`.

## Tech stack

- **Expo** (React Native, new architecture) + TypeScript
- **React Navigation**: separate auth, student and club navigators
- **Redux Toolkit**: auth, clubs and events slices
- **Firebase**: Auth with AsyncStorage persistence, and Firestore
- **Cloudinary** for event and profile images (`expo-image-picker`)
- `expo-notifications`, `expo-linear-gradient`, `date-fns`

## Project structure

```
src/
  navigation/   AppNavigator → Auth / Student / Club navigators
  screens/      auth, student, club and shared screens
  components/   club, event and common UI
  services/     Firebase, auth, club, event, Cloudinary
  store/        Redux Toolkit slices
  hooks/        useAuth, useClubs, useEvents
  types/        Event, Club and auth types
```

## Getting started

```bash
npm install
npx expo start      # press a for Android, i for iOS, or scan the QR code with Expo Go
```

Firebase config lives in `src/services/firebase.ts`. Cloudinary config is in
`src/config/cloudinary.ts`. Point both at your own projects before running.
