let globals = require('../globals');

let queue = globals.queue;

function parseQueue() {
    return queue.map((q, idx) => `${idx + 1}. ${q.username}`).join('\n');
}

function addToQueue(queueObj) {
    queue.push(queueObj);
}

function removeFromQueue(id) {
    let index = getNumberInQueue(id);
    if (index == null)
        return;

    queue.splice(index, 1);
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

module.exports = {
    queue,
    parseQueue,
    addToQueue,
    removeFromQueue,
    findInQueue,
    getNumberInQueue,
};