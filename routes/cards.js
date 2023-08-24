const router = require('express').Router();

const {
  addCard,
  likeCard,
  dislikeCard,
  getCards,
  deleteCard,
} = require('../controllers/cards');

router.post('/', addCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);
router.get('/', getCards);
router.delete('/:cardId', deleteCard);

module.exports = router;
