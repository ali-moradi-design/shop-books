import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function signInAsAdmin(page: Page, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  const form = page.locator('form:visible', {
    has: page.getByRole('button', { name: 'Sign in', exact: true }),
  });
  await form.getByLabel('Email', { exact: true }).fill('admin@bookstore.local');
  await form.getByLabel('Password').fill('Admin123!');
  await form.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(next.replace(/\//g, '\\/')));
}

test('admin pages load and pass axe', async ({ page }) => {
  await signInAsAdmin(page, '/admin');
  for (const [path, heading] of [
    ['/admin', 'Dashboard'],
    ['/admin/books', 'Books'],
    ['/admin/orders', 'Orders'],
    ['/admin/returns', 'Returns'],
    ['/admin/discounts', 'Discounts'],
    ['/admin/customers', 'Customers'],
    ['/admin/reviews', 'Reviews'],
    ['/admin/emails', 'Emails'],
    ['/admin/experiments', 'A/B tests'],
    ['/admin/roles', 'Roles'],
    ['/admin/activity', 'Activity'],
    ['/admin/books/import', 'Import books'],
  ] as const) {
    await page.goto(path);
    await expect(
      page.getByRole('heading', { level: 1, name: heading }).locator('visible=true'),
    ).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      serious.map((v) => `${path} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([]);
  }
  // the CSV export downloads through the storefront with the admin's session
  const csv = await page.request.get('/admin/export/books');
  expect(csv.headers()['content-type']).toContain('text/csv');
});

test('guest checkout and forgot password are offered; search suggests books', async ({ page }) => {
  await page.goto('/login?next=/checkout');
  await expect(page.getByRole('heading', { name: 'In a hurry?' })).toBeVisible();
  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  const form = page.locator('form:visible', {
    has: page.getByRole('button', { name: 'Email me a link' }),
  });
  await form.getByLabel('Email').fill('nobody@example.com');
  await form.getByRole('button', { name: 'Email me a link' }).click();
  await expect(page.getByText(/a link to reset the password is on its way/)).toBeVisible();

  await page.getByRole('combobox', { name: /search by title/i }).fill('pride');
  await expect(page.getByRole('option').first()).toBeVisible();
  await page.getByRole('combobox', { name: /search by title/i }).press('ArrowDown');
  await page.getByRole('combobox', { name: /search by title/i }).press('Enter');
  await expect(page).toHaveURL(/\/books\/bk_/);
});

test('every page tells search engines to stay away', async ({ request }) => {
  const res = await request.get('/');
  expect(res.headers()['x-robots-tag']).toContain('noindex');
  expect(await res.text()).toContain('noindex');
  expect(await (await request.get('/robots.txt')).text()).not.toContain('Sitemap');
});
