import { expect, test } from '@playwright/test';

test('customer can browse, buy with the fake gateway, and admin sees the order', async ({
  page,
  browser,
}) => {
  const email = `buyer_${Date.now()}@example.com`;

  // Browse and search by ISBN
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A bookshop for people who still browse',
  );
  await page.getByRole('searchbox', { name: /search by title/i }).fill('978-0-14-143951-8');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/books\?q=/);
  await page.getByRole('link', { name: /Pride and Prejudice by Jane Austen/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Pride and Prejudice' })).toBeVisible();

  // Look inside
  await expect(page.getByText('It is a truth universally acknowledged')).toBeVisible();

  // Adding to the cart needs an account
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByRole('link', { name: 'Create an account' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Create account' })).toBeVisible();
  // Next keeps the previous route hidden in the DOM during transitions: scope to visible nodes.
  const form = page.locator('form:visible');
  await form.getByRole('textbox', { name: 'Name' }).fill('Ada Reader');
  await form.getByLabel('Email').fill(email);
  await form.getByLabel('Password').fill('Passw0rd!x');
  await form.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/books\//);

  await page.getByLabel('Quantity').fill('2');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('2 books');

  // Checkout with a discount code
  await page.getByRole('link', { name: 'Checkout' }).click();
  await page.getByLabel('Full name').fill('Ada Reader');
  await page.getByLabel('Address', { exact: true }).fill('1 Library Lane');
  await page.getByLabel('City').fill('Berlin');
  await page.getByLabel('Postal code').fill('10115');
  await page.getByLabel('Discount code (optional)').fill('WELCOME10');
  await page.getByRole('button', { name: 'Continue to payment' }).click();

  // Fake payment gateway: a decline first, then approve
  await expect(page).toHaveURL(/\/pay\//);
  await page.getByRole('button', { name: 'Simulate a declined card' }).click();
  await expect(page.getByText('The test card was declined')).toBeVisible();
  await page.getByRole('button', { name: /^Pay / }).click();
  await expect(page).toHaveURL(/\/orders\/.+paid=1/);
  await expect(page.getByText('Payment received')).toBeVisible();
  await expect(page.getByText('Discount WELCOME10')).toBeVisible();
  const orderId = new URL(page.url()).pathname.split('/').pop()!;

  // Reading list
  await page.goto('/books?q=1984');
  await page.getByRole('link', { name: /^1984 by/ }).click();
  await page.getByRole('button', { name: /Add to reading list/ }).click();
  await page.goto('/reading-list');
  await expect(page.getByRole('heading', { name: '1984' })).toBeVisible();

  // Admin sees the order and moves it along
  const adminPage = await (await browser.newContext()).newPage();
  await adminPage.goto('/login?next=/admin');
  await adminPage.getByLabel('Email').fill('admin@bookstore.local');
  await adminPage.getByLabel('Password').fill('Admin123!');
  await adminPage.getByRole('button', { name: 'Sign in' }).click();
  await expect(adminPage.getByRole('heading', { name: 'Admin' })).toBeVisible();
  const row = adminPage.getByRole('row').filter({ hasText: orderId.slice(-8) });
  await expect(row).toContainText('Paid');
  await row.getByRole('combobox').selectOption('processing');
  await row.getByRole('button', { name: 'Save' }).click();
  await expect(adminPage.getByText('Order updated')).toBeVisible();
  await expect(adminPage.getByRole('row').filter({ hasText: orderId.slice(-8) })).toContainText(
    'Processing',
  );
});
