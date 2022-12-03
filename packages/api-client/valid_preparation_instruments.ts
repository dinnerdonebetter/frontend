import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidPreparationInstrumentList,
  ValidPreparationInstrumentCreationRequestInput,
  ValidPreparationInstrument,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function validPreparationInstrumentsForPreparationID(
  client: Axios,
  validPreparationID: string,
): Promise<AxiosResponse<ValidPreparationInstrumentList>> {
  const searchURL = format(backendRoutes.VALID_PREPARATION_INSTRUMENTS_SEARCH_BY_PREPARATION_ID, validPreparationID);
  return client.get<ValidPreparationInstrumentList>(searchURL);
}

export async function validPreparationInstrumentsForInstrumentID(
  client: Axios,
  validInstrumentID: string,
): Promise<AxiosResponse<ValidPreparationInstrumentList>> {
  const searchURL = format(backendRoutes.VALID_PREPARATION_INSTRUMENTS_SEARCH_BY_PREPARATION_ID, validInstrumentID);
  return client.get<ValidPreparationInstrumentList>(searchURL);
}

export async function createValidPreparationInstrument(
  client: Axios,
  input: ValidPreparationInstrumentCreationRequestInput,
): Promise<AxiosResponse<ValidPreparationInstrument>> {
  return client.post<ValidPreparationInstrument>(backendRoutes.VALID_PREPARATION_INSTRUMENTS, input);
}

export async function deleteValidPreparationInstrument(
  client: Axios,
  validPreparationInstrumentID: string,
): Promise<AxiosResponse> {
  return client.delete(format(backendRoutes.VALID_PREPARATION_INSTRUMENT, validPreparationInstrumentID));
}
