# Gobadi Expo App — Complete Reference

> **Stack**: Expo SDK 57 · React Native 0.86 · Expo Router v57 · Redux Toolkit (RTK Query) · Socket.IO Client · TypeScript

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Navigation & Screens](#navigation--screens)
4. [State Management (Redux Store)](#state-management)
5. [RTK Query API Slices](#rtk-query-api-slices)
6. [Auth Flow](#auth-flow)
7. [Real-time Chat (WebSocket)](#real-time-chat)
8. [Push Notifications](#push-notifications)
9. [Design System](#design-system)
10. [OAuth Integration](#oauth-integration)
11. [Environment Variables](#environment-variables)
12. [Build & Deploy](#build--deploy)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 57 |
| UI | React Native 0.86 |
| Routing | Expo Router v57 (file-based, typed routes) |
| State | Redux Toolkit + RTK Query (24 API slices) |
| Real-time | Socket.IO Client |
| Auth | JWT (SecureStore) + Google/Facebook OAuth |
| Styling | React Native StyleSheet + NativeWind/Global CSS |
| Animations | react-native-reanimated 4.5 |
| Image | expo-image |
| Push | expo-notifications (Expo Push Tokens) |
| Platform | iOS, Android, Web |
| Build | EAS Build |
| React Compiler | Enabled (experimental) |

---

## Project Structure

```
app/
├── app.json                          # Expo config
├── eas.json                          # EAS Build config
├── package.json
├── tsconfig.json
├── src/
│   ├── app/                          # Expo Router screens (file-based routing)
│   │   ├── _layout.tsx               # Root layout (Redux Provider, auth guard, splash)
│   │   ├── index.tsx                 # Onboarding/landing screen
│   │   ├── signup.tsx                # Registration
│   │   ├── login.tsx                 # Login
│   │   ├── otp.tsx                   # OTP verification
│   │   ├── forgot.tsx                # Forgot password
│   │   ├── reset-password.tsx        # Reset password
│   │   ├── congo.tsx                 # Congratulations/success
│   │   ├── (tabs)/                   # Tab-based navigation (auth required)
│   │   │   ├── _layout.tsx           # Tab layout
│   │   │   ├── index.tsx             # Home dashboard
│   │   │   ├── animals.tsx           # My Animals list
│   │   │   ├── doctors.tsx           # Doctors (with AI scan banner)
│   │   │   ├── market.tsx            # Marketplace (buy/sell)
│   │   │   ├── profile.tsx           # User profile + menu
│   │   │   ├── doctor-bookings.tsx   # Doctor: My Bookings
│   │   │   ├── doctor-availability.tsx # Doctor: Manage availability
│   │   │   └── doctor-messages.tsx   # Doctor: Conversations list
│   │   ├── animal-details.tsx        # View marketplace animal listing
│   │   ├── my-animal-detail.tsx      # View own animal details
│   │   ├── add-animal.tsx            # Add new animal form
│   │   ├── add-listing.tsx           # Add livestock listing for sale
│   │   ├── ai-scan.tsx               # AI diagnosis: photo capture
│   │   ├── ai-hold.tsx               # AI diagnosis: holding/loading
│   │   ├── ai-summary.tsx            # AI diagnosis: results
│   │   ├── all-doctors.tsx           # All doctors list
│   │   ├── doctor-detail.tsx         # Doctor profile detail
│   │   ├── book-slot.tsx             # Book appointment slot
│   │   ├── billing-details.tsx       # Billing/checkout for appointment
│   │   ├── animal-billing-details.tsx # Billing for animal purchase
│   │   ├── booking-payment.tsx       # Booking payment flow
│   │   ├── booking-bkash-number.tsx  # bKash payment for booking
│   │   ├── payment-method.tsx        # Select payment method
│   │   ├── bkash-number.tsx          # bKash number input
│   │   ├── confirm-pay.tsx           # Confirm payment
│   │   ├── payment-success.tsx       # Payment success screen
│   │   ├── checkout.tsx              # Product/livestock checkout
│   │   ├── order-success.tsx         # Order placed successfully
│   │   ├── cart.tsx                  # Shopping cart
│   │   ├── wishlist.tsx              # Wishlist
│   │   ├── chat.tsx                  # Chat conversation screen
│   │   ├── video-call.tsx            # Video call (placeholder)
│   │   ├── my-treatment.tsx          # My treatment/appointments
│   │   ├── my-task.tsx               # My tasks
│   │   ├── my-orders.tsx             # My orders list
│   │   ├── medical-records.tsx       # Medical records
│   │   ├── notifications.tsx         # Notifications list
│   │   ├── search.tsx                # Global search
│   │   ├── book-animal.tsx           # Book an animal (reservation)
│   │   └── edit-profile.tsx          # Edit user profile
│   ├── components/                   # Shared components
│   │   ├── app-tabs.tsx              # Custom tab bar (mobile)
│   │   ├── app-tabs.web.tsx          # Custom tab bar (web)
│   │   ├── animated-icon.tsx         # Splash animation
│   │   ├── error-boundary.tsx        # Error boundary wrapper
│   │   ├── external-link.tsx         # External link handler
│   │   ├── hint-row.tsx              # Hint/tooltip row
│   │   ├── identifier-tabs.tsx       # Phone/Email toggle tabs
│   │   ├── password-field.tsx        # Password input with visibility toggle
│   │   ├── themed-text.tsx           # Themed text
│   │   ├── themed-view.tsx           # Themed view
│   │   ├── web-badge.tsx             # Web badge
│   │   └── ui/
│   │       ├── collapsible.tsx       # Collapsible section
│   │       ├── empty-state.tsx       # Empty state placeholder
│   │       └── skeleton.tsx          # Skeleton loading placeholders
│   ├── constants/
│   │   ├── api.ts                    # API URL, SecureStore token helpers
│   │   ├── theme.ts                  # Colors, fonts, spacing
│   │   ├── design-system.ts          # Design tokens (colors, radius, spacing, typography)
│   │   └── oauth.ts                  # Google/Facebook OAuth config
│   ├── hooks/
│   │   ├── use-chat-socket.ts        # Chat WebSocket subscription hook
│   │   ├── use-color-scheme.ts       # Color scheme (native)
│   │   ├── use-color-scheme.web.ts   # Color scheme (web)
│   │   ├── use-social-auth.ts        # Google/Facebook OAuth hook
│   │   └── use-theme.ts             # Theme hook
│   ├── lib/
│   │   ├── socket-manager.ts         # Socket.IO singleton wrapper
│   │   └── push-notifications.ts     # Expo push token registration
│   ├── store/                        # Redux store + RTK Query APIs
│   │   ├── store.ts                  # Store config, bootstrapAuth
│   │   ├── authSlice.ts              # Auth state (user, token, refreshToken)
│   │   ├── authApi.ts                # Auth API (login, register, OAuth, OTP)
│   │   ├── base-query-with-reauth.ts # Auto token refresh on 401
│   │   ├── decode-jwt.ts             # Client-side JWT decode
│   │   ├── animalsApi.ts             # Animals CRUD
│   │   ├── doctorsApi.ts             # Doctors list/detail
│   │   ├── doctorPortalApi.ts        # Doctor portal (bookings, availability)
│   │   ├── appointmentsApi.ts        # Appointments
│   │   ├── chatApi.ts                # Chat messages/conversations
│   │   ├── productsApi.ts            # Product catalog
│   │   ├── livestockApi.ts           # Livestock listings
│   │   ├── cartApi.ts                # Shopping cart
│   │   ├── wishlistApi.ts            # Wishlist
│   │   ├── ordersApi.ts              # Orders
│   │   ├── paymentsApi.ts            # Payments
│   │   ├── deliveryApi.ts            # Delivery tracking
│   │   ├── clinicsApi.ts             # Clinics
│   │   ├── servicesApi.ts            # Services
│   │   ├── aiDiagnosisApi.ts         # AI diagnosis
│   │   ├── medicalRecordsApi.ts      # Medical records
│   │   ├── tasksApi.ts               # Tasks
│   │   ├── weatherApi.ts             # Weather
│   │   ├── alertsApi.ts              # Alerts
│   │   ├── referralsApi.ts           # Referrals
│   │   ├── reviewsApi.ts             # Reviews
│   │   ├── searchApi.ts              # Global search
│   │   ├── notificationsApi.ts       # Notifications + push tokens
│   │   └── usersApi.ts              # User profile
│   └── global.css                    # Global CSS (NativeWind)
└── assets/images/                    # Static images
```

---

## Navigation & Screens

### Route Architecture

```
Root Layout (_layout.tsx)
├── [Not Authenticated]
│   ├── index (Onboarding)
│   ├── signup
│   ├── login
│   ├── otp
│   ├── forgot
│   ├── reset-password
│   └── congo
│
├── [Authenticated] → (tabs)
│   ├── User Tabs
│   │   ├── index (Home)
│   │   ├── animals
│   │   ├── doctors
│   │   ├── market
│   │   └── profile
│   │
│   └── Doctor Tabs
│       ├── doctor-bookings
│       ├── doctor-availability
│       ├── doctor-messages
│       └── profile
│
└── [Modal/Stack Screens]
    ├── animal-details, my-animal-detail
    ├── add-animal, add-listing
    ├── ai-scan, ai-hold, ai-summary
    ├── all-doctors, doctor-detail
    ├── book-slot, billing-details, animal-billing-details
    ├── booking-payment, booking-bkash-number
    ├── payment-method, bkash-number, confirm-pay
    ├── payment-success
    ├── checkout, order-success
    ├── cart, wishlist
    ├── chat, video-call
    ├── my-treatment, my-task, my-orders
    ├── medical-records
    ├── notifications
    ├── search
    ├── book-animal
    └── edit-profile
```

### Tab Bar

The app uses a **custom floating tab bar** (`app-tabs.tsx`) with role-based tab visibility:

**User tabs** (when `role !== 'doctor'`):
- 🏠 Home — `(tabs)/index`
- 🐾 Animals — `(tabs)/animals`
- 🩺 Doctors — `(tabs)/doctors`
- 🏪 Market — `(tabs)/market`
- 👤 Profile — `(tabs)/profile`

**Doctor tabs** (when `role === 'doctor'`):
- 📅 Bookings — `(tabs)/doctor-bookings`
- 🗓️ Availability — `(tabs)/doctor-availability`
- 💬 Messages — `(tabs)/doctor-messages`
- 👤 Profile — `(tabs)/profile`

---

## Screen Descriptions

### Auth Screens

| Screen | File | Description |
|--------|------|-------------|
| Onboarding | `index.tsx` | Splash with logo, tagline, "Get Started" button → signup |
| Sign Up | `signup.tsx` | Register with phone/email + password, Google/Facebook OAuth, role toggle (user/doctor) |
| Login | `login.tsx` | Login with phone/email + password, "Remember Me" toggle, OAuth |
| OTP | `otp.tsx` | OTP code input for verification |
| Forgot Password | `forgot.tsx` | Request password reset via identifier |
| Reset Password | `reset-password.tsx` | Set new password with reset token |
| Congratulations | `congo.tsx` | Success screen after registration |

### Home Dashboard (`(tabs)/index.tsx`)

- **Header**: Greeting with date, search + notification buttons
- **Farm Weather Card**: Temperature, humidity, precipitation, pressure, wind, sunrise/sunset arc
- **My Animals**: Quick list of first 3 animals, link to full list
- **Today's Tasks**: Task list with toggle done/undone
- **Alerts**: Horizontal scroll of crop/disease alerts with action buttons
- **Refer & Earn**: Referral code sharing, claim input
- **Marketplace**: Category shortcuts (Feeds, Milk, Meat, Animals), market rates

### Animals (`(tabs)/animals.tsx`)

- Search input, filter tabs (All, Calf, Bull)
- Animal cards with image, name, breed, species/age/weight specs
- Status badge (Healthy/Under Treatment)
- FAB: "Add Animal" button → `/add-animal`

### Doctors (`(tabs)/doctors.tsx`)

- Sliding banners: Upcoming Treatment card, AI Scan card
- Specialty categories (General, Medicine, Surgery, Gynaecology, Avian)
- Nearby Doctors with "Book Slot" and "Details" buttons
- My Treatment button → `/my-treatment`

### Marketplace (`(tabs)/market.tsx`)

- **Buy/Sell toggle** — switches between buying and selling views
- **Search** across listings
- **Category selector**: Animals, Proteins, Dairy, Food, Equipments, Vaccines
- **Buy mode**: Trending animals with species/age/weight, seller info, "Book Animal" + "Buy Animal" buttons
- **Sell mode**: My listings, "Add Listing" button → `/add-listing`

### Doctor Portal

| Screen | Description |
|--------|-------------|
| `doctor-bookings.tsx` | List of appointments with patient info, status badge, "Mark Complete" button |
| `doctor-availability.tsx` | 7-day weekly availability grid with enable/disable toggles, start/end time inputs, save button |
| `doctor-messages.tsx` | Conversation list with patient avatars, last message date, real-time updates via `useConversationListSocket` |

### Profile (`(tabs)/profile.tsx`)

- User card with avatar, name, phone, edit button
- Animal stats (cow/goat/buffalo count)
- Subscription plan card
- Menu: My Task, My Orders, Medical Records, Notification, Language, Refer & Earn, Help Support
- Sign Out button

### AI Diagnosis Flow

1. `ai-scan.tsx` — Upload/take photo of animal
2. `ai-hold.tsx` — Loading/processing state
3. `ai-summary.tsx` — Results with analysis, confidence score, recommendations

### E-commerce Flow

1. `market.tsx` → browse animals/products
2. `animal-details.tsx` — View listing details
3. `checkout.tsx` — Checkout with address selection
4. `payment-method.tsx` — Choose payment method
5. `bkash-number.tsx` / `booking-bkash-number.tsx` — Payment provider input
6. `confirm-pay.tsx` — Confirm payment
7. `payment-success.tsx` / `order-success.tsx` — Success

### Chat (`chat.tsx`)

- Real-time messaging with Socket.IO
- Typing indicators
- Read/delivered status
- Image/document attachments via Cloudinary

---

## State Management

### Redux Store (24 API Slices + 1 Auth Slice)

```
store.ts
├── auth (authSlice) — user, token, refreshToken, isBootstrapping
├── authApi — register, login, sendOtp, verifyOtp, forgotPassword, resetPassword, googleAuth, facebookAuth, logout
├── animalsApi — CRUD for user's animals
├── doctorsApi — list/detail doctors, availability
├── doctorPortalApi — doctor profile, bookings, availability management
├── appointmentsApi — appointments
├── chatApi — conversations, messages, send message, mark read
├── productsApi — product catalog, categories, brands, search, stock
├── livestockApi — livestock listings, search, featured, my listings
├── cartApi — add/update/remove/clear cart, get cart summary
├── wishlistApi — add/remove/get wishlist
├── ordersApi — place order, get orders, order details
├── paymentsApi — payment intent, verify, simulate
├── deliveryApi — tracking, create/update delivery
├── clinicsApi — list/detail clinics
├── servicesApi — list/detail services
├── aiDiagnosisApi — upload image, analyze, history, get by id
├── medicalRecordsApi — upload, list, get attachment
├── tasksApi — CRUD tasks
├── weatherApi — get weather
├── alertsApi — get alerts, act on alert
├── referralsApi — get my referral, claim code
├── reviewsApi — create, list, helpful, report, moderate, reply
├── searchApi — global search
├── notificationsApi — list, mark read, register/unregister push token
└── usersApi — get/update profile
```

### Token Refresh (base-query-with-reauth.ts)

- All RTK Query slices use `baseQueryWithReauth`
- On 401 response → automatically calls `POST /auth/refresh` with refresh token
- Single refresh in flight at a time (prevents race condition with token rotation)
- Persists new tokens to SecureStore only if session was already persisted
- If refresh fails → clears credentials (forces re-login)

### Auth Bootstrap (store.ts:bootstrapAuth)

- On app cold start, reads JWT from SecureStore
- Decodes JWT without expiry check (access token expires often, but refresh token means session is valid)
- Dispatches `setCredentials` + `setBootstrapped` → app shows tabs or auth screens

---

## RTK Query API Slices

### Auth API (`authApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `register` | POST | Register with name, identifier, password, role |
| `login` | POST | Login with identifier + password, optional rememberMe |
| `sendOtp` | POST | Send OTP to phone |
| `verifyOtp` | POST | Verify OTP code |
| `forgotPassword` | POST | Request password reset |
| `resetPassword` | POST | Reset password with token |
| `googleAuth` | POST | Google OAuth login |
| `facebookAuth` | POST | Facebook OAuth login |
| `logoutSession` | POST | Revoke refresh token |

### Animals API (`animalsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getAnimals` | GET | List user's animals (paginated, filter by breed) |
| `getAnimalById` | GET | Get animal by ID |
| `addAnimal` | POST | Create new animal |
| `updateAnimal` | PATCH | Update animal |
| `deleteAnimal` | DELETE | Delete animal |

### Doctors API (`doctorsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getDoctors` | GET | List doctors (paginated, filter by specialty) |
| `getDoctorById` | GET | Get doctor details |
| `getAvailability` | GET | Get doctor's weekly availability |

### Doctor Portal API (`doctorPortalApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getMyDoctorProfile` | GET | Get own doctor profile |
| `getDoctorBookings` | GET | Get all bookings (tagged: DoctorBookings) |
| `completeBooking` | PATCH | Mark booking completed |
| `cancelBooking` | PATCH | Cancel booking |
| `rescheduleBooking` | PATCH | Reschedule booking |
| `getAvailability` | GET | Get availability schedule |
| `setAvailability` | POST | Replace availability schedule |

### Chat API (`chatApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getConversations` | GET | List conversations (tagged: Conversation) |
| `getMessages` | GET | List messages in conversation |
| `sendMessage` | POST | Send text message (invalidates: ChatMessage) |
| `markRead` | PATCH | Mark message as read |

### Products API (`productsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getProducts` | GET | List products (paginated, filter by category/brand) |
| `getCategories` | GET | List categories |
| `getBrands` | GET | List brands |
| `searchProducts` | GET | Search products |
| `getProductById` | GET | Get product details |
| `getStock` | GET | Get product stock level |

### Livestock API (`livestockApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getLivestock` | GET | List active listings (paginated, filter by species/breed) |
| `getFeatured` | GET | Featured listings |
| `searchLivestock` | GET | Search listings |
| `getMyListings` | GET | Seller's own listings |
| `getLivestockById` | GET | Get listing details |
| `createLivestock` | POST | Create listing |
| `updateLivestock` | PUT | Update listing |
| `deleteLivestock` | DELETE | Delete listing |

### Cart API (`cartApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getCart` | GET | Get cart summary with price/stock validation |
| `addItem` | POST | Add product or livestock to cart |
| `updateItem` | PUT | Update item quantity |
| `removeItem` | DELETE | Remove item |
| `clearCart` | DELETE | Clear entire cart |

### Wishlist API (`wishlistApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getWishlist` | GET | Get wishlist items |
| `addItem` | POST | Add product or livestock |
| `removeItem` | DELETE | Remove item |

### Orders API (`ordersApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `placeOrder` | POST | Place order from cart |
| `getMyOrders` | GET | User's orders |
| `getOrderDetails` | GET | Order details by ID |

### Payments API (`paymentsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `createIntent` | POST | Create payment intent |
| `verifyPayment` | GET | Verify transaction |

### Delivery API (`deliveryApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `trackByNumber` | GET | Track by tracking number (public) |
| `trackByOrder` | GET | Track by order ID |

### Clinics API (`clinicsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getClinics` | GET | List clinics (paginated) |
| `getClinicById` | GET | Get clinic details |

### Services API (`servicesApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getServices` | GET | List active services |
| `getServiceById` | GET | Get service details |

### AI Diagnosis API (`aiDiagnosisApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `uploadImage` | POST | Upload photo for diagnosis |
| `analyze` | POST | Submit symptoms + photos (async) |
| `getHistory` | GET | Get diagnosis history |
| `getById` | GET | Poll diagnosis for status/result |

### Medical Records API (`medicalRecordsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `upload` | POST | Upload medical file |
| `list` | GET | List records |
| `getById` | GET | Get single attachment |

### Tasks API (`tasksApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getTasks` | GET | Get tasks for a date |
| `createTask` | POST | Create task |
| `toggleTask` | PATCH | Toggle done/undone |
| `deleteTask` | DELETE | Delete task |

### Weather API (`weatherApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getWeather` | GET | Get farm weather (lat/long/district) |

### Alerts API (`alertsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getAlerts` | GET | List active alerts |
| `actOnAlert` | POST | Record action on alert |

### Referrals API (`referralsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getMyReferral` | GET | Get referral code + earnings |
| `claimReferral` | POST | Claim another user's code |

### Reviews API (`reviewsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `createReview` | POST | Submit review |
| `findByTarget` | GET | List reviews for target |
| `voteHelpful` | POST | Upvote helpfulness |
| `reportReview` | POST | Report review |

### Search API (`searchApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `globalSearch` | GET | Search across products, livestock, clinics, doctors |

### Notifications API (`notificationsApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getNotifications` | GET | Get user's notifications |
| `markAsRead` | PATCH | Mark as read |
| `markAllAsRead` | POST | Mark all as read |
| `registerPushToken` | POST | Register Expo push token |
| `unregisterPushToken` | DELETE | Unregister push token |

### Users API (`usersApi.ts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `getMe` | GET | Get current user profile |
| `updateMe` | PATCH | Update profile |

---

## Auth Flow

### Registration
1. User enters name, phone/email, password on `signup.tsx`
2. `POST /auth/register` → creates user, returns success
3. Navigate to OTP verification → `POST /auth/send-otp`
4. User enters OTP → `POST /auth/verify-otp` → returns accessToken + refreshToken
5. Tokens stored in SecureStore (if "Remember Me" checked)
6. Navigate to `(tabs)`

### Login
1. User enters phone/email + password on `login.tsx`
2. `POST /auth/login` → returns accessToken + refreshToken
3. Tokens dispatched to Redux store + persisted to SecureStore
4. Navigate to `(tabs)`

### OAuth (Google/Facebook)
1. `useSocialAuth` hook triggers native OAuth flow
2. Returns id_token (Google) or access_token (Facebook)
3. Sent to backend: `POST /auth/oauth/google` or `POST /auth/oauth/facebook`
4. Backend creates/returns user + tokens
5. Session persisted

### Token Refresh
- All API calls use `baseQueryWithReauth`
- On 401 → `POST /auth/refresh` with refreshToken
- New tokens dispatched to store + persisted (if session was persisted)
- Concurrent refreshes deduplicated via shared promise

### Logout
- `POST /auth/logout` with refreshToken (revokes it)
- Socket disconnects
- Clear Redux credentials + SecureStore
- Navigate to onboarding

---

## Real-time Chat

### Socket Manager (`socket-manager.ts`)

Singleton wrapping a single Socket.IO connection:
- Connects with JWT token in `auth`
- Auto-reconnects with exponential backoff (1s → 10s)
- On `connect_error` → tries token refresh before giving up
- On reconnect → emits local `reconnected` event → RTK Query cache invalidation
- Transports: WebSocket only

### Chat Socket Hook (`use-chat-socket.ts`)

Two hooks:
1. **`useChatSocket(conversationId)`** — for active chat screen
   - Joins conversation room
   - Listens: `messageReceived`, `typingIndicator`, `messageStatusUpdate`, `reconnected`
   - Updates RTK Query cache optimistically
   - Auto-stops typing indicator after 3 seconds
   - Returns: `isOtherUserTyping`, `emitTyping`

2. **`useConversationListSocket()`** — for conversation list screen
   - Listens: `conversationUpdated`, `reconnected`
   - Invalidates conversation tags for refetch

### Events

**Client → Server:**
- `joinConversation { conversationId }`
- `sendMessage { conversationId, text }`
- `typing { conversationId, isTyping }`
- `markRead { messageId }`

**Server → Client:**
- `messageReceived` — new message
- `typingIndicator { userId, isTyping }`
- `messageStatusUpdate { id, status }`
- `conversationUpdated` — for conversation-list screens

---

## Push Notifications

### Registration (`push-notifications.ts`)

1. Check for EAS projectId (no-op if not configured)
2. Request notification permission
3. Get Expo push token
4. Register with backend: `POST /notifications/push-token`

### Handling
- `expo-notifications` handler configured: show banner + list + sound
- Notification tap → navigates to `/notifications` screen

### Cleanup
- On logout: `DELETE /notifications/push-token` → unregisters token

---

## Design System

### Colors (`design-system.ts`)

```
Brand:        #BD632F (terracotta brown)
Text:         #1A1817
Text Muted:   #7C7672
Text Faint:   #9C9690
Placeholder:  #A39E99
Background:   #FAF9F6 (cream)
Surface:      #FFFFFF
Border:       #E6E1DC
Success:      #4CAF50
Danger:       #E53935
Warning:      #FFF3E0
```

### Design Tokens

```
Border Radius: sm=12, md=14, lg=20, xl=24, pill=999
Spacing:       xs=4, sm=8, md=12, lg=16, xl=20, xxl=24
Typography:    title=18/700, body=14/600, caption=13/500, small=11/500
```

### Theme Colors (`theme.ts`)

```
Light: text=#000, bg=#fff, bgElement=#F0F0F3, bgSelected=#E0E1E6
Dark:  text=#fff, bg=#000, bgElement=#212225, bgSelected=#2E3135
```

---

## OAuth Integration

### Config (`oauth.ts`)

```typescript
GOOGLE_IOS_CLIENT_ID       // from env
GOOGLE_ANDROID_CLIENT_ID   // from env
GOOGLE_WEB_CLIENT_ID       // from env
FACEBOOK_APP_ID            // from env

isGoogleConfigured    // Boolean (true if any Google ID set)
isFacebookConfigured  // Boolean (true if Facebook App ID set)
```

### Flow (`use-social-auth.ts`)

1. **Google**: `expo-auth-session/providers/google` → `useIdTokenAuthRequest` → id_token → backend
2. **Facebook**: `expo-auth-session` → `useAuthRequest` → access_token → backend

If not configured → shows "not configured" message instead of attempting flow.

---

## Environment Variables

```env
EXPO_PUBLIC_API_URL=https://gobaadi.onrender.com   # Backend URL
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=                  # Google OAuth
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=              # Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=                      # Google OAuth (web)
EXPO_PUBLIC_FACEBOOK_APP_ID=                       # Facebook OAuth
```

---

## Build & Deploy

### EAS Build (`eas.json`)

| Profile | Distribution | Notes |
|---------|-------------|-------|
| `development` | internal | Dev client, dev mode |
| `preview` | internal | Preview builds |
| `production` | store | Auto-increment version |

### Commands

```bash
npx expo start              # Start dev server
npx expo run:android        # Run on Android
npx expo run:ios            # Run on iOS
npx expo start --web        # Run on web
npx expo lint               # Lint
eas build --profile preview # Build preview
eas build --profile production # Build production
```

### Config (`app.json`)

- **Name**: gobadi
- **Slug**: gobadi
- **Scheme**: gobadi (deep linking)
- **iOS Bundle**: com.champius.gobadi
- **Android Package**: com.champius.gobadi
- **Orientation**: portrait
- **UI Style**: light
- **Plugins**: expo-router, expo-splash-screen, expo-secure-store, expo-notifications, expo-image, expo-web-browser
- **Experiments**: typed routes, react compiler

---

## Key Architecture Decisions

1. **REST for history, sockets for live updates** — Chat uses RTK Query for initial message history, Socket.IO for real-time delivery
2. **Single Socket.IO connection** — Singleton `SocketManager` class, not Redux-managed (side effects, not serializable state)
3. **Token refresh deduplication** — Shared promise prevents concurrent refresh requests with rotating refresh tokens
4. **Memory-only sessions** — "Remember Me" unchecked = tokens in memory only (SecureStore not written), so app restart logs out
5. **Role-based tab bar** — Different tab sets for user vs doctor, using `href: null` to hide tabs (not conditional rendering)
6. **Optimistic cache updates** — `useChatSocket` patches RTK Query cache directly for instant UI feedback
7. **Fallback UI states** — Every list screen has loading skeletons, empty states, and error handling
