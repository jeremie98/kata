import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    const object = plainToClass(metatype!, value);
    const errors = await validate(object, { dismissDefaultMessages: true });

    if (errors.length > 0) {
      const propertiesOnError = this.findPropertiesOnError(errors);

      if (propertiesOnError.every((property) => !property)) return value;

      let errorMessage: string;

      if (propertiesOnError.length === 1) {
        errorMessage = `Le champ ${
          Array.from(propertiesOnError)[0]
        } ne correspond pas au format attendu ou n'est pas renseigné.`;
      } else {
        errorMessage = `Les champs suivants ne correspondent pas au format attendu ou ne sont pas renseignés : ${Array.from(
          propertiesOnError
        ).join(', ')}.`;
      }

      throw new HttpException(errorMessage, 400);
    }
    return value;
  }

  private findPropertiesOnError(
    errors: ValidationError[],
    properties: string[] = []
  ): string[] {
    for (const error of errors) {
      const children = error.children;
      const failedConstraints = Object.keys(error.constraints ?? {});

      if (failedConstraints.length > 0) {
        properties.push(error.property);
      } else if (children) {
        properties.push(...this.findPropertiesOnError(children, properties));
      }
    }
    return properties;
  }
}
