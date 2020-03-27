let globals = require('../globals');

function parseQueue() {
    return globals.queue.map((q, idx) => `${idx + 1}. ${q.username}`).join('\n');
}

function addToQueue(queueObj) {
    globals.queue.push(queueObj);
}

module.exports = {
    queue: globals.queue,
    parseQueue,
    addToQueue,
};