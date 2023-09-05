const { HTTP_STATUS_CREATED, HTTP_STATUS_OK } = require('http2').constants;
const Card = require('../models/card');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

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
            if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError('Карточка с данным _id не найдена'));
            } else if (err.name === 'CastError') {
              next(new BadRequestError('Некорректный _id карточки'));
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
        if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с данным _id: ${req.params.cardId} не найдена`));
        } else if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id: ${req.params.cardId} карточки`));
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
        if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с данным _id: ${req.params.cardId} не найдена`));
        } else if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id: ${req.params.cardId} карточки`));
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
    Card.findById(req.params.cardId)
      .then((card) => {
        if (!card.owner.equals(req.user._id)) {
          throw new ForbiddenError('Карточка вам не принадлежит');
        }
        Card.deleteOne(card)
          .orFail()
          .then(() => {
            res.status(HTTP_STATUS_OK).send({ message: 'Карточка успешно удалена' });
          })
          .catch((err) => {
            if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError(`Карточка с данным _id: ${req.params.cardId} не найдена`));
            } else if (err.name === 'CastError') {
              next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
            } else {
              next(err);
            }
          });
      })
      .catch((err) => {
        if (err.name === 'TypeError') {
          next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
        } else {
          next(err);
        }
      });
  },

};
