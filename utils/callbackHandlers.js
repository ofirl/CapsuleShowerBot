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

    let numberInQueue = queueUtils.addToQueue(msg.from);
    bot.sendMessage(msg.from.id, `You have been added to the queue,\nYou are number ${numberInQueue}`);
}

function removeFromQueue(bot, msg) {
    queueUtils.removeFromQueue(msg.from.id);
    bot.sendMessage(msg.from.id, "You have been removed from the queue");
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