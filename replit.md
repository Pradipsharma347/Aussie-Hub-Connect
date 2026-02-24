# Kaam App

## Overview
Multi-platform community app for the Australian market. Features Jobs listings, Room listings, News portal, Events, Australian Embassy details, and user profiles with authentication. Admin dashboard for managing all content.

## Recent Changes
- 2026-02-24: Complete rebuild of all mobile app screens with proper styling, navigation, and data fetching
- 2026-02-24: Generated branded app icons (green/gold briefcase theme)
- 2026-02-24: Initial project setup with database, backend APIs, admin dashboard, and mobile app

## Architecture
- **Frontend**: Expo (React Native) with file-based routing via expo-router
- **Backend**: Express.js with TypeScript on port 5000
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Session-based (express-session + connect-pg-simple)
- **State Management**: React Query for server state, React Context for auth
- **Design**: Green (#1B4D3E) and Gold (#E8A838) color scheme, Inter font family

## Key Files
- `shared/schema.ts` - Database schema (users, news, events, jobs, rooms, embassy, bookmarks)
- `server/routes.ts` - All API routes (auth, CRUD for all entities, admin routes)
- `server/storage.ts` - Database operations
- `server/templates/admin.html` - Admin dashboard web panel
- `lib/auth-context.tsx` - Auth context provider
- `lib/query-client.ts` - React Query setup and API helpers
- `constants/colors.ts` - App color constants
- `app/_layout.tsx` - Root layout with providers
- `app/(tabs)/` - Main tab screens (Home, Jobs, Rooms, Discover, Profile)
- `app/(auth)/` - Login and Register screens
- `app/` - Detail screens (news-detail, job-detail, room-detail, event-detail, embassy-detail, edit-profile)

## Admin Credentials
- Username: admin
- Password: admin123
- Dashboard: /admin route on port 5000

## User Preferences
- Professional look for Australian market
- All users must register/login to access features
- Admin can manage all content via dashboard
