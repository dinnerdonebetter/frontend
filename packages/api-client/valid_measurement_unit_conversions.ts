import { Axios, AxiosResponse } from 'axios';
import format from 'string-format';

import {
  ValidMeasurementUnitConversionCreationRequestInput,
  ValidMeasurementUnitConversion,
  QueryFilter,
  ValidMeasurementUnitConversionUpdateRequestInput,
  QueryFilteredResult,
  APIResponse,
} from '@dinnerdonebetter/models';

import { backendRoutes } from './routes';

export async function createValidMeasurementUnitConversion(
  client: Axios,
  input: ValidMeasurementUnitConversionCreationRequestInput,
): Promise<AxiosResponse<APIResponse<ValidMeasurementUnitConversion>>> {
  return client.post<APIResponse<ValidMeasurementUnitConversion>>(
    backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS,
    input,
  );
}

export async function getValidMeasurementUnitConversion(
  client: Axios,
  validMeasurementUnitConversionID: string,
): Promise<AxiosResponse<APIResponse<ValidMeasurementUnitConversion>>> {
  return client.get<APIResponse<ValidMeasurementUnitConversion>>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSION, validMeasurementUnitConversionID),
  );
}

export async function getValidMeasurementUnitConversionsFromUnit(
  client: Axios,
  validMeasurementUnitID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidMeasurementUnitConversion[]>> {
  return client.get<ValidMeasurementUnitConversion[]>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS_FROM_UNIT, validMeasurementUnitID),
    {
      params: filter.asRecord(),
    },
  );
}

export async function getValidMeasurementUnitConversionsToUnit(
  client: Axios,
  validMeasurementUnitID: string,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<ValidMeasurementUnitConversion[]>> {
  return client.get<ValidMeasurementUnitConversion[]>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS_TO_UNIT, validMeasurementUnitID),
    {
      params: filter.asRecord(),
    },
  );
}

export async function getValidMeasurementUnitConversions(
  client: Axios,
  filter: QueryFilter = QueryFilter.Default(),
): Promise<AxiosResponse<QueryFilteredResult<ValidMeasurementUnitConversion>>> {
  return client.get<QueryFilteredResult<ValidMeasurementUnitConversion>>(
    backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSIONS,
    {
      params: filter.asRecord(),
    },
  );
}

export async function updateValidMeasurementUnitConversion(
  client: Axios,
  validMeasurementUnitConversionID: string,
  input: ValidMeasurementUnitConversionUpdateRequestInput,
): Promise<AxiosResponse<APIResponse<ValidMeasurementUnitConversion>>> {
  return client.put<APIResponse<ValidMeasurementUnitConversion>>(
    format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSION, validMeasurementUnitConversionID),
    input,
  );
}

export async function deleteValidMeasurementUnitConversion(
  client: Axios,
  validMeasurementUnitConversionID: string,
): Promise<AxiosResponse<APIResponse<ValidMeasurementUnitConversion>>> {
  return client.delete(format(backendRoutes.VALID_MEASUREMENT_UNIT_CONVERSION, validMeasurementUnitConversionID));
}
