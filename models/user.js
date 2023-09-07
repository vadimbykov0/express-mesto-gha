const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { emailRegex, urlRegex } = require('../utils/constants');

const UnauthorizedError = require('../errors/unauthorized-error');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Минимальная длина поля 2 символа'],
    maxlength: [30, 'Максимальная длина поля 30 символов'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Минимальная длина поля 2 символа'],
    maxlength: [30, 'Максимальная длина поля 30 символов'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(url) {
        return urlRegex.test(url);
      },
      message: 'Ошибка валидации URL адреса',
    },
  },
  email: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    unique: true,
    validate: {
      validator(email) {
        return emailRegex.test(email);
      },
      message: (props) => `${props.value} не является email`,
    },
  },
  password: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    select: false,
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function func(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user || !bcrypt.compare(password, user.password)) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      return user;
    });
};

module.exports = mongoose.model('user', userSchema);
