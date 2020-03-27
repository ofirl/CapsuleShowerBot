let globals = require('../globals');
let queueUtils = require('./QueueUtils');

console.log(globals);

function showQueue(bot, msg) {    
    bot.sendMessage(msg.from.id, queueUtils.parseQueue());
}

function addToQueue(bot, msg) {
    let currentIndex = queueUtils.queue.findIndex((q) => q.id === msg.from.id);
    if (currentIndex !== -1) {
        bot.sendMessage(msg.from.id, `You are already number ${currentIndex + 1} in the queue`);
        return;
    }

    queueUtils.addToQueue(msg.from);
    bot.sendMessage(msg.from.id, "You have been added to the queue :)");
}

function removeFromQueue(bot, msg) {

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