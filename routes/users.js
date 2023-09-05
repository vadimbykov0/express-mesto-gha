const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  editUserData,
  editUserAvatar,
  getUsers,
  getUserById,
  getMeUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getMeUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), editUserData);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/),
  }),
}), editUserAvatar);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required,
  }),
}), getUserById);

module.exports = router;
