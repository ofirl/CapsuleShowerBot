let keyboardUtils = require('./utils/Keyboard');

let consts = require('./consts');
let globals = require('./globals');
let callbackHandlers = require('./utils/callbackHandlers');
let queueUtils = require('./utils/QueueUtils');

const token = process.env.TOKEN;

const Bot = require('node-telegram-bot-api');
let bot;

if (process.env.NODE_ENV === 'production') {
    bot = new Bot(token);
    bot.setWebHook(process.env.BOT_WEBHOOK + "/" + bot.token, {
        certificate: 'https://capsule-shower-bot.ofirl.com/static/fullchain.pem',
    }).then((res) => console.log(res));
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

    let numberInQueue = queueUtils.getNumberInQueue(msg.from.id);
    let queueActions = [];
    numberInQueue ?
        queueActions.push([{ text: "Remove from queue", callback_data: "removeFromQueue" }])
        :
        queueActions.push([{ text: "Add me to queue", callback_data: "addToQueue" }]);

    if (numberInQueue === 1)
        queueActions.push([{ text: "End current shower", callback_data: "endCurrentShower" }]);

    let resp = `Hello ${msg.from.username},\nI'm ShowerBot,\nHow can i help?`;

    // send back the matched "whatever" to the chat
    bot.sendMessage(msg.chat.id, resp, {
        reply_markup: {
            //"keyboard": [["Sample text", "Second sample"], ["Keyboard"], ["I'm robot"]]
            inline_keyboard: [
                ...queueActions,
                [{ text: "Show queue", callback_data: "showQueue" }],
                // [{ text: "End current shower", callback_data: "endCurrentShower" }],
                // [{ text: "Take a break", callback_data: "break" }]
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

module.exports = bot;