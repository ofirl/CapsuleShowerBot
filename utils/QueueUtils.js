let globals = require('../globals');

let queue = globals.queue;
let doneQueue = globals.doneQueue;

function parseQueue() {
    return queue.length === 0 ? "The queue is empty" : queue.map((q, idx) => `${idx + 1}. ${q.first_name || ""} ${q.last_name || ""} - @${q.username}`).join('\n');
}

function parseDoneQueue() {
    return doneQueue.length === 0 ? "The queue is empty" : doneQueue.map((q, idx) => `${idx + 1}. ${q.first_name || ""} ${q.last_name || ""} - @${q.username}`).join('\n');
}

function addToQueue(queueObj) {
    queue.push(queueObj);
    return queue.length;
}

function removeFromQueue(id) {
    let index = queue.findIndex((q) => q.id === id);
    if (index === -1)
        return;

    doneQueue.push(queue.splice(index - 1, 1));
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
    queue.splice(0, 1);
};

function sendToAllQueue(bot, msg, text) {
    queue.forEach((q) => {
        bot.sendMessage(q.id, text);
    });
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
};