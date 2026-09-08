# Gobadi Backend API Documentation

Base URL: `http://localhost:3000`

All authenticated endpoints require `Authorization: Bearer <token>` header.

Roles: `USER`, `DOCTOR`, `CLINIC`, `ADMIN`

---

## Table of Contents

1. [Auth](#auth)
2. [Users](#users)
3. [Addresses](#addresses)
4. [Animals](#animals)
5. [Doctors](#doctors)
6. [Clinics](#clinics)
7. [Services](#services)
8. [Appointments](#appointments)
9. [Products](#products)
10. [Livestock](#livestock)
11. [Cart](#cart)
12. [Wishlist](#wishlist)
13. [Orders](#orders)
14. [Payments](#payments)
15. [Wallet](#wallet)
16. [Payment Methods](#payment-methods)
17. [Discounts](#discounts)
18. [Prescriptions](#prescriptions)
19. [Calendar](#calendar)
20. [Subscriptions](#subscriptions)
21. [FAQs](#faqs)
22. [Support Tickets](#support-tickets)
23. [Fields](#fields)
24. [Market Rates](#market-rates)
25. [Badges](#badges)
26. [Block Times](#block-times)
27. [Delivery](#delivery)
28. [Chat](#chat)
29. [Reviews](#reviews)
30. [Referrals](#referrals)
31. [AI Diagnosis](#ai-diagnosis)
32. [Medical Records](#medical-records)
33. [Alerts](#alerts)
34. [Notifications](#notifications)
35. [Tasks](#tasks)
36. [Search](#search)
37. [Weather](#weather)
38. [Admin](#admin)
39. [Health](#health)

---

## Auth

Rate limited: 10 requests/minute.

### POST `/auth/register`

Create a new account.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "name": "string",
    "identifier": "string (email or phone)",
    "password": "string (min 8 chars)",
    "role": "USER | DOCTOR | CLINIC | ADMIN"
  }
  ```
- **Response:** `{ user, accessToken, refreshToken }`

### POST `/auth/login`

Log in with credentials.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "identifier": "string (email or phone)",
    "password": "string"
  }
  ```
- **Response:** `{ user, accessToken, refreshToken }`

### POST `/auth/send-otp`

Send OTP code to phone/email for login, verification, or password reset.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "phone": "string (email or phone)",
    "purpose": "login | verify | reset (optional)"
  }
  ```
- **Response:** `{ success: true }`

### POST `/auth/verify-otp`

Verify OTP and receive session token.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "phone": "string",
    "code": "string",
    "purpose": "login | verify | reset (optional)"
  }
  ```
- **Response:** `{ user, accessToken, refreshToken }`

### POST `/auth/forgot-password`

Request a password reset OTP.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "identifier": "string (email or phone)"
  }
  ```
- **Response:** `{ success: true }`

### POST `/auth/reset-password`

Reset password using verified reset token.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "resetToken": "string",
    "newPassword": "string (min 8 chars)"
  }
  ```
- **Response:** `{ success: true }`

### POST `/auth/oauth/google`

Login or register via Google ID token.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "idToken": "string"
  }
  ```
- **Response:** `{ user, accessToken, refreshToken }`

### POST `/auth/oauth/facebook`

Login or register via Facebook access token.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "accessToken": "string"
  }
  ```
- **Response:** `{ user, accessToken, refreshToken }`

### POST `/auth/refresh`

Exchange refresh token for new token pair.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:** `{ accessToken, refreshToken }`

### POST `/auth/logout`

Revoke a refresh token.

- **Roles:** Public
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:** `{ success: true }`

---

## Users

### GET `/users/me`

Get current user's profile.

- **Roles:** Any authenticated
- **Response:** `User` object (without password)

### PATCH `/users/me`

Update current user's profile.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "name": "string (optional)",
    "email": "string (optional)",
    "profilePhoto": "string (optional)",
    "dateOfBirth": "ISO date (optional)",
    "bloodGroup": "string (optional)",
    "allergies": "string (optional)",
    "emergencyContactName": "string (optional)",
    "emergencyContactPhone": "string (optional)"
  }
  ```
- **Response:** Updated `User` object

### PATCH `/users/me/language`

Update preferred language.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "language": "en | bn"
  }
  ```
- **Response:** `{ language: string }`

---

## Addresses

### GET `/addresses`

List current user's addresses.

- **Roles:** Any authenticated
- **Response:** `Address[]`

### GET `/addresses/:id`

Get single address by ID.

- **Roles:** Any authenticated (own only)
- **Response:** `Address`

### POST `/addresses`

Create a new address.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "label": "string",
    "contactName": "string",
    "phone": "string",
    "division": "string",
    "district": "string",
    "upazila": "string",
    "postalCode": "string",
    "latitude": "number (optional)",
    "longitude": "number (optional)",
    "isDefault": "boolean (optional)"
  }
  ```
- **Response:** `Address`

### PUT `/addresses/:id`

Update an address.

- **Roles:** Any authenticated (own only)
- **Request Body:** Same as create, all fields optional
- **Response:** `Address`

### DELETE `/addresses/:id`

Delete an address.

- **Roles:** Any authenticated (own only)
- **Response:** `void`

---

## Animals

### GET `/animals`

List current user's animals.

- **Roles:** Any authenticated
- **Query Params:** `page`, `limit`, `breed`
- **Response:** `Animal[]` or `PaginatedResult<Animal>`

### GET `/animals/:id`

Get animal by ID.

- **Roles:** Any authenticated (own only)
- **Response:** `Animal`

### POST `/animals`

Add a new animal.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "name": "string",
    "breed": "string",
    "weight": "string",
    "age": "string",
    "color": "string",
    "image": "string (optional)"
  }
  ```
- **Response:** `Animal`

### PATCH `/animals/:id`

Update animal details.

- **Roles:** Any authenticated (own only)
- **Request Body:** Same as create, all fields optional
- **Response:** `Animal`

### DELETE `/animals/:id`

Delete an animal.

- **Roles:** Any authenticated (own only)
- **Response:** `{ success: true }`

---

## Doctors

### GET `/doctors`

List all doctors.

- **Roles:** Public
- **Query Params:** `page`, `limit`, `specialty`
- **Response:** `Doctor[]` or `PaginatedResult<Doctor>`

### GET `/doctors/me`

Get current logged-in doctor's own profile.

- **Roles:** `DOCTOR`
- **Response:** `Doctor`

### GET `/doctors/:id`

Get doctor by ID.

- **Roles:** Public
- **Response:** `Doctor`

### GET `/doctors/:id/availability`

Get doctor's weekly availability schedule.

- **Roles:** Public
- **Response:** `Availability[]`

### POST `/doctors/:id/availability`

Replace doctor's weekly availability (own profile only).

- **Roles:** `DOCTOR`
- **Request Body:**
  ```json
  {
    "entries": [
      {
        "dayOfWeek": "number (0-6, Sunday=0)",
        "startTime": "string (HH:mm)",
        "endTime": "string (HH:mm)",
        "slotDurationMinutes": "number (optional, min 5)",
        "bufferMinutes": "number (optional, min 0)"
      }
    ]
  }
  ```
- **Response:** `Availability[]`

### PATCH `/doctors/:id/availability/:dayId`

Update a single day's availability (doctor only).

- **Roles:** `DOCTOR`
- **Request Body:**
  ```json
  {
    "startTime": "string (HH:mm, optional)",
    "endTime": "string (HH:mm, optional)",
    "slotDurationMinutes": "number (optional)",
    "bufferMinutes": "number (optional)",
    "isActive": "boolean (optional)"
  }
  ```
- **Response:** `Availability`

---

## Clinics

### GET `/clinics`

List all clinics.

- **Roles:** Public
- **Query Params:** `page`, `limit`
- **Response:** `Clinic[]` or `PaginatedResult<Clinic>`

### GET `/clinics/:id`

Get clinic details by ID.

- **Roles:** Public
- **Response:** `Clinic`

### POST `/clinics`

Create a new clinic profile.

- **Roles:** `CLINIC`, `ADMIN`
- **Request Body:**
  ```json
  {
    "name": "string",
    "location": "string",
    "description": "string",
    "businessHours": "object (optional)",
    "avatar": "string (optional)"
  }
  ```
- **Response:** `Clinic`

### PUT `/clinics/:id`

Update clinic profile.

- **Roles:** Any authenticated (owner/admin)
- **Request Body:** Same as create, all fields optional
- **Response:** `Clinic`

### PATCH `/clinics/:id/verify`

Verify or unverify a clinic.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "isVerified": "boolean"
  }
  ```
- **Response:** `Clinic`

### POST `/clinics/:id/doctors`

Add doctor association to clinic.

- **Roles:** Any authenticated (owner/admin)
- **Request Body:**
  ```json
  {
    "doctorId": "number"
  }
  ```
- **Response:** `Clinic`

### DELETE `/clinics/:id/doctors/:doctorId`

Remove doctor from clinic.

- **Roles:** Any authenticated (owner/admin)
- **Response:** `Clinic`

---

## Services

### GET `/services`

List all active consulting services.

- **Roles:** Public
- **Query Params:** `providerType`, `providerId`
- **Response:** `Service[]`

### GET `/services/:id`

Get service details by ID.

- **Roles:** Public
- **Response:** `Service`

### POST `/services`

Create a new consulting service.

- **Roles:** `DOCTOR`, `CLINIC`, `ADMIN`
- **Request Body:**
  ```json
  {
    "providerType": "DOCTOR | CLINIC",
    "providerId": "number",
    "name": "string",
    "description": "string",
    "durationMinutes": "number (min 5)",
    "price": "number (min 0)",
    "preparationInstructions": "string (optional)",
    "requirements": "string (optional)",
    "isOnline": "boolean (optional)",
    "isOffline": "boolean (optional)",
    "location": "string (optional)",
    "cancellationPolicy": "string (optional)",
    "isRecurring": "boolean (optional)"
  }
  ```
- **Response:** `Service`

### PUT `/services/:id`

Update service details.

- **Roles:** `DOCTOR`, `CLINIC`, `ADMIN`
- **Request Body:** Same as create, all fields optional
- **Response:** `Service`

### DELETE `/services/:id`

Deactivate a service.

- **Roles:** `DOCTOR`, `CLINIC`, `ADMIN`
- **Response:** `void`

---

## Appointments

### GET `/doctors/:id/slots`

List available booking slots for a doctor on a given date.

- **Roles:** Public
- **Query Params:** `date` (YYYY-MM-DD)
- **Response:** `string[]` (list of available times)

### POST `/doctors/book`

Book an appointment slot with a doctor.

- **Roles:** `USER`
- **Request Body:**
  ```json
  {
    "doctorId": "string",
    "date": "string (YYYY-MM-DD)",
    "time": "string (HH:mm)",
    "clinicId": "number (optional)",
    "serviceId": "number (optional)"
  }
  ```
- **Response:** `Appointment`

### GET `/doctors/bookings/all`

List current user's appointments. Patients see own bookings; doctors see their bookings.

- **Roles:** Any authenticated
- **Response:** `AppointmentWithPatient[]`

### PATCH `/doctors/bookings/:id/reschedule`

Reschedule an appointment (must be >2h before start).

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "date": "string (YYYY-MM-DD)",
    "time": "string (HH:mm)"
  }
  ```
- **Response:** `Appointment`

### PATCH `/doctors/bookings/:id/cancel`

Cancel an appointment (must be >2h before start).

- **Roles:** Any authenticated
- **Response:** `Appointment`

### PATCH `/doctors/bookings/:id/complete`

Mark appointment as completed.

- **Roles:** `DOCTOR`
- **Response:** `Appointment`

---

## Products

### GET `/products`

List product catalog.

- **Roles:** Public
- **Query Params:** `page`, `limit`, `categoryId`, `brandId`
- **Response:** `Product[]` or `PaginatedResult<Product>`

### GET `/products/categories`

List all product categories.

- **Roles:** Public
- **Response:** `Category[]`

### POST `/products/categories`

Create a product category.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "name": "string",
    "slug": "string",
    "description": "string (optional)"
  }
  ```
- **Response:** `Category`

### GET `/products/brands`

List all product brands.

- **Roles:** Public
- **Response:** `Brand[]`

### POST `/products/brands`

Create a product brand.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "name": "string",
    "slug": "string",
    "description": "string (optional)"
  }
  ```
- **Response:** `Brand`

### GET `/products/search`

Search active products.

- **Roles:** Public
- **Query Params:** `q` (search text), `categoryId` (optional)
- **Response:** `Product[]`

### GET `/products/:id`

Get product details by ID.

- **Roles:** Public
- **Response:** `Product`

### POST `/products`

Create a new product.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "sku": "string",
    "barcode": "string (optional)",
    "name": "string",
    "description": "string",
    "price": "number (min 0)",
    "discount": "number (optional)",
    "brandId": "number (optional)",
    "categoryId": "number (optional)",
    "specifications": "object (optional)",
    "instructions": "string (optional)",
    "images": "string[] (optional)",
    "videos": "string[] (optional)",
    "documents": "string[] (optional)",
    "seoTitle": "string (optional)",
    "seoDescription": "string (optional)",
    "seoKeywords": "string (optional)",
    "status": "DRAFT | ACTIVE | ARCHIVED (optional)",
    "visibility": "boolean (optional)",
    "isPrescriptionRequired": "boolean (optional)"
  }
  ```
- **Response:** `Product`

### PUT `/products/:id`

Update a product.

- **Roles:** `ADMIN`
- **Request Body:** Same as create, all fields optional
- **Response:** `Product`

### DELETE `/products/:id`

Delete a product.

- **Roles:** `ADMIN`
- **Response:** `void`

### GET `/products/:id/stock`

Get current stock level for a product.

- **Roles:** Public
- **Response:** `{ productId: number, stock: number }`

### POST `/products/:id/stock`

Add inventory stock for a product.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "quantity": "number",
    "batchNumber": "string (optional)",
    "expiryDate": "string (optional, ISO date)"
  }
  ```
- **Response:** `{ success: true }`

---

## Livestock

### GET `/livestock`

List active livestock listings.

- **Roles:** Public
- **Query Params:** `page`, `limit`, `species`, `breed`
- **Response:** `Livestock[]` or `PaginatedResult<Livestock>`

### GET `/livestock/featured`

List top featured livestock listings.

- **Roles:** Public
- **Response:** `Livestock[]`

### GET `/livestock/search`

Search livestock listings.

- **Roles:** Public
- **Query Params:** `q` (search text), `species` (optional)
- **Response:** `Livestock[]`

### GET `/livestock/my`

List current seller's own listings.

- **Roles:** Any authenticated
- **Response:** `Livestock[]`

### GET `/livestock/:id`

Get livestock listing details.

- **Roles:** Public
- **Response:** `Livestock`

### POST `/livestock`

Create a new livestock listing.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "species": "string",
    "breed": "string",
    "age": "string",
    "weight": "number (min 0)",
    "gender": "string",
    "vaccinationHistory": "object (optional)",
    "medicalHistory": "object (optional)",
    "healthStatus": "string",
    "pregnancyStatus": "string (optional)",
    "certification": "string (optional)",
    "farmName": "string",
    "location": "string",
    "images": "string[] (optional)",
    "videos": "string[] (optional)",
    "documents": "string[] (optional)",
    "price": "number (min 0)",
    "isNegotiable": "boolean (optional)",
    "status": "ACTIVE | SOLD | RESERVED (optional)"
  }
  ```
- **Response:** `Livestock`

### PUT `/livestock/:id`

Update livestock listing (owner only).

- **Roles:** Any authenticated (owner)
- **Request Body:** Same as create, all fields optional
- **Response:** `Livestock`

### DELETE `/livestock/:id`

Delete livestock listing (owner only).

- **Roles:** Any authenticated (owner)
- **Response:** `void`

### PATCH `/livestock/:id/verify`

Verify or unverify a livestock listing.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "isVerified": "boolean"
  }
  ```
- **Response:** `Livestock`

### PATCH `/livestock/:id/feature`

Set featured status on a listing.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "isFeatured": "boolean"
  }
  ```
- **Response:** `Livestock`

### PATCH `/livestock/:id/reserve`

Reserve or release a livestock listing.

- **Roles:** Any authenticated (owner)
- **Request Body:**
  ```json
  {
    "isReserved": "boolean"
  }
  ```
- **Response:** `Livestock`

### PATCH `/livestock/:id/sold`

Mark listing as sold.

- **Roles:** Any authenticated (owner)
- **Request Body:**
  ```json
  {
    "isSold": "boolean"
  }
  ```
- **Response:** `Livestock`

---

## Cart

### GET `/cart`

Get current user's cart with price and stock validation.

- **Roles:** Any authenticated
- **Response:** `CartSummary`

### POST `/cart/add`

Add a product or livestock item to cart.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "productId": "number (optional)",
    "livestockId": "number (optional)",
    "quantity": "number (optional, min 1)"
  }
  ```
- **Response:** `CartItem`

### PUT `/cart/item/:id`

Update cart item quantity.

- **Roles:** Any authenticated (own cart)
- **Request Body:**
  ```json
  {
    "quantity": "number (min 1)"
  }
  ```
- **Response:** `CartItem`

### DELETE `/cart/item/:id`

Remove item from cart.

- **Roles:** Any authenticated (own cart)
- **Response:** `void`

### DELETE `/cart`

Clear all items from user's cart.

- **Roles:** Any authenticated
- **Response:** `void`

---

## Wishlist

### GET `/wishlist`

Get current user's wishlist.

- **Roles:** Any authenticated
- **Response:** `WishlistItem[]`

### POST `/wishlist`

Add a product or livestock item to wishlist.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "productId": "number (optional)",
    "livestockId": "number (optional)"
  }
  ```
- **Response:** `WishlistItem`

### DELETE `/wishlist/:id`

Remove item from wishlist.

- **Roles:** Any authenticated (own only)
- **Response:** `void`

---

## Orders

### POST `/orders`

Place a new order from the shopping cart.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "addressId": "number",
    "deliveryMethod": "string",
    "deliveryNotes": "string (optional)"
  }
  ```
- **Response:** `Order`

### GET `/orders/my`

Get current user's orders.

- **Roles:** Any authenticated
- **Response:** `Order[]`

### GET `/orders/:id`

Get order details by ID.

- **Roles:** Any authenticated (own orders)
- **Response:** `Order`

### GET `/orders/admin`

List all orders (admin view).

- **Roles:** `ADMIN`
- **Query Params:** `page`, `limit`, `status`
- **Response:** `Order[]` or `PaginatedResult<Order>`

### PATCH `/orders/:id/status`

Update order status.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "status": "PENDING | SHIPPED | DELIVERED | CANCELLED"
  }
  ```
- **Response:** `Order`

---

## Payments

### POST `/payments/intent`

Create a payment intent (returns simulation URLs).

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "amount": "number (min 1)",
    "orderId": "string (optional)",
    "bookingId": "number (optional)",
    "provider": "string (optional)"
  }
  ```
- **Response:** `Transaction`

### GET `/payments/verify/:transactionId`

Verify transaction status.

- **Roles:** Any authenticated
- **Response:** `Transaction`

### POST `/payments/simulate-success`

Gateway simulation: force success status.

- **Roles:** Public (dev/test only)
- **Request Body:**
  ```json
  {
    "transactionId": "string",
    "gatewayTxId": "string (optional)"
  }
  ```
- **Response:** `Transaction`

### POST `/payments/simulate-fail`

Gateway simulation: force fail status.

- **Roles:** Public (dev/test only)
- **Request Body:**
  ```json
  {
    "transactionId": "string"
  }
  ```
- **Response:** `Transaction`

---

## Wallet

### GET `/wallet`

Get current user's wallet balance and coins.

- **Roles:** Any authenticated
- **Response:**
  ```json
  {
    "balance": "number",
    "coins": "number"
  }
  ```

### GET `/wallet/transactions`

List current user's wallet transaction history.

- **Roles:** Any authenticated
- **Query Params:** `page`, `limit`
- **Response:** `WalletTransaction[]`

### POST `/wallet/topup`

Add money to wallet.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "amount": "number (min 0.01)"
  }
  ```
- **Response:** `WalletTransaction`

### POST `/wallet/pay`

Pay from wallet balance.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "amount": "number (min 0.01)",
    "appointmentId": "string (optional)",
    "reason": "string"
  }
  ```
- **Response:** `{ balance: number }`

### POST `/wallet/earn-coins`

Earn coins (internal endpoint).

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "amount": "number (min 1)",
    "reason": "string"
  }
  ```
- **Response:** `{ coins: number }`

### POST `/wallet/spend-coins`

Spend coins (internal endpoint).

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "amount": "number (min 1)",
    "reason": "string"
  }
  ```
- **Response:** `{ coins: number }`

---

## Payment Methods

### GET `/payment-methods`

List current user's saved payment methods.

- **Roles:** Any authenticated
- **Response:** `PaymentMethod[]`

### POST `/payment-methods`

Add a new payment method.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "type": "bkash | card | nagad | rocket",
    "number": "string",
    "isDefault": "boolean (optional)"
  }
  ```
- **Response:** `PaymentMethod`

### PUT `/payment-methods/:id`

Update a payment method (owner only).

- **Roles:** Any authenticated (owner)
- **Request Body:** Same as create, all fields optional
- **Response:** `PaymentMethod`

### DELETE `/payment-methods/:id`

Remove a payment method (owner only).

- **Roles:** Any authenticated (owner)
- **Response:** `void`

### PATCH `/payment-methods/:id/default`

Set a payment method as default (owner only).

- **Roles:** Any authenticated (owner)
- **Response:** `PaymentMethod`

### POST `/payment-methods/:id/verify-otp`

Verify a payment method with OTP.

- **Roles:** Any authenticated (owner)
- **Request Body:**
  ```json
  {
    "otp": "string"
  }
  ```
- **Response:** `PaymentMethod`

---

## Discounts

### GET `/discounts/available`

Get available discount codes for current user.

- **Roles:** Any authenticated
- **Response:** `Discount[]`

### POST `/discounts/validate`

Validate a discount code.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "code": "string"
  }
  ```
- **Response:** `Discount` (with discount details)

### POST `/discounts/apply`

Apply a discount code to an appointment.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "code": "string",
    "appointmentId": "string"
  }
  ```
- **Response:** `{ success: true, discountAmount: number }`

### GET `/discounts/my`

Get current user's discount usage history.

- **Roles:** Any authenticated
- **Response:** `Discount[]`

### POST `/admin/discounts`

Create a discount promo code (admin only).

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "code": "string",
    "percent": "number (optional)",
    "amount": "number (optional)",
    "validFrom": "ISO date",
    "validTo": "ISO date",
    "usageLimit": "number (optional)"
  }
  ```
- **Response:** `Discount`

### PATCH `/admin/discounts/:id`

Update a discount promo code (admin only).

- **Roles:** `ADMIN`
- **Request Body:** Same as create, all fields optional
- **Response:** `Discount`

### DELETE `/admin/discounts/:id`

Delete a discount promo code (admin only).

- **Roles:** `ADMIN`
- **Response:** `void`

### POST `/discounts`

Doctor creates a patient discount.

- **Roles:** `DOCTOR`
- **Request Body:**
  ```json
  {
    "patientId": "number",
    "percent": "number",
    "appointmentId": "string (optional)"
  }
  ```
- **Response:** `PatientDiscount`

### GET `/doctors/me/patients`

Doctor lists patients with discounts.

- **Roles:** `DOCTOR`
- **Response:** `PatientDiscount[]`

---

## Prescriptions

### POST `/prescriptions`

Create a prescription (doctor only).

- **Roles:** `DOCTOR`
- **Request Body:**
  ```json
  {
    "appointmentId": "string",
    "animalId": "number",
    "medicines": [
      {
        "name": "string",
        "dosage": "string",
        "duration": "string",
        "notes": "string (optional)"
      }
    ]
  }
  ```
- **Response:** `Prescription`

### GET `/prescriptions/:appointmentId`

Get prescription by appointment ID.

- **Roles:** Any authenticated
- **Response:** `Prescription`

### GET `/prescriptions/by-appointment/:appointmentId`

Get prescription by appointment ID (alias).

- **Roles:** Any authenticated
- **Response:** `Prescription`

### GET `/prescriptions/animal/:animalId`

Get animal's prescription history.

- **Roles:** Any authenticated
- **Response:** `Prescription[]`

### GET `/prescriptions/by-animal/:animalId`

Get animal's prescription history (alias).

- **Roles:** Any authenticated
- **Response:** `Prescription[]`

### PUT `/prescriptions/:id`

Update a prescription (doctor only).

- **Roles:** `DOCTOR`
- **Request Body:** Same as create, all fields optional
- **Response:** `Prescription`

### POST `/prescriptions/:id/attachment`

Upload attachment for prescription (doctor only).

- **Roles:** `DOCTOR`
- **Request:** `multipart/form-data` with `file` field
- **Response:** `{ attachmentUrl: string }`

### POST `/prescriptions/:id/send`

Send prescription to owner (doctor only).

- **Roles:** `DOCTOR`
- **Response:** `{ success: true, sentAt: ISO date }`

---

## Calendar

### GET `/calendar/doctor/:doctorId`

Get doctor's monthly calendar with appointments and block times.

- **Roles:** Any authenticated
- **Query Params:** `month` (1-12), `year` (YYYY)
- **Response:**
  ```json
  {
    "days": [
      {
        "date": "YYYY-MM-DD",
        "appointments": [...],
        "blockTimes": [...]
      }
    ]
  }
  ```

### GET `/calendar/doctor/:doctorId/week`

Get doctor's weekly calendar.

- **Roles:** Any authenticated
- **Query Params:** `date` (YYYY-MM-DD)
- **Response:** Same as monthly, but for the week containing the date

### GET `/calendar/appointments`

Get current user's appointments grouped by view.

- **Roles:** Any authenticated
- **Query Params:** `date` (YYYY-MM-DD), `view` (day|week|month)
- **Response:**
  ```json
  {
    "appointments": [
      {
        "date": "YYYY-MM-DD",
        "items": [...]
      }
    ]
  }
  ```

### GET `/calendar/badges`

Get per-day appointment counts for a month.

- **Roles:** Any authenticated
- **Query Params:** `month` (1-12), `year` (YYYY)
- **Response:**
  ```json
  {
    "2026-08-15": { "appointments": 3, "tasks": 1 },
    "2026-08-16": { "appointments": 0, "tasks": 2 }
  }
  ```

---

## Subscriptions

### GET `/subscriptions/plans`

List available subscription plans.

- **Roles:** Public
- **Response:** `SubscriptionPlan[]`

### GET `/subscriptions/my`

Get current user's subscription.

- **Roles:** Any authenticated
- **Response:** `UserSubscription`

### POST `/subscriptions/subscribe`

Subscribe to a plan.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "planId": "number",
    "paymentMethodId": "number (optional)"
  }
  ```
- **Response:** `UserSubscription`

### POST `/subscriptions/cancel`

Cancel current subscription.

- **Roles:** Any authenticated
- **Response:** `{ success: true }`

### GET `/admin/subscriptions`

List all subscriptions (admin only).

- **Roles:** `ADMIN`
- **Response:** `UserSubscription[]`

---

## FAQs

### GET `/faqs`

List all FAQs (optionally filter by category).

- **Roles:** Public
- **Query Params:** `category` (optional)
- **Response:** `Faq[]`

### GET `/faqs/:id`

Get single FAQ.

- **Roles:** Public
- **Response:** `Faq`

### POST `/admin/faqs`

Create an FAQ (admin only).

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "question": "string",
    "answer": "string",
    "category": "string (optional)",
    "order": "number (optional)"
  }
  ```
- **Response:** `Faq`

### PUT `/admin/faqs/:id`

Update an FAQ (admin only).

- **Roles:** `ADMIN`
- **Request Body:** Same as create, all fields optional
- **Response:** `Faq`

### DELETE `/admin/faqs/:id`

Delete an FAQ (admin only).

- **Roles:** `ADMIN`
- **Response:** `void`

---

## Support Tickets

### POST `/support/tickets`

Create a support ticket.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "subject": "string",
    "message": "string"
  }
  ```
- **Response:** `SupportTicket`

### GET `/support/tickets`

List current user's support tickets.

- **Roles:** Any authenticated
- **Response:** `SupportTicket[]`

### GET `/support/tickets/:id`

Get ticket details (owner or admin).

- **Roles:** Any authenticated (owner or admin)
- **Response:** `SupportTicket` with replies

### POST `/support/tickets/:id/reply`

Reply to a ticket (owner or admin).

- **Roles:** Any authenticated (owner or admin)
- **Request Body:**
  ```json
  {
    "message": "string"
  }
  ```
- **Response:** `SupportTicketReply`

### GET `/admin/support/tickets`

List all support tickets (admin only).

- **Roles:** `ADMIN`
- **Response:** `SupportTicket[]`

### PATCH `/admin/support/tickets/:id`

Update ticket status (admin only).

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "status": "open | in-progress | closed"
  }
  ```
- **Response:** `SupportTicket`

---

## Fields

### GET `/fields`

List current user's fields.

- **Roles:** Any authenticated
- **Response:** `Field[]`

### POST `/fields`

Create a new field.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "name": "string",
    "sizeAcres": "number",
    "cropType": "string (optional)",
    "location": "string (optional)"
  }
  ```
- **Response:** `Field`

### PUT `/fields/:id`

Update a field (owner only).

- **Roles:** Any authenticated (owner)
- **Request Body:** Same as create, all fields optional
- **Response:** `Field`

### DELETE `/fields/:id`

Delete a field (owner only).

- **Roles:** Any authenticated (owner)
- **Response:** `void`

---

## Market Rates

### GET `/market-rates`

Get today's/latest rates for all commodities.

- **Roles:** Public
- **Response:** `MarketRate[]`

### GET `/market-rates/history`

Get historical rates for a commodity.

- **Roles:** Public
- **Query Params:** `commodity` (required)
- **Response:** `MarketRate[]`

### POST `/admin/market-rates`

Add or update a market rate (admin only).

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "commodity": "string",
    "price": "number",
    "unit": "string",
    "date": "ISO date (optional)",
    "region": "string (optional)"
  }
  ```
- **Response:** `MarketRate`

---

## Badges

### GET `/badges/available`

Get all available badges (public).

- **Roles:** Public
- **Response:** `Badge[]`

### GET `/badges/me`

Get user's earned badges.

- **Roles:** Any authenticated
- **Response:** `UserBadge[]`

---

## Block Times

### GET `/doctors/:id/block-times`

List a doctor's blocked time-off ranges.

- **Roles:** Public
- **Response:** `BlockTime[]`

### POST `/doctors/:id/block-times`

Block a date range (doctor only).

- **Roles:** `DOCTOR`
- **Request Body:**
  ```json
  {
    "startDate": "ISO date",
    "endDate": "ISO date",
    "reason": "string (optional)"
  }
  ```
- **Response:** `BlockTime`

### DELETE `/doctors/:id/block-times/:blockId`

Remove a blocked time-off range (doctor only).

- **Roles:** `DOCTOR`
- **Response:** `void`

### GET `/doctors/:id/block-times/calculate-fee`

Calculate cancellation fee for an appointment.

- **Roles:** Any authenticated
- **Query Params:** `appointmentId` (required)
- **Response:**
  ```json
  {
    "cancellationFee": "number",
    "refundAmount": "number"
  }
  ```

---

## Delivery

### GET `/delivery/track/:trackingNumber`

Public tracking of shipment by tracking number.

- **Roles:** Public
- **Response:** `Delivery`

### GET `/delivery/order/:orderId`

Get shipment tracking details for an order.

- **Roles:** Any authenticated
- **Response:** `Delivery`

### POST `/delivery/order/:orderId`

Create shipment/courier assignment.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "courierName": "string"
  }
  ```
- **Response:** `Delivery`

### PUT `/delivery/order/:orderId`

Update shipment status and timeline event.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "status": "PENDING | PICKED_UP | IN_TRANSIT | DELIVERED | FAILED",
    "location": "string (optional)",
    "description": "string (optional)",
    "deliveryProofUrl": "string (optional)",
    "deliveryNotes": "string (optional)"
  }
  ```
- **Response:** `Delivery`

---

## Chat

### GET `/chat/conversations`

List current user's conversations.

- **Roles:** Any authenticated
- **Response:** `Conversation[]`

### GET `/chat/messages`

List messages in a conversation.

- **Roles:** Any authenticated
- **Query Params:** `conversationId` (required for non-USER roles)
- **Response:** `ChatMessageClientView[]`

### POST `/chat/message`

Send a text chat message.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "text": "string",
    "conversationId": "number (optional, auto-created for USER)"
  }
  ```
- **Response:** `ChatMessageClientView`

### POST `/chat/message/attachment`

Send a chat message with image/document attachment.

- **Roles:** Any authenticated
- **Request:** `multipart/form-data` with `file` field and optional `conversationId`, `caption`
- **Response:** `ChatMessageClientView`

### PATCH `/chat/messages/:id/read`

Mark a message as read.

- **Roles:** Any authenticated (participant only)
- **Response:** Updated message object

---

## Reviews

### POST `/reviews`

Submit a new review (validates purchase/booking).

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "targetType": "PRODUCT | LIVESTOCK | DOCTOR | CLINIC | SERVICE",
    "targetId": "string",
    "rating": "number (1-5)",
    "text": "string",
    "images": "string[] (optional)",
    "videos": "string[] (optional)"
  }
  ```
- **Response:** `Review`

### GET `/reviews/:targetType/:targetId`

List approved reviews for a target.

- **Roles:** Public
- **Response:** `Review[]`

### POST `/reviews/:id/helpful`

Upvote review helpfulness.

- **Roles:** Public
- **Response:** `Review`

### POST `/reviews/:id/report`

Report review as spam or inappropriate.

- **Roles:** Public
- **Response:** `Review`

### GET `/reviews/reported`

List all reported reviews.

- **Roles:** `ADMIN`
- **Response:** `Review[]`

### PATCH `/reviews/:id/moderate`

Approve or reject a review.

- **Roles:** `ADMIN`
- **Request Body:**
  ```json
  {
    "isApproved": "boolean"
  }
  ```
- **Response:** `Review`

### POST `/reviews/:id/reply`

Submit a reply to a review.

- **Roles:** `DOCTOR`, `ADMIN`
- **Request Body:**
  ```json
  {
    "replyText": "string"
  }
  ```
- **Response:** `Review`

---

## Referrals

### GET `/referrals/me`

Get current user's referral code, earnings, and share link.

- **Roles:** Any authenticated
- **Response:** `Referral` with `shareLink` field

### POST `/referrals/claim`

Claim another user's referral code. Rate limited: 30/minute.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "code": "string"
  }
  ```
- **Response:** `Referral`

---

## AI Diagnosis

### POST `/ai-diagnosis/upload-image`

Upload a photo for AI diagnosis.

- **Roles:** Any authenticated
- **Request:** `multipart/form-data` with `file` field
- **Response:** `{ url: string }`

### POST `/ai-diagnosis/analyze`

Submit symptoms and photos for AI diagnosis (processed async).

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "images": "string[] (optional, URLs)",
    "symptoms": "string[] (required, non-empty)"
  }
  ```
- **Response:** `AiDiagnosis` (status: PENDING)

### GET `/ai-diagnosis/history`

Get current user's diagnostic check history.

- **Roles:** Any authenticated
- **Response:** `AiDiagnosis[]`

### GET `/ai-diagnosis/:id`

Poll diagnosis by ID for status/result.

- **Roles:** Any authenticated (own only)
- **Response:** `AiDiagnosis`

---

## Medical Records

### POST `/medical-records/upload`

Upload a medical file (PDF/image/DICOM) for processing.

- **Roles:** Any authenticated
- **Request:** `multipart/form-data` with `file` field, optional `patientId` (doctors), optional `appointmentId`
- **Response:** `Attachment` (status: UPLOADED)

### GET `/medical-records`

List medical records. Patients see own; doctors provide `patientId` query.

- **Roles:** Any authenticated
- **Query Params:** `patientId` (required for doctors)
- **Response:** `Attachment[]`

### GET `/medical-records/:id`

Get single attachment (ownership-checked).

- **Roles:** Any authenticated (own/patient records)
- **Response:** `Attachment`

---

## Alerts

### GET `/alerts`

List active regional crop/disease risk alerts.

- **Roles:** Any authenticated
- **Query Params:** `severity` (optional)
- **Response:** `Alert[]`

### POST `/alerts/:id/action`

Dispatch user's chosen action on an alert.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "actionChoice": "AlertActionType enum"
  }
  ```
- **Response:** `{ success: true }`

---

## Notifications

### GET `/notifications`

Get current user's notifications.

- **Roles:** Any authenticated
- **Response:** `Notification[]`

### PATCH `/notifications/:id/read`

Mark a notification as read.

- **Roles:** Any authenticated
- **Response:** `Notification`

### POST `/notifications/read-all`

Mark all user notifications as read.

- **Roles:** Any authenticated
- **Response:** `{ success: true }`

### POST `/notifications/push-token`

Register Expo push token for current device.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "token": "string",
    "deviceId": "string (optional)"
  }
  ```
- **Response:** `{ success: true }`

### DELETE `/notifications/push-token`

Unregister Expo push token.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "token": "string"
  }
  ```
- **Response:** `{ success: true }`

### GET `/notifications/preferences`

Get current user's notification preferences.

- **Roles:** Any authenticated
- **Response:**
  ```json
  {
    "appointmentReminders": "boolean",
    "promotions": "boolean",
    "chatMessages": "boolean",
    "orderUpdates": "boolean",
    "medicalAlerts": "boolean"
  }
  ```

### PUT `/notifications/preferences`

Update notification preferences.

- **Roles:** Any authenticated
- **Request Body:** Same as GET response, all fields optional
- **Response:** Updated preferences

---

## Tasks

### GET `/tasks`

Get current user's tasks for a given day. Rate limited: 30/minute.

- **Roles:** Any authenticated
- **Query Params:** `date` (YYYY-MM-DD, required)
- **Response:** `Task[]`

### POST `/tasks`

Create a task.

- **Roles:** Any authenticated
- **Request Body:**
  ```json
  {
    "title": "string",
    "detail": "string (optional)",
    "scheduledTime": "string (ISO 8601 date)"
  }
  ```
- **Response:** `Task`

### PATCH `/tasks/:id/toggle`

Toggle task done/undone.

- **Roles:** Any authenticated (own only)
- **Response:** `Task`

### DELETE `/tasks/:id`

Delete a task.

- **Roles:** Any authenticated (own only)
- **Response:** `{ success: true }`

---

## Search

### GET `/search`

Mixed global search across products, livestock, clinics, and doctors.

- **Roles:** Public
- **Query Params:** `q` (search text)
- **Response:** Aggregated results object

---

## Weather

### GET `/weather`

Get current farm weather for a location.

- **Roles:** Public
- **Query Params:** `lat` (optional), `long` (optional), `district` (optional)
- **Response:**
  ```json
  {
    "location": "string",
    "temperature": "number",
    "highTemp": "number",
    "lowTemp": "number",
    "humidityPercentage": "number",
    "precipitationMl": "number",
    "pressureHpa": "number",
    "windMps": "number",
    "sunriseTime": "string",
    "sunsetTime": "string",
    "isCached": "boolean"
  }
  ```

---

## Admin

All admin endpoints require `ADMIN` role.

### Admin - Users

#### GET `/admin/users`

List users with pagination and search.

- **Query Params:** `page`, `limit`, `search`
- **Response:** `PaginatedResult<User>`

#### PATCH `/admin/users/:id/role`

Update a user's role.

- **Request Body:**
  ```json
  {
    "role": "USER | DOCTOR | CLINIC | ADMIN"
  }
  ```
- **Response:** `User`

### Admin - Orders

#### GET `/admin/orders`

List all orders with pagination and status filter.

- **Query Params:** `page`, `limit`, `status`
- **Response:** `Order[]` or `PaginatedResult<Order>`

#### PATCH `/admin/orders/:id/status`

Update order status.

- **Request Body:**
  ```json
  {
    "status": "PENDING | SHIPPED | DELIVERED | CANCELLED"
  }
  ```
- **Response:** `Order`

### Admin - Alerts

#### POST `/admin/alerts`

Create and broadcast an alert.

- **Request Body:**
  ```json
  {
    "title": "string",
    "location": "string",
    "crop": "string",
    "severity": "LOW | MEDIUM | HIGH | CRITICAL",
    "actionType": "AlertActionType enum"
  }
  ```
- **Response:** `Alert`

#### DELETE `/admin/alerts/:id`

Deactivate an alert.

- **Response:** `{ success: true }`

### Admin - Notifications

#### GET `/admin/notifications`

List sent notifications with pagination.

- **Query Params:** `page`, `limit`, `type`, `userId`
- **Response:** `PaginatedResult<Notification>`

#### POST `/admin/notifications/send`

Send notification to specific users.

- **Request Body:**
  ```json
  {
    "userIds": "number[]",
    "title": "string",
    "body": "string",
    "type": "NotificationType (optional)",
    "referenceType": "string (optional)",
    "referenceId": "string (optional)"
  }
  ```
- **Response:** `{ count: number }`

#### POST `/admin/notifications/broadcast`

Broadcast notification to all users or by role.

- **Request Body:**
  ```json
  {
    "title": "string",
    "body": "string",
    "type": "NotificationType (optional)",
    "role": "USER | DOCTOR | CLINIC | ADMIN (optional)"
  }
  ```
- **Response:** `{ queued: true }`

### Admin - Referrals

#### GET `/admin/referrals/pending`

List referrals pending payout.

- **Response:** `Referral[]`

#### POST `/admin/referrals/:id/approve`

Approve a referral payout.

- **Request Body:**
  ```json
  {
    "amount": "number (min 0.01)"
  }
  ```
- **Response:** `Referral`

---

## Health

### GET `/health`

Check database and Redis connectivity.

- **Roles:** Public
- **Response (200):**
  ```json
  {
    "status": "healthy",
    "timestamp": "ISO 8601",
    "details": {
      "database": { "status": "UP" },
      "redis": { "status": "UP" }
    }
  }
  ```
- **Response (503):** ServiceUnavailableException with same shape, status "unhealthy"

---

## Swagger Docs

Full interactive API docs available at `/api/docs` when server is running.
