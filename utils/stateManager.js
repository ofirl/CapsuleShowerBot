let consts = require('../consts');
let globals = require('../globals');
let queueUtils = require('./QueueUtils');
let userUtils = require('./userUtils');

console.log(queueUtils);

function startBreak(bot, msg) {
    globals.state.break = true;

    queueUtils.sendToAllQueue(bot, msg, "Break started");

    bot.sendMessage(consts.adminGroupChatId, "Break started");
}

function endBreak(bot, msg) {
    if (queueUtils.queue.length === 0)
        return false;

    globals.state.break = false;

    queueUtils.sendToAllQueue(bot, msg, "Break ended");

    if (queueUtils.queue.length < 1)
        return;

    bot.sendMessage(queueUtils.queue[0].id, `The shower is now yours`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "End shower", callback_data: "endCurrentShower" }],
            ]
        }
    });

    if (queueUtils.queue.length >= 2)
        bot.sendMessage(queueUtils.queue[1].id, `${userUtils.formatName(queueUtils.queue[0])} is now going to the shower,\nYou can get ready, you are next `);

    return true;
}

function addUserSwitch(id) {
    globals.state.activeUserSwitches.push({ from: id });

    return true;
}

function cancelSwitch(id) {
    globals.state.activeUserSwitches.splice(globals.state.activeUserSwitches.findIndex((s) => s.from === id), 1);

    return true;
}

function findUserSwitchByFrom(id) {
    return globals.state.activeUserSwitches.find((s) => s.from === id);
}

function findUserSwitchByTo(id) {
    return globals.state.activeUserSwitches.find((s) => s.to === id);
}

function confirmSwitch(bot, msg, id) {
    let userSwitch = findUserSwitchByFrom(id);

    bot.sendMessage(consts.adminGroupChatId, `${userUtils.formatName(queueUtils.findInQueue(userSwitch.from))} and ${userUtils.formatName(queueUtils.findInQueue(userSwitch.to))} was switched,\n${queueUtils.parseQueue()}`);

    let fromIndex = queueUtils.getQueueIndex(userSwitch.from);
    let toIndex = queueUtils.getQueueIndex(userSwitch.to);

    if (fromIndex === 0 || toIndex === 0 && (!globals.state.break))
        queueUtils.sendEndShowerNotice(bot);

    return cancelSwitch(id);
}

function getBreakStatus() {
    return globals.state.break;
}

module.exports = {
    startBreak,
    endBreak,
    addUserSwitch,
    cancelSwitch,
    findUserSwitchByFrom,
    findUserSwitchByTo,
    confirmSwitch,
    getBreakStatus,
};