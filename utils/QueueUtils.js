let globals = require('../globals');

let queue = globals.queue;
let doneQueue = globals.doneQueue;

function queueToString(selectedQueue) {
    return selectedQueue.length === 0 ? "The queue is empty" : selectedQueue.map((q, idx) => `${idx + 1}. ${q.first_name || ""} ${q.last_name || ""}${q.username ? ` - @${q.username}` : ""}`).join('\n');
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

function removeFromQueue(id) {
    let index = queue.findIndex((q) => q.id === id);
    if (index === -1)
        return;

    return queue.splice(index, 1)[0];
}

function findInQueue(id) {
    return queue.find((q) => q.id === id);
}

function getNumberInQueue(id) {
    let number = queue.findIndex((q) => q.id === id);
    if (number === -1)
        return null;

    return number + 1;
}

function popQueue() {
    doneQueue.push(...queue.splice(0, 1));

    return true;
};

function sendToAllQueue(bot, msg, text) {
    queue.forEach((q) => {
        bot.sendMessage(q.id, text);
    });

    return true;
}

function resetQueues(bot, msg) {
    queue = [];
    doneQueue = [];

    return true;
};

function addToQueueByIndex(queueObj, index) {
    queue.splice(index, 0, queueObj);

    return true;
}

module.exports = {
    queue,
    doneQueue,
    parseQueue,
    parseDoneQueue,
    addToQueue,
    removeFromQueue,
    findInQueue,
    getNumberInQueue,
    popQueue,
    sendToAllQueue,
    resetQueues,
    addToQueueByIndex,
};