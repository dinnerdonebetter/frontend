import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  User,
  QueryFilter,
  UserAccountStatusUpdateInput,
  QueryFilteredResult,
  EmailAddressVerificationRequestInput,
  AvatarUpdateInput,
  TOTPSecretRefreshInput,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function fetchSelf(client: Axios): Promise<AxiosResponse<APIResponse<User>>> {
  return client.get<APIResponse<User>>(backendRoutes.SELF);
}

export async function requestEmailVerificationEmail(client: Axios): Promise<AxiosResponse> {
  return client.post(backendRoutes.USERS_REQUEST_EMAIL_VERIFICATION_EMAIL);
}

export async function getUser(client: Axios, userID: string): Promise<AxiosResponse<APIResponse<User>>> {
  return client.get<APIResponse<User>>(format(backendRoutes.USER, userID));
}

export async function getUsers(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<User>>> {
  return client.get<QueryFilteredResult<User>>(backendRoutes.USERS, { params: filter.asRecord() });
}

export async function updateUserAccountStatus(
  client: Axios,
  input: UserAccountStatusUpdateInput,
): Promise<AxiosResponse> {
  return client.post<QueryFilteredResult<User>>(backendRoutes.USER_REPUTATION_UPDATE, input);
}

export async function searchForUsers(client: Axios, query: string): Promise<AxiosResponse<User[]>> {
  return client.get<User[]>(`${backendRoutes.USERS_SEARCH}?q=${encodeURIComponent(query)}`);
}

export async function verifyEmailAddress(
  client: Axios,
  verificationInput: EmailAddressVerificationRequestInput,
): Promise<AxiosResponse> {
  return client.post(backendRoutes.USERS_VERIFY_EMAIL_ADDRESS, verificationInput);
}

export async function uploadNewAvatar(client: Axios, input: AvatarUpdateInput): Promise<AxiosResponse> {
  return client.post(backendRoutes.USERS_UPLOAD_NEW_AVATAR, input);
}

export async function newTwoFactorSecret(client: Axios, input: TOTPSecretRefreshInput): Promise<AxiosResponse> {
  return client.post<QueryFilteredResult<User>>(backendRoutes.NEW_2FA_SECRET, input);
}
