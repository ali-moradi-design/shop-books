import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Stripe from 'stripe';
import {
  authHeader,
  registerCustomer,
  setupTestApp,
  shippingAddress,
  teardownTestApp,
  type TestContext,
} from '../helpers/testApp';

/** Email, account, returns, stock alerts, admin tools and A/B events. */
describe('Shop features (integration)', () => {
  let ctx: TestContext;
  const admin = () => authHeader(ctx.adminToken);
  const stripe = new Stripe('sk_test_unused');
  let isbnSeq = 0;

  beforeAll(async () => {
    ctx = await setupTestApp();
  }, 120_000);

  afterAll(async () => {
    await teardownTestApp();
  }, 60_000);

  async function lastEmail(to: string, template: string) {
    const res = await ctx.request.get(`/api/v1/emails?to=${encodeURIComponent(to)}`).set(admin()).expect(200);
    return (res.body.data as { template: string; text: string }[]).find((e) => e.template === template);
  }

  async function book(stock: number, title = 'Feature Book') {
    const isbn = `977${Date.now().toString().slice(-8)}${String(isbnSeq++).padStart(2, '0')}`;
    const res = await ctx.request
      .post('/api/v1/books')
      .set(admin())
      .send({ title, author: 'Test Author', description: 'For tests', isbn, price: 2000, stock, categories: ['fiction'] })
      .expect(201);
    return res.body.data as { id: string };
  }

  async function paidOrder(token: string, bookId: string) {
    await ctx.request.post('/api/v1/cart/items').set(authHeader(token)).send({ bookId, quantity: 1 }).expect(201);
    const order = (await ctx.request.post('/api/v1/cart/checkout').set(authHeader(token)).send({ shippingAddress }).expect(201)).body.data;
    const payload = JSON.stringify({
      id: `evt_${Math.random().toString(36).slice(2)}`,
      object: 'event',
      type: 'checkout.session.completed',
      data: { object: { id: `cs_${order.id}`, payment_status: 'paid', amount_total: order.totalAmount, currency: 'usd', client_reference_id: order.id, payment_intent: `pi_${order.id}` } },
    });
    await ctx.request
      .post('/api/v1/payments/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test_secret' }))
      .send(payload)
      .expect(200);
    return order as { id: string; totalAmount: number };
  }

  it('rejects unsigned or tampered webhooks', async () => {
    const payload = JSON.stringify({ id: 'evt_x', type: 'checkout.session.completed', data: { object: { id: 'cs_x' } } });
    await ctx.request.post('/api/v1/payments/stripe/webhook').set('Content-Type', 'application/json').send(payload).expect(400);
    await ctx.request
      .post('/api/v1/payments/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('Stripe-Signature', stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_wrong' }))
      .send(payload)
      .expect(400);
  });

  it('sends a welcome email and resets a password through the emailed link', async () => {
    const c = await registerCustomer(ctx.request);
    expect(await lastEmail(c.email, 'welcome')).toBeTruthy();
    await ctx.request.post('/api/v1/auth/forgot-password').send({ email: c.email }).expect(202);
    await ctx.request.post('/api/v1/auth/forgot-password').send({ email: 'nobody@example.com' }).expect(202);
    const token = (await lastEmail(c.email, 'password-reset'))!.text.match(/token=([a-f0-9]+)/)![1];
    await ctx.request.post('/api/v1/auth/reset-password').send({ token, password: 'NewPass123!' }).expect(200);
    await ctx.request.post('/api/v1/auth/reset-password').send({ token, password: 'Other123!!' }).expect(400);
    await ctx.request.post('/api/v1/auth/refresh').send({ refreshToken: c.refreshToken }).expect(401);
    await ctx.request.post('/api/v1/auth/login').send({ email: c.email, password: 'NewPass123!' }).expect(200);
  });

  it('guest checkout signs in once, and never again by email alone', async () => {
    const email = `guest_${Date.now()}@test.local`;
    const guest = await ctx.request.post('/api/v1/auth/guest').send({ name: 'Guest Reader', email }).expect(201);
    expect(guest.body.user).toMatchObject({ email, guest: true });
    await ctx.request.get('/api/v1/account').set(authHeader(guest.body.accessToken)).expect(200);
    await ctx.request.post('/api/v1/auth/guest').send({ name: 'Someone', email }).expect(409);
    await ctx.request.post('/api/v1/auth/login').send({ email, password: 'anything123' }).expect(401);
  });

  it('updates the profile, password and address book', async () => {
    const c = await registerCustomer(ctx.request);
    const auth = authHeader(c.accessToken);
    await ctx.request.patch('/api/v1/account').set(auth).send({ email: `x_${Date.now()}@test.local` }).expect(400);
    await ctx.request.post('/api/v1/account/password').set(auth).send({ currentPassword: 'wrong', newPassword: 'Another123!' }).expect(400);
    const first = await ctx.request.post('/api/v1/account/addresses').set(auth).send({ ...shippingAddress, label: 'Home' }).expect(201);
    expect(first.body.data[0].isDefault).toBe(true);
    const same = await ctx.request.post('/api/v1/account/addresses').set(auth).send(shippingAddress).expect(201);
    expect(same.body.data).toHaveLength(1);
    const second = await ctx.request.post('/api/v1/account/addresses').set(auth).send({ ...shippingAddress, line1: '2 Work Rd', isDefault: true }).expect(201);
    expect(second.body.data.map((a: { isDefault: boolean }) => a.isDefault)).toEqual([false, true]);
    const removed = await ctx.request.delete(`/api/v1/account/addresses/${second.body.data[1].id}`).set(auth).expect(200);
    expect(removed.body.data[0].isDefault).toBe(true);
  });

  it('customer cancels before shipping and is refunded; restock emails waiting readers', async () => {
    const b = await book(1, 'Last Copy');
    const c = await registerCustomer(ctx.request);
    const order = await paidOrder(c.accessToken, b.id);
    expect(await lastEmail(c.email, 'order-confirmed')).toBeTruthy();
    const waiting = `wait_${Date.now()}@test.local`;
    await ctx.request.post(`/api/v1/books/${b.id}/stock-alerts`).send({ email: waiting }).expect(201);
    await ctx.request.post(`/api/v1/books/${b.id}/stock-alerts`).send({ email: waiting }).expect(201);
    const cancelled = await ctx.request.post(`/api/v1/orders/${order.id}/cancel`).set(authHeader(c.accessToken)).send({}).expect(200);
    expect(cancelled.body.data).toMatchObject({ status: 'cancelled', refunded: true });
    const emails = (await ctx.request.get(`/api/v1/emails?to=${waiting}`).set(admin()).expect(200)).body.data;
    expect(emails.filter((e: { template: string }) => e.template === 'back-in-stock')).toHaveLength(1);
  });

  it('ships with tracking, then takes a return and refunds it', async () => {
    const b = await book(5, 'Returnable');
    const c = await registerCustomer(ctx.request);
    const order = await paidOrder(c.accessToken, b.id);
    await ctx.request.patch(`/api/v1/orders/${order.id}/status`).set(admin()).send({ status: 'processing' }).expect(200);
    const shipped = await ctx.request
      .patch(`/api/v1/orders/${order.id}/status`)
      .set(admin())
      .send({ status: 'shipped', shipment: { carrier: 'USPS', trackingNumber: '9400100000000000000000' } })
      .expect(200);
    expect(shipped.body.data.shipment.url).toMatch(/usps\.com/);
    expect((await lastEmail(c.email, 'order-shipped'))!.text).toMatch(/9400100000000000000000/);
    await ctx.request.post(`/api/v1/orders/${order.id}/cancel`).set(authHeader(c.accessToken)).send({}).expect(400);

    const auth = authHeader(c.accessToken);
    await ctx.request.post('/api/v1/returns').set(auth).send({ orderId: order.id, reason: 'damaged', items: [{ bookId: b.id, quantity: 2 }] }).expect(400);
    const ret = await ctx.request.post('/api/v1/returns').set(auth).send({ orderId: order.id, reason: 'damaged', items: [{ bookId: b.id, quantity: 1 }] }).expect(201);
    expect(ret.body.data).toMatchObject({ status: 'requested', refundAmount: order.totalAmount });
    await ctx.request.post('/api/v1/returns').set(auth).send({ orderId: order.id, reason: 'other', items: [{ bookId: b.id, quantity: 1 }] }).expect(400);
    await ctx.request.patch(`/api/v1/returns/${ret.body.data.id}`).set(auth).send({ status: 'approved' }).expect(403);
    await ctx.request.patch(`/api/v1/returns/${ret.body.data.id}`).set(admin()).send({ status: 'refunded' }).expect(400);
    for (const status of ['approved', 'received', 'refunded']) {
      await ctx.request.patch(`/api/v1/returns/${ret.body.data.id}`).set(admin()).send({ status }).expect(200);
    }
    const mine = await ctx.request.get(`/api/v1/returns/mine?order=${order.id}`).set(auth).expect(200);
    expect(mine.body.data[0]).toMatchObject({ status: 'refunded', refunded: true });
  });

  it('suggests books by title, author or ISBN', async () => {
    const b = await book(2, 'Quixotic Suggestion');
    const byTitle = await ctx.request.get('/api/v1/books/suggest?q=quixotic').expect(200);
    expect(byTitle.body.data.some((s: { id: string }) => s.id === b.id)).toBe(true);
    const byAuthor = await ctx.request.get('/api/v1/books/suggest?q=test author').expect(200);
    expect(byAuthor.body.data.length).toBeGreaterThan(0);
    await ctx.request.post(`/api/v1/books/${b.id}/stock-alerts`).send({ email: 'a@test.local' }).expect(409);
  });

  it('exports CSV and imports books back, dry run first', async () => {
    const exported = await ctx.request.get('/api/v1/admin/export/books.csv').set(admin()).expect(200);
    expect(exported.text).toMatch(/^\uFEFFisbn,title,author/);
    await ctx.request.get('/api/v1/admin/export/orders.csv').set(admin()).expect(200);
    await ctx.request.get('/api/v1/admin/export/customers.csv').set(admin()).expect(200);
    const isbn = `976${Date.now().toString().slice(-10)}`;
    const csv = [
      'isbn,title,author,price,stock,categories,description',
      `${isbn},"Imported, A Novel",CSV Author,14.99,3,fiction | classics,From the import`,
      'bad,Bad,Bad,abc,1,,',
    ].join('\n');
    const dry = await ctx.request.post('/api/v1/admin/import/books').set(admin()).send({ csv }).expect(200);
    expect(dry.body.data).toMatchObject({ created: 1, updated: 0, dryRun: true });
    expect(dry.body.data.errors[0].row).toBe(3);
    const run = await ctx.request.post('/api/v1/admin/import/books').set(admin()).send({ csv, dryRun: false }).expect(200);
    expect(run.body.data).toMatchObject({ created: 1 });
    const again = await ctx.request.post('/api/v1/admin/import/books').set(admin()).send({ csv: csv.replace(',3,', ',9,'), dryRun: false }).expect(200);
    expect(again.body.data).toMatchObject({ updated: 1 });
  });

  it('reports insights and logs staff changes, not customers', async () => {
    const res = await ctx.request.get('/api/v1/admin/insights?days=30').set(admin()).expect(200);
    expect(res.body.data).toHaveProperty('returningRate');
    expect(Array.isArray(res.body.data.byCategory)).toBe(true);
    const b = await book(2, 'Audited');
    await ctx.request.patch(`/api/v1/books/${b.id}`).set(admin()).send({ featured: true }).expect(200);
    await new Promise((r) => setTimeout(r, 150));
    const audit = await ctx.request.get('/api/v1/admin/audit').set(admin()).expect(200);
    expect(audit.body.data.some((a: { action: string }) => a.action.startsWith('Edited book'))).toBe(true);
    const c = await registerCustomer(ctx.request);
    await ctx.request.get('/api/v1/admin/audit').set(authHeader(c.accessToken)).expect(403);
  });

  it('keeps the newsletter list without revealing who is on it', async () => {
    const email = `news_${Date.now()}@test.local`;
    await ctx.request.post('/api/v1/newsletter').send({ email }).expect(202);
    await ctx.request.post('/api/v1/newsletter').send({ email }).expect(202);
    const token = (await lastEmail(email, 'newsletter-welcome'))!.text.match(/token=([a-f0-9]+)/)![1];
    await ctx.request.post('/api/v1/newsletter/unsubscribe').send({ token }).expect(200);
    const list = await ctx.request.get('/api/v1/newsletter').set(admin()).expect(200);
    expect(list.body.data.some((s: { email: string }) => s.email === email)).toBe(false);
  });

  it('counts unique visitors per variant for A/B tests', async () => {
    const send = (visitor: string, variant: string, types: string[]) =>
      ctx.request.post('/api/v1/experiments/events').send({ visitor, events: types.map((type) => ({ experiment: 'test-exp', variant, type })) }).expect(204);
    await send('visitor-aaaaaaaaaaaa1', 'control', ['exposure', 'add_to_cart']);
    await send('visitor-aaaaaaaaaaaa1', 'control', ['exposure']);
    await send('visitor-aaaaaaaaaaaa2', 'control', ['exposure']);
    await send('visitor-bbbbbbbbbbbb1', 'variant', ['exposure', 'add_to_cart', 'purchase']);
    const res = await ctx.request.get('/api/v1/experiments/results').set(admin()).expect(200);
    const exp = res.body.data.find((e: { key: string }) => e.key === 'test-exp');
    expect(exp.variants[0]).toMatchObject({ name: 'control', visitors: 2, addToCart: 1, addToCartRate: 0.5 });
    expect(exp.variants[1]).toMatchObject({ name: 'variant', visitors: 1, purchases: 1 });
  });
});
