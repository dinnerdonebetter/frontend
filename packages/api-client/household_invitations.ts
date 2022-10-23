import { Axios, AxiosResponse } from 'axios';
import * as format from 'string-format';

import { HouseholdInvitationUpdateRequestInput } from 'models';
import { backendRoutes } from './routes';

export async function getInvitation(client: Axios, invitationID: string): Promise<AxiosResponse> {
  return this.client.get(format(backendRoutes.HOUSEHOLD_INVITATION, invitationID));
}

export async function acceptInvitation(
  client: Axios,
  invitationID: string,
  input: HouseholdInvitationUpdateRequestInput,
): Promise<AxiosResponse> {
  return this.client.put(format(backendRoutes.ACCEPT_HOUSEHOLD_INVITATION, invitationID), input);
}

export async function cancelInvitation(
  client: Axios,
  invitationID: string,
  input: HouseholdInvitationUpdateRequestInput,
): Promise<AxiosResponse> {
  return this.client.put(format(backendRoutes.CANCEL_HOUSEHOLD_INVITATION, invitationID), input);
}

export async function rejectInvitation(
  client: Axios,
  invitationID: string,
  input: HouseholdInvitationUpdateRequestInput,
): Promise<AxiosResponse> {
  return this.client.put(format(backendRoutes.REJECT_HOUSEHOLD_INVITATION, invitationID), input);
}
