# MyQuro Restaurant Partner App — Full Team Documentation

> **Version**: 1.0.0
> **Last Updated**: August 2026
> **Platform**: React Native (Expo) — Android & iOS
> **Maintained by**: MyQuro Engineering Team

---

## 📖 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Design System](#4-design-system)
5. [Complete Screen Flow and Navigation Map](#5-complete-screen-flow-and-navigation-map)
6. [Onboarding Flow — Screen by Screen](#6-onboarding-flow--screen-by-screen)
7. [Dashboard and Post-Onboarding Features](#7-dashboard-and-post-onboarding-features)
8. [State Management](#8-state-management)
9. [Backend API Contracts](#9-backend-api-contracts)
10. [Assets Reference](#10-assets-reference)
11. [Running the App Locally](#11-running-the-app-locally)

---

## 1. Project Overview

The **MyQuro Restaurant Partner App** is a mobile application for restaurant owners to onboard and manage their outlet on the MyQuro food delivery platform.

### Two Major Modules

| Module | Purpose |
|--------|---------|
| **Onboarding** | 4-step registration flow — from phone login to contract signing |
| **Restaurant Dashboard** | Day-to-day restaurant management — orders, past orders, ratings, KDS |

### Design Philosophy
- Dark luxury theme: background `#07090E` / `#0B0D12`, primary gold `#F5A623`, accent gold `#D4AF37`
- `Urbanist` typeface family (Regular, Medium, SemiBold, Bold, ExtraBold)
- Glassmorphism cards with subtle borders and shadow layering
- Smooth animations — 450ms cross-fades, slide-up modals, live badge counters

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.76.7 |
| Runtime | Expo Go | 54.0.8 |
| Routing | Expo Router (file-based) | 4.0.17 |
| Language | TypeScript | Strict mode, 0 errors |
| Styling | React Native StyleSheet + Expo LinearGradient | — |
| State Management | Zustand + AsyncStorage persistence | — |
| Icons | @expo/vector-icons (Ionicons) | — |
| Media Picker | expo-image-picker | ~17.0.11 |
| Safe Area | react-native-safe-area-context | — |
| SVG | react-native-svg | — |
| Data Fetching | @tanstack/react-query | — |
| Fonts | expo-font (Urbanist, Fasthand) | — |

---

## 3. Project Structure

```
Myquro_resturant/
├── assets/
│   ├── fonts/                        # Urbanist & Fasthand font files
│   ├── images/                       # Onboarding hero illustrations
│   ├── image.png                     # Checklist / Steps background
│   ├── image copy.png                # Restaurant info graphic
│   ├── image copy 2.png              # Location screen pin graphic
│   ├── image copy 4.png              # Documents screen graphic
│   ├── image copy 5.png              # Contract screen graphic
│   ├── image copy 6.png              # Thank You screen illustration
│   └── image copy 8.png             # Dashboard empty state illustration
│
└── src/
    ├── app/
    │   ├── _layout.tsx               # Root layout — font loading, QueryClient, SafeAreaProvider
    │   ├── index.tsx                 # [Screen 1] Login — phone entry + carousel
    │   ├── onboarding-checklist.tsx  # [Screen 2] Required docs checklist
    │   ├── restaurant-name.tsx       # [Screen 3] Restaurant name entry
    │   ├── onboarding-steps.tsx      # [Screen 4] 4-Step timeline tracker (step=1|2|3|4)
    │   ├── restaurant-information.tsx# [Screen 5] Owner info, hours, location
    │   ├── restaurant-location.tsx   # [Screen 5a] GPS map pin selector
    │   ├── restaurant-address-details.tsx # [Screen 5b] Address + storefront photos
    │   ├── restaurant-documents.tsx  # [Screen 7] FSSAI, PAN, GSTIN, Bank details
    │   ├── select-outlet-type.tsx    # [Screen 7a] Category I / II / III picker
    │   ├── menu-setup.tsx            # [Screen 9] POS, cuisine, menu upload, packaging
    │   ├── partner-contract.tsx      # [Screen 11] Contract viewer + T&C acceptance
    │   ├── thank-you.tsx             # [Screen 12] Success + 10s countdown redirect
    │   ├── (tabs)/
    │   │   ├── _layout.tsx           # Tab bar layout (hidden, using custom bottom bar)
    │   │   └── index.tsx             # [Screen 13] Restaurant Dashboard (main hub)
    │   ├── past-orders.tsx           # Past Orders analytics + records page
    │   ├── order-section.tsx         # Kitchen Display System (KDS) live orders
    │   └── ratings.tsx              # Ratings & Reviews page
    │
    ├── state/
    │   ├── orderStore.ts             # Zustand store — orders database (persisted)
    │   ├── authStore.ts              # Auth state store
    │   └── cartStore.ts             # Cart state store
    │
    ├── constants/
    │   └── theme.ts                 # Color tokens, typography scale
    │
    ├── services/                    # API service layer (future integration)
    ├── types/                       # Shared TypeScript type definitions
    ├── hooks/                       # Custom React hooks
    └── utils/                       # Utility helpers
```

---

## 4. Design System

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Background Deep | #07090E | Primary dark background |
| Background Mid | #0B0D12 | Secondary dark background |
| Primary Gold | #F5A623 | CTAs, highlights, active states |
| Accent Gold | #D4AF37 | Card borders, logo |
| Card Surface | rgba(17, 20, 29, 0.94) | Glass cards |
| Text Primary | #FFFFFF | Headings |
| Text Muted | rgba(255,255,255,0.62) | Body / subtitles |
| Error | #EF4444 | Validation errors |
| Success Green | #2ECC71 | Online status / completed |

### Typography Scale

| Name | Font | Size | Usage |
|------|------|------|-------|
| H1 | Urbanist-Bold | 28-30px | Page titles |
| H2 | Urbanist-Bold | 22-24px | Section headers |
| Body | Urbanist-Regular | 13-15px | Content text |
| Label | Urbanist-SemiBold | 12-14px | Field labels |
| Button | Urbanist-Bold | 16px | CTA buttons |
| Caption | Urbanist-Medium | 11-12px | Counters, captions |

---

## 5. Complete Screen Flow and Navigation Map

```
App Launch
    |
    v
[Screen 1]  /index                    Phone number entry + animated carousel
    |  Enter 10-digit number, tap Continue
    v
[Screen 2]  /onboarding-checklist    Documents required checklist
    |  Tap Begin
    v
[Screen 3]  /restaurant-name         Restaurant name entry
    |  Tap Save and Continue
    v
[Screen 4]  /onboarding-steps?step=1 Timeline: Step 1 active
    |  Tap Proceed
    v
[Screen 5]  /restaurant-information  Owner info, hours, location
    |   +-- Tap Add Restaurant Location
    |   |       v
    |   |  [Screen 5a] /restaurant-location       GPS map pin
    |   |       |  Tap Confirm Location
    |   |       v
    |   |  [Screen 5b] /restaurant-address-details  Address + photos
    |   |       |  Tap Save Address Details
    |   +-------+  (returns to Screen 5 with locationAdded=true)
    |  Tap Save and Continue
    v
[Screen 6]  /onboarding-steps?step=2 Timeline: Step 2 active
    |  Tap Proceed
    v
[Screen 7]  /restaurant-documents    FSSAI, PAN, GSTIN, Bank
    |   +-- Tap Select Restaurant Category
    |   |       v
    |   |  [Screen 7a] /select-outlet-type  Category I / II / III
    |   |       |  Select category
    |   +-------+  (returns to Screen 7 with outletType param)
    |  Tap Save and Proceed
    v
[Screen 8]  /onboarding-steps?step=3 Timeline: Step 3 active
    |  Tap Proceed
    v
[Screen 9]  /menu-setup              Cuisine, menu upload, packaging
    |  Tap Proceed
    v
[Screen 10] /onboarding-steps?step=4 Timeline: Step 4 active
    |  Tap Proceed
    v
[Screen 11] /partner-contract        Contract viewer + T&C acceptance
    |  Tap Proceed inside Terms Modal
    v
[Screen 12] /thank-you               Success screen (10s countdown)
    |  Auto-redirects after 10 seconds
    v
[Screen 13] /(tabs)/index            RESTAURANT DASHBOARD
    |
    +-- [More] --> /past-orders       Analytics + order history
    +-- [More] --> /order-section     Kitchen Display System (KDS)
    +-- [More] --> /ratings           Customer ratings and reviews
```

---

## 6. Onboarding Flow — Screen by Screen

### Screen 1: Login (src/app/index.tsx)
**Purpose**: Entry point. Collect the restaurant owner's phone number.

| Property | Details |
|----------|---------|
| Route | / |
| Input | 10-digit mobile number (numeric only, max 10 chars) |
| Validation | Exact 10 digits required |
| Navigation | On success -> /onboarding-checklist |
| Visual | 3-slide animated carousel (fade-in/out every 4.5s) with hero illustrations |

**Backend API Required**:
```
POST /api/auth/send-otp
Body: { phone: "9XXXXXXXXX" }
Response: { success: true, otp_ref: "string" }
```

---

### Screen 2: Onboarding Checklist (src/app/onboarding-checklist.tsx)
**Purpose**: Inform the owner what documents they need before starting.

| Property | Details |
|----------|---------|
| Route | /onboarding-checklist |
| Content | PAN Number, GSTIN, Bank Details (IFSC + Account), FSSAI Number, Restaurant Menu |
| Navigation | Tap Begin -> /restaurant-name |
| Visual | Hero image background with translucent checklist card |

No API call needed — static informational screen.

---

### Screen 3: Restaurant Name (src/app/restaurant-name.tsx)
**Purpose**: Capture the restaurant legal/trade name.

| Property | Details |
|----------|---------|
| Route | /restaurant-name |
| Input | Restaurant name (text, non-empty) |
| Navigation | Tap Save and Continue -> /onboarding-steps |

**Backend API Required**:
```
POST /api/restaurant/init
Body: { name: "Restaurant Name" }
Response: { restaurant_id: "uuid", name: "..." }
```

---

### Screen 4: Onboarding Steps Timeline (src/app/onboarding-steps.tsx)
**Purpose**: Visual progress tracker. Shows which steps are done, active, or pending.

| Property | Details |
|----------|---------|
| Route | /onboarding-steps?step=1|2|3|4 |
| Param | step — current active step number |
| Step 1 Active | Proceed -> /restaurant-information |
| Step 2 Active | Proceed -> /restaurant-documents |
| Step 3 Active | Proceed -> /menu-setup |
| Step 4 Active | Proceed -> /partner-contract |
| Completed steps | Show Edit details link |

No API call — navigation screen only.

---

### Screen 5: Restaurant Information (src/app/restaurant-information.tsx)
**Purpose**: Capture owner contact info, business hours, and confirm location.

| Field | Validation |
|-------|-----------|
| Owner Name | Mandatory |
| Restaurant Name | Mandatory |
| Email Address | Mandatory + regex format |
| Mobile Number | Mandatory, 10 digits |
| Operating Days | At least 1 day selected |
| Open/Close Time | Not identical times |
| Restaurant Location | Mandatory (confirmed via sub-flow) |

Sub-flow: Add Restaurant Location -> /restaurant-location -> /restaurant-address-details -> back with locationAdded=true

Navigation: Save and Continue -> /onboarding-steps?step=2

**Backend API Required**:
```
PUT /api/restaurant/:id/information
Body: {
  owner_name, restaurant_name, email, phone,
  operating_days: ["Monday", ...],
  open_time: "09:00 AM",
  close_time: "10:00 PM",
  location: { lat, lng, address }
}
```

---

### Screen 5a: Restaurant Location Map (src/app/restaurant-location.tsx)
**Purpose**: Let owner pin their restaurant on the map.

| Property | Details |
|----------|---------|
| Route | /restaurant-location |
| Visual | Dark GPS road network map with 3D gold radar pin |
| Navigation | Confirm Location -> /restaurant-address-details |

**Backend API Required**:
```
GET /api/maps/search?q={query}
GET /api/maps/geocode?lat={lat}&lng={lng}
```

---

### Screen 5b: Address Details (src/app/restaurant-address-details.tsx)
**Purpose**: Detailed address + storefront photo collection.

| Field | Validation |
|-------|-----------|
| Full Address | Mandatory |
| Shop/Plot Number | Mandatory |
| Floor | Mandatory |
| Building Name | Mandatory |
| Pincode | Mandatory, exact 6 digits |
| Landmark | Mandatory |
| Storefront Photos | Optional (Camera or Gallery) |

Navigation: Save Address Details -> /restaurant-information?locationAdded=true

**Backend API Required**:
```
POST /api/restaurant/:id/address
Body: { address, plot, floor, building, pincode, landmark, photos: [url] }
```

---

### Screen 7: Restaurant Documents (src/app/restaurant-documents.tsx)
**Purpose**: Collect legal compliance documents.

| Field | Validation | Category |
|-------|-----------|---------|
| FSSAI License | Exactly 14 digits | All |
| PAN Number | Exactly 10 alphanumeric | All |
| GSTIN | Exactly 15 alphanumeric | Optional Cat I, Mandatory Cat II & III |
| Bank Account | Min 9 digits | All |
| IFSC Code | Exactly 11 chars | All |

Outlet Types (from /select-outlet-type):
- Category I: Fresh food only. GSTIN optional. MyQuro pays GST.
- Category II: Ice Cream, Bakery, Packaged. GSTIN mandatory. Outlet pays GST.
- Category III: Both fresh + packaged. GSTIN mandatory. Split GST.

Navigation: Save and Proceed -> /onboarding-steps?step=3

**Backend API Required**:
```
POST /api/restaurant/:id/documents
Body: { fssai, pan, gstin, bank_account, ifsc, outlet_type }
Response: { verified: true }
```

---

### Screen 9: Menu Setup (src/app/menu-setup.tsx)
**Purpose**: Set up cuisine preferences, upload menu, and configure packaging.

| Section | Details |
|---------|---------|
| POS Integration | None / PetPooja / LimeTray / UrbanPiper / DotPe / SlickPOS / Posist / Other |
| Food Category | Veg Only / Both Veg and Non-Veg |
| Cuisines | 60+ options (North Indian, South Indian, Chinese, Fast Food, etc.) + custom |
| Cost for Two | numeric rupee value |
| Menu Upload | Gallery picker (photos of menu card) |
| Packaging Charges | Zero / Fixed amount / Based on item price (5-tier table) |

Navigation: Proceed -> /onboarding-steps?step=4

**Backend API Required**:
```
POST /api/restaurant/:id/menu
Body: {
  pos_provider: string | null,
  food_type: "veg" | "both",
  cuisines: string[],
  cost_for_two: number,
  menu_photos: string[],
  packaging: { type: "zero" | "fixed" | "tiered", amount?, tiers? }
}
```

---

### Screen 11: Partner Contract (src/app/partner-contract.tsx)
**Purpose**: Present the business contract for review and acceptance.

| Section | Details |
|---------|---------|
| Commission | 15% of order value |
| Onboarding Fee | Rs. 949 (one-time) |
| Contract Viewer | 11-page LOU with merchant name/address interpolated |
| PDF Download | CTA button |
| Terms and Conditions | Bottom sheet modal with 6 terms |
| Acceptance | Golden Proceed button -> records acceptance |

Navigation: Accept -> /thank-you

**Backend API Required**:
```
POST /api/restaurant/:id/contract/accept
Body: { accepted: true, timestamp: ISO_string }
Response: { application_id: "APP-XXXX", status: "under_review" }
```

---

### Screen 12: Thank You (src/app/thank-you.tsx)
**Purpose**: Confirm successful submission. Auto-redirect to dashboard after 10 seconds.

| Property | Details |
|----------|---------|
| Countdown | 10-second progress bar |
| Auto-redirect | /(tabs) dashboard |
| Info shown | Review timeline (72 hours), email/SMS notification notice |

---

## 7. Dashboard and Post-Onboarding Features

### Screen 13: Restaurant Dashboard (src/app/(tabs)/index.tsx)

#### Online/Offline Toggle
- Online: Orders are shown and can be received
- Offline: No new orders displayed
- BLOCKED: Cannot go offline if any order is in New or Preparing state — must complete all active orders first

#### Order Lifecycle Tabs

| Tab | Actions |
|-----|---------|
| New | Accept (-> Preparing) or Decline (-> Rejected) |
| Preparing | Mark as Ready (-> Ready) |
| Ready | Complete Delivery (-> Picked Up) |
| Picked up | View-only — shows Delivered and Completed badge |

#### Bottom Navigation Bar (Custom)

| Tab | Action |
|-----|--------|
| Orders | Default view — order lifecycle |
| Menu | Future: menu management |
| Business | Future: business analytics |
| Complaints | Future: customer complaints |
| More | Opens More overlay panel |

#### More Overlay Panel
- Past Orders / Order History -> /past-orders
- Order Section (KDS) -> /order-section
- Ratings and Reviews -> /ratings
- Outlet Settings -> (Future)
- Help and Support -> (Future)

---

### Past Orders Page (src/app/past-orders.tsx)

#### Summary Metrics
- Total Orders
- Total Sales (Rs.)
- Average Order Value (Rs.)
- Items Sold
- Acceptance Rate (%)
- Comparison vs. previous period (% growth/decline)

#### Date Range Filters

| Filter | Range |
|--------|-------|
| Today | Current calendar day |
| Yesterday | Previous calendar day |
| This Week | Mon-Sun current week |
| Last Week | Mon-Sun previous week |
| This Month | 1st to today current month |
| Last Month | Full previous calendar month |

#### Charts and Insights
- Hourly Distribution — bar chart of orders by hour
- Weekday Performance — orders per day of week
- Status Breakdown — Completed vs. Rejected
- Preparation Time — average kitchen prep speed
- Customer Loyalty — New vs. Returning ratio
- Top Selling Items — ranked by revenue + demand %
- Operational Alerts — dynamic tips (busy hours, rejection flags, speed warnings)

#### Order Records Table
- Search by Order ID or customer name
- Filter by status and amount range
- Sortable columns, paginated (10 per page)
- Tap order -> receipt modal with full item breakdown + timeline
- CSV Export -> shares via native OS Share sheet

**Backend API Required**:
```
GET /api/restaurant/:id/orders?from=ISO&to=ISO&status=all|completed|rejected
GET /api/restaurant/:id/analytics?period=today|week|month
```

---

### Order Section / KDS (src/app/order-section.tsx)

#### Tab Filters
| Tab | Shows |
|-----|-------|
| All | All active orders |
| New | Orders not yet accepted |
| Preparing | Accepted, being cooked |
| Ready | Cooked, awaiting pickup |

#### Alert System
| State | Threshold | Visual |
|-------|----------|--------|
| New order waiting | > 5 minutes | Red border + warning |
| Order in Preparing | > 20 minutes | Red border + warning |

#### Actions (synced with orderStore in real time)
- Accept (New -> Preparing)
- Decline (New -> Rejected)
- Mark as Ready (Preparing -> Ready)
- Complete Delivery (Ready -> Picked Up)

---

### Ratings and Reviews (src/app/ratings.tsx)

#### Overview Card
- Average star rating
- Total reviews count
- Star distribution bars (5 to 1 star)
- Category averages: Food Quality / Preparation Speed / Delivery

#### Review Feed
- Customer name, star rating, items ordered, review text, tag badges, date

#### Filters
- By star count, by category, keyword search

#### Owner Response
- Reply to any customer review via dialog modal

**Backend API Required**:
```
GET /api/restaurant/:id/reviews?star=5&category=food&q=keyword
POST /api/restaurant/:id/reviews/:review_id/reply
Body: { reply: "Thank you..." }
```

---

## 8. State Management

### orderStore.ts — Central Order Database

Location: src/state/orderStore.ts
Technology: Zustand + AsyncStorage

#### Order Data Model
```typescript
interface Order {
  id: string;                           // "MQ-XXXX"
  customer: string;                     // Customer display name
  items: { name: string; qty: number; price: number }[];
  total: number;                        // Rs. total
  timestamp: string;                    // ISO date (order placed time)
  status: "New" | "Preparing" | "Ready" | "Picked up" | "Rejected";
  receivedTime: string;                 // ISO (when received by restaurant)
  acceptedTime?: string;               // ISO (when accepted)
  readyTime?: string;                  // ISO (when marked ready)
  pickedUpTime?: string;              // ISO (when delivered)
  rejectedTime?: string;              // ISO (when rejected)
  rejectionReason?: string;
  customerType: "New" | "Returning";
}
```

#### Store Actions

| Action | Description |
|--------|-------------|
| loadOrders() | Loads persisted orders from AsyncStorage on app start |
| addOrder(order) | Adds a new order to the store and persists |
| addSimulatedOrder(isOnline) | Generates a realistic simulated incoming order (only if online) |
| acceptOrder(id) | Sets status to Preparing, stamps acceptedTime |
| markReady(id) | Sets status to Ready, stamps readyTime |
| markPickedUp(id) | Sets status to Picked up, stamps pickedUpTime |
| rejectOrder(id, reason) | Sets status to Rejected, stamps rejectedTime |
| clearDatabase() | Wipes all orders from store and storage |

#### Persistence
- AsyncStorage key: @myquro_orders_db
- Auto-seeded with 80+ mock historical orders spanning 45 days on first empty load
- Shared across Dashboard, Order Section (KDS), and Past Orders

---

## 9. Backend API Contracts

### Base URL
```
Production:  https://api.myquro.com/v1
Staging:     https://staging-api.myquro.com/v1
```

### Authentication
```
All protected endpoints require:
Header: Authorization: Bearer {jwt_token}
```

### Endpoints Summary

| Endpoint | Method | Screen | Description |
|----------|--------|--------|-------------|
| /auth/send-otp | POST | Login | Send OTP to phone |
| /auth/verify-otp | POST | Login | Verify OTP, return JWT |
| /restaurant/init | POST | Restaurant Name | Create restaurant record |
| /restaurant/:id/information | PUT | Restaurant Info | Save Step 1 info |
| /restaurant/:id/address | POST | Address Details | Save address + photos |
| /restaurant/:id/documents | POST | Documents | Save compliance docs |
| /restaurant/:id/menu | POST | Menu Setup | Save menu details |
| /restaurant/:id/contract/accept | POST | Partner Contract | Record contract acceptance |
| /restaurant/:id/orders | GET | Dashboard + KDS | Fetch live/past orders |
| /restaurant/:id/analytics | GET | Past Orders | Fetch analytics data |
| /restaurant/:id/reviews | GET | Ratings | Fetch customer reviews |
| /restaurant/:id/reviews/:id/reply | POST | Ratings | Submit owner reply |
| /restaurant/:id/status | PUT | Dashboard | Toggle online/offline |
| /orders/:id/accept | PUT | Dashboard + KDS | Accept an order |
| /orders/:id/ready | PUT | Dashboard + KDS | Mark order ready |
| /orders/:id/complete | PUT | Dashboard + KDS | Mark order picked up |
| /orders/:id/reject | PUT | Dashboard + KDS | Reject an order |

### Restaurant Data Model
```json
{
  "id": "uuid",
  "name": "Restaurant Name",
  "owner_name": "Owner Name",
  "email": "owner@email.com",
  "phone": "9XXXXXXXXX",
  "status": "online | offline | under_review | approved | rejected",
  "outlet_type": "Category I | II | III",
  "fssai": "14-digit string",
  "pan": "10-char string",
  "gstin": "15-char string | null",
  "bank_account": "string",
  "ifsc": "11-char string",
  "location": { "lat": 0.0, "lng": 0.0, "address": "string" },
  "cuisines": ["North Indian", "Chinese"],
  "cost_for_two": 400,
  "packaging_type": "zero | fixed | tiered",
  "operating_hours": {
    "days": ["Monday", "Tuesday"],
    "open": "09:00 AM",
    "close": "10:00 PM"
  },
  "onboarding_step": 1
}
```

### Order Data Model
```json
{
  "id": "MQ-1234",
  "restaurant_id": "uuid",
  "customer_name": "Deepak Kumar",
  "customer_type": "new | returning",
  "items": [
    { "name": "Butter Chicken", "qty": 2, "price": 280 }
  ],
  "total": 560,
  "status": "new | preparing | ready | picked_up | rejected",
  "created_at": "ISO string",
  "accepted_at": "ISO string | null",
  "ready_at": "ISO string | null",
  "completed_at": "ISO string | null",
  "rejected_at": "ISO string | null",
  "rejection_reason": "string | null"
}
```

### Review Data Model
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "customer_name": "string",
  "rating": 4,
  "food_rating": 4.5,
  "prep_rating": 4.0,
  "delivery_rating": 3.5,
  "text": "Great food, fast delivery!",
  "tags": ["Great Food", "Fast Delivery"],
  "items_ordered": ["Butter Chicken", "Naan"],
  "created_at": "ISO string",
  "owner_reply": "string | null",
  "replied_at": "ISO string | null"
}
```

---

## 10. Assets Reference

| File | Used In | Description |
|------|---------|-------------|
| assets/images/restaurant_onboarding_hero.png | Login Slide 1 | Onboarding carousel hero |
| assets/images/onboarding_hero_2.png | Login Slide 2 | Onboarding carousel hero |
| assets/images/onboarding_hero_3.png | Login Slide 3 | Onboarding carousel hero |
| assets/image.png | Checklist, Steps | Section background |
| assets/image copy.png | Restaurant Info | Owner info graphic |
| assets/image copy 2.png | Location screen | GPS pin graphic |
| assets/image copy 4.png | Documents | Document organizer graphic |
| assets/image copy 5.png | Contract | Contract + pen graphic |
| assets/image copy 6.png | Thank You | Success illustration |
| assets/image copy 8.png | Dashboard | Empty state illustration |
| assets/fonts/Urbanist-*.ttf | All screens | Urbanist font family |
| assets/fonts/Fasthand-Regular.ttf | Logo areas | Decorative font |

---

## 11. Running the App Locally

### Prerequisites
- Node.js 18+
- Expo Go app on physical device
- npm or yarn

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Start Metro bundler
npx expo start

# 3. Scan QR code with Expo Go (Android) or Camera app (iOS)
```

### Dev Server with Tunnel (for testing over LTE/mobile data)
```bash
npm run tunnel
```

### TypeScript Check (must always exit 0)
```bash
npx tsc --noEmit
```

### Clear Metro Cache
```bash
npx expo start --clear
```

---

*This documentation is maintained alongside the codebase. Please update it whenever new screens, APIs, or features are added.*
