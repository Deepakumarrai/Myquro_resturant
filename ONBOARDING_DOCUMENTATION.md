# MyQuro Restaurant Partner App — Onboarding Flow Documentation

## 📌 Overview
The **MyQuro Restaurant Partner App** is a high-performance React Native (Expo Router) application tailored for restaurant onboarding. It features a luxury dark-gold glassmorphism design system (`#07090E`, `#D4AF37`, `#F5A623`, `Urbanist` typography) and delivers a seamless 4-step onboarding timeline from initial mobile login to partner contract signing.

---

## 🗺️ Complete Screen Architecture & Navigation Flow

```
[Screen 1: /] Login & Mobile Auth (3-Slide Carousel)
     │
     ▼
[Screen 2: /onboarding-checklist] Required Documents Checklist
     │
     ▼
[Screen 3: /restaurant-name] Restaurant Name Entry
     │
     ▼
[Screen 4: /onboarding-steps?step=1] 4-Step Timeline (Step 1 Active)
     │
     ▼
[Screen 5: /restaurant-information] Step 1: Owner, Contact, Open/Close Time
     │  (Tap "Add Restaurant Location")
     ▼
[Screen 6: /restaurant-location] GPS Radar Map Location Picker
     │  (Tap "Confirm Location")
     ▼
[Screen 7: /restaurant-address-details] Address, Landmark & Storefront Photos Picker (Camera/Local Files)
     │  (Tap "Save Address Details" ➔ Location confirmed back to Step 1)
     ▼
[Screen 5: /restaurant-information] ➔ Tap "Save & Continue"
     │
     ▼
[Screen 4: /onboarding-steps?step=2] 4-Step Timeline (Step 2 Active)
     │  (Tap "Proceed ➔")
     ▼
[Screen 8: /restaurant-documents] Step 2: FSSAI, GSTIN (Conditional), PAN, Bank Details
     │  (Tap "Select Restaurant / Cloud Kitchen Category")
     ▼
[Screen 9: /select-outlet-type] Category I, II, III Selection
     │  (Selects category & returns to Step 2)
     ▼
[Screen 8: /restaurant-documents] ➔ Tap "Save & Proceed"
     │
     ▼
[Screen 4: /onboarding-steps?step=3] 4-Step Timeline (Step 3 Active)
     │  (Tap "Proceed ➔")
     ▼
[Screen 10: /menu-setup] Step 3: POS Integration, Food Type, Cuisines Catalog, Cost for 2, Menu Upload & Packaging Tiers
     │  (Tap "Proceed")
     ▼
[Screen 4: /onboarding-steps?step=4] 4-Step Timeline (Step 4 Active)
     │  (Tap "Proceed ➔")
     ▼
[Screen 11: /partner-contract] Step 4: Overview (15% Commission, ₹949 Onboarding Fee), 11-Page LOU Viewer, & Terms & Conditions Bottom Sheet
```

---

## 📱 Detailed Screen Breakdown

### Screen 1: Mobile Phone Authentication (`src/app/index.tsx`)
- **Visuals**: Animated 3-slide value proposition carousel with gold indicator pills.
- **Inputs**: Country code picker (`+91`), 10-digit mobile phone input with numeric formatting.
- **Actions**: `Send OTP` / `Login` CTA button.

### Screen 2: Onboarding Document Checklist (`src/app/onboarding-checklist.tsx`)
- **Visuals**: Hero background graphic with translucent card overlay.
- **Checklist Cards**:
  1. Restaurant Details (Name, address, contact, operating hours).
  2. Documents (FSSAI license, PAN card, GSTIN).
  3. Bank Details (Account number, IFSC code).
  4. Menu & Pricing (Menu card photos, item rates).
- **Actions**: `I have these documents ready ➔` leading to Restaurant Name Entry.

### Screen 3: Restaurant Name Entry (`src/app/restaurant-name.tsx`)
- **Visuals**: 3D Storefront graphic header with gold accents.
- **Inputs**: Restaurant legal & trade name input.
- **Validation**: Mandatory non-empty string.
- **Actions**: `Continue ➔` advances to Onboarding Steps Timeline.

### Screen 4: Dynamic Onboarding Steps Timeline (`src/app/onboarding-steps.tsx`)
- **Visuals**: Vertical timeline with connecting dashed lines and dynamic step status badges.
- **Timeline Logic**:
  - `step=1`: Step 1 is active with gold glowing badge + `Proceed ➔` CTA; Steps 2–4 inactive.
  - `step=2`: Step 1 marked `Completed ✓` (with `Edit details`); Step 2 active with `Proceed ➔` CTA; Steps 3–4 inactive.
  - `step=3`: Steps 1 & 2 marked `Completed ✓`; Step 3 active with `Proceed ➔` CTA; Step 4 inactive.
  - `step=4`: Steps 1, 2, 3 marked `Completed ✓`; Step 4 active with `Proceed ➔` CTA.

### Screen 5: Restaurant Information (`src/app/restaurant-information.tsx`)
- **Visuals**: 3D Storefront graphic header.
- **Fields & Validations**:
  - Restaurant Name (Pre-filled/Editable).
  - Owner Full Name (Mandatory).
  - Owner Email ID (Mandatory regex validation).
  - Owner Phone Number (Mandatory 10-digit).
  - Operating Hours (Interactive Opening & Closing Time picker modals).
  - **Restaurant Location** (Strictly mandatory; displays green-gold checkmark badge when location confirmed).
- **Actions**: `Save & Continue` advances timeline to Step 2.

### Screen 6: Restaurant Location Map Picker (`src/app/restaurant-location.tsx`)
- **Visuals**: 9:16 dark GPS road network vector map texture with 3D gold radar pin overlay.
- **Features**: Live coordinate resolution, search location input, recent location pills.
- **Actions**: `Confirm Location` passes coordinates to Address Details.

### Screen 7: Add Restaurant Location Details (`src/app/restaurant-address-details.tsx`)
- **Fields & Validations**:
  - Full Complete Address (Mandatory).
  - Shop / Plot Number (Mandatory).
  - Floor & Building Name (Mandatory).
  - Pincode (Strict 6-digit numeric validation).
  - Landmark (Mandatory).
  - **Storefront / Location Photos**: Image picker modal supporting:
    - `Take a photo from camera` (Camera capture).
    - `Upload from local folders` (Device media gallery).
    - Live thumbnail previews with instant delete action.
- **Actions**: `Save Address Details` redirects directly to `/restaurant-information` with location confirmation.

### Screen 8: Restaurant Documents (`src/app/restaurant-documents.tsx`)
- **Visuals**: 3D black & gold document organizer graphic (`assets/image copy 4.png`).
- **Category Selection**: Outlet Type trigger box displaying current category.
- **Fields & Conditional Validations**:
  - **FSSAI License Number**: 14-digit numeric validation (Compulsory for all categories).
  - **GSTIN**: 15-character alphanumeric validation:
    - *Category I (Fresh Food Only)*: **Optional**.
    - *Category II (IceCreams/Bakery/Packed)* & *Category III (Both)*: **Compulsory**.
  - **PAN Card Number**: 10-character alphanumeric validation (Compulsory).
  - **Bank Account Details**: Account Number & IFSC Code validation (Compulsory).
- **Actions**: `Save & Proceed` advances timeline to Step 3.

### Screen 9: Select Outlet Type (`src/app/select-outlet-type.tsx`)
- **Cards**:
  - **Category I**: Fresh Food Only (GSTIN Optional).
  - **Category II**: Ice Cream, Bakery & Packaged Foods (GSTIN Compulsory).
  - **Category III**: Both Fresh Food & Packaged Items (GSTIN Compulsory).
- **Actions**: Two-way state persistence back to `/restaurant-documents`.

### Screen 10: Complete Menu Setup (`src/app/menu-setup.tsx`)
- **Visuals**: 3D Paneer food bowl header graphic (`assets/images/image copy.png`).
- **Cards & Features**:
  1. **POS System**:
     - `No, I don't have POS`
     - `Yes, I have POS integration`: Expands interactive POS provider chips (*PetPooja, LimeTray, UrbanPiper, DotPe, SlickPOS, Posist, Other*).
  2. **Food Category**: `Veg Only` vs `Both Veg & Non-Veg`.
  3. **Cuisines Catalog**: Searchable bottom sheet modal with 60+ Indian (North, South, East, West) and Western/Global cuisines with custom query creation.
  4. **Cost for Two**: Numeric cost estimator with `₹` currency symbol.
  5. **Upload Your Menu**: Dotted dropzone with gallery picker, guidelines list, and file thumbnail previews.
  6. **Packaging Charges**:
     - `Zero`
     - `Fixed (Order Level Packing)` (with custom amount input).
     - `Based on item price` (with 5-tier pricing breakdown table).
- **Actions**: Strict mandatory validation on all fields before advancing timeline to Step 4.

### Screen 11: Partner Contract (`src/app/partner-contract.tsx`)
- **Visuals**: 3D signed contract document & golden pen graphic (`assets/image copy 5.png`).
- **Cards & Features**:
  1. **Overview**:
     - **MyQuro Commission**: **`15%`** (with structure tooltip).
     - **Onboarding Fee**: **`₹949`** (with breakdown tooltip).
  2. **11-Page Contract Viewer**:
     - Letter of Understanding (LOU) legal clauses with merchant name & address interpolation.
     - Previous / Next page controls (`Page: 1 / 11`).
     - PDF download CTA.
  3. **Terms and Conditions Bottom Sheet Modal**:
     - Triggered by `Review & Accept`.
     - Displays all 6 onboarding terms (0% initial commission rebate, 15% standard commission, upfront ₹943 fee split, weekly payout adjustments).
     - Golden `Proceed` CTA finalizing contract acceptance.

---

## 🛠️ Technology Stack
- **Framework**: React Native 0.76.7 / Expo Go 54.0.8
- **Routing**: Expo Router 4.0.17 (File-based routing)
- **Styling**: React Native StyleSheet + Expo LinearGradient
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Media**: `expo-image-picker` (~17.0.11)
- **Safe Area**: `react-native-safe-area-context`
- **Type Checking**: TypeScript with strict `tsc --noEmit` validation (0 errors).
