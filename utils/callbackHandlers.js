let globals = require('../globals');
let queueUtils = require('./QueueUtils');
let stateUtils = require('./stateManager');
let userUtils = require('./userUtils');
let consts = require('../consts');
let mathUtils = require('./mathUtils');

let { answerCallbackQueryMiddleware } = require('./middlewares');

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

    bot.sendMessage(consts.adminGroupChatId, `${userUtils.formatName(msg.from)} has joind the queue`);
}

function removeFromQueue(bot, msg) {
    let prevQueueIndex = queueUtils.getQueueIndex(msg.from.id);
    if (queueUtils.removeFromQueue(bot, msg, msg.from.id)) {
        bot.editMessageText("You have been removed from the queue",
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );

        bot.sendMessage(consts.adminGroupChatId, `${userUtils.formatName(msg.from)} has left the queue`);

        if (prevQueueIndex === 0 && !stateUtils.getBreakStatus())
            queueUtils.sendEndShowerNotice(bot);

        if (queueUtils.queue.length === 0) {
            stateUtils.startBreak(bot, msg);
            bot.sendMessage(consts.adminGroupChatId, "The queue is now empty,\nTaking a break");
        }
    }
    else {
        bot.editMessageText("You are not in the queue dummy...",
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );
    }
}

function endCurrentShower(bot, msg) {
    if (queueUtils.getNumberInQueue(msg.message.chat.id) !== 1) {
        bot.editMessageText("You are not the first in queue...",
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );
        return;
    }

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

    queueUtils.sendEndShowerNotice(bot);

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

function switchPosition(bot, msg) {
    let currentQueueIndex = queueUtils.getQueueIndex(msg.from.id);
    if (currentQueueIndex != null) {
        if (stateUtils.findUserSwitchByFrom(msg.from.id)) {
            bot.editMessageText("You already have an active switch request,\nOnly 1 active switch request is allowed",
                {
                    chat_id: msg.message.chat.id,
                    message_id: msg.message.message_id
                }
            );
            return
        }

        bot.editMessageReplyMarkup({

        },
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );

        stateUtils.addUserSwitch(msg.from.id);

        bot.sendMessage(msg.from.id, `With who do you want to switch? (1-${queueUtils.queue.length})\n${queueUtils.parseQueue()}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Cancel", callback_data: "cancelSwitch" }],
                ]
            }
        });
    }
    else {
        bot.editMessageText("You are not even in the queue dummy...",
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );
    }
}

function cancelSwitch(bot, msg) {
    stateUtils.cancelSwitch(msg.from.id);

    bot.sendMessage(msg.from.id, `Switch canceled`);
}

function messageHandler(bot, msg) {
    let userSwitch = stateUtils.findUserSwitchByFrom(msg.from.id);
    if (userSwitch) {
        let dst;
        try {
            if (msg.text.match(/\D/) != null)
                throw "Nan";

            dst = parseInt(msg.text);
        }
        catch (e) {
            bot.sendMessage(msg.from.id, `Oops...\nIt appears there was an error parsing your number, please try again`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Cancel", callback_data: "cancelSwitch" }],
                    ]
                }
            });
            return;
        }
        if (isNaN(dst)) {
            bot.sendMessage(msg.from.id, `Oops...\nIt appears there was an error parsing your number, please try again`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Cancel", callback_data: "cancelSwitch" }],
                    ]
                }
            });
            return;
        }
        if (dst === queueUtils.getNumberInQueue(msg.from.id)) {
            bot.sendMessage(msg.from.id, `You can't switch places with yourself, please try again`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Cancel", callback_data: "cancelSwitch" }],
                    ]
                }
            });
            return;
        }
        if (dst < 1 || dst > queueUtils.queue.length) {
            bot.sendMessage(msg.chat.id, `Oops,\nYou did not enter a number between 1 and ${queueUtils.queue.length}, please try again`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Cancel", callback_data: "cancelSwitch" }],
                    ]
                }
            });
            return;
        }

        userSwitch.to = queueUtils.queue[dst - 1].id;

        bot.sendMessage(userSwitch.to, `${userUtils.formatName(queueUtils.findInQueue(userSwitch.from))} would like to switch places with you,\nDo you approve?`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Yes", callback_data: "acceptSwitch" }],
                    [{ text: "No", callback_data: "declineSwitch" }],
                ]
            }
        });

        bot.sendMessage(msg.chat.id, `Message was sent to ${userUtils.formatName(queueUtils.queue[dst - 1])},\non approval you will be switched`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Cancel", callback_data: "cancelSwitch" }],
                ]
            }
        });

        return;
    }
}

function declineSwitch(bot, msg) {
    bot.editMessageReplyMarkup({

    },
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );

    let userSwitch = stateUtils.findUserSwitchByTo(msg.from.id);
    if (userSwitch) {
        let from = queueUtils.findInQueue(userSwitch.from);

        stateUtils.cancelSwitch(userSwitch.from);

        bot.sendMessage(from.id, `Your switch request was declined`);
    }
    else {
        bot.sendMessage(msg.chat.id, `Switch request is no longer valid...`);
    }
}

function acceptSwitch(bot, msg) {
    bot.editMessageReplyMarkup({

    },
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );

    let userSwitch = stateUtils.findUserSwitchByTo(msg.from.id);
    if (userSwitch) {
        let from = queueUtils.findInQueue(userSwitch.from);
        let to = queueUtils.findInQueue(userSwitch.to);

        let fromIndex = queueUtils.getQueueIndex(userSwitch.from);
        let toIndex = queueUtils.getQueueIndex(userSwitch.to);

        queueUtils.queue[fromIndex] = to;
        queueUtils.queue[toIndex] = from;

        bot.sendMessage(from.id, `You have been switched,\nYou are now number ${queueUtils.getNumberInQueue(from.id)}`);
        bot.sendMessage(to.id, `You have been switched,\nYou are now number ${queueUtils.getNumberInQueue(to.id)}`);

        stateUtils.confirmSwitch(bot, msg, userSwitch.from);
    }
    else {
        bot.sendMessage(msg.chat.id, `Switch request is no longer valid...`);
    }
}

const callbackHandlersMap = {
    message: messageHandler,
    ...[
        showQueue,
        addToQueue,
        removeFromQueue,
        endCurrentShower,
        callNextInLine,
        takeWaterBreak,
        switchPosition,
        cancelSwitch,
        declineSwitch,
        acceptSwitch,
    ].reduce((acc, f) => {
        acc[f.name] = answerCallbackQueryMiddleware(f);
        return acc;
    }, {}),
};

module.exports = {
    callbackHandlersMap,
    showQueue,
};