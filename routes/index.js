const router = require('express').Router();

const usersRouter = require('./users');
const cardsRouter = require('./cards');
const signinRouter = require('./signin');
const signupRouter = require('./signup');

const NotFoundError = require('../errors/NotFoundError');

const auth = require('../middlewares/auth');

router.use('/signin', signinRouter);
router.use('/signup', signupRouter);

router.use(auth);

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
