import { test, expect, Page, Route } from '@playwright/test';

import { UserLoginInput, UserStatusResponse } from '@prixfixeco/models';

export const fakeLogin = (username: string, password: string, totpToken: string) => {
  return (page: Page) =>
    page.route('**/api/login', (route: Route) => {
      const authState = new UserStatusResponse({
        accountStatus: 'good',
        accountStatusExplanation: '',
        activeHousehold: '',
        isAuthenticated: true,
      });

      const requestBody = route.request().postDataJSON() as UserLoginInput;
      const totpTokenEmpty = requestBody.totpToken === '';

      expect(requestBody.username).toEqual(username);
      expect(requestBody.password).toEqual(password);
      if (!totpTokenEmpty) {
        expect(requestBody.totpToken).toEqual(totpToken);
      }

      route.fulfill({
        status: totpTokenEmpty ? 205 : 202,
        body: totpTokenEmpty ? '' : JSON.stringify(authState),
      });
    });
};

test('login with required two factor', async ({ page }) => {
  await page.goto('/login');

  const expectedUsername = 'username';
  const expectedPassword = 'hunterz2';
  const expectedTOTPToken = '123456';

  await fakeLogin(expectedUsername, expectedPassword, expectedTOTPToken)(page);

  const usernameInput = await page.locator('input[data-pf="username-input"]');
  await expect(usernameInput).toBeEnabled();
  await usernameInput.type(expectedUsername);

  const passwordInput = await page.locator('input[data-pf="password-input"][type="password"]');
  await expect(passwordInput).toBeEnabled();
  await passwordInput.type(expectedPassword);

  const submitButton = await page.locator('button[data-pf="submit"]');
  await submitButton.click();

  const totpInput = await page.locator('input[data-pf="totp-input"]');
  await expect(totpInput).toBeEnabled();
  await totpInput.type(expectedTOTPToken);

  await submitButton.click();
  await page.waitForURL('/');
});
