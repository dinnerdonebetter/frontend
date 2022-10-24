import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidInstrumentCreationRequestInput,
  ValidInstrument,
  QueryFilter,
  ValidInstrumentList,
  ValidInstrumentUpdateRequestInput,
} from 'models';
import { backendRoutes } from './routes';

export async function createValidInstrument(
  client: Axios,
  input: ValidInstrumentCreationRequestInput,
): Promise<AxiosResponse<ValidInstrument>> {
  return client.post<ValidInstrument>(backendRoutes.VALID_INSTRUMENTS, input);
}

export async function getValidInstrument(
  client: Axios,
  validInstrumentID: string,
): Promise<AxiosResponse<ValidInstrument>> {
  return client.get<ValidInstrument>(format(backendRoutes.VALID_INSTRUMENT, validInstrumentID));
}

export async function getValidInstruments(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidInstrumentList>> {
  return client.get<ValidInstrumentList>(backendRoutes.VALID_INSTRUMENTS, {
    params: filter.asRecord(),
  });
}

export async function updateValidInstrument(
  client: Axios,
  validInstrumentID: string,
  input: ValidInstrumentUpdateRequestInput,
): Promise<AxiosResponse<ValidInstrument>> {
  return client.put<ValidInstrument>(format(backendRoutes.VALID_INSTRUMENT, validInstrumentID), input);
}

export async function deleteValidInstrument(
  client: Axios,
  validInstrumentID: string,
): Promise<AxiosResponse<ValidInstrument>> {
  return client.delete(format(backendRoutes.VALID_INSTRUMENT, validInstrumentID));
}

export async function searchForValidInstruments(
  client: Axios,
  query: string,
): Promise<AxiosResponse<ValidInstrument[]>> {
  const searchURL = `${backendRoutes.VALID_INSTRUMENTS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ValidInstrument[]>(searchURL);
}
