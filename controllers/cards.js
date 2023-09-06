const mongoose = require('mongoose');
const Card = require('../models/card');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports = {
  addCard(req, res, next) {
    const { name, link } = req.body;
    Card.create({ name, link, owner: req.user._id })
      .then((card) => {
        Card.findById(card._id)
          .orFail()
          .populate('owner')
          .then((data) => res.status(201).send(data))
          .catch((err) => {
            if (err instanceof mongoose.Error.DocumentNotFoundError) {
              next(new NotFoundError('Карточка с указанным _id не найдена'));
            } else {
              next(err);
            }
          });
      })
      .catch((err) => {
        if (err instanceof mongoose.Error.ValidationError) {
          next(new BadRequestError(err.message));
        } else {
          next(err);
        }
      });
  },

  getCards(req, res, next) {
    Card.find({})
      .populate(['owner', 'likes'])
      .then((cards) => res.status(200).send(cards))
      .catch(next);
  },

  deleteCard(req, res, next) {
    Card.findById(req.params.cardId)
      .then((card) => {
        if (!card.owner.equals(req.user._id)) {
          throw new ForbiddenError('Карточка другого пользовател');
        }
        Card.deleteOne(card)
          .orFail()
          .then(() => {
            res.status(200).send({ message: 'Карточка удалена' });
          })
          .catch((err) => {
            if (err instanceof mongoose.Error.DocumentNotFoundError) {
              next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
            } else if (err instanceof mongoose.Error.CastError) {
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

  likeCard(req, res, next) {
    Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
      .orFail()
      .populate(['owner', 'likes'])
      .then((card) => {
        res.status(200).send(card);
      })
      .catch((err) => {
        if (err instanceof mongoose.Error.DocumentNotFoundError) {
          next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
        } else if (err instanceof mongoose.Error.CastError) {
          next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
        } else {
          next(err);
        }
      });
  },

  dislikeCard(req, res, next) {
    Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
      .orFail()
      .populate(['owner', 'likes'])
      .then((card) => {
        res.status(200).send(card);
      })
      .catch((err) => {
        if (err instanceof mongoose.Error.DocumentNotFoundError) {
          next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
        } else if (err instanceof mongoose.Error.CastError) {
          next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
        } else {
          next(err);
        }
      });
  },
};
