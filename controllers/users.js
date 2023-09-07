const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { SECRET_KEY = 'some-secret-key' } = process.env;

const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');

module.exports = {
  getUsers(req, res, next) {
    User.find({})
      .then((users) => res.status(200).send(users))
      .catch(next);
  },

  getUserById(req, res, next) {
    User.findById(req.params.userId)
      .orFail()
      .then((user) => res.status(200).send(user))
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id: ${req.params.userId}`));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Нет пользователя с таким _id: ${req.params.userId}`));
        } else {
          next(err);
        }
      });
  },

  getCurrentUser(req, res, next) {
    User.findById(req.user._id)
      .then((users) => res.status(200).send(users))
      .catch(next);
  },

  updateCurrentUser(req, res, next) {
    const { name, about } = req.body;
    User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: 'true', runValidators: true },
    )
      .orFail()
      .then((user) => res.status(200).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Нет пользователя с таким _id: ${req.user._id}`));
        } else {
          next(err);
        }
      });
  },

  updateAvatar(req, res, next) {
    const { avatar } = req.body;
    User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: 'true', runValidators: true },
    )
      .orFail()
      .then((user) => res.status(200).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Нет пользователя с таким _id: ${req.user._id}`));
        } else {
          next(err);
        }
      });
  },

  createUser(req, res, next) {
    const {
      name,
      about,
      avatar,
      email,
      password,
    } = req.body;
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
        .then((user) => res.status(201).send({
          name: user.name,
          about: user.about,
          avatar: user.avatar,
          _id: user._id,
          email: user.email,
        }))
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictError(`Пользователь с таким email: ${email} существует`));
          } else if (err.name === 'ValidationError') {
            next(new BadRequestError(err.message));
          } else {
            next(err);
          }
        }));
  },

  login(req, res, next) {
    const { email, password } = req.body;
    return User.findUserByCredentials(email, password)
      .then((user) => {
        const token = jwt.sign(
          { _id: user._id },
          SECRET_KEY,
          { expiresIn: '7d' },
        );
        res.send({ token });
      })
      .catch((err) => {
        next(err);
      });
  },
};
