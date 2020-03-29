function answerCallbackQueryMiddleware(f) {
    return (bot, msg, ...args) => {
        f(bot, msg, ...args);
        bot.answerCallbackQuery(msg.id);
    };
}

module.exports = {
    answerCallbackQueryMiddleware,
};