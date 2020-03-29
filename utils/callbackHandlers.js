let globals = require('../globals');
let queueUtils = require('./QueueUtils');
let stateUtils = require('./stateManager');
let consts = require('../consts');
let mathUtils = require('./mathUtils');
let { answerCallbackQueryMiddleware } = require('./middlewares');

console.log(globals);

function showQueue(bot, msg) {
    bot.sendMessage(msg.from.id, "Waiting:\n" + queueUtils.parseQueue());
}

function addToQueue(bot, msg) {
    let currentNumber = queueUtils.getNumberInQueue(msg.from.id);
    if (currentNumber != null) {
        bot.editMessageText(`You are already number ${currentNumber} in the queue`,
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );
        return;
    }

    let numberInQueue = queueUtils.addToQueue(msg.from);
    bot.editMessageReplyMarkup(
        {
            inline_keyboard: [
                [{ text: "Remove from queue", callback_data: "removeFromQueue" }],
                [{ text: "Show queue", callback_data: "showQueue" }],
            ],
        },
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
    bot.sendMessage(msg.from.id, `You have been added to the queue,\nYou are number ${numberInQueue}`);

    if (queueUtils.queue.length === 1)
        bot.sendMessage(consts.adminGroupChatId, `There are people waiting to take a shower`);
}

function removeFromQueue(bot, msg) {
    queueUtils.removeFromQueue(msg.from.id);
    bot.editMessageText("You have been removed from the queue",
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
}

function endCurrentShower(bot, msg) {
    queueUtils.popQueue();

    bot.editMessageText("Hope you enjoyed your shower :)\nAre there any hot water left?",
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Yes", callback_data: "callNextInLine" }],
                    [{ text: "No", callback_data: "takeWaterBreak" }],
                ]
            },
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );

    if (queueUtils.queue.length === 0) {
        stateUtils.startBreak(bot, msg);
        bot.sendMessage(consts.adminGroupChatId, "The queue is now empty,\nTaking a break");
    }
}

function callNextInLine(bot, msg) {
    bot.editMessageText("Hope you enjoyed your shower :)",
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
    bot.sendSticker(msg.message.chat.id, consts.showerDoneStickers[mathUtils.getRandomNumber(0, consts.showerDoneStickers.length - 1)]);

    if (queueUtils.queue.length < 1 || globals.state.break)
        return;

    bot.sendMessage(queueUtils.queue[0].id, `The shower is now yours`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "End shower", callback_data: "endCurrentShower" }],
            ]
        }
    });

    if (queueUtils.queue.length < 2)
        return;

    bot.sendMessage(queueUtils.queue[1].id, `${queueUtils.queue[0].first_name || ""} ${queueUtils.queue[0].last_name || ""} ${queueUtils.queue[0].username ? `(@${queueUtils.queue[0].username})` : ""} is now going to the shower,\nYou can get ready, you are next `);
}

function takeWaterBreak(bot, msg) {
    bot.editMessageText("Hope you enjoyed your shower :)",
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
    bot.sendSticker(msg.message.chat.id, "CAACAgIAAxkBAAIC415_Q6ABYGrpRapRTU2MzeBkJCDtAAJZAANEDc8X-HZZ1vlXfjgYBA");

    stateUtils.startBreak(bot, msg);
    bot.sendMessage(consts.adminGroupChatId, `There are no hot water, taking a break`);
}

const callbackHandlersMap = {
    ...[
        showQueue,
        addToQueue,
        removeFromQueue,
        endCurrentShower,
        callNextInLine,
        takeWaterBreak
    ].reduce((acc, f) => {
        acc[f.name] = answerCallbackQueryMiddleware(f);
        return acc;
    }, {}),
};

module.exports = {
    callbackHandlersMap,
    showQueue,
};