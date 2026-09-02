import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

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
