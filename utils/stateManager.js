let consts = require('../consts');
let globals = require('../globals');
let queueUtils = require('./QueueUtils');

function startBreak(bot, msg) {
    globals.state.break = true;

    queueUtils.sendToAllQueue(bot, msg, "Break started");
}

function endBreak(bot, msg) {
    globals.state.break = false;

    queueUtils.sendToAllQueue(bot, msg, "Break ended");
    bot.sendMessage(queueUtils.queue[0], "You can go shower now, have fun :)");
    bot.sendMessage(queueUtils.queue[1], `${queueUtils.queue[0].first_name || ""} ${queueUtils.queue[0].last_name || ""} ${queueUtils.queue[0].username ? `(@${queueUtils.queue[0].username})` : ""} is now going to the shower,\nYou can get ready, you are next `);
}

module.exports = {
    startBreak,
    endBreak,
};