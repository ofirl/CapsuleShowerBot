let globals = require('../globals');
let queueUtils = require('./QueueUtils');

console.log(globals);

function showQueue(bot, msg) {
    bot.sendMessage(msg.from.id, queueUtils.parseQueue());
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

    bot.editMessageText("Hope you enjoyed your shower :)\nAre there hot water left?",
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
}

function callNextInLine(bot, msg) {
    bot.editMessageText("Hope you enjoyed your shower :)",
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
    
    if (queueUtils.queue.length < 2)
        return;

    bot.sendMessage(queueUtils.queue[1].id, `You are next in line, get ready`);
}

function takeWaterBreak(bot, msg) {
    bot.editMessageText("Hope you enjoyed your shower :)",
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
}

const callbackHandlersMap = {
    showQueue,
    addToQueue,
    removeFromQueue,
    endCurrentShower,
    callNextInLine,
    takeWaterBreak,
};

module.exports = {
    callbackHandlersMap,
    showQueue,
};