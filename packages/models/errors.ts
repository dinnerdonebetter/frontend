// Code generated by gen_typescript. DO NOT EDIT.

export interface IAPIError {
  message: NonNullable<string>;
  code: NonNullable<number>;
}

export class APIError implements IAPIError {
  message: NonNullable<string> = '';
  code: NonNullable<number> = 0;

  constructor(
    input: {
      message?: string;
      code?: number;
    } = {},
  ) {
    this.message = input.message ?? '';
    this.code = input.code ?? 0;
  }
}
