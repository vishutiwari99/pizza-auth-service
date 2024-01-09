import { checkSchema } from 'express-validator';

export default checkSchema({
  firstName: {
    errorMessage: 'First Name is missing!',
    notEmpty: true,
  },
  lastName: {
    errorMessage: 'Last Name is missing!',
    notEmpty: true,
  },
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

// export default [body('email').notEmpty().withMessage('Email is required!')];
