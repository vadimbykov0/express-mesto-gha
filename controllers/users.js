const User = require('../models/user');

module.exports = {

  addUser(req, res) {
    const { name, about, avatar } = req.body;
    User.create({ name, about, avatar })
      .then((user) => res.status(201).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(400).send({ message: err.message });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  editUserData(req, res) {
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
          res.status(400).send({ message: err.message });
        } else if (err.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: 'Пользователь с данным _id не найден' });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  editUserAvatar(req, res) {
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
          res.status(400).send({ message: err.message });
        } else if (err.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: 'Пользователь с данным _id не найден' });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  getUsers(req, res) {
    User.find({})
      .then((users) => res.status(200).send(users))
      .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
  },

  getUserById(req, res) {
    User.findById(req.params.userId)
      .orFail()
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          res.status(400).send({ message: `Некорректный _id: ${req.params.userId}` });
        } else if (err.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: `Пользователь с данным _id: ${req.params.userId} не найден` });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

};
