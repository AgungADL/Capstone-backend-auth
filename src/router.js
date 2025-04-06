const Joi = require('@hapi/joi');
const { registerHandler, verifyEmailHandler, loginHandler } = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/register',
    handler: registerHandler,
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().min(3).required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
        failAction: (request, h, err) => {
          return h.response({ status: 'fail', message: err.details[0].message }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/verify-email',
    handler: verifyEmailHandler,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          code: Joi.string().min(6).required(),
        }),
        failAction: (request, h, err) => {
          return h.response({ status: 'fail', message: err.details[0].message }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler: loginHandler,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
        failAction: (request, h, err) => {
          return h.response({ status: 'fail', message: err.details[0].message }).code(400).takeover();
        },
      },
    },
  },
];

module.exports = routes;