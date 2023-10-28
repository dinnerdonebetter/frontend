import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  QueryFilter,
  ValidIngredientMeasurementUnitCreationRequestInput,
  ValidIngredientMeasurementUnit,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function getValidIngredientMeasurementUnit(
  client: Axios,
  validIngredientMeasurementUnitID: string,
): Promise<AxiosResponse<APIResponse<ValidIngredientMeasurementUnit>>> {
  const uri = format(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNIT, validIngredientMeasurementUnitID);
  return client.get<APIResponse<ValidIngredientMeasurementUnit>>(uri);
}

export async function validIngredientMeasurementUnitsForIngredientID(
  client: Axios,
  validIngredientID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientMeasurementUnit>>> {
  const searchURL = format(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNITS_SEARCH_BY_INGREDIENT_ID, validIngredientID);
  return client.get<QueryFilteredResult<ValidIngredientMeasurementUnit>>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function validIngredientMeasurementUnitsForMeasurementUnitID(
  client: Axios,
  validMeasurementUnitID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidIngredientMeasurementUnit>>> {
  const searchURL = format(
    backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNITS_SEARCH_BY_INGREDIENT_ID,
    validMeasurementUnitID,
  );
  return client.get<QueryFilteredResult<ValidIngredientMeasurementUnit>>(searchURL, {
    params: filter.asRecord(),
  });
}

export async function createValidIngredientMeasurementUnit(
  client: Axios,
  input: ValidIngredientMeasurementUnitCreationRequestInput,
): Promise<AxiosResponse<APIResponse<ValidIngredientMeasurementUnit>>> {
  return client.post<APIResponse<ValidIngredientMeasurementUnit>>(
    backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNITS,
    input,
  );
}

export async function deleteValidIngredientMeasurementUnit(
  client: Axios,
  validIngredientMeasurementUnitID: string,
): Promise<AxiosResponse<APIResponse<ValidIngredientMeasurementUnit>>> {
  return client.delete<APIResponse<ValidIngredientMeasurementUnit>>(
    format(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNIT, validIngredientMeasurementUnitID),
  );
}
