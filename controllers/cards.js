const Card = require('../models/card');

module.exports = {

  addCard(req, res) {
    const { name, link } = req.body;
    Card.create({ name, link, owner: req.user._id })
      .then((card) => {
        Card.findById(card._id)
          .populate('owner')
          .then((data) => res.status(201).send(data))
          .catch(() => res.status(404).send({ message: 'Карточка с данным _id не найдена' }));
      })
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(400).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  likeCard(req, res) {
    if (req.params.cardId.length === 24) {
      Card.findByIdAndUpdate(
        req.params.cardId,
        { $addToSet: { likes: req.user._id } },
        { new: true },
      )
        .populate(['owner', 'likes'])
        .then((card) => {
          if (!card) {
            res.status(404).send({ message: 'Карточка с данным _id не найдена' });
            return;
          }
          res.send(card);
        })
        .catch(() => res.status(404).send({ message: 'Карточка с данным _id не найдена' }));
    } else {
      res.status(400).send({ message: 'Некорректный _id карточки' });
    }
  },

  dislikeCard(req, res) {
    if (req.params.cardId.length === 24) {
      Card.findByIdAndUpdate(
        req.params.cardId,
        { $pull: { likes: req.user._id } },
        { new: true },
      )
        .populate(['owner', 'likes'])
        .then((card) => {
          if (!card) {
            res.status(404).send({ message: 'Карточка с данным _id не найдена' });
            return;
          }
          res.send(card);
        })
        .catch(() => res.status(404).send({ message: 'Карточка с данным _id не найдена' }));
    } else {
      res.status(400).send({ message: 'Некорректный _id карточки' });
    }
  },

  getCards(req, res) {
    Card.find({})
      .populate(['owner', 'likes'])
      .then((cards) => res.status(200).send(cards))
      .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
  },

  deleteCard(req, res) {
    if (req.params.cardId.length === 24) {
      Card.findByIdAndRemove(req.params.cardId)
        .then((card) => {
          if (!card) {
            res.status(404).send({ message: 'Карточка с данным _id не найдена' });
            return;
          }
          res.send({ message: 'Карточка успешно удалена' });
        })
        .catch(() => res.status(404).send({ message: 'Карточка с данным _id не найдена' }));
    } else {
      res.status(400).send({ message: 'Некорректный _id карточки' });
    }
  },
};
