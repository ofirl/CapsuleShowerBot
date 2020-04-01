let consts = require('../consts');
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

    if (queueUtils.queue.length >= 2)
        breakActions.push([{ text: "Move Someone to number", callback_data: "moveSomeoneToNumber" }]);

    bot.sendMessage(msg.chat.id, "Hi :)", {
        reply_markup: {
            inline_keyboard: [
                ...breakActions,
                // [{ text: "Show done queue", callback_data: "showDoneQueue" }],
                [{ text: "Show queue", callback_data: "showQueue" }, { text: "Show done queue", callback_data: "showDoneQueue" }],
                [{ text: "Clear queues", callback_data: "resetQueues" }],
                // [{ text: "End current shower", callback_data: "endCurrentShower" }],
                // [{ text: "Take a break", callback_data: "break" }]
            ]
        }
    });
}

function showQueue(bot, msg) {
    bot.sendMessage(consts.adminGroupChatId, "Waiting:\n" + queueUtils.parseQueue());
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
    bot.sendMessage(msg.message.chat.id, `Choose a number you want to move (1 - ${queueUtils.queue.length})`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Cancel", callback_data: "adminCancelMove" }],
            ]
        }
    });

    globals.state.adminMove = {};
}

function messageHandler(bot, msg) {
    if (globals.state.adminMove) {
        if (!globals.state.adminMove.src) {
            let src;
            try {
                src = parseInt(msg.text);
                if (isNaN(src))
                    throw {};
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
                if (isNaN(dst))
                    throw {};
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

            if (dst === src) {
                bot.sendMessage(msg.chat.id, `Oops,\nYou did not make any changes, please try again`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Cancel", callback_data: "adminCancelMove" }],
                        ]
                    }
                });
                return;
            }

            queueUtils.addToQueueByIndex(queueUtils.removeFromQueue(queueUtils.queue[src - 1].id), dst - 1);

            let movedObj = queueUtils.queue[dst - 1];
            bot.sendMessage(msg.chat.id, `${movedObj.first_name || ""} ${movedObj.last_name || ""}${movedObj.username ? ` - @${movedObj.username}` : ""} was moved`);
            showQueue(bot, msg);

            let queueStartNotification = Math.max(Math.min(src, dst) - 1, 0);
            let queueEndNotification = Math.min(Math.max(src, dst) + 1, queueUtils.queue.length - 1);

            queueUtils.sendToAllQueue(bot, msg, 'The queue have changed,\n' + queueUtils.parseQueue(), queueStartNotification, queueEndNotification);

            if (dst === 1 || src === 1)
                bot.sendMessage(queueUtils.queue[0].id, `The shower is now yours`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "End shower", callback_data: "endCurrentShower" }],
                        ]
                    }
                });

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