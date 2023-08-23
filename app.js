const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const usersRouter = require('./routes/users');
// const cardsRouter = require('./routes/cards');

const { PORT = 3000, DB_URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('DB is connected'))
  .catch((err) => console.log('DB error', err));

// app.use((req, res, next) => {
//   req.user = {
//     _id: '64e651f9e0d8bc01b410cce5',
//   };
//   next();
// });

app.use('/users', usersRouter);
// app.use('/cards', cardsRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
