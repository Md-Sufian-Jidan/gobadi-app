import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';

test.describe('Cart & Orders API Tests', () => {
  let adminClient: ApiClient;
  let userClient: ApiClient;

  test.beforeEach(({ request }) => {
    adminClient = new ApiClient(request);
    userClient = new ApiClient(request);
  });

  test('Cart additions, checkout, order placement and fulfillment status lifecycle', async () => {
    // 1. Setup - Create a product by Admin
    await adminClient.registerAndVerifyUser('admin');

    const rand = Math.floor(Math.random() * 1000000);
    const catRes = await adminClient.post('/products/categories', {
      name: `Livestock Feed ${rand}`,
      slug: `livestock-feed-${rand}`,
    });
    expect(catRes.status()).toBe(201);
    const category = await catRes.json();

    const brandRes = await adminClient.post('/products/brands', {
      name: `Gobadi Brand ${rand}`,
      slug: `gobadi-brand-${rand}`,
    });
    expect(brandRes.status()).toBe(201);
    const brand = await brandRes.json();

    const sku = `SKU-${Math.floor(Math.random() * 1000000)}`;
    const prodRes = await adminClient.post('/products', {
      sku: sku,
      name: 'Super Grass Feed',
      description: 'Healthy feed for cattle',
      price: 1500,
      categoryId: category.id,
      brandId: brand.id,
      status: 'published', // Set published so it can be purchased
    });
    expect(prodRes.status()).toBe(201);
    const product = await prodRes.json();

    // Add stock so it can be added to the cart
    const stockRes = await adminClient.post(`/products/${product.id}/stock`, {
      quantity: 10,
    });
    expect(stockRes.status()).toBe(201);

    // 2. User registers and sets up an Address
    const userSession = await userClient.registerAndVerifyUser('user');
    
    const addressRes = await userClient.post('/addresses', {
      label: 'Home Address',
      contactName: userSession.name,
      phone: userSession.identifier,
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
      postalCode: '1230',
    });
    expect(addressRes.status()).toBe(201);
    const address = await addressRes.json();

    // 3. User adds the product to their Cart
    const addCartRes = await userClient.post('/cart/add', {
      productId: product.id,
      quantity: 2,
    });
    expect(addCartRes.status()).toBe(201);

    // Verify cart contents
    const cartRes = await userClient.get('/cart');
    expect(cartRes.status()).toBe(200);
    const cart = await cartRes.json();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].productId).toBe(product.id);
    expect(cart.items[0].quantity).toBe(2);

    // 4. Place the order
    const orderRes = await userClient.post('/orders', {
      addressId: address.id,
      deliveryMethod: 'standard',
      deliveryNotes: 'Deliver in afternoon',
    });
    expect(orderRes.status()).toBe(201);
    const order = await orderRes.json();
    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
    expect(order.totalPrice).toBe(3000); // 1500 * 2

    // Cart should be empty now
    const cartAfterOrder = await userClient.get('/cart');
    expect(cartAfterOrder.status()).toBe(200);
    const cartAfter = await cartAfterOrder.json();
    expect(cartAfter.items.length).toBe(0);

    // 5. Admin transitions the order through the status lifecycle
    // Transition to preparing
    const updateRes1 = await adminClient.patch(`/orders/${order.id}/status`, {
      status: 'preparing',
    });
    expect(updateRes1.status()).toBe(200);
    const order1 = await updateRes1.json();
    expect(order1.status).toBe('preparing');

    // Transition to shipped
    const updateRes2 = await adminClient.patch(`/orders/${order.id}/status`, {
      status: 'shipped',
    });
    expect(updateRes2.status()).toBe(200);
    const order2 = await updateRes2.json();
    expect(order2.status).toBe('shipped');
  });
});
