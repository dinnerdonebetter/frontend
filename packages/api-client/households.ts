import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  Household,
  QueryFilter,
  HouseholdList,
  HouseholdUpdateRequestInput,
  HouseholdInvitationCreationRequestInput,
  HouseholdInvitationList,
  HouseholdInvitation,
} from '@prixfixeco/models';
import { backendRoutes } from './routes';

export async function getCurrentHouseholdInfo(client: Axios): Promise<AxiosResponse<Household>> {
  return client.get<Household>(backendRoutes.HOUSEHOLD_INFO);
}

export async function getHousehold(client: Axios, id: string): Promise<AxiosResponse<Household>> {
  return client.get<Household>(format(backendRoutes.HOUSEHOLD, id));
}

export async function getHouseholds(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<HouseholdList>> {
  return client.get<HouseholdList>(backendRoutes.HOUSEHOLDS, { params: filter.asRecord() });
}

export async function updateHousehold(
  client: Axios,
  householdID: string,
  household: HouseholdUpdateRequestInput,
): Promise<AxiosResponse<Household>> {
  return client.put<Household>(format(backendRoutes.HOUSEHOLD, householdID), household);
}

export async function inviteUserToHousehold(
  client: Axios,
  householdID: string,
  input: HouseholdInvitationCreationRequestInput,
): Promise<AxiosResponse<HouseholdInvitation>> {
  const uri = format(backendRoutes.HOUSEHOLD_ADD_MEMBER, householdID);

  return client.post<HouseholdInvitation>(uri, input);
}

export async function removeMemberFromHousehold(
  client: Axios,
  householdID: string,
  memberID: string,
): Promise<AxiosResponse> {
  const uri = format(backendRoutes.HOUSEHOLD_REMOVE_MEMBER, householdID, memberID);
  return client.delete(uri);
}

export async function getReceivedInvites(client: Axios): Promise<AxiosResponse<HouseholdInvitationList>> {
  return client.get<HouseholdInvitationList>(backendRoutes.RECEIVED_HOUSEHOLD_INVITATIONS);
}

export async function getSentInvites(client: Axios): Promise<AxiosResponse<HouseholdInvitationList>> {
  return client.get<HouseholdInvitationList>(backendRoutes.SENT_HOUSEHOLD_INVITATIONS);
}
