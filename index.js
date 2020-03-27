require("dotenv").config();

var showerBot = require('./ShowerBot');
require('./web')(showerBot);