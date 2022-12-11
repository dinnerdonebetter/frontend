import { Axios, AxiosResponse } from 'axios';

import {
  UserLoginInput,
  UserStatusResponse,
  UserRegistrationInput,
  UserPermissionsRequestInput,
  UserPermissionsResponse,
  PasswordResetTokenCreationRequestInput,
  PasswordResetTokenRedemptionRequestInput,
  UsernameReminderRequestInput,
  UserCreationResponse,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function logIn(client: Axios, input: UserLoginInput): Promise<AxiosResponse<UserStatusResponse>> {
  return client.post<UserStatusResponse>(backendRoutes.LOGIN, input).then((response) => {
    if (response.status !== 202 && response.status !== 205) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    return response;
  });
}

export async function adminLogin(client: Axios, input: UserLoginInput): Promise<AxiosResponse<UserStatusResponse>> {
  return client.post<UserStatusResponse>(backendRoutes.LOGIN_ADMIN, input).then((response) => {
    if (response.status !== 202) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    return response;
  });
}

export async function logOut(client: Axios): Promise<AxiosResponse<UserStatusResponse>> {
  return client.post(backendRoutes.LOGOUT);
}

export async function register(
  client: Axios,
  input: UserRegistrationInput,
): Promise<AxiosResponse<UserCreationResponse>> {
  return client.post<UserCreationResponse>(backendRoutes.USER_REGISTRATION, input);
}

export async function checkPermissions(
  client: Axios,
  body: UserPermissionsRequestInput,
): Promise<AxiosResponse<UserPermissionsResponse>> {
  return client.post<UserPermissionsResponse>(backendRoutes.PERMISSIONS_CHECK, body);
}

export async function requestPasswordResetToken(
  client: Axios,
  input: PasswordResetTokenCreationRequestInput,
): Promise<AxiosResponse> {
  return client.post(backendRoutes.REQUEST_PASSWORD_RESET_TOKEN, input);
}

export async function redeemPasswordResetToken(
  client: Axios,
  input: PasswordResetTokenRedemptionRequestInput,
): Promise<AxiosResponse> {
  return client.post(backendRoutes.REDEEM_PASSWORD_RESET_TOKEN, input);
}

export async function requestUsernameReminderEmail(
  client: Axios,
  input: UsernameReminderRequestInput,
): Promise<AxiosResponse> {
  return client.post(backendRoutes.REQUEST_USERNAME_REMINDER_EMAIL, input);
}
