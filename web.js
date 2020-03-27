const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');

const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, //"0.0.0.0", 
() => {
  console.log(`Express server is listening on ${process.env.PORT}`);
}
);

module.exports = (bot) => {
  app.post('/' + bot.token, (req, res) => {
    console.log('testing bot?');
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};
