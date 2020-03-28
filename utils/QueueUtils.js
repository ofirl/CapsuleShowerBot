let globals = require('../globals');

let queue = globals.queue;

function parseQueue() {
    return queue.map((q, idx) => `${idx + 1}. ${q.username}`).join('\n');
}

function addToQueue(queueObj) {
    queue.push(queueObj);
    return queue.length;
}

function removeFromQueue(id) {
    let index = queue.findIndex((q) => q.id === id);;
    if (index === -1)
        return;

    queue.splice(index - 1, 1);
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