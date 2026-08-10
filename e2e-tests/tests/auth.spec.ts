import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

test.describe('Authentication & System Health API Tests', () => {
  let client: ApiClient;

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  test('GET / health & root endpoints', async () => {
    const rootRes = await client.get('/');
    expect(rootRes.status()).toBe(200);
    const rootText = await rootRes.text();
    expect(rootText).toBe('Hello World!');

    const healthRes = await client.get('/health');
    expect(healthRes.status()).toBe(200);
    const healthJson = await healthRes.json();
    expect(healthJson.status).toBe('healthy');
    expect(healthJson.details.database.status).toBe('UP');
    expect(healthJson.details.redis.status).toBe('UP');
  });

  test('POST /auth/register - happy path user registration & verification', async () => {
    const testData = ApiClient.generateTestData('user');
    
    // Register
    const regRes = await client.post('/auth/register', {
      name: testData.name,
      identifier: testData.email,
      password: testData.password,
      role: 'user',
    });
    expect(regRes.status()).toBe(201);
    const regJson = await regRes.json();
    expect(regJson.success).toBe(true);

    // Request OTP via /auth/send-otp
    const sendOtpResponse = await client.post('/auth/send-otp', {
      phone: testData.email,
      purpose: 'verify',
    });
    expect(sendOtpResponse.status()).toBe(201);
    const sendOtpResult = await sendOtpResponse.json();
    const otp = sendOtpResult.otp;
    expect(otp).toBeDefined();

    // Verify OTP
    const verifyRes = await client.post('/auth/verify-otp', {
      phone: testData.email,
      code: otp,
      purpose: 'verify',
    });
    expect(verifyRes.status()).toBe(201);
    const verifyJson = await verifyRes.json();
    expect(verifyJson.verified).toBe(true);
    expect(verifyJson.accessToken).toBeDefined();
    expect(verifyJson.user.email).toBe(testData.email);
    expect(verifyJson.user.verified).toBe(true);
  });

  test('POST /auth/register - boundary: conflict on duplicate identifier', async () => {
    const testData = ApiClient.generateTestData('user');
    
    // Register first user
    const reg1 = await client.post('/auth/register', {
      name: testData.name,
      identifier: testData.email,
      password: testData.password,
      role: 'user',
    });
    expect(reg1.status()).toBe(201);

    // Register second user with same identifier (email)
    const reg2 = await client.post('/auth/register', {
      name: 'Duplicate User',
      identifier: testData.email,
      password: 'SomePassword123',
      role: 'user',
    });
    expect(reg2.status()).toBe(409);
    const reg2Json = await reg2.json();
    expect(reg2Json.message).toContain('exists');
  });

  test('POST /auth/register - inputs validation negative test cases', async () => {
    // Missing fields validation (Role invalid/empty, password too short)
    const regFail = await client.post('/auth/register', {
      name: 'Test',
      identifier: 'invalidemail.com',
      password: 'abc', // Short password
      role: 'manager123', // Invalid role
    });
    expect(regFail.status()).toBe(400);

    // Empty body
    const regEmpty = await client.post('/auth/register', {});
    expect(regEmpty.status()).toBe(400);
  });

  test('POST /auth/login & sessions controls', async () => {
    const testData = ApiClient.generateTestData('user');
    
    // Register & retrieve OTP
    const regRes = await client.post('/auth/register', {
      name: testData.name,
      identifier: testData.email,
      password: testData.password,
      role: 'user',
    });
    expect(regRes.status()).toBe(201);
    
    // Attempt login before verification (should fail 403 Forbidden)
    const unverifiedLogin = await client.post('/auth/login', {
      identifier: testData.email,
      password: testData.password,
    });
    expect(unverifiedLogin.status()).toBe(403);

    // Request OTP via /auth/send-otp
    const sendOtpResponse = await client.post('/auth/send-otp', {
      phone: testData.email,
      purpose: 'verify',
    });
    expect(sendOtpResponse.status()).toBe(201);
    const sendOtpResult = await sendOtpResponse.json();
    const otp = sendOtpResult.otp;

    // Verify user
    await client.post('/auth/verify-otp', {
      phone: testData.email,
      code: otp,
      purpose: 'verify',
    });

    // Login with invalid credentials
    const badLogin = await client.post('/auth/login', {
      identifier: testData.email,
      password: 'WrongPassword!',
    });
    expect(badLogin.status()).toBe(401);

    // Successful Login
    const loginRes = await client.post('/auth/login', {
      identifier: testData.email,
      password: testData.password,
    });
    expect(loginRes.status()).toBe(201);
    const loginJson = await loginRes.json();
    expect(loginJson.accessToken).toBeDefined();
    expect(loginJson.refreshToken).toBeDefined();

    // Token Rotation (Refresh)
    const refreshRes = await client.post('/auth/refresh', {
      refreshToken: loginJson.refreshToken,
    });
    expect(refreshRes.status()).toBe(201);
    const refreshJson = await refreshRes.json();
    expect(refreshJson.accessToken).toBeDefined();
    expect(refreshJson.refreshToken).toBeDefined();

    // Revoked (Used) refresh token retry should fail (Token Rotation security check)
    const doubleRefresh = await client.post('/auth/refresh', {
      refreshToken: loginJson.refreshToken,
    });
    expect(doubleRefresh.status()).toBe(401);

    // Logout
    const logoutRes = await client.post('/auth/logout', {
      refreshToken: refreshJson.refreshToken,
    });
    expect(logoutRes.status()).toBe(201);
  });

  test('POST /auth/forgot-password & reset-password recovery flow', async () => {
    const testData = ApiClient.generateTestData('user');
    
    // Register and verify account
    const regRes = await client.post('/auth/register', {
      name: testData.name,
      identifier: testData.email,
      password: testData.password,
      role: 'user',
    });
    expect(regRes.status()).toBe(201);

    // Request OTP via /auth/send-otp
    const sendOtpResponse = await client.post('/auth/send-otp', {
      phone: testData.email,
      purpose: 'verify',
    });
    expect(sendOtpResponse.status()).toBe(201);
    const sendOtpResult = await sendOtpResponse.json();
    const otp = sendOtpResult.otp;

    await client.post('/auth/verify-otp', {
      phone: testData.email,
      code: otp,
      purpose: 'verify',
    });

    // Trigger forgot password
    const forgotRes = await client.post('/auth/forgot-password', {
      identifier: testData.email,
    });
    expect(forgotRes.status()).toBe(201);

    // Request Reset OTP via /auth/send-otp
    const sendResetOtpRes = await client.post('/auth/send-otp', {
      phone: testData.email,
      purpose: 'reset',
    });
    expect(sendResetOtpRes.status()).toBe(201);
    const sendResetOtpResult = await sendResetOtpRes.json();
    const resetOtp = sendResetOtpResult.otp;

    // Verify Reset OTP
    const verifyResetRes = await client.post('/auth/verify-otp', {
      phone: testData.email,
      code: resetOtp,
      purpose: 'reset',
    });
    expect(verifyResetRes.status()).toBe(201);
    const verifyResetJson = await verifyResetRes.json();
    expect(verifyResetJson.resetToken).toBeDefined();

    // Reset password
    const newPassword = 'NewSecurePassword@123';
    const resetRes = await client.post('/auth/reset-password', {
      resetToken: verifyResetJson.resetToken,
      newPassword: newPassword,
    });
    expect(resetRes.status()).toBe(201);

    // Login with new password
    const newLoginRes = await client.post('/auth/login', {
      identifier: testData.email,
      password: newPassword,
    });
    expect(newLoginRes.status()).toBe(201);
  });

  test('POST /auth/oauth - OAuth integrations failure validation', async () => {
    // Validate that endpoints respond gracefully to invalid OAuth tokens
    const googleRes = await client.post('/auth/oauth/google', {
      idToken: 'invalid-mock-google-token',
    });
    expect(googleRes.status()).toBe(401);

    const facebookRes = await client.post('/auth/oauth/facebook', {
      accessToken: 'invalid-mock-facebook-token',
    });
    expect(facebookRes.status()).toBe(401);
  });
});
