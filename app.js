const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

const build = `${__dirname}/build`;
const port = process.env.PORT ? process.env.PORT : 3000;

const app = express();

app.use(morgan('combined'));
app.use(compression());
app.use(express.static(build));

app.get('/norse', (req, res) => res.redirect(301, 'https://youtu.be/lzSgZw9k7Ls'));

app.listen(port, function (error) {
  if (error) {
    console.error(error);
  }

  console.info('Server is now running. Express is listening on port %s', port);
});
