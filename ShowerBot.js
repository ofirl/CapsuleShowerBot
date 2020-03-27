let keyboardUtils = require('./utils/Keyboard');

let consts = require('./consts');
let globals = require('./globals');
let callbackHandlers = require('./utils/callbackHandlers');

const token = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
let bot;

if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
    bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
});

bot.onText(/\/start\b(.*)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    //const resp = match[1]; // the captured "whatever"

    let resp = `Hello ${msg.from.username},\nI'm ShowerBot,\nHow can i help?`;

    // send back the matched "whatever" to the chat
    bot.sendMessage(msg.chat.id, resp, {
        reply_markup: {
            //"keyboard": [["Sample text", "Second sample"], ["Keyboard"], ["I'm robot"]]
            inline_keyboard: [
                [{ text: "Add to queue", callback_data: "addToQueue" }], 
                [{ text: "Show queue", callback_data: "showQueue" }],
                [{ text: "End current shower", callback_data: "endCurrentShower" }],
                [{ text: "Take a break", callback_data: "break" }]
            ]
        }
    });
});

bot.on('callback_query', (msg) => {
    console.log(msg);

    callbackHandlers.callbackHandlersMap[msg.data](bot, msg);
});

// logger
bot.on('message', (msg) => {
    console.log(msg);
  });

bot.on('sticker', (msg) => {
    bot.sendSticker(msg.chat.id, "CAADAQADrwAD82LeB9V0bTtHBQwSAg");
});