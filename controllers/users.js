const User = require('../models/user');

module.exports = {

  addUser(req, res) {
    const { name, about, avatar } = req.body;
    User.create({ name, about, avatar })
      .then((user) => res.status(201).send(user))
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(400).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  editUserData(req, res) {
    const { name, about } = req.body;
    if (req.user._id) {
      User.findByIdAndUpdate(
        req.user._id,
        { name, about },
        { new: 'true', runValidators: true },
      )
        .then((user) => res.send(user))
        .catch((error) => {
          if (error.name === 'ValidationError') {
            res.status(400).send({ message: error.message });
          } else {
            res.status(404).send({ message: 'Пользователь с данным _id не найден' });
          }
        });
    } else {
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    }
  },

  editUserAvatar(req, res) {
    const { avatar } = req.body;
    if (req.user._id) {
      User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        { new: 'true', runValidators: true },
      )
        .then((user) => res.send(user))
        .catch((error) => {
          if (error.name === 'ValidationError') {
            res.status(400).send({ message: error.message });
          } else {
            res.status(404).send({ message: 'Пользователь с данным _id не найден' });
          }
        });
    } else {
      res.status(500).send({ message: 'На сервере произошла ошибка' });
    }
  },

  getUsers(req, res) {
    User.find({})
      .then((users) => res.status(200).send(users))
      .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
  },

  getUserById(req, res) {
    if (req.params.userId.length === 24) {
      User.findById(req.params.userId)
        .then((user) => {
          if (!user) {
            res.status(404).send({ message: 'Пользователь с данным _id не найден' });
            return;
          }
          res.send(user);
        })
        .catch(() => res.status(404).send({ message: 'Пользователь с данным _id не найден' }));
    } else {
      res.status(400).send({ message: 'Некорректный _id пользователя' });
    }
  },
};
