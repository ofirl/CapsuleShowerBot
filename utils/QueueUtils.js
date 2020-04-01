let globals = require('../globals');
let userUtils = require('./userUtils');

let queue = globals.queue;
let doneQueue = globals.doneQueue;

function queueToString(selectedQueue) {
    return selectedQueue.length === 0 ? "The queue is empty" : selectedQueue.map((q, idx) => `${idx + 1}. ${userUtils.formatName(q)}`).join('\n');
}

function parseQueue() {
    return queueToString(queue);
}

function parseDoneQueue() {
    return queueToString(doneQueue);
}

function addToQueue(queueObj) {
    queue.push(queueObj);
    return queue.length;
}

function removeFromQueue(bot ,msg, id) {
    let index = queue.findIndex((q) => q.id === id);
    if (index === -1)
        return null;

    return queue.splice(index, 1)[0];
}

function findInQueue(id) {
    return queue.find((q) => q.id === id);
}

function getNumberInQueue(id) {
    let queueIndex = getQueueIndex(id);
    return queueIndex != null ? queueIndex + 1 : null;
}

function getQueueIndex(id) {
    let number = queue.findIndex((q) => q.id === id);
    if (number === -1)
        return null;

    return number;
}

function popQueue() {
    doneQueue.push(...queue.splice(0, 1));

    return true;
};

function sendToAllQueue(bot, msg, text, from = 0, to = queue.length - 1) {
    let i;
    for (i = from; i <= to; i++)
        bot.sendMessage(queue[i].id, text);

    // queue.forEach((q) => {
    //     bot.sendMessage(q.id, text);
    // });

    return true;
}

function resetQueues(bot, msg) {
    queue.splice(0, queue.length);
    doneQueue.splice(0, doneQueue.length);

    return true;
};

function addToQueueByIndex(queueObj, index) {
    queue.splice(index, 0, queueObj);

    return true;
}

function sendEndShowerNotice(bot) {
    bot.sendMessage(queue[0].id, `The shower is now yours`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "End shower", callback_data: "endCurrentShower" }],
            ]
        }
    });

    return true;
}

module.exports = {
    queue: queue,
    doneQueue: doneQueue,
    parseQueue,
    parseDoneQueue,
    addToQueue,
    removeFromQueue,
    findInQueue,
    getNumberInQueue,
    getQueueIndex,
    popQueue,
    sendToAllQueue,
    resetQueues,
    addToQueueByIndex,
    sendEndShowerNotice,
};