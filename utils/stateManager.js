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
}

module.exports = {
    startBreak,
    endBreak,
};