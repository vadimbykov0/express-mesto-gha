const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');

module.exports = {
  getUsers(req, res, next) {
    User.find({})
      .then((users) => res.send(users))
      .catch(next);
  },

  getUserById(req, res, next) {
    User.findById(req.params.userId)
      .orFail(() => new NotFoundError(`Нет пользователя с таким _id: ${req.params.userId}`))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id: ${req.params.userId}`));
        } else {
          next(err);
        }
      });
  },

  getCurrentUser(req, res, next) {
    const userId = req.user._id;
    User.findById(userId)
      .orFail(() => new NotFoundError(`Нет пользователя с таким _id: ${req.user._id}`))
      .then((currentUser) => res.send(currentUser))
      .catch(next);
  },

  updateCurrentUser(req, res, next) {
    const { name, about } = req.body;
    User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: 'true', runValidators: true },
    )
      .orFail(() => new NotFoundError(`Нет пользователя с таким _id: ${req.user._id}`))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
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
      .orFail(() => new NotFoundError(`Нет пользователя с таким _id: ${req.user._id}`))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
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
    bcrypt.hash(password, SALT_ROUNDS)
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
        const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '7d' });
        res.send({ token });
      })
      .catch((err) => {
        next(err);
      });
  },
};
