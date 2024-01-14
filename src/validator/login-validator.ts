import { checkSchema } from 'express-validator';

export default checkSchema({
  password: {
    errorMessage: 'Password is missing',
    notEmpty: true,
    trim: true,
    isLength: {
      options: {
        min: 8,
      },
    },
  },
  email: {
    errorMessage: 'Email is required!',
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
});
