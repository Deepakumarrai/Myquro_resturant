# MyQuro Restaurant Partner App

A React Native (Expo) mobile application for restaurant owners to onboard and manage their outlet on the MyQuro food delivery platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Start with public tunnel (for LTE/mobile testing)
npm run tunnel

# TypeScript check (must be 0 errors)
npx tsc --noEmit
```

## Documentation

For full technical documentation including screen flow, API contracts, design system, and state management:

**>> See [DOCUMENTATION.md](./DOCUMENTATION.md) <<**

## App Modules

| Module | Description |
|--------|-------------|
| **Onboarding** | 13-screen registration flow — from phone login to partner contract signing |
| **Dashboard** | Live order management with online/offline toggle and order lifecycle |
| **Past Orders** | Analytics, charts, and searchable historical order records |
| **Order Section (KDS)** | Kitchen Display System for real-time order tracking |
| **Ratings & Reviews** | Customer feedback center with owner reply functionality |

## Tech Stack

- React Native 0.76.7 + Expo Go 54.0.8
- Expo Router 4.0.17 (file-based routing)
- TypeScript (strict mode)
- Zustand + AsyncStorage (state management)
- @tanstack/react-query (data fetching)
