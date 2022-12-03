import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  QueryFilter,
  ValidIngredientMeasurementUnitList,
  ValidIngredientMeasurementUnitCreationRequestInput,
  ValidIngredientMeasurementUnit,
} from '@prixfixeco/models';

import { backendRoutes } from './routes';

export async function validIngredientMeasurementUnitsForIngredientID(
  client: Axios,
  validIngredientID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidIngredientMeasurementUnitList>> {
  const searchURL = format(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNITS_SEARCH_BY_INGREDIENT_ID, validIngredientID);
  return client.get<ValidIngredientMeasurementUnitList>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function validIngredientMeasurementUnitsForMeasurementUnitID(
  client: Axios,
  validMeasurementUnitID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidIngredientMeasurementUnitList>> {
  const searchURL = format(
    backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNITS_SEARCH_BY_INGREDIENT_ID,
    validMeasurementUnitID,
  );
  return client.get<ValidIngredientMeasurementUnitList>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function createValidIngredientMeasurementUnit(
  client: Axios,
  input: ValidIngredientMeasurementUnitCreationRequestInput,
): Promise<AxiosResponse<ValidIngredientMeasurementUnit>> {
  return client.post<ValidIngredientMeasurementUnit>(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNITS, input);
}

export async function deleteValidIngredientMeasurementUnit(
  client: Axios,
  validIngredientMeasurementUnitID: string,
): Promise<AxiosResponse<ValidIngredientMeasurementUnit>> {
  return client.delete<ValidIngredientMeasurementUnit>(
    format(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNIT, validIngredientMeasurementUnitID),
  );
}
