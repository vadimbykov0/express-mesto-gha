const Card = require('../models/card');

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports = {
  getCards(req, res, next) {
    Card.find({}).sort({ createdAt: -1 })
      .then((cards) => res.send(cards))
      .catch(next);
  },

  createCard(req, res, next) {
    const { name, link } = req.body;
    const owner = req.user._id;
    Card.create({ name, link, owner })
      .orFail()
      .then((card) => res.status(201).send({ data: card }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError('Карточка с _id не найдена'));
        } else {
          next(err);
        }
      });
  },

  deleteCard(req, res, next) {
    const id = req.user._id;
    Card.findById(req.params.cardId)
      .orFail()
      .then((card) => {
        if (!card.owner.equals(id)) {
          throw new ForbiddenError('Нет прав для удаления карточки');
        }
        Card.deleteOne(card)
          .orFail()
          .then(() => {
            res.send({ message: 'Карточка успешно удалена' });
          })
          .catch((err) => {
            if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
            } else if (err.name === 'CastError') {
              next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
            } else {
              next(err);
            }
          });
      })
      .catch((err) => {
        if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
        } else {
          next(err);
        }
      });
  },

  likeCard(req, res, next) {
    const { cardId } = req.params;
    Card.findByIdAndUpdate(
      { _id: cardId },
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .orFail()
      .then((card) => {
        res.send(card);
      })
      .catch((err) => {
        if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
        } else if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
        } else {
          next(err);
        }
      });
  },

  dislikeCard(req, res, next) {
    const { cardId } = req.params;
    Card.findByIdAndUpdate(
      { _id: cardId },
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .orFail()
      .then((card) => {
        res.send(card);
      })
      .catch((err) => {
        if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
        } else if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
        } else {
          next(err);
        }
      });
  },
};
