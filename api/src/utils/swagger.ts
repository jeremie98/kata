import { ApiResponse } from '@kata/typings';
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

export class ApiResponseDto<T> implements ApiResponse<T> {
  @ApiProperty()
  data!: T;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty()
  success!: boolean;

  @ApiProperty({ required: false })
  count?: number;
}

type Primitive = 'string' | 'number' | 'boolean';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPrimitiveType = (type: any): type is Primitive =>
  ['string', 'number', 'boolean'].includes(type);

export const ApiOkResponseCustom = <DataDto extends Type<unknown> | Primitive>(
  dataDto: DataDto,
  isArray: boolean = false,
  isPrimitive: boolean = false
) => {
  const schemaProperties = isPrimitive
    ? { type: dataDto as Primitive }
    : isArray
      ? {
          type: 'array',
          items: { $ref: getSchemaPath(dataDto as Type<unknown>) },
        }
      : { $ref: getSchemaPath(dataDto as Type<unknown>) };

  return applyDecorators(
    !isPrimitiveType(dataDto)
      ? ApiExtraModels(ApiResponseDto, dataDto as Type<unknown>)
      : ApiExtraModels(ApiResponseDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: schemaProperties,
            },
          },
        ],
      },
    })
  );
};
