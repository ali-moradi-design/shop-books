import { randomBytes } from 'node:crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { authenticate, requireAnyPermission, requirePermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../../../shared/asyncHandler';
import { AppError } from '../../../../shared/AppError';
import { DomainError } from '../../../../domain/shared/DomainError';
import { env } from '../../../../infrastructure/config/env';
import { logger } from '../../../../infrastructure/logging/logger';
import { prisma } from '../../../../infrastructure/persistence/prisma/client';
import { mailer, templates } from '../../../../infrastructure/mail';
import { bookService, orderService, payments } from '../../../../infrastructure/composition';
import { domainEvents, returnUpdatedEvent } from '../../../../domain/shared/events';
import { parseCsvObjects, toCsv } from '../../../../shared/csv';

/*
 * Shop features beyond the original API: newsletter and email outbox, returns,
 * back-in-stock alerts and search suggestions, admin insights, CSV export and
 * import, the staff activity log, and A/B test events.
 */

const shop = () => env.STOREFRONT_URL.replace(/\/$/, '');
const limiter = (max: number, windowMs = 15 * 60 * 1000) =>
  rateLimit({ windowMs, max: env.NODE_ENV === 'test' ? 10_000 : max, standardHeaders: true, legacyHeaders: false });
const page = (q: Record<string, unknown>, fallback = 30) => {
  const p = Math.max(1, Number(q.page) || 1);
  const l = Math.min(100, Math.max(1, Number(q.limit) || fallback));
  return { page: p, limit: l, skip: (p - 1) * l };
};
const pageQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
const meta = (p: { page: number; limit: number }, total: number) => ({ page: p.page, limit: p.limit, total, pages: Math.ceil(total / p.limit) });

// ---------- newsletter ----------

export const newsletterRouter = Router();

newsletterRouter.post(
  '/',
  limiter(10),
  validate({ body: z.object({ email: z.string().trim().email().max(200), source: z.string().max(40).optional() }) }),
  asyncHandler(async (req, res) => {
    const email = String(req.body.email).toLowerCase();
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    // the same answer either way, so the form cannot tell who is subscribed
    if (!existing || existing.unsubscribedAt) {
      const token = existing?.token ?? randomBytes(24).toString('hex');
      await prisma.subscriber.upsert({
        where: { email },
        create: { email, token, source: req.body.source ?? 'footer' },
        update: { unsubscribedAt: null, source: req.body.source ?? 'footer' },
      });
      await mailer.send({ to: email, template: 'newsletter-welcome', ...templates.newsletterWelcome(`${shop()}/newsletter/unsubscribe?token=${token}`) });
    }
    res.status(202).json({ message: 'Subscribed' });
  }),
);

newsletterRouter.post(
  '/unsubscribe',
  validate({ body: z.object({ token: z.string().regex(/^[a-f0-9]{48}$/) }) }),
  asyncHandler(async (req, res) => {
    const row = await prisma.subscriber.findUnique({ where: { token: req.body.token } });
    if (!row) throw new AppError('This link is not valid', 404);
    if (!row.unsubscribedAt) await prisma.subscriber.update({ where: { id: row.id }, data: { unsubscribedAt: new Date() } });
    res.json({ message: 'Unsubscribed' });
  }),
);

newsletterRouter.get(
  '/',
  authenticate,
  requirePermission('users:read'),
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const p = page(req.query, 50);
    const where = { unsubscribedAt: null };
    const [rows, total] = await Promise.all([
      prisma.subscriber.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
      prisma.subscriber.count({ where }),
    ]);
    res.json({ data: rows.map((r) => ({ id: r.id, email: r.email, source: r.source, createdAt: r.createdAt })), meta: meta(p, total) });
  }),
);

newsletterRouter.get(
  '/export.csv',
  authenticate,
  requirePermission('users:read'),
  asyncHandler(async (_req, res) => {
    const rows = await prisma.subscriber.findMany({ where: { unsubscribedAt: null }, orderBy: { createdAt: 'asc' } });
    res.type('text/csv').attachment('subscribers.csv').send(toCsv(['email', 'source', 'subscribed_at'], rows.map((r) => [r.email, r.source, r.createdAt])));
  }),
);

// ---------- email outbox ----------

export const emailsRouter = Router();
emailsRouter.use(authenticate, requirePermission('users:read'));

emailsRouter.get(
  '/',
  validate({ query: pageQuery.extend({ to: z.string().max(200).optional() }) }),
  asyncHandler(async (req, res) => {
    const p = page(req.query);
    const where = req.query.to ? { to: String(req.query.to).trim().toLowerCase() } : {};
    const [rows, total] = await Promise.all([
      prisma.emailMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit, omit: { html: true } }),
      prisma.emailMessage.count({ where }),
    ]);
    res.json({ data: rows, meta: { ...meta(p, total), transport: mailer.mode } });
  }),
);

// ---------- catalog: suggestions and back-in-stock alerts ----------

export const catalogExtrasRouter = Router();

/** GET /books/suggest?q= — a few matches by title, author or ISBN, cheap enough per keystroke. */
catalogExtrasRouter.get(
  '/suggest',
  validate({ query: z.object({ q: z.string().trim().min(2).max(60) }) }),
  asyncHandler(async (req, res) => {
    const q = String(req.query.q);
    const isbn = q.replace(/[-\s]/g, '');
    const rows = await prisma.book.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          ...(/^\d{4,13}$/.test(isbn) ? [{ isbn: { startsWith: isbn } }] : []),
        ],
      },
      orderBy: [{ featured: 'desc' }, { title: 'asc' }],
      take: 6,
      select: { id: true, title: true, author: true, coverImageUrl: true, price: true, stock: true },
    });
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ data: rows.map(({ stock, ...b }) => ({ ...b, inStock: stock > 0 })) });
  }),
);

catalogExtrasRouter.post(
  '/:id/stock-alerts',
  limiter(20),
  validate({ params: z.object({ id: z.string().min(1).max(60) }), body: z.object({ email: z.string().trim().email().max(200) }) }),
  asyncHandler(async (req, res) => {
    const book = await prisma.book.findFirst({ where: { id: String(req.params.id), deletedAt: null }, select: { stock: true } });
    if (!book) throw new AppError('Book not found', 404);
    if (book.stock > 0) throw new AppError('This book is in stock now', 409);
    const email = String(req.body.email).toLowerCase();
    const open = await prisma.stockAlert.findFirst({ where: { bookId: String(req.params.id), email, notifiedAt: null } });
    if (!open) await prisma.stockAlert.create({ data: { bookId: String(req.params.id), email } });
    res.status(201).json({ message: 'We will email you when it is back in stock.' });
  }),
);

/** Emails everyone waiting for this book, once. */
export async function notifyBackInStock(bookId: string): Promise<number> {
  const book = await prisma.book.findFirst({ where: { id: bookId, deletedAt: null } });
  if (!book || book.stock <= 0) return 0;
  const alerts = await prisma.stockAlert.findMany({ where: { bookId, notifiedAt: null } });
  for (const a of alerts) {
    await mailer.send({ to: a.email, template: 'back-in-stock', ...templates.backInStock(book) });
    await prisma.stockAlert.update({ where: { id: a.id }, data: { notifiedAt: new Date() } });
  }
  return alerts.length;
}

// ---------- returns ----------

export const RETURN_WINDOW_DAYS = 30;
const RETURN_STATUSES = ['requested', 'approved', 'rejected', 'received', 'refunded'] as const;
type ReturnStatus = (typeof RETURN_STATUSES)[number];
const RETURN_REASONS = ['damaged', 'wrong-item', 'not-as-described', 'changed-mind', 'other'] as const;
const NEXT: Record<ReturnStatus, ReturnStatus[]> = {
  requested: ['approved', 'rejected'],
  approved: ['received', 'rejected'],
  received: ['refunded'],
  rejected: [],
  refunded: [],
};

interface ReturnItem {
  bookId: string;
  title: string;
  quantity: number;
  price: number;
}

const presentReturn = (r: Prisma.ReturnRequestGetPayload<object>) => ({
  id: r.id,
  order: r.orderId,
  user: r.userId,
  items: r.items as unknown as ReturnItem[],
  reason: r.reason,
  comment: r.comment ?? undefined,
  status: r.status as ReturnStatus,
  refundAmount: r.refundAmount,
  refunded: Boolean(r.refundId),
  history: r.history,
  createdAt: r.createdAt,
});

export const returnsRouter = Router();
returnsRouter.use(authenticate);

returnsRouter.post(
  '/',
  requirePermission('orders:read-own'),
  validate({
    body: z.object({
      orderId: z.string().min(1),
      reason: z.enum(RETURN_REASONS),
      comment: z.string().trim().max(1000).optional(),
      items: z.array(z.object({ bookId: z.string().min(1), quantity: z.number().int().min(1) })).min(1),
    }),
  }),
  asyncHandler(async (req, res) => {
    const order = await orderService.getById(req.body.orderId, req.user!.id, false);
    if (!['shipped', 'completed'].includes(order.status)) throw new DomainError('Returns open once your order has shipped', 'VALIDATION');
    const shippedAt = order.shipment?.shippedAt ?? order.statusHistory.find((h) => h.status === 'shipped')?.at;
    if (shippedAt && Date.now() - new Date(shippedAt).getTime() > RETURN_WINDOW_DAYS * 86_400_000) {
      throw new DomainError(`Returns are accepted for ${RETURN_WINDOW_DAYS} days after shipping`, 'VALIDATION');
    }
    // copies already in an open or finished return cannot be returned twice
    const earlier = await prisma.returnRequest.findMany({ where: { orderId: order.id, status: { not: 'rejected' } } });
    const taken = new Map<string, number>();
    for (const r of earlier) for (const i of r.items as unknown as ReturnItem[]) taken.set(i.bookId, (taken.get(i.bookId) ?? 0) + i.quantity);
    const items: ReturnItem[] = (req.body.items as { bookId: string; quantity: number }[]).map((want) => {
      const line = order.items.find((i) => i.book === want.bookId);
      if (!line) throw new DomainError('That book is not in this order', 'VALIDATION');
      const left = line.quantity - (taken.get(want.bookId) ?? 0);
      if (want.quantity > left) throw new DomainError(`You can return at most ${left} of ${line.title}`, 'VALIDATION');
      return { bookId: line.book, title: line.title, quantity: want.quantity, price: line.price };
    });
    // a discount is shared out across the lines, so refunds never exceed what was paid
    const share = order.subtotalAmount > 0 ? order.totalAmount / order.subtotalAmount : 1;
    const refundAmount = Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * share);
    const row = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: req.user!.id,
        items: items as unknown as Prisma.InputJsonValue,
        reason: req.body.reason,
        comment: req.body.comment,
        refundAmount,
        history: [{ status: 'requested', at: new Date() }] as unknown as Prisma.InputJsonValue,
      },
    });
    await domainEvents.publish(returnUpdatedEvent({ returnId: row.id, orderId: order.id, userId: req.user!.id, status: 'requested' }));
    res.status(201).json({ data: presentReturn(row) });
  }),
);

returnsRouter.get(
  '/mine',
  validate({ query: z.object({ order: z.string().min(1).max(60).optional() }) }),
  asyncHandler(async (req, res) => {
    const rows = await prisma.returnRequest.findMany({
      where: { userId: req.user!.id, ...(req.query.order ? { orderId: String(req.query.order) } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: rows.map(presentReturn) });
  }),
);

returnsRouter.get(
  '/',
  requirePermission('orders:update-status'),
  validate({ query: pageQuery.extend({ status: z.enum(RETURN_STATUSES).optional() }) }),
  asyncHandler(async (req, res) => {
    const p = page(req.query, 50);
    const where = req.query.status ? { status: String(req.query.status) } : {};
    const [rows, total] = await Promise.all([
      prisma.returnRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.limit }),
      prisma.returnRequest.count({ where }),
    ]);
    res.json({ data: rows.map(presentReturn), meta: meta(p, total) });
  }),
);

returnsRouter.patch(
  '/:id',
  requirePermission('orders:update-status'),
  validate({ params: z.object({ id: z.string().min(1) }), body: z.object({ status: z.enum(RETURN_STATUSES), note: z.string().trim().max(500).optional() }) }),
  asyncHandler(async (req, res) => {
    const row = await prisma.returnRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!row) throw new DomainError('Return not found', 'NOT_FOUND');
    const status = req.body.status as ReturnStatus;
    if (!NEXT[row.status as ReturnStatus].includes(status)) {
      throw new DomainError(`A ${row.status} return cannot become ${status}`, 'ILLEGAL_TRANSITION');
    }
    let refundId = row.refundId;
    if (status === 'refunded' && row.refundAmount > 0 && !refundId) {
      const order = await prisma.order.findUnique({ where: { id: row.orderId } });
      if (order?.paymentMethod === 'stripe' && order.transactionId) refundId = await payments.gateway.refund(order.transactionId, row.refundAmount);
    }
    const history = [...((row.history as unknown as object[]) ?? []), { status, at: new Date(), note: req.body.note }];
    const saved = await prisma.returnRequest.update({
      where: { id: row.id },
      data: { status, refundId, history: history as unknown as Prisma.InputJsonValue },
    });
    await domainEvents.publish(returnUpdatedEvent({ returnId: row.id, orderId: row.orderId, userId: row.userId, status, note: req.body.note }));
    res.json({ data: presentReturn(saved) });
  }),
);

// ---------- admin: insights, CSV, activity ----------

const PAID = ['paid', 'processing', 'shipped', 'completed'] as const;
const dollars = (cents?: number | null) => (cents == null ? '' : (cents / 100).toFixed(2));

export async function insights(days: number) {
  const since = new Date(Date.now() - days * 86_400_000);
  const where = { deletedAt: null, status: { in: [...PAID] }, createdAt: { gte: since } };
  const [totals, byCategory, customers, refunds] = await Promise.all([
    prisma.order.aggregate({ where, _sum: { totalAmount: true }, _count: true }),
    prisma.$queryRaw<{ category: string; revenue: bigint; units: bigint }[]>`
      SELECT COALESCE(cat, 'other') AS category, SUM(oi."price" * oi."quantity") AS revenue, SUM(oi."quantity") AS units
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId"
      JOIN "Book" b ON b."id" = oi."bookId"
      LEFT JOIN LATERAL (SELECT b."categories"[1] AS cat) c ON TRUE
      WHERE o."deletedAt" IS NULL AND o."status"::text IN ('paid','processing','shipped','completed') AND o."createdAt" >= ${since}
      GROUP BY 1 ORDER BY 2 DESC`,
    // buyers in the period, and how many of them had bought before it (or more than once in it)
    prisma.$queryRaw<{ customers: bigint; returning: bigint }[]>`
      SELECT COUNT(*) AS customers,
             COUNT(*) FILTER (WHERE first_order < ${since} OR in_period > 1) AS returning
      FROM (
        SELECT "userId", MIN("createdAt") AS first_order, COUNT(*) FILTER (WHERE "createdAt" >= ${since}) AS in_period
        FROM "Order"
        WHERE "deletedAt" IS NULL AND "status"::text IN ('paid','processing','shipped','completed')
        GROUP BY "userId"
      ) t
      WHERE in_period > 0`,
    prisma.order.count({ where: { refundId: { not: null }, updatedAt: { gte: since } } }),
  ]);
  const revenue = totals._sum.totalAmount ?? 0;
  const orders = totals._count;
  const c = { customers: Number(customers[0]?.customers ?? 0), returning: Number(customers[0]?.returning ?? 0) };
  return {
    days,
    revenue,
    orders,
    averageOrderValue: orders ? Math.round(revenue / orders) : 0,
    customers: c.customers,
    returningCustomers: c.returning,
    returningRate: c.customers ? c.returning / c.customers : 0,
    refunds,
    byCategory: byCategory.map((r) => ({ category: r.category, revenue: Number(r.revenue), units: Number(r.units) })),
  };
}

const BOOK_COLUMNS = ['isbn', 'title', 'author', 'price', 'stock', 'categories', 'series', 'series_number', 'featured', 'cover_image_url', 'description'];

const bookCsvSchema = z.object({
  isbn: z.string().regex(/^[\d-]{10,17}$/, 'isbn: 10 or 13 digits'),
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  categories: z.array(z.string().max(60)).max(10),
  series: z.string().max(200).optional(),
  seriesNumber: z.number().int().positive().optional(),
  featured: z.boolean(),
  coverImageUrl: z.string().url().optional(),
  description: z.string().max(5000),
});

const split = (v?: string) => (v ? v.split('|').map((s) => s.trim()).filter(Boolean) : []);

export async function importBooks(csv: string, dryRun: boolean) {
  const { header, records } = parseCsvObjects(csv);
  const missing = ['isbn', 'title', 'author', 'price', 'stock'].filter((c) => !header.includes(c));
  if (missing.length) return { created: 0, updated: 0, errors: [{ row: 1, message: `Missing columns: ${missing.join(', ')}` }], dryRun };
  if (records.length > 1000) return { created: 0, updated: 0, errors: [{ row: 1, message: 'Import at most 1000 rows at a time' }], dryRun };
  const isbns = records.map((r) => r.isbn.replace(/-/g, ''));
  const existing = new Map((await prisma.book.findMany({ where: { isbn: { in: isbns } }, select: { id: true, isbn: true } })).map((b) => [b.isbn, b.id]));
  let created = 0;
  let updated = 0;
  const errors: { row: number; isbn?: string; message: string }[] = [];
  for (const [i, r] of records.entries()) {
    const row = i + 2;
    const parsed = bookCsvSchema.safeParse({
      isbn: r.isbn,
      title: r.title,
      author: r.author,
      price: Math.round(Number((r.price ?? '').replace(/[$,\s]/g, '')) * 100),
      stock: Number(r.stock),
      categories: split(r.categories),
      series: r.series || undefined,
      seriesNumber: r.series_number ? Number(r.series_number) : undefined,
      featured: /^(yes|true|1)$/i.test(r.featured ?? ''),
      coverImageUrl: r.cover_image_url || undefined,
      description: r.description ?? '',
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors.push({ row, isbn: r.isbn, message: issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message });
      continue;
    }
    const isbn = parsed.data.isbn.replace(/-/g, '');
    const id = existing.get(isbn);
    if (dryRun) {
      if (id) updated++;
      else created++;
      continue;
    }
    try {
      const { seriesNumber, ...rest } = parsed.data;
      const data = { ...rest, isbn, ...(seriesNumber ? { seriesNumber } : {}) };
      if (id) {
        // through the service, so a restocked book sends back-in-stock emails
        await bookService.update(id, data);
        updated++;
      } else {
        await bookService.create(data as Parameters<typeof bookService.create>[0]);
        created++;
      }
    } catch (err) {
      errors.push({ row, isbn: r.isbn, message: err instanceof Error ? err.message : 'Could not save' });
    }
  }
  return { created, updated, errors, dryRun };
}

const STAFF_PERMISSIONS = ['books:update', 'orders:update-status', 'users:update', 'discounts:update', 'roles:update', 'reviews:delete'];
const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function describeAction(method: string, path: string, body: Record<string, unknown> | undefined): string {
  const p = path.replace(/^\/api\/v1/, '');
  const id = (p.split('/')[2] ?? '').slice(-8);
  const rules: [RegExp, string][] = [
    [/^\/books$/, `Added book ${body?.title ?? ''}`],
    [/^\/books\/[^/]+$/, method === 'DELETE' ? `Removed book ${id}` : `Edited book ${id}`],
    [/^\/orders\/[^/]+\/status$/, `Set order ${id} to ${body?.status ?? ''}`],
    [/^\/orders\/[^/]+\/pay$/, `Recorded payment for order ${id}`],
    [/^\/returns\/[^/]+$/, `Set return ${id} to ${body?.status ?? ''}`],
    [/^\/discounts/, `${method === 'POST' ? 'Created' : method === 'DELETE' ? 'Deleted' : 'Changed'} discount ${body?.code ?? id}`],
    [/^\/users/, `${method === 'DELETE' ? 'Deleted' : 'Changed'} user ${id}`],
    [/^\/roles/, `${method === 'POST' ? 'Created' : method === 'DELETE' ? 'Deleted' : 'Changed'} role ${body?.name ?? id}`],
    [/^\/reviews/, `Removed review ${id}`],
    [/^\/admin\/import/, 'Imported books from CSV'],
  ];
  return rules.find(([re]) => re.test(p))?.[1].trim() ?? `${method} ${p}`;
}

/** Records successful writes by staff, after the response, so it never slows a request. */
export function auditTrail(req: Request, res: Response, next: NextFunction): void {
  if (!WRITE.has(req.method)) return next();
  res.on('finish', () => {
    const user = req.user;
    if (!user || res.statusCode >= 400 || !user.permissions.some((p) => STAFF_PERMISSIONS.includes(p))) return;
    const path = req.originalUrl.split('?')[0];
    if (/^\/api\/v1\/(auth|account|cart|favorites)/.test(path)) return;
    prisma.auditEntry
      .create({ data: { actorId: user.id, actorEmail: user.email, method: req.method, path, action: describeAction(req.method, path, req.body), status: res.statusCode } })
      .catch((err) => logger.error('audit write failed', { error: String(err) }));
  });
  next();
}

const sendCsv = (res: Response, name: string, csv: string) =>
  res.type('text/csv').attachment(`${name}-${new Date().toISOString().slice(0, 10)}.csv`).send(csv);

export const insightsRouter = Router();
insightsRouter.use(authenticate);

insightsRouter.get(
  '/insights',
  requireAnyPermission('admin:dashboard', 'reports:analytics'),
  validate({ query: z.object({ days: z.coerce.number().int().min(1).max(365).optional() }) }),
  asyncHandler(async (req, res) => {
    res.json({ data: await insights(Number(req.query.days ?? 30)) });
  }),
);

insightsRouter.get(
  '/export/books.csv',
  requirePermission('books:update'),
  asyncHandler(async (_req, res) => {
    const rows = await prisma.book.findMany({ where: { deletedAt: null }, orderBy: { title: 'asc' } });
    sendCsv(
      res,
      'books',
      toCsv(
        BOOK_COLUMNS,
        rows.map((b) => [b.isbn, b.title, b.author, dollars(b.price), b.stock, b.categories.join(' | '), b.series, b.seriesNumber, b.featured ? 'yes' : '', b.coverImageUrl, b.description]),
      ),
    );
  }),
);

insightsRouter.get(
  '/export/orders.csv',
  requirePermission('orders:read'),
  asyncHandler(async (_req, res) => {
    const rows = await prisma.order.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 10_000, include: { items: true, user: { select: { email: true } } } });
    sendCsv(
      res,
      'orders',
      toCsv(
        ['order', 'date', 'status', 'customer_email', 'ship_to', 'city', 'country', 'items', 'subtotal', 'discount_code', 'discount', 'total', 'payment', 'transaction', 'carrier', 'tracking'],
        rows.map((o) => [
          o.id, o.createdAt, o.status, o.user.email, o.shippingFullName, o.shippingCity, o.shippingCountry,
          o.items.map((i) => `${i.quantity}× ${i.title}`).join(' | '),
          dollars(o.subtotalAmount), o.discountCode, dollars(o.discountAmount), dollars(o.totalAmount),
          o.paymentMethod, o.transactionId, o.shipCarrier, o.shipTracking,
        ]),
      ),
    );
  }),
);

insightsRouter.get(
  '/export/customers.csv',
  requirePermission('users:read'),
  asyncHandler(async (_req, res) => {
    const [users, spend] = await Promise.all([
      prisma.user.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
      prisma.order.groupBy({ by: ['userId'], where: { deletedAt: null, status: { in: [...PAID] } }, _count: true, _sum: { totalAmount: true } }),
    ]);
    const byUser = new Map(spend.map((s) => [s.userId, s]));
    sendCsv(
      res,
      'customers',
      toCsv(
        ['name', 'email', 'guest', 'active', 'joined', 'orders', 'spent'],
        users.map((u) => {
          const s = byUser.get(u.id);
          return [u.name, u.email, u.guest ? 'yes' : '', u.isActive ? 'yes' : 'no', u.createdAt, s?._count ?? 0, dollars(s?._sum.totalAmount ?? 0)];
        }),
      ),
    );
  }),
);

insightsRouter.post(
  '/import/books',
  requirePermission('books:create', 'books:update'),
  validate({ body: z.object({ csv: z.string().min(1).max(2_000_000), dryRun: z.boolean().default(true) }) }),
  asyncHandler(async (req, res) => {
    res.json({ data: await importBooks(req.body.csv, req.body.dryRun) });
  }),
);

insightsRouter.get(
  '/audit',
  requirePermission('users:read'),
  validate({ query: pageQuery }),
  asyncHandler(async (req, res) => {
    const p = page(req.query, 50);
    const [rows, total] = await Promise.all([
      prisma.auditEntry.findMany({ orderBy: { at: 'desc' }, skip: p.skip, take: p.limit }),
      prisma.auditEntry.count(),
    ]);
    res.json({ data: rows, meta: meta(p, total) });
  }),
);

// ---------- A/B tests ----------

const EVENT_TYPES = ['exposure', 'add_to_cart', 'purchase'] as const;
type EventType = (typeof EVENT_TYPES)[number];

/** Two-sided p-value of a two-proportion z-test (normal approximation). */
export function pValue(convA: number, nA: number, convB: number, nB: number): number | null {
  if (nA < 1 || nB < 1) return null;
  const pooled = (convA + convB) / (nA + nB);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / nA + 1 / nB));
  if (se === 0) return null;
  const zScore = Math.abs(convB / nB - convA / nA) / se;
  const t = 1 / (1 + 0.2316419 * zScore);
  const d = 0.3989423 * Math.exp((-zScore * zScore) / 2);
  const tail = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return Math.min(1, 2 * tail);
}

export async function experimentResults() {
  const rows = await prisma.experimentEvent.groupBy({ by: ['experiment', 'variant', 'type'], _count: true, _min: { at: true } });
  const experiments = new Map<string, { started: Date; variants: Map<string, Record<EventType, number>> }>();
  for (const r of rows) {
    const first = r._min.at ?? new Date();
    const e = experiments.get(r.experiment) ?? { started: first, variants: new Map() };
    if (first < e.started) e.started = first;
    const v = e.variants.get(r.variant) ?? { exposure: 0, add_to_cart: 0, purchase: 0 };
    v[r.type as EventType] = r._count;
    e.variants.set(r.variant, v);
    experiments.set(r.experiment, e);
  }
  return [...experiments].map(([key, e]) => {
    const variants = [...e.variants].sort(([a], [b]) => (a === 'control' ? -1 : b === 'control' ? 1 : a.localeCompare(b)));
    const control = e.variants.get('control') ?? variants[0]?.[1];
    return {
      key,
      started: e.started,
      variants: variants.map(([name, v]) => {
        const rate = (k: 'add_to_cart' | 'purchase') => (v.exposure ? v[k] / v.exposure : 0);
        const vs = (k: 'add_to_cart' | 'purchase') =>
          control && name !== 'control' && control.exposure
            ? { uplift: control[k] ? rate(k) / (control[k] / control.exposure) - 1 : null, pValue: pValue(control[k], control.exposure, v[k], v.exposure) }
            : null;
        return {
          name,
          visitors: v.exposure,
          addToCart: v.add_to_cart,
          purchases: v.purchase,
          addToCartRate: rate('add_to_cart'),
          purchaseRate: rate('purchase'),
          addToCartVsControl: vs('add_to_cart'),
          purchaseVsControl: vs('purchase'),
        };
      }),
    };
  });
}

const slug = z.string().regex(/^[a-z0-9-]{1,40}$/);

export const experimentsRouter = Router();

experimentsRouter.post(
  '/events',
  limiter(60, 60 * 1000),
  validate({
    body: z.object({
      visitor: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
      events: z.array(z.object({ experiment: slug, variant: slug, type: z.enum(EVENT_TYPES) })).min(1).max(10),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { visitor, events } = req.body as { visitor: string; events: { experiment: string; variant: string; type: EventType }[] };
    // the first variant recorded for a visitor wins, so a changed cookie cannot count twice
    await prisma.experimentEvent.createMany({ data: events.map((e) => ({ ...e, visitor })), skipDuplicates: true });
    res.status(204).end();
  }),
);

experimentsRouter.get(
  '/results',
  authenticate,
  requireAnyPermission('admin:dashboard', 'reports:analytics'),
  asyncHandler(async (_req, res) => {
    res.json({ data: await experimentResults() });
  }),
);
