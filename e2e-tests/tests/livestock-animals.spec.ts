import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

test.describe('Animals & Livestock API Tests', () => {
  let client: ApiClient;

  test.beforeEach(async ({ request }) => {
    client = new ApiClient(request);
    await client.registerAndVerifyUser('user');
  });

  test('Livestock Registry CRUD Operations & validation boundaries', async () => {
    // 1. Add Animal
    const animalData = {
      name: 'Bella',
      breed: 'Holstein-Friesian',
      weight: '450kg',
      age: '3 years',
      color: 'Black and White',
    };

    const addRes = await client.post('/animals', animalData);
    expect(addRes.status()).toBe(201);
    const animal = await addRes.json();
    expect(animal.id).toBeDefined();
    expect(animal.name).toBe(animalData.name);

    // 2. Fetch Animals list
    const listRes = await client.get('/animals');
    expect(listRes.status()).toBe(200);
    const list = await listRes.json();
    // Support either direct array or paginated structure
    const items = Array.isArray(list) ? list : list.data;
    expect(items.some((item: any) => item.id === animal.id)).toBe(true);

    // 3. Get Animal by ID
    const getRes = await client.get(`/animals/${animal.id}`);
    expect(getRes.status()).toBe(200);
    const fetchedAnimal = await getRes.json();
    expect(fetchedAnimal.id).toBe(animal.id);

    // 4. Update Animal details
    const updateRes = await client.patch(`/animals/${animal.id}`, {
      weight: '470kg',
      name: 'Bella II',
    });
    expect(updateRes.status()).toBe(200);
    const updatedAnimal = await updateRes.json();
    expect(updatedAnimal.weight).toBe('470kg');
    expect(updatedAnimal.name).toBe('Bella II');

    // 5. Delete Animal
    const deleteRes = await client.delete(`/animals/${animal.id}`);
    expect(deleteRes.status()).toBe(200);

    // 6. Verify deleted animal is gone
    const verifyGet = await client.get(`/animals/${animal.id}`);
    expect(verifyGet.status()).toBe(404);
  });

  test('POST /animals - validation failures on invalid input data', async () => {
    // Missing required fields
    const res = await client.post('/animals', {
      name: 'Bella',
      breed: '', // empty breed
    });
    expect(res.status()).toBe(400);
  });
});
