# Backend Implementation Plan

> 22 new modules + 5 existing module updates. ~88 new endpoints.  
> Source of truth: `backend-requirement.md` (Part 1 onward = audit, Part 0 = spec reference).

### Progress Status

| Phase | Status |
|-------|--------|
| Phase 1: Entity Updates | ✅ COMPLETE |
| Phase 2: Fix Existing Partial Modules | ✅ COMPLETE |
| Phase 3: New Modules (Independent) | ✅ COMPLETE |
| Phase 4: New Modules (Sequential) | ✅ COMPLETE |
| Phase 5: Cross-Cutting Concerns | ✅ COMPLETE |

---

## Key Facts Before Starting

| Fact | Detail |
|------|--------|
| Stack | NestJS, TypeORM, Postgres, `synchronize: true` (entities auto-create columns) |
| Auth guards | `JwtAuthGuard` (login required), `RolesGuard` + `@Roles(UserRole.DOCTOR/ADMIN)` (role-gated) |
| UserRole enum | `USER`, `DOCTOR`, `CLINIC`, `ADMIN` — no PATIENT role |
| Existing `verified` field | OTP validation (phone/email at signup). New doctor verification field = `isDoctorVerified` (separate, never merge) |
| Existing `cancellationNote` | Free-text. Spec wants `cancellationReason` — check if same field or two fields. Don't rename blindly. |
| Existing `followUpId` | FK to another appointment. Spec wants `followUpDate: Date` — different concept, add alongside |
| Coins | Does NOT exist anywhere. New concept, build as part of Wallet |
| Patient concept | Undefined. Animals = livestock. Users = humans. Prescription/Lab/Vax/Consult all need `patientId`. **Must clarify before building those 4 modules** |

---

## Phase 1: Entity Updates (Foundation) ✅ COMPLETE

Everything else depends on these. Do them first, no exceptions.

### 1.1 User Entity — `src/users/user.entity.ts` ✅ COMPLETE

**Add 9 columns:**

```
profilePhoto     string?    Cloudinary URL
dateOfBirth      Date?      type: 'date'
bloodGroup       string?
allergies        string?    type: 'text'
emergencyContactName  string?
emergencyContactPhone string?
language         string     default: 'en'   (values: 'en' | 'bn')
isDoctorVerified boolean    default: false  (NOT reuse existing `verified`)
verificationDocuments  string[]?  simple-array, Cloudinary URLs
```

**Files to touch:**
- `src/users/user.entity.ts` — add columns ✅
- `src/users/dto/update-profile.dto.ts` — add optional fields (NOT language, NOT isDoctorVerified) ✅
- `src/users/users.service.ts` — update `updateProfile()` to accept new fields ✅
- `src/users/users.controller.ts` — no change needed (already PATCH /users/me)

**Gotcha:** grep `\.verified` across all backend files before adding `isDoctorVerified`. Make sure no DTO/serializer confuses the two.

---

### 1.2 Doctor Availability Entity — `src/doctors/availability.entity.ts` ✅ COMPLETE

**Add 3 columns:**

```
specificDate   Date?    type: 'date', null = recurring weekly row
isAvailable    boolean  default: true  (false = blocked this specific date)
overrideSlots  string[]?  simple-array, e.g. ['09:00-09:30','10:00-10:30']
```

**Files to touch:**
- `src/doctors/availability.entity.ts` — add columns ✅
- `src/doctors/doctors.service.ts` — update `findAvailabilityWindow()` to check `specificDate` rows first, use `overrideSlots`/`isAvailable` when a date-specific row exists ✅
- `src/appointments/appointments.service.ts` — `listAvailableSlots()` must also respect date-specific overrides ✅

**Gotcha:** `isActive` = weekly rule enabled/disabled. `isAvailable` = specific date blocked. Don't conflate.

---

### 1.3 Tasks Entity — `src/tasks/task.entity.ts` ✅ COMPLETE

**Add 3 columns:**

```
category   string?    'field' | 'animal' | 'appointment' | 'other'
priority   enum       'low' | 'medium' | 'high', default: 'medium'
dueDate    Date?      type: 'date'
```

**Files to touch:**
- `src/tasks/task.entity.ts` — add columns ✅
- `src/tasks/dto/create-task.dto.ts` — add optional category, priority, dueDate ✅
- `src/tasks/tasks.controller.ts` — add query params for filtering by category/priority if needed
- `src/tasks/tasks.service.ts` — update create + list to handle new fields ✅

---

### 1.4 Appointment Entity — `src/appointments/appointment.entity.ts` ✅ COMPLETE

**Add 5 columns:**

```
cancellationFee     number   decimal(10,2), default: 0
refundAmount        number   decimal(10,2), default: 0
walletTransactionId string?  FK -> wallet_transactions.id
consultationNotes   string?  type: 'text'
followUpDate        Date?    type: 'date'
```

**Files to touch:**
- `src/appointments/appointment.entity.ts` — add columns ✅
- `src/appointments/appointments.service.ts` — update `cancelAppointment()` and `bookAppointment()` (wallet integration, cancellation fee logic) ✅
- `src/appointments/dto/cancel-appointment.dto.ts` — possibly add fields ✅

**Depends on:** Wallet module (1.1B) for coins, Block Time fee-calc (1.8B) for fee calculation. Build entity fields now, wire logic after Wallet is done.

---

## Phase 2: Fix Existing Partial Modules ✅ COMPLETE

### 2.1 Wallet Module — `src/wallet/` ✅ COMPLETE

**Current state:** `GET /wallet/me` (wrong path), `GET /wallet/me/transactions` (wrong path). No topup, no pay, no coins.

**Changes:**
1. Add `coins: number (default 0)` column to `wallet.entity.ts` ✅
2. Create `src/wallet/constants.ts` with configurable rate: `COINS_PER_DOLLAR = 10` (easy to change later) ✅
3. Rename controller routes: `GET /wallet/me` → `GET /wallet`, `GET /wallet/me/transactions` → `GET /wallet/transactions` ✅
4. Add new endpoints:
   - `POST /wallet/topup` — body `{ amount, method }`. Credits wallet directly (bKash deferred) ✅
   - `POST /wallet/pay` — body `{ amount, appointmentId?, reason }`. Deduct from balance, reject if insufficient ✅
   - `POST /wallet/earn-coins` — internal, body `{ amount, reason }`. Add coins ✅
   - `POST /wallet/spend-coins` — internal, body `{ amount, reason }`. Deduct coins, reject if insufficient ✅

**Files to touch:**
- `src/wallet/wallet.entity.ts` — add `coins` column ✅
- `src/wallet/constants.ts` — create with `COINS_PER_DOLLAR` config ✅
- `src/wallet/wallet.controller.ts` — rename routes + add 4 new endpoints ✅
- `src/wallet/wallet.service.ts` — add `pay()`, `earnCoins()`, `spendCoins()` methods ✅

**Validation:** All DTOs must use `@IsNumber()` `@Min(0.01)` for amounts.

---

### 2.2 Doctor Block Time — `src/time-off/` ✅ COMPLETE

**Current state:** `GET/POST/DELETE /doctors/:id/time-off`. Has real conflict detection + fee estimate logic. Path wrong, GET not public, fee-calc not standalone.

**Changes:**
1. Rename route: `time-off` → `block-times` (safe, app doesn't call it) ✅
2. Make `GET` public (remove doctor-only guard from list endpoint) ✅
3. Add standalone route: `GET /doctors/:id/block-times/calculate-fee?appointmentId=` ✅

**Files to touch:**
- `src/time-off/time-off.controller.ts` — rename `@Controller('doctors/:id/time-off')` → `@Controller('doctors/:id/block-times')`, remove doctor guard from GET, add fee-calc route ✅
- `src/time-off/time-off.service.ts` — extract fee calculation into standalone method ✅
- `src/time-off/time-off.module.ts` — possibly rename files, register in AppModule (already done) ✅

**Gotcha:** Keep the module folder name `time-off` if renaming files is too disruptive — just change the route path in the controller decorator.

---

### 2.3 Doctor Working Hours — `src/doctors/` ✅ COMPLETE

**Current state:** `GET/POST /doctors/:id/availability` exists and is wired into the mobile app.

**Changes:**
1. Keep `/doctors/:id/availability` path (app depends on it) ✅
2. Add: `PATCH /doctors/:id/availability/:dayId` — update single day without resending whole week ✅

**Files to touch:**
- `src/doctors/doctors.controller.ts` — add new PATCH route ✅
- `src/doctors/doctors.service.ts` — add `updateSingleDay()` method ✅

---

### 2.4 Discount Module — `src/discounts/` ✅ COMPLETE

**Current state:** Doctor-only controller. Has doctor→patient discount feature (working).

**Changes:**
1. Keep existing doctor discount routes (just prefix them under `/doctors/discounts` per spec, or alias) ✅
2. Add user-facing endpoints:
   - `GET /discounts/available` — JWT, active codes + doctor-granted discounts ✅
   - `POST /discounts/validate` — JWT, body `{ code }`, returns discount or 404 ✅
   - `POST /discounts/apply` — JWT, body `{ code, appointmentId }`, applies to appointment ✅
   - `GET /discounts/my` — JWT, user's discount history ✅
3. Add admin CRUD:
   - `POST /admin/discounts` — create discount code ✅
   - `PATCH /admin/discounts/:id` — update ✅
   - `DELETE /admin/discounts/:id` — delete ✅
4. New `Discount` entity for promo codes: `id, code, percent/amount, validFrom, validTo, usageLimit, isActive` ✅

**Discount code validation:** Alphanumeric only, max 10 chars, case-sensitive.
- DTO validation: `@Matches(/^[a-zA-Z0-9]{1,10}$/)`

**Files to touch:**
- `src/discounts/` — add new entity, new controller for user/admin routes ✅
- `src/admin/admin.module.ts` — register admin discount controller ✅

---

### 2.5 Appointment Cancel/Book Logic — `src/appointments/appointments.service.ts` ✅ COMPLETE

**Cancel logic (currently line 326-382):**
- Currently: flat 2-hour buffer, full refund if paid, no fee
- Required: calculate fee from doctor's block-time settings, deduct fee, refund remainder, store `walletTransactionId` ✅

**Book logic (currently line 67-127):**
- Currently: discount works, no wallet check, no bKash fallback, no coins
- Required: check wallet → enough? deduct + record → not enough? return redirect to bKash → apply discount → apply coins

**Depends on:** Wallet (1.1B) done, Block Time fee-calc (1.8B) done.

---

## Phase 3: New Modules (Independent)

### 3.1 Patient Module — NO SEPARATE MODULE NEEDED ✅ COMPLETE

**Decision:** Patient = Animal. Users are owners/parents of animals. No new `Patient` entity required.

**Reuse existing:**
- `Animal` entity (`src/animals/animal.entity.ts`) — already has `userId` (owner), `name`, `breed`, `age`, etc.
- `AnimalsController` — already has full CRUD (`GET /animals`, `POST /animals`, etc.)

**For Prescription/Lab/Vaccination/Consultation modules:** use `animalId` (FK → Animal.id) as the patient identifier. The appointment entity already has `animalId` column.

**If additional patient fields are needed** (e.g., medical history, allergies specific to one animal), add them to the `Animal` entity rather than creating a parallel `Patient` entity.

---

### 3.2 Prescription Module — `src/prescriptions/` ✅ COMPLETE

**Depends on:** Animal entity (already exists, no Patient module needed).

**Entity:** `Prescription: id, appointmentId, doctorId, animalId (FK→animals), medicines (jsonb [{name, dosage, duration, notes}])?, attachmentUrl?, sentAt?, createdAt, updatedAt`

**Endpoints:**
```
POST   /prescriptions                    JWT+Doctor  create (verify doctor owns appointment)
GET    /prescriptions/:appointmentId     JWT         view (doctor or animal owner on that appt)
GET    /prescriptions/animal/:animalId   JWT         animal's prescription history (doctor or owner)
PUT    /prescriptions/:id                JWT+Doctor  update (creating doctor only)
POST   /prescriptions/:id/attachment     JWT+Doctor  upload file (Cloudinary)
POST   /prescriptions/:id/send           JWT+Doctor  mark sent + notify owner
```

**Files to create:** Same structure as typical NestJS module.

---

### 3.3 Extend Medical Events for Lab/Vax/Consult — `src/medical-events/` ✅ COMPLETE

**Recommendation:** Extend existing `MedicalEvent` entity (already has `LAB_TEST`, `VACCINATION`, `CONSULTATION` types) rather than building 3 separate modules.

**Missing routes to add:**
```
GET    /medical-events/:id              JWT         single record (missing entirely)
DELETE /medical-events/:id              JWT+Doctor  delete (missing entirely)
```

**Add thin wrapper routes if frontend needs specific paths:**
```
GET    /lab-tests/animal/:animalId      JWT         → delegates to MedicalEvent list(type=LAB_TEST)
POST   /lab-tests                       JWT+Doctor  → delegates to MedicalEvent create(type=LAB_TEST)
PUT    /lab-tests/:id                   JWT+Doctor  → delegates to MedicalEvent update
GET    /vaccinations/animal/:animalId   JWT         → delegates to MedicalEvent list(type=VACCINATION)
POST   /vaccinations                    JWT+Doctor  → delegates to MedicalEvent create(type=VACCINATION)
PUT    /vaccinations/:id                JWT+Doctor  → delegates to MedicalEvent update
DELETE /vaccinations/:id                JWT+Doctor  → delegates to MedicalEvent delete
GET    /consultations/animal/:animalId  JWT         → delegates to MedicalEvent list(type=CONSULTATION)
GET    /consultations/:id               JWT         → delegates to MedicalEvent get single
PUT    /consultations/:id               JWT+Doctor  → delegates to MedicalEvent update
POST   /consultations/:id/end           JWT+Doctor  → sets status COMPLETED
```

**Files to touch:**
- `src/medical-events/medical-events.service.ts` — add `getById()`, `delete()` methods
- `src/medical-events/medical-events.controller.ts` — add `GET /:id`, `DELETE /:id` routes
- `src/medical-events/dto/` — possibly add type-specific DTOs

---

## Phase 4: New Modules (Sequential)

### 4.1 Payment Methods — `src/payment-methods/` ✅ COMPLETE

**Entity:** `PaymentMethod: id, userId, type (bkash/card/etc), maskedNumber, isDefault, isVerified, createdAt`

**Endpoints:**
```
GET    /payment-methods                 JWT   list user's methods
POST   /payment-methods                 JWT   add (triggers OTP if provider requires)
PUT    /payment-methods/:id             JWT   update (owner-only)
DELETE /payment-methods/:id             JWT   remove (owner-only)
PATCH  /payment-methods/:id/default     JWT   set default (owner-only, unsets others)
POST   /payment-methods/:id/verify-otp  JWT   verify with OTP
```

**Depends on:** bKash module (4.2) for real provider verification.

---

### 4.2 bKash Payment — `src/payments/bkash/` — **DEFERRED**

> **Skipped for now.** bKash integration deferred to future sprint. Requires sandbox credentials from team lead.

**Keep existing** `/payments/intent`, `/payments/simulate-*` routes (app uses them).

**Future bKash-specific routes:**
```
POST   /payments/bkash/initiate    JWT   calls bKash create-payment API
POST   /payments/bkash/confirm     JWT   calls bKash execute-payment, credits wallet or marks appointment paid
GET    /payments/bkash/status/:id  JWT   returns transaction status
```

**Gate simulate routes** behind `NODE_ENV !== 'production'`.

---

### 4.3 Consultation End — extend `src/appointments/` ✅ COMPLETE

**Current:** `PATCH /doctors/bookings/:id/complete` works, sets status COMPLETED + notification.

**Add:** Create a `Consultation`/`MedicalEvent` record with `status: COMPLETED` inside the handler.

**Depends on:** Medical Events module (3.3) being extended.

**Keep `PATCH .../complete` path** (app calls it via `doctorPortalApi.ts:70-72`).

---

### 4.4 Calendar — `src/calendar/` ✅ COMPLETE

**No new entity.** Read-only aggregation over Appointments + Tasks + Block Times.

**Endpoints:**
```
GET  /calendar/doctor/:doctorId?month=&year=    JWT   monthly calendar
GET  /calendar/doctor/:doctorId/week?date=      JWT   weekly calendar
GET  /calendar/appointments?date=&view=         JWT   user's appointments grouped by view
GET  /calendar/badges?month=&year=              JWT   per-day counts
```

**Depends on:** Appointments (1.4), Block Time (2.2), Tasks (1.3) all finalized.

---

### 4.5 Subscription — `src/subscriptions/` ✅ COMPLETE

**Entities:**
- `SubscriptionPlan: id, name, price, durationDays, features (jsonb)`
- `UserSubscription: id, userId, planId, startDate, endDate, status (active/cancelled/expired)`

**Endpoints:**
```
GET    /subscriptions/plans       Public   list plans
GET    /subscriptions/my          JWT      user's subscription
POST   /subscriptions/subscribe   JWT      body { planId, paymentMethodId }
POST   /subscriptions/cancel      JWT      cancel
GET    /admin/subscriptions       JWT+Admin  list all
```

**Manual renew initially.** Schema supports recurring (add `autoRenew: boolean` column later when needed). For now, user must manually call `POST /subscriptions/subscribe` again after expiry.

---

### 4.6 FAQ / Help — `src/faqs/` ✅ COMPLETE

**Entity:** `Faq: id, question, answer, category, order`

**Endpoints:**
```
GET    /faqs                    Public   list (support ?category= filter)
GET    /faqs/:id                Public   get single
POST   /admin/faqs              JWT+Admin  create
PUT    /admin/faqs/:id          JWT+Admin  update
DELETE /admin/faqs/:id          JWT+Admin  delete
```

**Register admin controller in** `src/admin/admin.module.ts`.

---

### 4.7 Support Tickets — `src/support/` ✅ COMPLETE

**Entities:**
- `SupportTicket: id, userId, subject, status (open/in-progress/closed), createdAt`
- `SupportTicketReply: id, ticketId, authorId, message, createdAt`

**Endpoints:**
```
POST   /support/tickets                 JWT   create ticket
GET    /support/tickets                 JWT   list user's own tickets
GET    /support/tickets/:id             JWT   get details (owner or admin)
POST   /support/tickets/:id/reply       JWT   reply (owner or admin)
GET    /admin/support/tickets           JWT+Admin   all tickets
PATCH  /admin/support/tickets/:id       JWT+Admin   update status
```

---

### 4.8 Notification Preferences — `src/notifications/` ✅ COMPLETE

**Entity:** `NotificationPreference: id, userId, appointmentReminders (bool), promotions (bool), chatMessages (bool), ...`

**Endpoints:**
```
GET  /notifications/preferences    JWT   get (create default on first access)
PUT  /notifications/preferences    JWT   update
```

**File to add:** `src/notifications/notification-preference.entity.ts` + controller routes in existing notifications controller.

---

### 4.9 Language Preference — `src/users/` ✅ COMPLETE

**Endpoint:** `PATCH /users/me/language` — JWT, body `{ language: 'en' | 'bn' }`

**Depends on:** User entity 1.1 (`language` column exists).

**Add to:** `src/users/users.controller.ts` next to existing `PATCH /users/me`.

---

### 4.10 Fields — `src/fields/` ✅ COMPLETE

**Entity:** `Field: id, userId, name, sizeAcres, cropType?, location?, createdAt`

**Endpoints:**
```
GET    /fields          JWT   list user's fields
POST   /fields          JWT   create
PUT    /fields/:id      JWT   update (owner-only)
DELETE /fields/:id      JWT   delete (owner-only)
```

---

### 4.11 Market Rates — `src/market-rates/` ✅ COMPLETE

**Entity:** `MarketRate: id, commodity, price, unit, date, region?`

**Endpoints:**
```
GET  /market-rates                    Public   today's/latest rates
GET  /market-rates/history?commodity= Public   time series
POST /admin/market-rates              JWT+Admin  add/update rate
```

---

### 4.12 Badges / Achievements — `src/badges/` ✅ COMPLETE

**Entities:**
- `Badge: id, name, description, icon, criteria (jsonb {type, threshold})`
- `UserBadge: id, userId, badgeId, earnedAt`

**Endpoints:**
```
GET  /badges/me           JWT      user's earned badges
GET  /badges/available    Public   all badges (locked/unlocked state)
```

Awarding logic = internal (triggered by other services), not an endpoint.

---

### 4.13 Video Call — `src/video-call/` — **DEFERRED**

> **Skipped for now.** Video provider decision pending (Twilio/Agora/Daily.co). Requires team decision on provider + mobile SDK integration.

**Placeholder stays:** `POST /doctors/bookings/:id/join` remains as-is (returns fake URL).

**Future entity:** `VideoSession: id, appointmentId, sessionId, status, createdAt, endedAt`

**Future endpoints (once provider chosen):**
```
POST /video-call/create            JWT+Doctor  create session
POST /video-call/join/:sessionId   JWT         join (doctor or patient check)
POST /video-call/end/:sessionId    JWT         end
GET  /video-call/token/:sessionId  JWT         fresh access token
```

---

## Phase 5: Cross-Cutting Concerns

### 5.1 Gate simulate routes behind env check ✅ COMPLETE
`src/payments/payments.controller.ts` — add `@UseGuards` or conditional guard for `simulate-success` and `simulate-fail`.

### 5.2 Notification preferences integration
Wherever notifications are sent (booking, cancellation, prescription, support), eventually check `NotificationPreference` before sending. Flag as follow-up, not in scope for this ticket.

### 5.3 Admin module registration ✅ COMPLETE
New admin controllers (Discounts, FAQs, Subscriptions, Market Rates, Support) must be registered in `src/admin/admin.module.ts`.

### 5.4 AppModule registration ✅ COMPLETE
All new modules must be added to `src/app.module.ts` imports array.

---

## Build Order (Dependency-Driven) — Updated with Progress

```
Phase 1: Entity Updates ✅ COMPLETE
  1.1 User entity          ✅
  1.2 Doctor Availability  ✅
  1.3 Tasks entity         ✅
  1.4 Appointment entity   ✅

Phase 2: Fix Existing ✅ COMPLETE
  2.1 Wallet fixes         ✅
  2.2 Block Time fixes     ✅
  2.3 Working Hours PATCH  ✅
  2.4 Discount fixes       ✅
  2.5 Cancel/Book logic    ✅

Phase 3: New Modules (Independent) ✅ COMPLETE
  3.1 Patient = Animal     ── no new module, reuse existing Animal
  3.2 Prescription         ── after Phase 1 (uses animalId)
  3.3 Medical Events ext   ── after Phase 1 (uses animalId)

Phase 4: New Modules (Sequential) ✅ COMPLETE
  4.1 Payment Methods      ── after 2.1
  4.2 bKash                ── DEFERRED (future sprint)
  4.3 Consultation End     ── after 3.3
  4.4 Calendar             ── after 2.2, 2.5, 1.3
  4.5 Subscription         ── after 4.1
  4.6 FAQ                  ── independent
  4.7 Support Tickets      ── independent
  4.8 Notification Prefs   ── independent
  4.9 Language             ── after 1.1
  4.10 Fields              ── independent
  4.11 Market Rates        ── independent
  4.12 Badges              ── independent
  4.13 Video Call          ── DEFERRED (provider decision pending)

Phase 5: Cross-Cutting ✅ COMPLETE
  Gate simulate routes
  Notification prefs integration (follow-up)
  Admin module registration
  AppModule registration
```

---

## Resolved Questions

| # | Question | Decision |
|---|----------|----------|
| 1 | What is a "Patient"? | **Animal.** Users are owners/parents of animals. Patient module = Animal records. Use `animalId` for Prescription/Lab/Vax/Consult. No separate Patient entity needed — reuse existing `Animal` entity. |
| 2 | `cancellationNote` vs `cancellationReason` | **Keep `cancellationReason` as free-text string.** Drop the enum. The existing `cancellationNote` text field can be repurposed or removed. |
| 3 | bKash credentials | **DEFERRED.** Skip bKash module (4.2) for now. Payment Methods (4.1) can still be built for future provider integration. |
| 4 | Video provider | **DEFERRED.** Skip Video Call module (4.13) for now. Placeholder `POST /doctors/bookings/:id/join` stays as-is. |
| 5 | Discount code format | **Alphanumeric, max 10 chars, case-sensitive.** Add validation in DTO: `@Matches(/^[a-zA-Z0-9]{1,10}$/)`. |
| 6 | Coins redemption rate | **Configurable.** Store rate in a config/constants file (e.g., `COINS_PER_DOLLAR = 10`). Easy to change later. Initially: 10 coins = 1 currency unit. |
| 7 | Subscription billing | **Manual renew initially.** Build `SubscriptionPlan` + `UserSubscription` entities. Support both manual and recurring in schema, but only expose manual renew endpoints now. |


