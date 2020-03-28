let globals = require('../globals');
let queueUtils = require('./QueueUtils');

console.log(globals);

function showQueue(bot, msg) {    
    bot.sendMessage(msg.from.id, queueUtils.parseQueue());
}

function addToQueue(bot, msg) {
    let currentNumber = queueUtils.getNumberInQueue(msg.from.id);
    if (currentNumber != null) {
        bot.sendMessage(msg.from.id, `You are already number ${currentNumber + 1} in the queue`);
        return;
    }

    queueUtils.addToQueue(msg.from);
    bot.sendMessage(msg.from.id, "You have been added to the queue :)");
}

function removeFromQueue(bot, msg) {
    queueUtils.removeFromQueue(msg.from.id);
}

const callbackHandlersMap = {
    showQueue,
    addToQueue,
    removeFromQueue,
};

module.exports = {
    callbackHandlersMap,
    showQueue,
};