const signUpRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { emailRegex, urlRegex } = require('../utils/constants');

const { createUser } = require('../controllers/users');

signUpRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(urlRegex),
    email: Joi.string().required().pattern(emailRegex),
    password: Joi.string().required(),
  }),
}), createUser);

module.exports = signUpRouter;
