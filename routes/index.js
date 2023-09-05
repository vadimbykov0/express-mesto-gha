const router = require('express').Router();

const usersRouter = require('./users');
const cardsRouter = require('./cards');

const auth = require('../middlewares/auth');

const signInRouter = require('./signin');
const signUpRouter = require('./signup');

const NotFoundError = require('../errors/NotFoundError');

router.use('/signup', signInRouter);
router.use('/signin', signUpRouter);

router.use('/users', auth, usersRouter);
router.use('/cards', auth, cardsRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

module.exports = router;
