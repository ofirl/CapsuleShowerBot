let globals = require('../globals');
let queueUtils = require('./QueueUtils');
let stateManager = require('./stateManager');

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
                [{ text: "Show queue", callback_data: "showQueue" }],
                [{ text: "Show done queue", callback_data: "showDoneQueue" }],
                [{ text: "Clear queues", callback_data: "resetQueues" }],
                // [{ text: "End current shower", callback_data: "endCurrentShower" }],
                // [{ text: "Take a break", callback_data: "break" }]
            ]
        }
    });
}

function showQueue(bot, msg) {
    bot.sendMessage(msg.message.chat.id, queueUtils.parseQueue());
}

function showDoneQueue(bot, msg) {
    bot.sendMessage(msg.message.chat.id, queueUtils.parseDoneQueue());
}

function endBreak(bot, msg) {
    stateManager.endBreak(bot, msg);

    bot.editMessageText(`Break ended`,
        {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        }
    );
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
};

const adminsHandlersMap = {
    start: adminStart,
    showQueue,
    showDoneQueue,
    endBreak,
    startBreak,
    resetQueues,
};

module.exports = {
    adminsHandlersMap,
};