let globals = require('../globals');
let queueUtils = require('./QueueUtils');
let stateManager = require('./stateManager');
let { answerCallbackQueryMiddleware } = require('./middlewares');

function adminStart(bot, msg) {
    let inBreak = globals.state.break;

    let breakActions = [];
    inBreak ?
        breakActions.push([{ text: "End break", callback_data: "endBreak" }])
        :
        breakActions.push([{ text: "Start break", callback_data: "startBreak" }]);

    bot.sendMessage(msg.chat.id, "Hi :)", {
        reply_markup: {
            inline_keyboard: [
                ...breakActions,
                [{ text: "Show queue", callback_data: "showQueue" }, { text: "Show done queue", callback_data: "showDoneQueue" }],
                // [{ text: "Show done queue", callback_data: "showDoneQueue" }],
                [{ text: "Move Someone to number", callback_data: "moveSomeoneToNumber" }],
                [{ text: "Clear queues", callback_data: "resetQueues" }],
                // [{ text: "End current shower", callback_data: "endCurrentShower" }],
                // [{ text: "Take a break", callback_data: "break" }]
            ]
        }
    });
}

function showQueue(bot, msg) {
    bot.sendMessage(msg.message.chat.id, "Waiting:\n" + queueUtils.parseQueue());
}

function showDoneQueue(bot, msg) {
    bot.sendMessage(msg.message.chat.id, "Showered:\n" + queueUtils.parseDoneQueue());
}

function endBreak(bot, msg) {
    if (stateManager.endBreak(bot, msg)) {
        bot.editMessageText(`Break ended`,
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );
    }
    else {
        bot.editMessageText(`The queue is empty dummy, still on a break...`,
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            }
        );
    }
}

function startBreak(bot, msg) {
    stateManager.startBreak(bot, msg);

    bot.editMessageText(`Break started`,
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
}

function resetQueues(bot, msg) {
    queueUtils.resetQueues(bot, msg);
    bot.editMessageText(`Queues cleared`,
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
}

function moveSomeoneToNumber(bot, msg) {
    // queueUtils.addToQueueByIndex();
    bot.sendMessage(msg.message.chat.id, `Choose a number you want to move (1 - ${queueUtils.queue.length})`);

    globals.state.adminMove = {};
}

function messageHandler(bot, msg) {
    if (globals.state.adminMove) {
        if (!globals.state.adminMove.src) {
            let src;
            try {
                src = parseInt(msg.text);
            }
            catch (e) {
                bot.sendMessage(msg.chat.id, `Oops...\nIt appears there was an error parsing your number, please try again`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Cancel", callback_data: "adminCancelMove" }],
                        ]
                    }
                });
                return;
            }
            if (src < 1 || src > queueUtils.queue.length) {
                bot.sendMessage(msg.chat.id, `Oops,\nYou did not enter a number between 1 and ${queueUtils.queue.length}, please try again`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Cancel", callback_data: "adminCancelMove" }],
                        ]
                    }
                });
                return;
            }

            globals.state.adminMove["src"] = src;
            bot.sendMessage(msg.chat.id, `Choose a number you want to move to (1 - ${queueUtils.queue.length})`);
        }
        else {
            let dst;
            try {
                dst = parseInt(msg.text);
            }
            catch (e) {
                bot.sendMessage(msg.chat.id, `Oops...\nIt appears there was an error parsing your number, please try again`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Cancel", callback_data: "adminCancelMove" }],
                        ]
                    }
                });
                return;
            }
            if (dst < 1 || dst > queueUtils.queue.length) {
                bot.sendMessage(msg.chat.id, `Oops,\nYou did not enter a number between 1 and ${queueUtils.queue.length}, please try again`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Cancel", callback_data: "adminCancelMove" }],
                        ]
                    }
                });
                return;
            }

            // globals.state.adminMove["dst"] = dst;
            let src = globals.state.adminMove.src;
            queueUtils.addToQueueByIndex(queueUtils.removeFromQueue(queueUtils.queue[src - 1].id), dst - 1);
            // bot.sendMessage(msg.chat.id, `Moved :)`);

            showQueue(bot, msg);

            globals.state.adminMove = null;
        }
    }
}

function adminCancelMove(bot, msg) {
    globals.state.adminMove = null;

    bot.editMessageReplyMarkup({
        // inline_keyboard: newInlineKeyboard,
    },
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
    bot.sendMessage(msg.chat.id, `Move canceled`);
}

const adminsHandlersMap = {
    start: adminStart,
    message: messageHandler,
    ...[
        showQueue,
        showDoneQueue,
        endBreak,
        startBreak,
        resetQueues,
        moveSomeoneToNumber,
        adminCancelMove,
    ].reduce((acc, f) => {
        acc[f.name] = answerCallbackQueryMiddleware(f);
        return acc;
    }, {}),
};

module.exports = {
    adminsHandlersMap,
};