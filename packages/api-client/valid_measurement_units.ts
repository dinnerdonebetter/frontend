import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidMeasurementUnitCreationRequestInput,
  ValidMeasurementUnit,
  QueryFilter,
  ValidMeasurementUnitList,
  ValidMeasurementUnitUpdateRequestInput,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function createValidMeasurementUnit(
  client: Axios,
  input: ValidMeasurementUnitCreationRequestInput,
): Promise<AxiosResponse<ValidMeasurementUnit>> {
  return client.post<ValidMeasurementUnit>(backendRoutes.VALID_MEASUREMENT_UNITS, input);
}

export async function getValidMeasurementUnit(
  client: Axios,
  validMeasurementUnitID: string,
): Promise<AxiosResponse<ValidMeasurementUnit>> {
  return client.get<ValidMeasurementUnit>(format(backendRoutes.VALID_MEASUREMENT_UNIT, validMeasurementUnitID));
}

export async function getValidMeasurementUnits(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidMeasurementUnitList>> {
  return client.get<ValidMeasurementUnitList>(backendRoutes.VALID_MEASUREMENT_UNITS, {
    params: filter.asRecord(),
  });
}

export async function updateValidMeasurementUnit(
  client: Axios,
  validMeasurementUnitID: string,
  input: ValidMeasurementUnitUpdateRequestInput,
): Promise<AxiosResponse<ValidMeasurementUnit>> {
  return client.put<ValidMeasurementUnit>(format(backendRoutes.VALID_MEASUREMENT_UNIT, validMeasurementUnitID), input);
}

export async function deleteValidMeasurementUnit(
  client: Axios,
  validMeasurementUnitID: string,
): Promise<AxiosResponse<ValidMeasurementUnit>> {
  return client.delete(format(backendRoutes.VALID_MEASUREMENT_UNIT, validMeasurementUnitID));
}

export async function searchForValidMeasurementUnits(
  client: Axios,
  query: string,
): Promise<AxiosResponse<ValidMeasurementUnit[]>> {
  const uri = `${backendRoutes.VALID_MEASUREMENT_UNITS_SEARCH}?q=${encodeURIComponent(query)}`;
  return client.get<ValidMeasurementUnit[]>(uri);
}

export async function searchForValidMeasurementUnitsByIngredientID(
  client: Axios,
  validIngredientID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidMeasurementUnitList>> {
  const uri = format(backendRoutes.VALID_MEASUREMENT_UNITS_SEARCH_BY_INGREDIENT, validIngredientID);
  return client.get<ValidMeasurementUnitList>(uri);
}
