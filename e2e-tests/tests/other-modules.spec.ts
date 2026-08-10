import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

test.describe('Secondary Modules API Tests', () => {
  let userClient: ApiClient;
  let docClient: ApiClient;
  let adminClient: ApiClient;

  test.beforeEach(({ request }) => {
    userClient = new ApiClient(request);
    docClient = new ApiClient(request);
    adminClient = new ApiClient(request);
  });

  test('Chat System - patient/doctor exchange and status updates', async () => {
    // 1. Setup clients
    const patientSession = await userClient.registerAndVerifyUser('user');
    const docSession = await docClient.registerAndVerifyUser('doctor');

    // 2. Patient sends message (auto-resolves conversation)
    const sendRes = await userClient.post('/chat/message', {
      text: 'Hello Customer Support / Doctor!',
    });
    expect(sendRes.status()).toBe(201);
    const msg = await sendRes.json();
    expect(msg.id).toBeDefined();
    expect(msg.text).toBe('Hello Customer Support / Doctor!');
    const convId = msg.conversationId;

    // 3. Patient views message history
    const historyRes = await userClient.get(`/chat/messages?conversationId=${convId}`);
    expect(historyRes.status()).toBe(200);
    const messages = await historyRes.json();
    expect(messages.some((m: any) => m.id === msg.id)).toBe(true);

    // 4. Validate that unassociated user cannot access the conversation
    const otherClient = new ApiClient(userClient['request']);
    await otherClient.registerAndVerifyUser('user');
    const badAccessRes = await otherClient.get(`/chat/messages?conversationId=${convId}`);
    expect(badAccessRes.status()).toBe(403);
  });

  test('Services catalog query & management', async () => {
    // List services catalog
    const listRes = await userClient.get('/services');
    expect(listRes.status()).toBe(200);
    const services = await listRes.json();
    expect(Array.isArray(services)).toBe(true);
  });

  test('Weather service querying', async () => {
    await userClient.registerAndVerifyUser('user');
    // Query weather conditions for specific coordinates (using long instead of lon)
    const weatherRes = await userClient.get('/weather?lat=23.8103&long=90.4125');
    expect(weatherRes.status()).toBe(200);
    const weather = await weatherRes.json();
    expect(weather.location).toBeDefined();
    expect(weather.temperature).toBeDefined();
  });

  test('Alerts, Tasks, and Referrals modules validations', async () => {
    await userClient.registerAndVerifyUser('user');

    // Fetch alerts
    const alertsRes = await userClient.get('/alerts');
    expect(alertsRes.status()).toBe(200);
    const alerts = await alertsRes.json();
    expect(Array.isArray(alerts)).toBe(true);

    // Fetch tasks (requires date query parameter)
    const tasksRes = await userClient.get('/tasks?date=2026-08-17');
    expect(tasksRes.status()).toBe(200);
    const tasks = await tasksRes.json();
    expect(Array.isArray(tasks)).toBe(true);

    // Fetch referrals
    const referralsRes = await userClient.get('/referrals/me');
    expect(referralsRes.status()).toBe(200);
    const referrals = await referralsRes.json();
    expect(referrals.referralCode).toBeDefined();
  });
});
