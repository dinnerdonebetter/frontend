import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  Household,
  QueryFilter,
  HouseholdUpdateRequestInput,
  HouseholdInvitationCreationRequestInput,
  HouseholdInvitation,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function getCurrentHouseholdInfo(client: Axios): Promise<AxiosResponse<APIResponse<Household>>> {
  return client.get<APIResponse<Household>>(backendRoutes.HOUSEHOLD_INFO);
}

export async function getHousehold(client: Axios, id: string): Promise<AxiosResponse<APIResponse<Household>>> {
  return client.get<APIResponse<Household>>(format(backendRoutes.HOUSEHOLD, id));
}

export async function getHouseholds(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<Household>>> {
  return client.get<QueryFilteredResult<Household>>(backendRoutes.HOUSEHOLDS, { params: filter.asRecord() });
}

export async function updateHousehold(
  client: Axios,
  householdID: string,
  household: HouseholdUpdateRequestInput,
): Promise<AxiosResponse<APIResponse<Household>>> {
  return client.put<APIResponse<Household>>(format(backendRoutes.HOUSEHOLD, householdID), household);
}

export async function inviteUserToHousehold(
  client: Axios,
  householdID: string,
  input: HouseholdInvitationCreationRequestInput,
): Promise<AxiosResponse<APIResponse<HouseholdInvitation>>> {
  const uri = format(backendRoutes.HOUSEHOLD_ADD_MEMBER, householdID);

  return client.post<APIResponse<HouseholdInvitation>>(uri, input);
}

export async function removeMemberFromHousehold(
  client: Axios,
  householdID: string,
  memberID: string,
): Promise<AxiosResponse> {
  const uri = format(backendRoutes.HOUSEHOLD_REMOVE_MEMBER, householdID, memberID);
  return client.delete(uri);
}

export async function getReceivedInvites(
  client: Axios,
): Promise<AxiosResponse<QueryFilteredResult<HouseholdInvitation>>> {
  return client.get<QueryFilteredResult<HouseholdInvitation>>(backendRoutes.RECEIVED_HOUSEHOLD_INVITATIONS);
}

export async function getSentInvites(client: Axios): Promise<AxiosResponse<QueryFilteredResult<HouseholdInvitation>>> {
  return client.get<QueryFilteredResult<HouseholdInvitation>>(backendRoutes.SENT_HOUSEHOLD_INVITATIONS);
}
