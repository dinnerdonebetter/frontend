import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import { User, QueryFilter, UserList, UserAccountStatusUpdateInput } from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function fetchSelf(client: Axios): Promise<AxiosResponse<User>> {
  return client.get<User>(backendRoutes.SELF);
}

export async function getUser(client: Axios, userID: string): Promise<AxiosResponse<User>> {
  return client.get<User>(format(backendRoutes.USER, userID));
}

export async function getUsers(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<UserList>> {
  return client.get<UserList>(backendRoutes.USERS, { params: filter.asRecord() });
}

export async function updateUserAccountStatus(
  client: Axios,
  input: UserAccountStatusUpdateInput,
): Promise<AxiosResponse> {
  return client.post<UserList>(backendRoutes.USER_REPUTATION_UPDATE, input);
}

export async function searchForUsers(client: Axios, query: string): Promise<AxiosResponse<User[]>> {
  return client.get<User[]>(`${backendRoutes.USERS_SEARCH}?q=${encodeURIComponent(query)}`);
}
