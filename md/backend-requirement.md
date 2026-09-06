# Backend Requirements & Implementation Instructions

> This single file replaces the old separate `BACKEND_REQUIREMENTS.md` and `INSTRUCTIONS.md`.
> **Part 0** below is the original requirements spec, kept as-is for reference.
> **Part 1** onward is the audit: what's actually built in `backend/src` vs this spec, checked file by file (not by folder name), plus a cross-check against what the mobile app (`app/src`) actually calls.
> **Use Part 1 onward as your build list.**

---

## Part 0: Original Requirements (Reference)

### Overview

Frontend ready. Backend needs **22 new modules** + **5 existing module updates** to sync with Figma designs.

> **Total:** ~88 new endpoints, 22 new entities, 5 entity updates

---

### Part 0A: Existing Modules - Updates Needed

#### 1. User Entity

**File:** `src/users/user.entity.ts`

**Fields to Add:**

| Field | Type | Notes |
|-------|------|-------|
| `+ profilePhoto` | String (nullable) | Cloudinary URL |
| `+ dateOfBirth` | Date (nullable) | |
| `+ bloodGroup` | String (nullable) | |
| `+ allergies` | Text (nullable) | |
| `+ emergencyContactName` | String (nullable) | |
| `+ emergencyContactPhone` | String (nullable) | |
| `+ language` | String (default `'en'`) | `'en'` or `'bn'` |
| `+ isVerified` | Boolean (default `false`) | for doctors |
| `+ verificationDocuments` | SimpleArray (nullable) | for doctors |

---

#### 2. Appointments - Add Cancellation Fee + Wallet Logic

**File:** `src/appointments/appointment.entity.ts`

**Fields to Add:**

| Field | Type | Notes |
|-------|------|-------|
| `+ cancelledAt` | Timestamp (nullable) | |
| `+ cancellationReason` | String (nullable) | |
| `+ cancellationFee` | Decimal (default `0`) | |
| `+ refundAmount` | Decimal (default `0`) | |
| `+ walletTransactionId` | UUID (nullable) | FK -> `wallet_transactions` |
| `+ consultationNotes` | Text (nullable) | |
| `+ followUpDate` | Date (nullable) | |

**Update Cancel Endpoint Logic:**

1. Check if cancellation is within allowed window
2. Calculate fee based on doctor's block-time settings or global rule
3. Deduct fee from wallet
4. Create wallet transaction record
5. Create refund transaction if applicable
6. Send notification to both parties

---

#### 3. Doctor Availability - Date-Specific Overrides

**File:** `src/doctors/availability.entity.ts`

**Fields to Add:**

| Field | Type | Notes |
|-------|------|-------|
| `+ specificDate` | Date (nullable) | `null` = recurring |
| `+ isAvailable` | Boolean (default `true`) | |
| `+ overrideSlots` | SimpleArray (nullable) | specific time slots for this date |

---

#### 4. Appointment Booking - Wallet Integration

**File:** `src/appointments/appointments.service.ts`

**Update Book Endpoint Logic:**

1. Check wallet balance
2. If sufficient -> deduct from wallet + create transaction
3. If insufficient -> redirect to payment (bKash or other)
4. Apply discount if user has one
5. Apply coins if user wants to use them

---

#### 5. Tasks - Add Categories

**File:** `src/tasks/task.entity.ts`

**Fields to Add:**

| Field | Type | Notes |
|-------|------|-------|
| `+ category` | String (nullable) | `'field'`, `'animal'`, `'appointment'`, `'other'` |
| `+ priority` | Enum (default `'medium'`) | `'low'`, `'medium'`, `'high'` |
| `+ dueDate` | Date (nullable) | |

---

#### Summary - Updates

| # | Module | File | Changes |
|---|--------|------|---------|
| 1 | Users | `src/users/user.entity.ts` | Add 9 fields |
| 2 | Appointments | `src/appointments/appointment.entity.ts` | Add 7 fields + update cancel logic |
| 3 | Doctor Availability | `src/doctors/availability.entity.ts` | Add 3 fields |
| 4 | Appointments | `src/appointments/appointments.service.ts` | Update book endpoint with wallet logic |
| 5 | Tasks | `src/tasks/task.entity.ts` | Add 3 fields |

---

### Part 0B: New Modules - APIs & Endpoints

#### 1. Wallet Module (`src/wallet/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/wallet` | JWT | Get wallet balance |
| GET | `/wallet/transactions` | JWT | Transaction history (with filters) |
| POST | `/wallet/topup` | JWT | Add money to wallet |
| POST | `/wallet/pay` | JWT | Pay from wallet (for appointments) |
| POST | `/wallet/earn-coins` | JWT | Earn coins (internal) |
| POST | `/wallet/spend-coins` | JWT | Spend coins (internal) |

---

#### 2. Payment Methods Module (`src/payment-methods/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/payment-methods` | JWT | List user's payment methods |
| POST | `/payment-methods` | JWT | Add payment method |
| PUT | `/payment-methods/:id` | JWT | Update payment method |
| DELETE | `/payment-methods/:id` | JWT | Remove payment method |
| PATCH | `/payment-methods/:id/default` | JWT | Set as default |
| POST | `/payment-methods/:id/verify-otp` | JWT | Verify payment method with OTP |

---

#### 3. bKash Payment Module (`src/payments/bkash/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/bkash/initiate` | JWT | Initiate bKash payment |
| POST | `/payments/bkash/confirm` | JWT | Confirm bKash payment |
| GET | `/payments/bkash/status/:id` | JWT | Check bKash status |

---

#### 4. Discount Module (`src/discounts/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/discounts/available` | JWT | Get available discounts for user |
| POST | `/discounts/validate` | JWT | Validate discount code |
| POST | `/discounts/apply` | JWT | Apply discount to appointment |
| GET | `/discounts/my` | JWT | User's discount history |
| POST | `/admin/discounts` | JWT+Admin | Create discount |
| PATCH | `/admin/discounts/:id` | JWT+Admin | Update discount |
| DELETE | `/admin/discounts/:id` | JWT+Admin | Delete discount |
| POST | `/doctors/discounts` | JWT+Doctor | Doctor creates patient discount |
| GET | `/doctors/discounts` | JWT+Doctor | Doctor's discount list |

---

#### 5. Prescription Module (`src/prescriptions/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/prescriptions` | JWT+Doctor | Create prescription |
| GET | `/prescriptions/:appointmentId` | JWT | Get prescription by appointment |
| GET | `/prescriptions/patient/:patientId` | JWT | Get patient's prescriptions |
| PUT | `/prescriptions/:id` | JWT+Doctor | Update prescription |
| POST | `/prescriptions/:id/attachment` | JWT+Doctor | Add attachment |
| POST | `/prescriptions/:id/send` | JWT+Doctor | Send prescription (mark as sent + notify) |

---

#### 6. Patient Module (`src/patients/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/patients` | JWT | List user's patients |
| GET | `/patients/:id` | JWT | Get patient details |
| POST | `/patients` | JWT | Add patient |
| PUT | `/patients/:id` | JWT | Update patient |
| DELETE | `/patients/:id` | JWT | Delete patient |
| GET | `/patients/search?q=` | JWT+Doctor | Search patients (for doctors) |

---

#### 7. Doctor Working Hours Module (`src/doctors/working-hours/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/doctors/:id/working-hours` | Public | Get doctor working hours |
| PUT | `/doctors/:id/working-hours` | JWT+Doctor | Update working hours (bulk) |
| PATCH | `/doctors/:id/working-hours/:dayId` | JWT+Doctor | Update single day |

---

#### 8. Doctor Block Time Module (`src/doctors/block-time/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/doctors/:id/block-times` | Public | Get blocked dates |
| POST | `/doctors/:id/block-times` | JWT+Doctor | Create block time |
| DELETE | `/doctors/:id/block-times/:blockId` | JWT+Doctor | Remove block time |
| GET | `/doctors/:id/block-times/calculate-fee` | JWT | Calculate cancellation fee |

---

#### 9. Lab Tests Module (`src/lab-tests/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/lab-tests/patient/:patientId` | JWT | Get patient's lab tests |
| POST | `/lab-tests` | JWT+Doctor | Order lab test |
| PUT | `/lab-tests/:id` | JWT+Doctor | Update lab test results |
| GET | `/lab-tests/:id` | JWT | Get lab test details |

---

#### 10. Vaccination Records Module (`src/vaccinations/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/vaccinations/animal/:animalId` | JWT | Get animal's vaccination records |
| POST | `/vaccinations` | JWT+Doctor | Add vaccination record |
| PUT | `/vaccinations/:id` | JWT+Doctor | Update vaccination record |
| DELETE | `/vaccinations/:id` | JWT+Doctor | Delete vaccination record |

---

#### 11. Consultation Records Module (`src/consultations/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/consultations/patient/:patientId` | JWT | Get patient's consultations |
| GET | `/consultations/:id` | JWT | Get consultation details |
| PUT | `/consultations/:id` | JWT+Doctor | Update consultation |
| POST | `/consultations/:id/end` | JWT+Doctor | End consultation |

---

#### 12. Calendar Module (`src/calendar/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/calendar/doctor/:doctorId?month=&year=` | JWT | Get doctor's monthly calendar |
| GET | `/calendar/doctor/:doctorId/week?date=` | JWT | Get doctor's weekly calendar |
| GET | `/calendar/appointments?date=&view=day\|week\|month` | JWT | Get appointments grouped by date |
| GET | `/calendar/badges?month=&year=` | JWT | Get badge counts per day |

---

#### 13. Subscription Module (`src/subscriptions/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/subscriptions/plans` | Public | List subscription plans |
| GET | `/subscriptions/my` | JWT | Get user's subscription |
| POST | `/subscriptions/subscribe` | JWT | Subscribe to plan |
| POST | `/subscriptions/cancel` | JWT | Cancel subscription |
| GET | `/admin/subscriptions` | JWT+Admin | List all subscriptions |

---

#### 14. FAQ / Help Module (`src/faqs/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/faqs` | Public | List FAQs |
| GET | `/faqs/:id` | Public | Get FAQ |
| POST | `/admin/faqs` | JWT+Admin | Create FAQ |
| PUT | `/admin/faqs/:id` | JWT+Admin | Update FAQ |
| DELETE | `/admin/faqs/:id` | JWT+Admin | Delete FAQ |

---

#### 15. Support Tickets Module (`src/support/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/support/tickets` | JWT | Create support ticket |
| GET | `/support/tickets` | JWT | List user's tickets |
| GET | `/support/tickets/:id` | JWT | Get ticket details |
| POST | `/support/tickets/:id/reply` | JWT | Reply to ticket |
| GET | `/admin/support/tickets` | JWT+Admin | List all tickets |
| PATCH | `/admin/support/tickets/:id` | JWT+Admin | Update ticket status |

---

#### 16. Notification Preferences Module (`src/notifications/preferences/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications/preferences` | JWT | Get notification preferences |
| PUT | `/notifications/preferences` | JWT | Update notification preferences |

---

#### 17. Language Preference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/users/me/language` | JWT | Set language preference (`en` / `bn`) |

---

#### 18. Fields Module (`src/fields/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/fields` | JWT | List user's fields |
| POST | `/fields` | JWT | Create field |
| PUT | `/fields/:id` | JWT | Update field |
| DELETE | `/fields/:id` | JWT | Delete field |

---

#### 19. Market Rates Module (`src/market-rates/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/market-rates` | Public | Get today's market rates |
| GET | `/market-rates/history?commodity=` | Public | Get rate history |
| POST | `/admin/market-rates` | JWT+Admin | Update market rates |

---

#### 20. Badges / Achievements Module (`src/badges/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/badges/me` | JWT | Get user's badges |
| GET | `/badges/available` | Public | List all available badges |

---

#### 21. Video Call Module (`src/video-call/`) — ✅ BUILT

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/video-call/create` | JWT+Doctor | Create video session |
| POST | `/video-call/join/:appointmentId` | JWT | Join video session (returns Agora token) |
| POST | `/video-call/end/:appointmentId` | JWT | End video session |
| GET | `/video-call/token/:appointmentId` | JWT | Get fresh Agora token |

---

#### 22. Consultation End Module (extend `src/appointments/`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/doctors/bookings/:id/end` | JWT+Doctor | End consultation (marks complete + creates consultation record) |

---

#### Summary - New Modules

| # | Module | Endpoints |
|---|--------|-----------|
| 1 | Wallet | 6 |
| 2 | Payment Methods | 6 |
| 3 | bKash Payment | 3 |
| 4 | Discount | 9 |
| 5 | Prescription | 6 |
| 6 | Patient | 6 |
| 7 | Doctor Working Hours | 3 |
| 8 | Doctor Block Time | 4 |
| 9 | Lab Tests | 4 |
| 10 | Vaccination Records | 4 |
| 11 | Consultation Records | 4 |
| 12 | Calendar | 4 |
| 13 | Subscription | 5 |
| 14 | FAQ / Help | 5 |
| 15 | Support Tickets | 6 |
| 16 | Notification Preferences | 2 |
| 17 | Language Preference | 1 |
| 18 | Fields | 4 |
| 19 | Market Rates | 3 |
| 20 | Badges | 2 |
| 21 | Video Call | 4 |
| 22 | Consultation End | 1 |
| **Total** | | **~88 endpoints** |

---

### Dependency Order (from the original spec)

Build in this sequence:

1. User entity updates (foundation)
2. Doctor availability overrides
3. Task categories (independent)
4. Appointment entity updates
5. Wallet module
6. Payment Methods
7. bKash integration
8. Discount module
9. Patient module
10. Medical records (Prescription, Lab, Vaccination, Consultation)
11. Doctor schedule (Working Hours, Block Time, Calendar)
12. Subscription module
13. Support & FAQ
14. Remaining features

**Why this order:**

- **User** -> Patient, Prescription (need user fields)
- **Appointment** -> Wallet, Discount (need appointment fields)
- **Doctor Availability** -> Working Hours, Block Time (need override support)
- **Wallet** -> Booking integration (need wallet first)

---

## Part 1: Audit & Implementation Instructions

### Stack facts you need:

- **NestJS, TypeORM, Postgres**, `synchronize: true` (entities auto-create tables, no migration needed for new columns - but still write a migration for prod safety if the team asks for one).
- **Auth:** `JwtAuthGuard` for login-required routes, `RolesGuard` + `@Roles(UserRole.DOCTOR | UserRole.ADMIN | ...)` for role-gated routes.
- **UserRole enum** (`src/users/user.entity.ts`): `USER`, `DOCTOR`, `CLINIC`, `ADMIN`. There is **no** `PATIENT` role - patients are just USER accounts (or Animal records owned by a user, for livestock).

### Status legend:

| Status | Meaning |
|--------|---------|
| `DONE` | route, auth, and logic all match spec |
| `PARTIAL` | something exists but path/verb/logic is wrong or incomplete |
| `MISSING` | nothing exists |

> **Total found:** 0 endpoints fully done, ~10 partial, ~78 missing, out of ~88 required.

### Mobile app cross-check

The app (`app/src`, RTK Query, all calls live in `app/src/store/*Api.ts`) was checked against every backend path this doc flags as needing a rename. Only **two** are actually wired into the app and need a coordinated frontend change if renamed:

1. `GET/POST /doctors/:id/availability` (1.7, doctor-availability screen)
2. `PATCH /doctors/bookings/:id/complete` (1.22, doctor-bookings screen)

Everything else this doc flags as "wrong path" (Wallet, Block Time/time-off, Discounts, video-call join) has **zero** mobile integration today - rename or rebuild those freely, no coordination needed. All modules that are fully missing (Payment Methods, bKash-specific, Prescriptions, Patients, Lab Tests, Vaccinations, Consultations, Calendar, Subscriptions, FAQ, Support, Notification Preferences, Language, Fields, Market Rates, Badges, Video Call) are also confirmed unbuilt on the mobile side - build them fresh, no legacy shape to match. See each module's "Mobile app check" note below for specifics.

---

### 1.A Update Existing Entities First

> Do these before touching the new modules. Other modules depend on these fields.

#### 1.1 User entity - MISSING (0/9 fields)

**File:** `backend/src/users/user.entity.ts`

**Current fields:** `id`, `phone`, `role`, `name`, `email`, `avatar`, `password`, `verified`, `googleId`, `facebookId`, `createdAt`.

**Add:**

```typescript
@Column({ nullable: true })
profilePhoto?: string; // Cloudinary URL

@Column({ type: 'date', nullable: true })
dateOfBirth?: Date;

@Column({ nullable: true })
bloodGroup?: string;

@Column({ type: 'text', nullable: true })
allergies?: string;

@Column({ nullable: true })
emergencyContactName?: string;

@Column({ nullable: true })
emergencyContactPhone?: string;

@Column({ default: 'en' })
language: string; // 'en' | 'bn'

@Column({ default: false })
isDoctorVerified: boolean; // doctor verification status - do NOT reuse existing `verified` field

@Column('simple-array', { nullable: true })
verificationDocuments?: string[]; // doctor docs, Cloudinary URLs
```

> **Important:** the entity already has a `verified: boolean` field used for OTP validation (phone/email verification at signup). `isDoctorVerified` is a separate, new field specifically for doctor document verification - the name makes it clear it's doctor-specific, don't shorten it to `isVerified` or it'll get confused with the OTP field again. Do not merge them or you'll break existing auth logic - check every place `verified` is read (`grep -rn "\.verified" backend/src`) before adding `isDoctorVerified` so you don't confuse the two in DTOs/serializers.

Also update `UpdateProfileDto` (`src/users/dto/update-profile.dto.ts`) to accept the new profile fields (photo, DOB, blood group, allergies, emergency contact). Language gets its own endpoint (see 1.17) - don't let it be set through the generic profile PATCH.

---

#### 1.2 Appointment entity - PARTIAL (2/7 fields, cancel/book logic incomplete)

**File:** `backend/src/appointments/appointment.entity.ts`

**Already there:** `cancelledAt`. There's also a `cancellationNote` field (not `cancellationReason` - spec wants free-text reason, current field name differs, check if it's actually usable as-is or needs renaming) and a `followUpId: number` (links to another appointment - NOT the same as the `followUpDate: Date` the spec wants).

**Add:**

```typescript
@Column('decimal', { precision: 10, scale: 2, default: 0 })
cancellationFee: number;

@Column('decimal', { precision: 10, scale: 2, default: 0 })
refundAmount: number;

@Column({ nullable: true })
walletTransactionId?: string; // FK -> wallet_transactions.id

@Column({ type: 'text', nullable: true })
consultationNotes?: string;

@Column({ type: 'date', nullable: true })
followUpDate?: Date;
```

**Cancel logic** - `appointments.service.ts`, `cancelAppointment()` (~line 326-382):

- **Current:** flat 2-hour buffer check (`enforceReschedulableBuffer`), and if the appointment was paid, it does a full refund, no fee.
- **Required:** calculate a cancellation fee based on doctor's block-time/cancellation-window settings (or a global fallback rule), deduct the fee, refund the remainder, store the wallet transaction id on the appointment, notify both parties.

**Implementation steps:**

1. Look up doctor's cancellation policy (this ties into the Doctor Block Time module, section 1.8 below - build that first or stub a default policy).
2. Compute `cancellationFee` based on how close to appointment time the cancel happens.
3. Call wallet service to refund `price - cancellationFee`, not full price.
4. Save the returned wallet transaction's id into `walletTransactionId`.
5. Notifications already work (lines 358-379) - keep that part as-is.

**Book logic** - `appointments.service.ts`, `bookAppointment()` (~line 67-127):

- **Current:** discount application works. No wallet balance check, no wallet deduction, no bKash fallback, no "coins" (there is no coins concept anywhere in the codebase yet - build it as part of Wallet module, section 1.1B).
- **Required flow:** check wallet balance -> if enough, deduct + record transaction -> if not enough, return a response telling the client to redirect to bKash payment -> apply discount -> apply coins if requested.

> Don't build this until Wallet module (1.1B) has pay and coins working - this depends on it.

---

#### 1.3 Doctor Availability entity - MISSING (0/3 fields)

**File:** `backend/src/doctors/availability.entity.ts`

**Current fields:** `id`, `doctorId`, `dayOfWeek`, `startTime`, `endTime`, `slotDurationMinutes`, `bufferMinutes`, `isActive`. This only models recurring weekly availability - no per-date override exists.

**Add:**

```typescript
@Column({ type: 'date', nullable: true })
specificDate?: Date; // null = recurring weekly row, set = one-off override for that date

@Column({ default: true })
isAvailable: boolean; // false = doctor blocked this specific date/slot

@Column('simple-array', { nullable: true })
overrideSlots?: string[]; // e.g. ['09:00-09:30','10:00-10:30'] - replaces the normal slots for specificDate
```

> Do not confuse this with `isActive` (existing field, means "this recurring rule is active"). `isAvailable` is about a specific date, `isActive` is about whether the weekly rule itself is enabled.

When computing available slots for a doctor on a given date, the slot-generation logic (wherever `/doctors/:id/slots` builds its response) must check for a row where `specificDate` matches first, and use `overrideSlots`/`isAvailable` from that row instead of the recurring weekly rule if one exists.

---

#### 1.4 Tasks entity - MISSING (0/3 fields)

**File:** `backend/src/tasks/task.entity.ts`

**Add:**

```typescript
@Column({ nullable: true })
category?: string; // 'field' | 'animal' | 'appointment' | 'other'

@Column({ type: 'enum', enum: ['low','medium','high'], default: 'medium' })
priority: 'low' | 'medium' | 'high';

@Column({ type: 'date', nullable: true })
dueDate?: Date;
```

Straightforward - no dependent logic, safe to do any time. Update the task DTOs and any list/filter endpoints to accept `category` and `priority` as query filters if the frontend needs filtering (check Figma - not explicitly stated in requirements doc but likely needed since these are being added for UI reasons).

---

### 1.B New Modules

#### 1.1B Wallet Module - PARTIAL

**Folder:** `src/wallet/` (exists)

| Required | Actual | Status |
|----------|--------|--------|
| `GET /wallet` | `GET /wallet/me` | PARTIAL - wrong path |
| `GET /wallet/transactions` | `GET /wallet/me/transactions` | PARTIAL - wrong path |
| `POST /wallet/topup` | - | MISSING |
| `POST /wallet/pay` | - | MISSING |
| `POST /wallet/earn-coins` | - | MISSING |
| `POST /wallet/spend-coins` | - | MISSING |

Entities `Wallet` (balance only, no coins column) and `WalletTransaction` exist and are wired into `app.module.ts`. Balance changes only happen internally today (`adjustBalance()`, called from appointment cancellation).

**Mobile app check:** confirmed - the app has zero wallet integration (`grep -ri wallet` across `app/src` returns nothing, no `walletApi.ts`, no wallet screen). Safe to rename freely, no frontend coordination needed.

**To do:**

1. Rename routes to match spec exactly: `GET /wallet`, `GET /wallet/transactions`.
2. Add `coins: number (default 0)` column to Wallet entity.
3. `POST /wallet/topup` - body `{ amount: number, method: 'bkash' | ... }`. This should hand off to the bKash module (1.3B) for real payment, then credit wallet on confirm. For now it can call `adjustBalance` directly once bKash confirm webhook lands.
4. `POST /wallet/pay` - body `{ amount: number, appointmentId?: string, reason: string }`. Deduct from balance, create a `WalletTransaction`, return new balance. Must reject with 400 if balance < amount.
5. `POST /wallet/earn-coins` / `POST /wallet/spend-coins` - marked "internal" in the spec, meaning these are called by other services (e.g. referrals, badges), not directly by the mobile app. Still expose as JWT-protected endpoints but expect callers to be other backend services. Body: `{ amount: number, reason: string }`.
6. All endpoints: `JwtAuthGuard`, operate on `req.user.id`'s wallet only - never let a user top up or pay from someone else's wallet.

**Validation:** amount must be a positive number (`@IsNumber()` `@Min(0.01)`), reject 0 or negative in the DTO, not just in service logic.

---

#### 1.2B Payment Methods Module - MISSING (entire module, all 6 endpoints)

No `src/payment-methods/` folder exists at all.

**Build:**

- **Entity** `PaymentMethod`: `id`, `userId`, `type` (bkash/card/etc), `maskedNumber`, `isDefault`, `isVerified`, `createdAt`.
- `GET /payment-methods` - JWT, list current user's methods.
- `POST /payment-methods` - JWT, body `{ type, number, ... }`. Should trigger OTP send if the payment provider requires verification (don't mark verified until OTP step passes).
- `PUT /payment-methods/:id` - JWT, owner-only (check `userId` matches `req.user.id`, return 403/404 otherwise).
- `DELETE /payment-methods/:id` - JWT, owner-only. If it's the default method and others exist, either block deletion or auto-promote another - decide with the team, document your choice in the PR.
- `PATCH /payment-methods/:id/default` - JWT, owner-only, unsets `isDefault` on the user's other methods first (only one default at a time).
- `POST /payment-methods/:id/verify-otp` - JWT, body `{ otp: string }`. Sets `isVerified = true` on match.

**Depends on:** bKash module (1.3B) if payment methods need real provider verification.

---

#### 1.3B bKash Payment Module - MISSING (spec-shaped endpoints don't exist)

No `src/payments/bkash/` folder. What exists instead: `src/payments/payments.controller.ts` has a generic simulated flow - `POST /payments/intent`, `GET /payments/verify/:transactionId`, `POST /payments/simulate-success`, `POST /payments/simulate-fail`. The simulate endpoints have no auth guard at all - that's fine for a dev/test simulator but **must never ship reachable in production**; gate them behind an env check (`NODE_ENV !== 'production'`) or a separate admin-only route.

**Mobile app check:** the app DOES call the generic simulated flow - `paymentsApi.ts` hits `/payments/intent`, `/payments/simulate-success`, `/payments/simulate-fail`. It also has bKash-looking screens (`payment-method.tsx`, `bkash-number.tsx`, `booking-bkash-number.tsx`), but those are pure navigation/UI - they don't call any bKash-specific endpoint, no submit action found. So: don't remove `/payments/intent/simulate-*` without updating `paymentsApi.ts` too, but the real bKash endpoints (1.3B) can be added fresh alongside them, and the existing bKash screens will need their submit handlers wired up once those endpoints exist - that's a mobile task to flag to the app team, not something backend can do alone.

**Build (new, bKash-specific):**

- `POST /payments/bkash/initiate` - JWT, body `{ amount, purpose: 'wallet-topup'|'appointment', referenceId }`. Calls bKash's create-payment API, returns `{ paymentId, bkashURL }` for the app to open.
- `POST /payments/bkash/confirm` - JWT, body `{ paymentId }`. Calls bKash execute-payment API, on success credits the wallet or marks the appointment paid, and stores a Transaction record.
- `GET /payments/bkash/status/:id` - JWT, returns current transaction status.

> Use real bKash sandbox credentials from `.env` (ask team lead for sandbox keys, don't hardcode). This is the highest-risk module to get wrong - money is involved. Write integration tests against bKash's sandbox before merging.

---

#### 1.4B Discount Module - PARTIAL (wrong shape - doctor-only, not user-facing)

**Folder:** `src/discounts/` (exists), controller is entirely doctor-gated (`@Roles(UserRole.DOCTOR)` on the whole controller).

| Required | Actual | Status |
|----------|--------|--------|
| `GET /discounts/available` (any JWT user) | - | MISSING |
| `POST /discounts/validate` | - | MISSING |
| `POST /discounts/apply` (user applies to own appointment) | `POST /discounts` exists but is doctor creating a discount for a patient - different feature | MISSING (wrong semantics) |
| `GET /discounts/my` (user's history) | - | MISSING |
| `POST /admin/discounts` | - | MISSING |
| `PATCH /admin/discounts/:id` | `PUT /discounts/:id` exists, doctor-scoped not admin | PARTIAL |
| `DELETE /admin/discounts/:id` | `DELETE /discounts/:id` exists, doctor-scoped not admin | PARTIAL |
| `POST /doctors/discounts` | `POST /discounts` exists (doctor-guarded), path differs | PARTIAL |
| `GET /doctors/discounts` | `GET /doctors/me/patients`, `GET /discounts/:patientId` exist, different shape | PARTIAL |

The existing code is a real, working feature (doctor grants a specific patient a discount) - keep it, just don't confuse it with what's missing. The spec wants **two separate discount systems**:

1. **Admin-managed general discount codes** (like a promo code) - entirely new, needs its own entity `Discount` (code, percent/amount, validFrom/validTo, usageLimit) and admin CRUD under `/admin/discounts`.
2. **Doctor-to-patient discounts** - already built, just needs its routes moved/aliased to `/doctors/discounts` prefix to match spec.

**Mobile app check:** confirmed - patient-facing discount browsing/apply/validate is entirely unbuilt in the app. `grep -i discount` across `app/src` only turns up plain numeric price fields already baked into product/order/cart types (`productsApi.ts:13` discount?, `ordersApi.ts:11,21` discount/discountAmount, `cartApi.ts:12` discountPrice) - these are unrelated to the discounts module. Full freedom to rename/build the entire `/discounts/*` and `/admin/discounts` surface, no frontend coordination needed.

**Build:**

1. New `Discount` entity + admin CRUD (`/admin/discounts`, `AdminGuard` - check how other admin routes in `src/admin/` are guarded and copy that pattern).
2. `GET /discounts/available` - JWT, returns active discount codes + any doctor-granted discount for that user.
3. `POST /discounts/validate` - JWT, body `{ code }`, returns discount details or 404 if invalid/expired.
4. `POST /discounts/apply` - JWT, body `{ code, appointmentId }`, applies the discount at booking time - this should be called from inside the booking flow (1.2), not standalone.
5. `GET /discounts/my` - JWT, list of discounts the user has used.

---

#### 1.5B Prescription Module - MISSING (entire module)

No `src/prescriptions/` folder, no entity. Only a leftover free-text `prescription?: string` column on Appointment - not usable for structured prescriptions (medicines, dosage, attachments).

**Build:**

- **Entity** `Prescription`: `id`, `appointmentId`, `doctorId`, `patientId`, `medicines` (jsonb: `[{name, dosage, duration, notes}]`), `attachmentUrl` (nullable), `sentAt` (nullable), `createdAt`, `updatedAt`.
- `POST /prescriptions` - JWT+Doctor, body `{ appointmentId, medicines: [...] }`. Verify the doctor owns the appointment before creating.
- `GET /prescriptions/:appointmentId` - JWT, either the doctor or the patient on that appointment can view (check ownership both ways).
- `GET /prescriptions/patient/:patientId` - JWT, doctor viewing a patient's history, or the patient viewing their own.
- `PUT /prescriptions/:id` - JWT+Doctor, only the creating doctor can edit.
- `POST /prescriptions/:id/attachment` - JWT+Doctor, file upload (reuse the Cloudinary module, `src/cloudinary/`, same pattern as other file uploads in the codebase).
- `POST /prescriptions/:id/send` - JWT+Doctor, sets `sentAt = now()`, triggers a notification to the patient (reuse `src/notifications/` service, same pattern as appointment notifications).

**Depends on:** Patient module (1.6B) for patientId resolution if patients become a dedicated concept - otherwise just use the appointment's userId.

---

#### 1.6B Patient Module - MISSING (entire module)

No `src/patients/` folder, no `/patients` routes anywhere. Right now "patients" are implicitly just Animal records or User accounts depending on context - there is no unified patient concept.

> **Before building** - clarify with the team: is a "patient" a livestock Animal, or a human dependent of a User (e.g. family member profile), or both? The requirements doc doesn't say. Check the Figma screens this maps to before writing the entity - guessing wrong here means rebuilding Prescription/Lab Tests/Vaccination/Consultation modules too since they all key off `patientId`.

**Build (once clarified):**

- **Entity** `Patient`: `id`, `ownerId` (FK -> users), `name`, `type` (human/animal), `dateOfBirth` or `age`, `species` (if animal), `notes`, `createdAt`.
- `GET /patients` - JWT, list current user's patients.
- `GET /patients/:id` - JWT, owner-only.
- `POST /patients` - JWT.
- `PUT /patients/:id` - JWT, owner-only.
- `DELETE /patients/:id` - JWT, owner-only. Consider soft-delete if prescriptions/lab tests reference this patient - don't hard-delete records with FK dependents.
- `GET /patients/search?q=` - JWT+Doctor, search across patients the doctor has an appointment history with (don't let doctors search all patients in the system - privacy issue).

---

#### 1.7B Doctor Working Hours Module - PARTIAL (exists as /availability, wrong path, no single-day PATCH)

`doctors.controller.ts` already has `GET /doctors/:id/availability` (public) and `POST /doctors/:id/availability` (doctor, full bulk replace).

**Mobile app check:** confirmed - this one IS wired in. `app/src/store/doctorPortalApi.ts:89-90` (`getAvailability`) and `:97-98` (`setAvailability`) both call `/doctors/${doctorId}/availability` (GET/POST), used by the doctor-availability screen via `useGetAvailabilityQuery`/`useSetAvailabilityMutation`. Response type there:

```typescript
interface AvailabilityEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  bufferMinutes?: number;
}

interface Availability extends AvailabilityEntry {
  id: number;
  doctorId: number;
  isActive: boolean;
}
```

> **Do not rename this path without updating the app.** If you rename to `/working-hours`, you must also change `app/src/store/doctorPortalApi.ts:89-98` in the same PR (or coordinate a mobile release), otherwise the doctor-availability screen breaks. Keeping `/availability` as-is and just adding the missing single-day PATCH route is the lower-risk option - recommend that unless the team specifically wants the rename.

**To do:**

Keep `/availability` path (see note above) unless coordinating a frontend change, and add `PATCH /doctors/:id/working-hours/:dayId` - update a single day's hours without resending the whole week. Needs the availability rows to have addressable ids exposed (they already have `id` as PK - just need a route for it). If you do rename the base path, keep `AvailabilityEntry`'s shape (`dayOfWeek`, `startTime`, `endTime`, `slotDurationMinutes`, `bufferMinutes`) unchanged so the app's types still match.

---

#### 1.8B Doctor Block Time Module - PARTIAL (exists as /time-off, wrong path, fee-calc not standalone)

**Folder:** `src/time-off/` (exists), controller `@Controller('doctors/:id/time-off')`, doctor-only for the whole controller.

| Required | Actual | Status |
|----------|--------|--------|
| `GET /doctors/:id/block-times` (Public) | `GET /doctors/:id/time-off` - guarded, not public | PARTIAL |
| `POST /doctors/:id/block-times` | `POST /doctors/:id/time-off` - has real conflict-detection + fee-estimate + force-cancel-and-refund logic | PARTIAL - good logic, wrong path |
| `DELETE /doctors/:id/block-times/:blockId` | `DELETE /doctors/:id/time-off/:timeOffId` | PARTIAL |
| `GET /doctors/:id/block-times/calculate-fee` | not a standalone route - folded into the POST's conflict response | MISSING |

**Mobile app check:** confirmed - not integrated at all. `grep` for `time-off`, `time_off`, `timeoff`, `block-time` across `app/src` returns zero hits. Safe to rename freely.

**To do:**

1. Rename `time-off` -> `block-times` in the route paths.
2. Make GET public (remove the doctor-only guard from the list endpoint - patients need to see blocked dates before booking).
3. Extract fee calculation into its own `GET /doctors/:id/block-times/calculate-fee?appointmentId=` so Appointment cancel logic (1.2) can call it independently instead of only getting a fee estimate as a side effect of creating a block.

> This module already has the best logic of anything in the new modules - just needs path/visibility fixes. Use its fee-calculation approach as the reference implementation for 1.2's cancellation fee logic.

---

#### 1.9B Lab Tests Module - MISSING (as spec'd)

No `src/lab-tests/` folder. MedicalEvent entity (`src/medical-events/`) has a `LAB_TEST` type value with a generic jsonb `data` column, reachable only via `/animals/:id/medical-events` - not the dedicated routes the spec wants, and there's no single-record GET.

> **Decision needed:** extend the existing generic medical-events module with lab-test-specific fields/routes, or build `src/lab-tests/` as a fully separate module? Given MedicalEvent already models this reasonably (type enum + jsonb data), recommend extending it rather than duplicating - add the missing single-GET route and, if the frontend truly needs `/lab-tests/*` paths, add thin wrapper routes in a new controller that delegate to the same service. Confirm this call with the team before building - don't duplicate the whole entity.

- `GET /lab-tests/patient/:patientId` - JWT.
- `POST /lab-tests` - JWT+Doctor.
- `PUT /lab-tests/:id` - JWT+Doctor.
- `GET /lab-tests/:id` - JWT (currently missing even on the generic medical-events controller - add it there regardless of which path decision is made).

---

#### 1.10B Vaccination Records Module - MISSING (as spec'd)

Same situation as Lab Tests - MedicalEvent.type has `VACCINATION`, reachable only through the generic route. No DELETE exists on medical-events at all.

- `GET /vaccinations/animal/:animalId` - JWT.
- `POST /vaccinations` - JWT+Doctor.
- `PUT /vaccinations/:id` - JWT+Doctor.
- `DELETE /vaccinations/:id` - JWT+Doctor. Add DELETE to the medical-events service first - it doesn't exist at all right now, any module (vaccinations, lab tests) needing delete is blocked on this.

> Same recommendation as 1.9B: extend medical-events rather than building a parallel entity.

---

#### 1.11B Consultation Records Module - MISSING (entire module)

No `src/consultations/` folder. MedicalEvent has a `CONSULTATION` type and an `ONGOING`/`COMPLETED` status enum (hinting this was planned), but no routes use it that way.

- `GET /consultations/patient/:patientId` - JWT.
- `GET /consultations/:id` - JWT.
- `PUT /consultations/:id` - JWT+Doctor.
- `POST /consultations/:id/end` - JWT+Doctor, sets status to `COMPLETED`.

> This overlaps with 1.22B (Consultation End) - build them together. A consultation record should be created automatically when a doctor ends an appointment (see 1.22B), not created manually by the doctor as a separate step, unless the spec means something different - confirm with team.

---

#### 1.12B Calendar Module - MISSING (entire module, 0/4 endpoints)

No `src/calendar/` folder, nothing calendar-shaped in doctors or appointments controllers.

- `GET /calendar/doctor/:doctorId?month=&year=` - JWT, returns appointments + block-times grouped by day for that month.
- `GET /calendar/doctor/:doctorId/week?date=` - JWT, same but for the week containing `date`.
- `GET /calendar/appointments?date=&view=day|week|month` - JWT, current user's own appointments (patient or doctor) grouped by the requested view.
- `GET /calendar/badges?month=&year=` - JWT, per-day counts (e.g. `{ "2026-08-15": { appointments: 3, tasks: 1 } }`) for calendar UI dots/badges.

> This is a read/aggregation layer over Appointments + Tasks + Block Times - no new entity needed, just query and group existing data. Build this last among the new modules since it depends on Appointments (1.2), Block Time (1.8B), and Tasks (1.4) all being in their final shape.

---

#### 1.13B Subscription Module - MISSING (entire module, 0/5 endpoints)

No `src/subscriptions/` folder.

- **Entity** `SubscriptionPlan`: `id`, `name`, `price`, `durationDays`, `features` (jsonb).
- **Entity** `UserSubscription`: `id`, `userId`, `planId`, `startDate`, `endDate`, `status` (active/cancelled/expired).
- `GET /subscriptions/plans` - Public.
- `GET /subscriptions/my` - JWT.
- `POST /subscriptions/subscribe` - JWT, body `{ planId, paymentMethodId }` - ties into Payment Methods (1.2B) / bKash (1.3B) for payment.
- `POST /subscriptions/cancel` - JWT.
- `GET /admin/subscriptions` - JWT+Admin, list all.

---

#### 1.14B FAQ / Help Module - MISSING (entire module, 0/5 endpoints)

No `src/faqs/` folder, not wired into `AdminModule`.

- **Entity** `Faq`: `id`, `question`, `answer`, `category`, `order`.
- `GET /faqs` - Public, list (support `?category=` filter).
- `GET /faqs/:id` - Public.
- `POST /admin/faqs`, `PUT /admin/faqs/:id`, `DELETE /admin/faqs/:id` - JWT+Admin. Register the controller in `src/admin/admin.module.ts` alongside the existing admin sub-controllers - copy the pattern from an existing one (e.g. how Alerts or Orders admin routes are wired).

---

#### 1.15B Support Tickets Module - MISSING (entire module, 0/6 endpoints)

No `src/support/` folder.

- **Entity** `SupportTicket`: `id`, `userId`, `subject`, `status` (open/in-progress/closed), `createdAt`.
- **Entity** `SupportTicketReply`: `id`, `ticketId`, `authorId`, `message`, `createdAt`.
- `POST /support/tickets` - JWT.
- `GET /support/tickets` - JWT, current user's own tickets only.
- `GET /support/tickets/:id` - JWT, owner or admin only.
- `POST /support/tickets/:id/reply` - JWT, owner or admin.
- `GET /admin/support/tickets` - JWT+Admin, all tickets.
- `PATCH /admin/support/tickets/:id` - JWT+Admin, update status.

---

#### 1.16B Notification Preferences Module - MISSING (0/2 endpoints)

`src/notifications/notifications.controller.ts` only has `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all`, push-token routes. No preferences entity.

**Mobile app check:** confirmed - `notificationsApi.ts` only calls those same 4 existing routes, nothing for preferences. Safe to build fresh, no coordination needed.

- **Entity** `NotificationPreference`: `id`, `userId`, `appointmentReminders` (bool), `promotions` (bool), `chatMessages` (bool), ... (whatever categories the app has).
- `GET /notifications/preferences` - JWT, create default row on first access if none exists.
- `PUT /notifications/preferences` - JWT.

> Wherever notifications are currently sent (appointment booking, cancellation, prescriptions, etc.), you'll eventually want to check this preference before sending - but that's a bigger cross-cutting change, not required by this endpoint spec. Flag it as a follow-up, don't scope-creep it into this ticket.

---

#### 1.17B Language Preference - MISSING (endpoint + underlying field)

Depends on 1.1 (language field on User).

**Mobile app check:** confirmed - `usersApi.ts` only has `/users/me` GET/PATCH with `UpdateProfileInput { name?, email? }`, no language field anywhere. Safe to add fresh.

- `PATCH /users/me/language` - JWT, body `{ language: 'en' | 'bn' }`, validate against an allow-list (`@IsIn(['en','bn'])`), reject anything else with 400.

Add to `users.controller.ts` next to the existing `PATCH /users/me`. Keep it a separate endpoint (don't fold into generic profile update) - the spec explicitly calls it out on its own, likely because the frontend has a dedicated language switcher that shouldn't require sending the whole profile payload.

---

#### 1.18B Fields Module - MISSING (entire module, 0/4 endpoints)

No `src/fields/` folder. This is a farm field (a plot of land), unrelated to the `category: 'field'` tag being added to Tasks (1.4) - don't conflate the two.

- **Entity** `Field`: `id`, `userId`, `name`, `sizeAcres`, `cropType` (nullable), `location` (nullable), `createdAt`.
- `GET /fields` - JWT, current user's fields.
- `POST /fields` - JWT.
- `PUT /fields/:id` - JWT, owner-only.
- `DELETE /fields/:id` - JWT, owner-only.

Straightforward CRUD, follow the same pattern as `src/livestock/` or `src/animals/` (owner-scoped resource module) - copy that module's structure as your starting point.

---

#### 1.19B Market Rates Module - MISSING (entire module, 0/3 endpoints)

No `src/market-rates/` folder.

- **Entity** `MarketRate`: `id`, `commodity`, `price`, `unit`, `date`, `region` (nullable).
- `GET /market-rates` - Public, today's rates (or latest per commodity).
- `GET /market-rates/history?commodity=` - Public, time series for one commodity.
- `POST /admin/market-rates` - JWT+Admin, add/update a rate entry.

---

#### 1.20B Badges / Achievements Module - MISSING (entire module, 0/2 endpoints)

No `src/badges/` folder. Not related to Doctor Block Time (also sometimes called "block-time badges" informally) or Calendar badges (1.12B, which are day-count dots, a different meaning of "badge") - this is a gamification/achievement feature. Don't merge these three concepts.

- **Entity** `Badge`: `id`, `name`, `description`, `icon`, `criteria` (jsonb, e.g. `{ type: 'appointments_completed', threshold: 10 }`).
- **Entity** `UserBadge`: `id`, `userId`, `badgeId`, `earnedAt`.
- `GET /badges/me` - JWT, badges the current user has earned.
- `GET /badges/available` - Public, all badges that exist (so the app can show locked/unlocked state).

> Awarding logic (checking criteria and inserting `UserBadge` rows) isn't specified as an endpoint - it'll be triggered internally from other services (e.g. after `completeAppointment`). Keep that out of scope unless asked; just build the two read endpoints and the schema for now.

---

#### 1.21B Video Call Module — ✅ BUILT

`src/video-call/` folder created. Provider: Agora (`agora-token` package).

- **Entity** `VideoSession`: `id` (serial), `appointmentId`, `channelName`, `status` (WAITING/ACTIVE/ENDED), `doctorUserId`, `patientId`, `startedAt`, `endedAt`, `createdAt`, `updatedAt`.
- `POST /video-call/create` - JWT+Doctor, creates a session tied to an appointment.
- `POST /video-call/join/:appointmentId` - JWT, returns Agora token + channel + appId (validates requester is doctor or patient).
- `POST /video-call/end/:appointmentId` - JWT, ends session.
- `GET /video-call/token/:appointmentId` - JWT, returns a fresh Agora token for reconnection.
- `POST /doctors/bookings/:id/join` - Now returns real Agora token + channel info (was placeholder fake URL).

---

#### 1.22B Consultation End - MISSING (wrong path/verb, missing consultation-record creation)

**Spec:** `POST /doctors/bookings/:id/end` (JWT+Doctor) - marks appointment complete AND creates a consultation record.

**Actual:** `PATCH /doctors/bookings/:id/complete` exists (`appointments.controller.ts`, guards correct: JWT+Doctor), calls `completeAppointment()` which only sets `status = COMPLETED` and sends a notification. No consultation record is created - because the Consultations module (1.11B) doesn't exist yet.

**Mobile app check:** confirmed - this one IS wired in. `app/src/store/doctorPortalApi.ts:70-72` (`completeBooking`) calls `PATCH /doctors/bookings/${id}/complete`, exported as `useCompleteBookingMutation` and used from the doctor-bookings screen. Response type `DoctorAppointment` (`id`, `doctorId`, `patientId`, `patientName?`, `patientPhone?`, `startAt`, `endAt`, `status`, `createdAt`). Renaming this path requires a matching change in `app/src/store/doctorPortalApi.ts:70-72` in the same PR - it's a real dependency, not a maybe.

**To do:**

1. Build Consultations module (1.11B) first.
2. Recommend keeping `PATCH .../complete` as the route (lower risk, already working end to end) and just adding the consultation-record creation inside it, rather than renaming to `POST .../end` - the verb/path rename buys nothing functionally and forces a coordinated mobile release. If the team insists on matching the spec's path exactly, update `doctorPortalApi.ts:70-72` in the same PR.
3. Inside the handler, after setting status to completed, create a `Consultation`/`MedicalEvent` record with `status: COMPLETED`, linked to the appointment. Keep the `DoctorAppointment` response shape unchanged so the app doesn't break.

---

## 2. Already-Working Endpoints You Can Build On

Nothing new is fully spec-compliant, but these are real, working features worth reusing as reference implementations or extending in place instead of rebuilding:

- **Doctor Block Time (1.8B, as `src/time-off/`)** - has the best logic of any new module: conflict detection, fee estimate, force-cancel-with-refund. Use its wallet-refund pattern for Appointment cancel fee logic (1.2).
- **Wallet balance adjustment** (`WalletService.adjustBalance`) - works, just needs public endpoints wrapped around it.
- **Discount (doctor -> patient) (1.4B)** - fully working feature, just needs correct route prefixes, don't rebuild it.
- **MedicalEvent module** (`src/medical-events/`) - generic entity already supports `LAB_TEST`, `VACCINATION`, `CONSULTATION` types via one flexible schema. Strongly consider extending this instead of building three separate modules (1.9B, 1.10B, 1.11B) from scratch.
- **Cloudinary upload pattern** (`src/cloudinary/`) - reuse for prescription attachments (1.5B), doctor verification documents (1.1), profile photos (1.1).
- **Notifications service** (`src/notifications/`) - reuse for prescription "send", support ticket replies, subscription events, etc. Don't write a second notification pathway.

---

## 3. Requirements That Don't Need a New Endpoint

- **Dependency Order section (Part 0, bottom)** - this is a build-sequence guide for you, not a feature. Follow it, but there's nothing to implement from it directly.
- **User entity field additions (1.1)** - pure schema change, no new route. The existing `PATCH /users/me` should be extended to accept the new fields (except language, which gets its own endpoint per 1.17B, and `isDoctorVerified`/`verificationDocuments`, which should only be settable via an admin/doctor-verification flow, not by the user themselves).
- **Appointment entity field additions (1.2)** - schema change consumed by existing cancel/book logic, no standalone route.
- **Doctor Availability field additions (1.3)** - schema change consumed by the existing `/doctors/:id/availability` (or renamed `/working-hours`) endpoints.
- **Task entity field additions (1.4)** - schema change, existing task endpoints just need to accept/return the new fields.

---

## 4. Inconsistencies Found (flag these before building blindly)

- **`verified` vs `isDoctorVerified` on User** - the entity already has `verified: boolean` for OTP validation (phone/email verification at signup). Use `isDoctorVerified` (not `isVerified`) for the new doctor verification field so the name itself prevents mixing the two up. Audit all usages of `verified` first.
- **`followUpId` vs `followUpDate` on Appointment** - existing field links to another appointment record; spec wants a plain date. These are different concepts with a similar name - don't accidentally repurpose the wrong one.
- **`cancellationNote` vs `cancellationReason` on Appointment** - check if these are meant to be the same field renamed, or two different fields (a free-text note plus a categorized reason). Confirm with whoever wrote the requirements doc.
- **Coins concept doesn't exist anywhere** - Wallet requirements assume a coins balance separate from cash balance, and Appointment booking mentions "apply coins" - none of this exists in the codebase today. This is new, not a rename.
- **"Patient" is undefined** - the codebase has no Patient entity. Sometimes "patient" means an Animal, sometimes a User. The Prescription, Lab Tests, Vaccination, Consultation, and Patient modules all take a `patientId` - resolve what a patient actually is (1.6B) before building any of those four modules, or you'll build them against the wrong foreign key.
- **Doctor Block Time** is called `time-off` in code but `block-times` in spec - confirmed safe to rename, app doesn't call it. Working Hours (`availability` vs `working-hours`) is different - confirmed the app DOES call `/doctors/:id/availability` (`app/src/store/doctorPortalApi.ts:89-98`). Recommend keeping `/availability` as the path and just adding the missing single-day PATCH, instead of renaming - see section 1.7B.
- **`/doctors/bookings/:id/join`** (video call placeholder) - Now returns real Agora token + channel info. `video-call.tsx` frontend still needs to be wired up to use the new endpoints.
- **Two different meanings of "badge"** in the spec - Calendar badges (1.12B, day-count dots) and Badges/Achievements (1.20B, gamification) are unrelated features that happen to share a name. Don't build one when the ticket says the other.
- **`PATCH /doctors/bookings/:id/complete`** vs spec's `POST .../end` - confirmed the app calls the existing complete path (`doctorPortalApi.ts:70-72`, `useCompleteBookingMutation`). Recommend keeping the path and just adding consultation-record creation to it (see 1.22B), rather than renaming and forcing a coordinated mobile release for no functional gain.

---

## 5. Suggested Build Order

Matches the requirements doc's dependency order, adjusted for what's actually missing vs partial:

1. User entity fields (1.1) - audit `verified`/`isDoctorVerified` collision first.
2. Doctor Availability overrides (1.3).
3. Task categories (1.4) - independent, do whenever.
4. Patient concept clarification (1.6B) - blocks Prescription, Lab Tests, Vaccination, Consultation. Get this answered early.
5. Wallet fixes + coins (1.1B).
6. Payment Methods (1.2B) + bKash (1.3B).
7. Appointment entity fields + cancel/book logic (1.2) - needs Wallet (1.1B) and Block Time fee-calc (1.8B) done first.
8. Discount module fixes (1.4B).
9. Prescription (1.5B), Lab Tests (1.9B), Vaccination (1.10B), Consultation (1.11B) - extend MedicalEvent, don't duplicate.
10. Doctor Working Hours (1.7B) + Block Time path fixes (1.8B).
11. Calendar (1.12B) - needs 7, 8, 1.4 done.
12. Consultation End (1.22B) - needs 1.11B done.
13. Subscription (1.13B), Support/FAQ (1.14B, 1.15B), Notification Preferences (1.16B), Language (1.17B).
14. Fields (1.18B), Market Rates (1.19B), Badges (1.20B).
15. Video Call (1.21B) - blocked on provider decision from the team.
