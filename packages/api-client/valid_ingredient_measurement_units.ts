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
): Promise<ValidIngredientMeasurementUnit> {
  return new Promise(async function (resolve, reject) {
    const response = await client.get<APIResponse<ValidIngredientMeasurementUnit>>(
      format(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNIT, validIngredientMeasurementUnitID),
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
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
): Promise<ValidIngredientMeasurementUnit> {
  return new Promise(async function (resolve, reject) {
    const response = await client.post<APIResponse<ValidIngredientMeasurementUnit>>(
      backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNITS,
      input,
    );

    if (response.data.error) {
      reject(new Error(response.data.error.message));
    }

    resolve(response.data.data);
  });
}

export async function deleteValidIngredientMeasurementUnit(
  client: Axios,
  validIngredientMeasurementUnitID: string,
): Promise<AxiosResponse<ValidIngredientMeasurementUnit>> {
  return client.delete<ValidIngredientMeasurementUnit>(
    format(backendRoutes.VALID_INGREDIENT_MEASUREMENT_UNIT, validIngredientMeasurementUnitID),
  );
}
