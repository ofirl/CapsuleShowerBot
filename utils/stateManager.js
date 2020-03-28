let consts = require('../consts');
let globals = require('../globals');
let queueUtils = require('./QueueUtils');

function startBreak(bot, msg) {
    globals.state.break = true;

    queueUtils.sendToAllQueue(bot, msg, "Break started");
}

function endBreak(bot, msg) {
    if (queueUtils.queue.length === 0)
        return false;

    globals.state.break = false;

    queueUtils.sendToAllQueue(bot, msg, "Break ended");

    if (queueUtils.queue.length < 1)
        return;

    bot.sendMessage(queueUtils.queue[0].id, `The shower is now yours`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "End shower", callback_data: "endCurrentShower" }],
            ]
        }
    });

    if (queueUtils.queue.length < 2)
        bot.sendMessage(queueUtils.queue[1].id, `${queueUtils.queue[0].first_name || ""} ${queueUtils.queue[0].last_name || ""} ${queueUtils.queue[0].username ? `(@${queueUtils.queue[0].username})` : ""} is now going to the shower,\nYou can get ready, you are next `);

    return true;
}

module.exports = {
    startBreak,
    endBreak,
};