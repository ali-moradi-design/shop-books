import { expect, test } from '@playwright/test';

test('customer can browse, buy through Stripe Checkout (simulated), and admin sees the order', async ({
  page,
  browser,
}) => {
  const email = `buyer_${Date.now()}@example.com`;

  // Browse and search by ISBN
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'A bookshop for people who still browse',
  );
  await page.getByRole('combobox', { name: /search by title/i }).fill('978-0-14-143951-8');
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
  // and the footer has a newsletter form: pick the form with the right button
  const form = page.locator('form:visible', {
    has: page.getByRole('button', { name: 'Create account' }),
  });
  await form.getByRole('textbox', { name: 'Name' }).fill('Ada Reader');
  await form.getByLabel('Email', { exact: true }).fill(email);
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

  // Simulated Stripe Checkout: a decline first, then pay; the order is confirmed by webhook
  await expect(page).toHaveURL(/\/pay\/cs_test_mock_/);
  const pay = page.locator('form:visible', { has: page.getByRole('button', { name: /^Pay / }) });
  await pay.getByLabel('Card number').fill('4000 0000 0000 0002');
  await pay.getByRole('button', { name: /^Pay / }).click();
  await expect(page.getByText('Your card was declined.')).toBeVisible();
  await pay.getByLabel('Card number').fill('4242 4242 4242 4242');
  await pay.getByRole('button', { name: /^Pay / }).click();
  await expect(page).toHaveURL(/\/orders\/.+checkout=success/);
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
  await adminPage.goto('/login?next=/admin/orders');
  const signIn = adminPage.locator('form:visible', {
    has: adminPage.getByRole('button', { name: 'Sign in', exact: true }),
  });
  await signIn.getByLabel('Email', { exact: true }).fill('admin@bookstore.local');
  await signIn.getByLabel('Password').fill('Admin123!');
  await signIn.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(adminPage.getByRole('heading', { level: 1, name: 'Orders' })).toBeVisible();
  const row = adminPage.getByRole('row').filter({ hasText: orderId.slice(-8) });
  await expect(row).toContainText('Paid');
  await row.getByRole('link', { name: orderId.slice(-8) }).click();
  await adminPage.getByRole('combobox', { name: 'Move to' }).selectOption('processing');
  await adminPage.getByRole('button', { name: 'Update' }).click();
  await expect(adminPage.getByText('Order updated')).toBeVisible();

  // Admin creates a new book and it appears in the catalog
  await adminPage.goto('/admin/books');
  await adminPage.getByRole('link', { name: '+ New book' }).click();
  await expect(adminPage.getByRole('heading', { level: 1, name: 'New book' })).toBeVisible();
  const bookForm = adminPage.locator('form:visible', {
    has: adminPage.getByRole('button', { name: 'Create book' }),
  });
  await bookForm.locator('[name=title]').fill('The E2E Chronicle');
  await bookForm.locator('[name=author]').fill('Test Author');
  await bookForm.locator('[name=description]').fill('A book created by the end-to-end test.');
  await bookForm.locator('[name=price]').fill('15.50');
  await bookForm.locator('[name=stock]').fill('7');
  await bookForm.locator('[name=categories]').fill('fiction, testing');
  await bookForm.getByRole('button', { name: 'Create book' }).click();
  await expect(
    adminPage.getByRole('heading', { level: 1, name: 'The E2E Chronicle' }),
  ).toBeVisible();
  await expect(adminPage.getByText('Book created.')).toBeVisible();
  await adminPage.goto('/books?q=E2E+Chronicle');
  await expect(
    adminPage.getByRole('link', { name: /The E2E Chronicle by Test Author/ }),
  ).toBeVisible();
});
