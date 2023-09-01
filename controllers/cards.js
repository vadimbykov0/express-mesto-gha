const { HTTP_STATUS_CREATED, HTTP_STATUS_OK } = require('http2').constants;
const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');

module.exports = {

  addCard(req, res, next) {
    const { name, link } = req.body;
    Card.create({ name, link, owner: req.user._id })
      .then((card) => {
        Card.findById(card._id)
          .orFail()
          .populate('owner')
          .then((data) => res.status(HTTP_STATUS_CREATED).send(data))
          .catch((err) => {
            if (err.name === 'CastError') {
              next(new BadRequestError('Некорректный _id карточки'));
            } else if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError('Карточка с данным _id не найдена'));
            } else {
              next(err);
            }
          });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else {
          next(err);
        }
      });
  },

  likeCard(req, res, next) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .orFail()
      .populate(['owner', 'likes'])
      .then((card) => {
        res.status(HTTP_STATUS_OK).send(card);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id: ${req.params.cardId} карточки`));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с данным _id: ${req.params.cardId} не найдена`));
        } else {
          next(err);
        }
      });
  },

  dislikeCard(req, res, next) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .orFail()
      .populate(['owner', 'likes'])
      .then((card) => {
        res.status(HTTP_STATUS_OK).send(card);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id: ${req.params.cardId} карточки`));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с данным _id: ${req.params.cardId} не найдена`));
        } else {
          next(err);
        }
      });
  },

  getCards(req, res, next) {
    Card.find({})
      .populate(['owner', 'likes'])
      .then((cards) => res.status(HTTP_STATUS_OK).send(cards))
      .catch(next);
  },

  deleteCard(req, res, next) {
    Card.findByIdAndRemove(req.params.cardId)
      .orFail()
      .then(() => {
        res.status(HTTP_STATUS_OK).send({ message: 'Карточка успешно удалена' });
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с данным _id: ${req.params.cardId} не найдена`));
        } else {
          next(err);
        }
      });
  },

};
