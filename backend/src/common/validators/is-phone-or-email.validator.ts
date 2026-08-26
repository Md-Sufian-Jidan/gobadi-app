import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?880|0)?1[3-9]\d{8}$/;

export function IsPhoneOrEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoneOrEmail',
      target: object.constructor,
      propertyName,
      options: {
        message: `${propertyName} must be a valid phone number or email address`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            (EMAIL_REGEX.test(value) || PHONE_REGEX.test(value))
          );
        },
      },
    });
  };
}
