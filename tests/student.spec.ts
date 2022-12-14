import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByLabel('First name').click();
  await page.getByLabel('First name').fill('super');
  await page.getByLabel('First name').press('Tab');
  await page.getByLabel('Last name').fill('super');
  await page.getByLabel('Last name').press('Tab');
  await page.getByLabel('Email').fill('super@duke.edu');
  await page.getByLabel('Email').press('Tab');
  await page.getByLabel('Username').fill('super');
  await page.getByLabel('Username').press('Tab');
  await page.locator('#password').fill('1234567');
  await page.locator('#password').press('Tab');
  await page.getByLabel('Confirm password').fill('1234567');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'View all courses' }).click();
  await page.getByRole('button', { name: 'Show more' }).first().click();
  await page.getByRole('button', { name: 'register' }).first().click();
  await page.getByRole('button', { name: 'register' }).nth(1).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'My courses' }).click();
  await page.getByRole('button', { name: 'drop' }).first().click();
  await page.getByRole('button', { name: 'drop' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});