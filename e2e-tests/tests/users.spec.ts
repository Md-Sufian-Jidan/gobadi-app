import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

test.describe('Users API Tests', () => {
  let client: ApiClient;

  test.beforeEach(({ request }) => {
    client = new ApiClient(request);
  });

  test('GET /users/me - reject unauthorized request', async () => {
    const res = await client.get('/users/me');
    expect(res.status()).toBe(401);
  });

  test('GET /users/me - fetch profile after authentication', async () => {
    const session = await client.registerAndVerifyUser('user');
    
    const res = await client.get('/users/me');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(session.id);
    expect(body.name).toBe(session.name);
    expect(body.email).toBe(session.identifier);
  });

  test('PATCH /users/me - update profile details successfully', async () => {
    await client.registerAndVerifyUser('user');

    const updatedName = 'Jannat Al Feda';
    const updatedEmail = `jannat_new_${Math.floor(Math.random() * 100000)}@example.com`;

    const res = await client.patch('/users/me', {
      name: updatedName,
      email: updatedEmail,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe(updatedName);
    expect(body.email).toBe(updatedEmail);

    // Verify change is persisted
    const verifyRes = await client.get('/users/me');
    const verifyBody = await verifyRes.json();
    expect(verifyBody.name).toBe(updatedName);
    expect(verifyBody.email).toBe(updatedEmail);
  });

  test('PATCH /users/me - invalid email input verification', async () => {
    await client.registerAndVerifyUser('user');

    const res = await client.patch('/users/me', {
      email: 'not-an-email',
    });
    expect(res.status()).toBe(400);
  });
});
