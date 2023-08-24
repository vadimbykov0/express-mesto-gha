const Card = require('../models/card');

module.exports = {

  addCard(req, res) {
    const { name, link } = req.body;
    Card.create({ name, link, owner: req.user._id })
      .then((card) => {
        Card.findById(card._id)
          .orFail()
          .populate('owner')
          .then((data) => res.status(201).send(data))
          .catch((err) => {
            if (err.name === 'CastError') {
              res.status(400).send({ message: 'Некорректный _id карточки' });
            } else if (err.name === 'DocumentNotFoundError') {
              res.status(404).send({ message: 'Карточка с данным _id не найдена' });
            } else {
              res.status(500).send({ message: 'На сервере произошла ошибка' });
            }
          });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(400).send({ message: err.message });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  likeCard(req, res) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .orFail()
      .populate(['owner', 'likes'])
      .then((card) => {
        res.status(200).send(card);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          res.status(400).send({ message: 'Некорректный _id карточки' });
        } else if (err.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: `Карточка с данным _id: ${req.params.cardId} не найдена` });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  dislikeCard(req, res) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .orFail()
      .populate(['owner', 'likes'])
      .then((card) => {
        res.status(200).send(card);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          res.status(400).send({ message: 'Некорректный _id карточки' });
        } else if (err.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: `Карточка с данным _id: ${req.params.cardId} не найдена` });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

  getCards(req, res) {
    Card.find({})
      .populate(['owner', 'likes'])
      .then((cards) => res.status(200).send(cards))
      .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
  },

  deleteCard(req, res) {
    Card.findByIdAndRemove(req.params.cardId)
      .orFail()
      .then(() => {
        res.status(200).send({ message: 'Карточка успешно удалена' });
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          res.status(400).send({ message: `Некорректный _id карточки: ${req.params.cardId}` });
        } else if (err.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: `Карточка с данным _id: ${req.params.cardId} не найдена` });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },

};
