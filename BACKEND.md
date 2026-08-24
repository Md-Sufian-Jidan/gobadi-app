# Gobadi Backend — Complete Reference

> **Stack**: NestJS v11 · PostgreSQL · TypeORM · Redis · BullMQ · Meilisearch · Socket.IO · Swagger

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Database Schema (31 Entities)](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [WebSocket Events](#websocket-events)
5. [Auth Flow](#auth-flow)
6. [Payment Providers](#payment-providers)
7. [External Integrations](#external-integrations)
8. [Admin Endpoints](#admin-endpoints)
9. [Migrations](#migrations)
10. [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 11 (TypeScript) |
| Database | PostgreSQL (TypeORM v1.1, autoLoadEntities + synchronize) |
| Cache / Queue | Redis + BullMQ (job queues for async AI, notifications) |
| Search | Meilisearch (full-text, DB ILIKE fallback) |
| Real-time | Socket.IO (chat gateway) |
| Auth | JWT + OTP + Google OAuth + Facebook OAuth |
| File Storage | Cloudinary |
| Email | Resend API + Nodemailer (SMTP fallback) |
| Push | Expo Server SDK |
| AI | OpenAI API (vision + symptoms diagnosis) |
| Security | Helmet, ThrottlerModule (100 req/60s default) |
| API Docs | Swagger at `/api/docs` |

---

## Database Schema

### 1. `users`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| phone | string? | unique where not null |
| email | string? | unique where not null |
| name | string? | |
| avatar | string? | |
| password | string? | select:false |
| role | enum | user / doctor / clinic / admin |
| verified | boolean | default false |
| googleId | string? | unique where not null |
| facebookId | string? | unique where not null |
| createdAt | timestamp | auto |

### 2. `refresh_tokens`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | indexed |
| tokenHash | string | unique |
| expiresAt | timestamptz | |
| revokedAt | timestamptz? | |
| createdAt | timestamp | auto |

### 3. `animals`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int? | indexed |
| name | string | indexed |
| breed | string | indexed |
| weight | string | |
| age | string | |
| color | string | |
| image | string? | |

### 4. `doctors`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int? | FK → users |
| name | string | |
| specialty | string | indexed |
| experience | string | |
| rating | float | default 4.8 |
| avatar | string | |
| bio | text | |
| qualifications | string[] | text array |
| licenseNumber | string? | |
| consultationFee | float | default 500 |
| isVerified | boolean | default false |

### 5. `doctor_availability`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| doctorId | int | composite index [doctorId, dayOfWeek] |
| dayOfWeek | int | 0=Sun .. 6=Sat |
| startTime | string | HH:mm |
| endTime | string | HH:mm |
| slotDurationMinutes | int | default 30 |
| bufferMinutes | int | default 10 |
| isActive | boolean | default true |

### 6. `clinics`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | owner/manager |
| name | string | |
| location | string | |
| businessHours | jsonb? | |
| rating | float | default 5.0 |
| avatar | string? | |
| description | text | |
| isVerified | boolean | default false |

### 7. `services`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| providerType | enum | doctor / clinic / ai |
| providerId | int | indexed |
| name | string | |
| description | text | |
| durationMinutes | int | |
| price | float | |
| preparationInstructions | text? | |
| requirements | text? | |
| isOnline | boolean | default true |
| isOffline | boolean | default false |
| location | string? | clinic address |
| cancellationPolicy | text? | |
| isActive | boolean | default true |
| isRecurring | boolean | default false |

### 8. `appointments`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| doctorId | int | indexed |
| clinicId | int? | indexed |
| serviceId | int? | indexed |
| patientId | int | indexed |
| startAt | timestamptz | unique constraint with doctorId (excl cancelled) |
| endAt | timestamptz | |
| durationMinutes | int | |
| price | float | default 0 |
| paymentStatus | string | pending/paid/failed/refunded |
| paymentTransactionId | string? | |
| prescription | text? | notes or URL |
| notes | text? | |
| followUpId | int? | |
| status | enum | PENDING / CONFIRMED / RESCHEDULED / CANCELLED / COMPLETED |
| reminder24hSent | boolean | |
| reminder1hSent | boolean | |
| cancelledAt | timestamptz? | |
| cancelledByUserId | int? | |
| originalStartAt | timestamptz? | |
| rescheduledAt | timestamptz? | |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 9. `conversations`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| doctorId | int | unique with patientId |
| doctorUserId | int? | |
| patientId | int | |
| appointmentId | int? | |
| lastMessageAt | timestamptz? | |
| createdAt | timestamp | auto |

### 10. `chat_messages`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| conversationId | int | indexed |
| senderId | int | indexed |
| senderRole | enum | user/doctor/clinic/admin |
| text | text | |
| status | enum | SENT / DELIVERED / READ |
| deliveredAt | timestamptz? | |
| readAt | timestamptz? | |
| attachmentUrl | string? | |
| attachmentType | enum? | image / document |
| attachmentMimeType | string? | |
| createdAt | timestamp | auto |

### 11. `products`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| sku | string | unique |
| barcode | string? | indexed |
| name | string | |
| description | text | |
| price | float | |
| discount | float | default 0 |
| brandId | int? | FK → brands |
| categoryId | int? | FK → categories |
| specifications | jsonb? | |
| instructions | text? | |
| images | string[] | |
| videos | string[] | |
| documents | string[] | |
| seoTitle | string? | |
| seoDescription | string? | |
| seoKeywords | string? | |
| status | enum | draft / published / archived |
| visibility | boolean | default true |
| isPrescriptionRequired | boolean | default false |
| deletedAt | timestamp? | soft delete |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 12. `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| name | string | unique |
| slug | string | unique |
| description | string? | |

### 13. `brands`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| name | string | unique |
| slug | string | unique |
| description | string? | |

### 14. `inventory_ledger`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| productId | int | FK → products, indexed |
| movementType | enum | addition / reservation / sale / return / adjustment |
| quantity | int | +/- |
| batchNumber | string? | |
| expiryDate | date? | |
| referenceId | string? | order ID or admin adjustment ID |
| createdAt | timestamp | auto |

### 15. `livestock`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| sellerId | int | FK → users, indexed |
| species | string | indexed (cattle/goat/sheep/poultry) |
| breed | string | indexed |
| age | string | e.g. "24 Months" |
| weight | float | kg |
| gender | string | Male / Female |
| vaccinationHistory | jsonb? | |
| medicalHistory | jsonb? | |
| healthStatus | string | e.g. Healthy, Recovering |
| pregnancyStatus | string? | e.g. Pregnant (3 Months) |
| certification | string? | URL |
| farmName | string | |
| location | string | Division/District |
| images | string[] | |
| videos | string[] | |
| documents | string[] | |
| price | float | |
| isNegotiable | boolean | |
| isFeatured | boolean | |
| isReserved | boolean | |
| isSold | boolean | |
| status | enum | draft / published / archived |
| isVerified | boolean | |
| deletedAt | timestamp? | soft delete |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 16. `cart_items`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | FK → users |
| productId | int? | FK → products |
| livestockId | int? | FK → livestock |
| quantity | int | default 1 |
| createdAt | timestamp | auto |

### 17. `wishlist_items`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | FK → users |
| productId | int? | FK → products |
| livestockId | int? | FK → livestock |
| createdAt | timestamp | auto |

### 18. `addresses`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | FK → users |
| label | string | Home/Farm/Office/Clinic |
| contactName | string | |
| phone | string | |
| division | string | |
| district | string | |
| upazila | string | |
| postalCode | string | |
| latitude | float? | |
| longitude | float? | |
| isDefault | boolean | |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 19. `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | string PK | format: GBD-xxxxxx |
| userId | int | indexed |
| totalPrice | float | |
| tax | float | |
| shippingFee | float | |
| discountAmount | float | default 0 |
| netAmount | float | |
| deliveryAddress | jsonb | snapshot |
| deliveryMethod | string | standard/express/same_day/store_pickup/seller_pickup |
| trackingNumber | string? | |
| eta | timestamptz? | |
| status | enum | pending/confirmed/preparing/packed/shipped/delivered/completed/cancelled/refunded/returned/failed |
| paymentStatus | string | pending/processing/successful/failed/cancelled/refunded |
| transactionId | string? | |
| deliveryNotes | string? | |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 20. `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| orderId | string | FK → orders |
| productId | int? | FK → products |
| livestockId | int? | FK → livestock |
| quantity | int | |
| price | float | checkout time price |
| discount | float | checkout time discount |
| name | string | snapshot of item name |

### 21. `transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | auto |
| orderId | string? | indexed |
| bookingId | int? | indexed |
| userId | int | FK → users |
| amount | float | |
| provider | string | bkash/nagad/stripe/sslcommerz/rocket/paypal/simulate |
| status | enum | pending/processing/successful/failed/cancelled/expired/refunded |
| gatewayTransactionId | string? | |
| gatewayMetadata | jsonb? | |
| redirectUrl | string? | |
| callbackUrl | string? | |
| auditTrail | jsonb | array of {status, timestamp, message} |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 22. `deliveries`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| orderId | string | unique, FK → orders |
| trackingNumber | string | unique |
| courierName | string | |
| status | enum | pending/picked_up/in_transit/out_for_delivery/delivered/failed/returned |
| timeline | jsonb | array of {status, timestamp, location, description} |
| deliveryProofUrl | string? | |
| deliveryNotes | string? | |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 23. `ai_diagnoses`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | FK → users |
| images | string[] | |
| symptoms | string[] | |
| status | enum | PENDING / READY / FAILED |
| failureReason | string? | |
| analysisResult | text? | |
| confidenceScore | float? | |
| recommendations | string[] | |
| recommendedDoctorIds | int[] | |
| prescriptionId | int? | |
| createdAt | timestamp | auto |

### 24. `attachments`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| patientId | int | indexed |
| appointmentId | int? | indexed |
| uploadedByUserId | int | |
| originalFileName | string | |
| mimeType | string | |
| fileSizeBytes | int | |
| storageUrl | string? | |
| storagePublicId | string? | |
| status | enum | UPLOADED / PROCESSING / READY / FAILED |
| failureReason | string? | |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 25. `alerts`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| title | string | |
| location | string | |
| crop | string | |
| severity | enum | LOW / MEDIUM / HIGH / CRITICAL |
| actionType | enum | MANAGE / SCHEDULE |
| isActive | boolean | default true |
| createdAt | timestamp | auto |

### 26. `alert_action_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| alertId | int | indexed |
| userId | int | |
| actionChoice | enum | MANAGE / SCHEDULE |
| createdAt | timestamp | auto |

### 27. `tasks`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | indexed |
| title | string | |
| detail | text? | |
| scheduledTime | timestamptz | indexed |
| isDone | boolean | default false |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 28. `referrals`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | unique |
| referralCode | string | unique |
| totalEarned | float | default 0 |
| pendingAmount | float | default 0 |
| payoutStatus | enum | NONE / PENDING / PAID |
| referralCount | int | default 0 |
| redeemedReferralCode | string? | |
| createdAt | timestamp | auto |

### 29. `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | FK → users |
| targetType | enum | product / livestock / doctor / clinic / service |
| targetId | string | |
| rating | int | 1-5 |
| text | text | |
| images | string[] | |
| videos | string[] | |
| reply | text? | vendor/provider reply |
| helpfulCount | int | default 0 |
| isReported | boolean | |
| isApproved | boolean | default true |
| isVerified | boolean | verified purchase/booking |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### 30. `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | FK → users |
| title | string | |
| body | text | |
| type | enum | order/booking/payment/delivery/reminder/ai_ready/prescription_ready/promotion/system/message/referral |
| referenceType | string? | e.g. Order, Appointment |
| referenceId | string? | e.g. Order ID |
| isRead | boolean | default false |
| createdAt | timestamp | auto |

### 31. `push_tokens`
| Column | Type | Notes |
|--------|------|-------|
| id | int PK | auto |
| userId | int | FK → users |
| token | string | unique (Expo push token) |
| deviceId | string? | |
| os | string? | |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

---

## API Endpoints

### Auth — `/auth` (rate limited: 10 req/min)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register with password |
| POST | `/auth/login` | — | Login with phone/email + password |
| POST | `/auth/forgot-password` | — | Request password reset OTP |
| POST | `/auth/reset-password` | — | Reset password via token |
| POST | `/auth/send-otp` | — | Send OTP to phone/email |
| POST | `/auth/verify-otp` | — | Verify OTP, get session |
| POST | `/auth/oauth/google` | — | Google OAuth login/register |
| POST | `/auth/oauth/facebook` | — | Facebook OAuth login/register |
| POST | `/auth/refresh` | — | Refresh token pair |
| POST | `/auth/logout` | — | Revoke refresh token |

### Users — `/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me` | JWT | Get own profile |
| PATCH | `/users/me` | JWT | Update profile |

### Animals — `/animals`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/animals` | JWT | List user's animals (paginated, filter by breed) |
| GET | `/animals/:id` | JWT | Get animal by ID |
| POST | `/animals` | JWT | Add new animal |
| PATCH | `/animals/:id` | JWT | Update animal |
| DELETE | `/animals/:id` | JWT | Delete animal |

### Doctors — `/doctors`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/doctors` | — | List all doctors (paginated, filter by specialty) |
| GET | `/doctors/me` | JWT + Doctor | Get own doctor profile |
| GET | `/doctors/:id` | — | Get doctor by ID |
| GET | `/doctors/:id/availability` | — | Get weekly availability |
| POST | `/doctors/:id/availability` | JWT + Doctor | Set availability (own profile only) |

### Appointments — mounted on `/doctors`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/doctors/:id/slots` | — | List open slots for a date |
| POST | `/doctors/book` | JWT + User | Book appointment |
| GET | `/doctors/bookings/all` | JWT | List user's appointments |
| PATCH | `/doctors/bookings/:id/reschedule` | JWT | Reschedule (must be >2h before start) |
| PATCH | `/doctors/bookings/:id/cancel` | JWT | Cancel (must be >2h before start) |
| PATCH | `/doctors/bookings/:id/complete` | JWT + Doctor | Mark completed |

### Chat — `/chat`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/chat/conversations` | JWT | List user's conversations |
| GET | `/chat/messages` | JWT | List messages in conversation |
| POST | `/chat/message` | JWT | Send text message |
| POST | `/chat/message/attachment` | JWT | Send message with file attachment |
| PATCH | `/chat/messages/:id/read` | JWT | Mark message as read |

### Products — `/products`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | — | List catalog (paginated, filter by category/brand) |
| GET | `/products/categories` | — | List categories |
| POST | `/products/categories` | JWT + Admin | Create category |
| GET | `/products/brands` | — | List brands |
| POST | `/products/brands` | JWT + Admin | Create brand |
| GET | `/products/search` | — | Search products |
| GET | `/products/:id` | — | Get product details |
| POST | `/products` | JWT + Admin | Create product |
| PUT | `/products/:id` | JWT + Admin | Update product |
| DELETE | `/products/:id` | JWT + Admin | Delete product |
| GET | `/products/:id/stock` | — | Get current stock level |
| POST | `/products/:id/stock` | JWT + Admin | Add inventory stock |

### Livestock — `/livestock`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/livestock` | — | List active listings (paginated, filter by species/breed) |
| GET | `/livestock/featured` | — | Featured listings |
| GET | `/livestock/search` | — | Search listings |
| GET | `/livestock/my` | JWT | Seller's own listings |
| GET | `/livestock/:id` | — | Get listing details |
| POST | `/livestock` | JWT | Create listing |
| PUT | `/livestock/:id` | JWT | Update listing (owner only) |
| DELETE | `/livestock/:id` | JWT | Delete listing (owner only) |
| PATCH | `/livestock/:id/verify` | JWT + Admin | Verify/unverify listing |
| PATCH | `/livestock/:id/feature` | JWT + Admin | Set featured status |
| PATCH | `/livestock/:id/reserve` | JWT | Reserve/release (owner only) |
| PATCH | `/livestock/:id/sold` | JWT | Mark sold (owner only) |

### Cart — `/cart`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cart` | JWT | Get cart summary (with price/stock validation) |
| POST | `/cart/add` | JWT | Add product or livestock to cart |
| PUT | `/cart/item/:id` | JWT | Update item quantity |
| DELETE | `/cart/item/:id` | JWT | Remove item |
| DELETE | `/cart` | JWT | Clear entire cart |

### Wishlist — `/wishlist`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/wishlist` | JWT | Get wishlist |
| POST | `/wishlist` | JWT | Add product or livestock |
| DELETE | `/wishlist/:id` | JWT | Remove item |

### Orders — `/orders`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | JWT | Place order from cart |
| GET | `/orders/my` | JWT | User's orders |
| GET | `/orders/admin` | JWT + Admin | All orders (paginated) |
| GET | `/orders/:id` | JWT | Order details |
| PATCH | `/orders/:id/status` | JWT + Admin | Update order status |

### Payments — `/payments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/intent` | JWT | Create payment intent |
| GET | `/payments/verify/:transactionId` | JWT | Verify/audit transaction |
| POST | `/payments/simulate-success` | — | Gateway simulation: force success |
| POST | `/payments/simulate-fail` | — | Gateway simulation: force fail |

### Delivery — `/delivery`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/delivery/track/:trackingNumber` | — | Public tracking |
| GET | `/delivery/order/:orderId` | JWT | Shipment by order |
| POST | `/delivery/order/:orderId` | JWT + Admin | Create courier assignment |
| PUT | `/delivery/order/:orderId` | JWT + Admin | Update shipment status |

### Clinics — `/clinics`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/clinics` | — | List clinics (paginated) |
| GET | `/clinics/:id` | — | Get clinic details |
| POST | `/clinics` | JWT + Clinic/Admin | Create clinic profile |
| PUT | `/clinics/:id` | JWT | Update clinic |
| PATCH | `/clinics/:id/verify` | JWT + Admin | Verify clinic |
| POST | `/clinics/:id/doctors` | JWT | Add doctor association |
| DELETE | `/clinics/:id/doctors/:doctorId` | JWT | Remove doctor association |

### Services — `/services`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/services` | — | List active services |
| GET | `/services/:id` | — | Get service details |
| POST | `/services` | JWT + Doctor/Clinic/Admin | Create service |
| PUT | `/services/:id` | JWT + Doctor/Clinic/Admin | Update service |
| DELETE | `/services/:id` | JWT + Doctor/Clinic/Admin | Deactivate service |

### AI Diagnosis — `/ai-diagnosis`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai-diagnosis/upload-image` | JWT | Upload photo for diagnosis |
| POST | `/ai-diagnosis/analyze` | JWT | Submit symptoms + photos (async queue) |
| GET | `/ai-diagnosis/history` | JWT | Get diagnosis history |
| GET | `/ai-diagnosis/:id` | JWT | Poll diagnosis for status/result |

### Medical Records — `/medical-records`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/medical-records/upload` | JWT | Upload medical file (PDF/image/DICOM) |
| GET | `/medical-records` | JWT | List records (own for patients, ?patientId for doctors) |
| GET | `/medical-records/:id` | JWT | Get single attachment |

### Alerts — `/alerts`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/alerts` | JWT | List active alerts (filter by severity) |
| POST | `/alerts/:id/action` | JWT | Record action on alert |

### Tasks — `/tasks` (rate limited: 30 req/min)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tasks` | JWT | Get tasks for a date |
| POST | `/tasks` | JWT | Create task |
| PATCH | `/tasks/:id/toggle` | JWT | Toggle done/undone |
| DELETE | `/tasks/:id` | JWT | Delete task |

### Referrals — `/referrals`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/referrals/me` | JWT | Get referral code + earnings + share link |
| POST | `/referrals/claim` | JWT | Claim another user's code |

### Reviews — `/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/reviews` | JWT | Submit review |
| GET | `/reviews/:targetType/:targetId` | — | List approved reviews |
| POST | `/reviews/:id/helpful` | — | Upvote helpfulness |
| POST | `/reviews/:id/report` | — | Report review |
| GET | `/reviews/reported` | JWT + Admin | List reported reviews |
| PATCH | `/reviews/:id/moderate` | JWT + Admin | Approve/reject |
| POST | `/reviews/:id/reply` | JWT + Doctor/Admin | Reply to review |

### Notifications — `/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | JWT | Get user's notifications |
| PATCH | `/notifications/:id/read` | JWT | Mark as read |
| POST | `/notifications/read-all` | JWT | Mark all as read |
| POST | `/notifications/push-token` | JWT | Register Expo push token |
| DELETE | `/notifications/push-token` | JWT | Unregister push token |

### Weather — `/weather`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/weather` | — | Get farm weather (lat/long/district) |

### Search — `/search`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search` | — | Global search (products, livestock, clinics, doctors) |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |

---

## WebSocket Events

Connect to default Socket.IO namespace with `{ auth: { token: <JWT> } }`.

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinConversation` | `{ conversationId }` | Join conversation room |
| `sendMessage` | `{ conversationId, text }` | Send text message |
| `typing` | `{ conversationId, isTyping }` | Typing indicator |
| `markRead` | `{ messageId }` | Mark message read |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `messageReceived` | ChatMessageClientView | New message in room |
| `typingIndicator` | `{ userId, isTyping }` | Typing status |
| `messageStatusUpdate` | `{ id, status }` | Status change |
| `conversationUpdated` | ChatMessageClientView | For conversation-list screens |

---

## Auth Flow

1. **Register** → `POST /auth/register` with phone/email + password → creates User
2. **OTP** → `POST /auth/send-otp` → sends code → `POST /auth/verify-otp` → returns session
3. **OAuth** → `POST /auth/oauth/google` or `/auth/oauth/facebook` → verifies token → creates/returns User
4. **JWT** → All protected routes use `Authorization: Bearer <accessToken>`
5. **Refresh** → `POST /auth/refresh` with refreshToken → new token pair
6. **Logout** → `POST /auth/logout` with refreshToken → revokes it

### Roles
- `user` — default, books appointments, shops
- `doctor` — manages availability, views bookings, replies to reviews
- `clinic` — manages clinic profile, assigns doctors
- `admin` — full access, manages users/orders/alerts/notifications

---

## Payment Providers

Supported providers (set via `provider` field):
- `bkash` — bKash (Bangladesh)
- `nagad` — Nagad (Bangladesh)
- `sslcommerz` — SSLCommerz (Bangladesh)
- `rocket` — Rocket (Bangladesh)
- `stripe` — Stripe (Global)
- `paypal` — PayPal (Global)
- `simulate` — Simulation mode for dev/testing

Simulation endpoints:
- `POST /payments/simulate-success` → force transaction to successful
- `POST /payments/simulate-fail` → force transaction to failed

---

## External Integrations

| Service | Purpose | Fallback |
|---------|---------|----------|
| **PostgreSQL** | Primary database | — |
| **Redis** | Cache, BullMQ broker | — |
| **Meilisearch** | Full-text search | DB ILIKE |
| **Cloudinary** | Image/document storage | — |
| **OpenAI** | AI diagnosis (vision + symptoms) | Keyword heuristic |
| **Expo** | Push notifications (mobile) | — |
| **Resend** | Email (HTTPS) | Nodemailer SMTP → mock console |
| **OpenWeatherMap** | Farm weather data | Mock weather data |
| **Google OAuth** | Social login | — |
| **Facebook OAuth** | Social login | — |

---

## Admin Endpoints

All require `JWT + ADMIN` role.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List users (paginated, searchable) |
| PATCH | `/admin/users/:id/role` | Update user role |
| GET | `/admin/orders` | List all orders (paginated, filterable by status) |
| PATCH | `/admin/orders/:id/status` | Update order status |
| POST | `/admin/alerts` | Create and broadcast alert |
| DELETE | `/admin/alerts/:id` | Deactivate alert |
| GET | `/admin/referrals/pending` | List pending payouts |
| POST | `/admin/referrals/:id/approve` | Approve referral payout |
| GET | `/admin/notifications` | List sent notifications (paginated) |
| POST | `/admin/notifications/send` | Send to specific user IDs |
| POST | `/admin/notifications/broadcast` | Broadcast to all/role |

---

## Migrations

| # | File | Purpose |
|---|------|---------|
| 1 | `1785156895910-SyncRemoteSchema.ts` | Initial schema sync |
| 2 | `1786310884479-AddPushTokens.ts` | Push token support |
| 3 | `1786311774523-AddNotificationTypes.ts` | Notification type enum |
| 4 | `1786313461133-AddAiDiagnosisStatus.ts` | AI diagnosis status enum |

---

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgrespassword
DB_DATABASE=gobadi

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Meilisearch (optional)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=dev-master-key

# JWT
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID_WEB=
GOOGLE_CLIENT_ID_IOS=
GOOGLE_CLIENT_ID_ANDROID=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (optional)
RESEND_API_KEY=
SMTP_FROM="Gobadi App <no-reply@yourdomain.com>"

# Weather (optional)
OPENWEATHER_API_KEY=

# AI Diagnosis (optional)
OPENAI_API_KEY=
```
