const router = require('express').Router();

const {
  addUser,
  editUserData,
  editUserAvatar,
  getUsers,
  getUserById,
} = require('../controllers/users');

router.post('/', addUser);
router.patch('/me', editUserData);
router.patch('/me/avatar', editUserAvatar);
router.get('/', getUsers);
router.get('/:userId', getUserById);

module.exports = router;
