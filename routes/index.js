const router = require('express').Router();
const auth = require('../middlewares/auth');

const signUpRouter = require('./signup');
const signInRouter = require('./singnin');
const usersRouter = require('./users');
const cardsRouter = require('./cards');

const NotFoundError = require('../errors/NotFoundError');

router.use('/signup', signUpRouter);
router.use('/signin', signInRouter);

router.use(auth);

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

module.exports = router;
