const { HTTP_STATUS_CREATED, HTTP_STATUS_OK } = require('http2').constants;
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports = {

  addUser(req, res, next) {
    const { name, about, avatar } = req.body;
    User.create({ name, about, avatar })
      .then((user) => res.status(HTTP_STATUS_CREATED).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else {
          next(err);
        }
      });
  },

  editUserData(req, res, next) {
    const { name, about } = req.body;
    User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: 'true', runValidators: true },
    )
      .orFail()
      .then((user) => res.status(HTTP_STATUS_OK).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Пользователь с данным _id: ${req.user._id} не найден`));
        } else {
          next(err);
        }
      });
  },

  editUserAvatar(req, res, next) {
    const { avatar } = req.body;
    User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: 'true', runValidators: true },
    )
      .orFail()
      .then((user) => res.status(HTTP_STATUS_OK).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Пользователь с данным _id: ${req.user._id} не найден`));
        } else {
          next(err);
        }
      });
  },

  getUsers(req, res, next) {
    User.find({})
      .then((users) => res.status(HTTP_STATUS_OK).send(users))
      .catch(next);
  },

  getUserById(req, res, next) {
    User.findById(req.params.userId)
      .orFail()
      .then((user) => {
        res.status(HTTP_STATUS_OK).send(user);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id: ${req.params.userId}`));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Пользователь с данным _id: ${req.params.userId} не найден`));
        } else {
          next(err);
        }
      });
  },

};
