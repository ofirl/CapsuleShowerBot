let chatHandlers = require('./chatHandlers');
let consts = require('./consts');

chatHandlers.allHandlers.push({
    chat_id: consts.adminGroupChatId,
    handler: adminGroupHandler,
    state: {}
});

function createOceantPermissionsState(msg) {
    return oceantPermissionsState = {
        from: msg.from,
        path: msg.data,
        name: "",
        per_num: "",
        position: "",
        remarks: ""
    };
}

function formatRequstPath(path) {
    return path.split('-').map((p) => consts.pathTranslations[p] || p).join('-');
}

function formatPermissionRequest(state) {
    return "בקשת הרשאות התקבלה\n" +
        "השולח :" + state.from.username + "\n" +
        "דרך : " + formatRequstPath(state.path) + "\n" +
        "שם :" + state.name + "\n" +
        "מספר אישי :" + state.per_num + "\n" +
        "תפקיד :" + state.position + "\n" +
        "הערות כלליות :" + state.remarks;
}

function getChantHandler(msg, handler, defaultStateFunc) {
    let chatId;
    if (msg.text != null)
        chatId = msg.chat.id;
    else
        chatId = msg.message.chat.id;

    if (chatHandlers.allHandlers.find((ch) => ch.chat_id === chatId) == null) {
        chatHandlers.allHandlers.push({
            chat_id: chatId,
            handler: handler,
            state: defaultStateFunc(msg)
        });
    }

    return chatHandlers.allHandlers.find((ch) => ch.chat_id === chatId);
}

function oceanPermissionsHandler(bot, msg) {
    let currentChatHandler = getChantHandler(msg, oceanPermissionsHandler, createOceantPermissionsState);
    let chatId = currentChatHandler.chat_id;
    let chatState = currentChatHandler.state;

    //console.log(currentChatHandler);

    // if (msg.text != null)
    //     chatId = msg.chat.id;
    // else
    //     chatId = msg.message.chat.id;

    // if (chatHandlers.allHandlers.find((ch) => ch.chat_id === chatId) == null) {
    //     console.log("asdasdasdasd");
    //     chatHandlers.allHandlers.push({
    //         chat_id: chatId,
    //         handler: oceanPermissionsHandler,
    //         state: {
    //             from: msg.from,
    //             path: msg.data,
    //             name: "",
    //             per_num: "",
    //             position: ""
    //         }
    //     });
    // }

    // let chatState = chatHandlers.allHandlers.find((ch) => ch.chat_id === chatId).state;

    if (msg.text != null) {
        if (chatState.name == "")
            chatState.name = msg.text;
        else if (chatState.per_num == "")
            chatState.per_num = msg.text;
        else if (chatState.position == "")
            chatState.position = msg.text;
        else if (chatState.remarks == "")
            chatState.remarks = msg.text;
    }

    if (chatState.name == "") {
        bot.sendMessage(chatId, "אנא שלח את שמך המלא");
    }
    else if (chatState.per_num == "") {
        bot.sendMessage(chatId, "אנא שלח את מספרך האישי או לחילופין את השם של הכרטיס המוקדי שעליו אתה רוצה הרשאות");
    }
    else if (chatState.position == "") {
        bot.sendMessage(chatId, "אנא שלח את תפקידך");
    }
    else if (chatState.remarks == "") {
        bot.sendMessage(chatId, "הערות כלליות (כל דבר נוסף שאת\ה רוצה למסור)");
    }
    else {
        // send confirmation to user
        bot.sendMessage(chatId, "בקשתך נשלחה, כשתטופל תקבל הודעה\n" + "ניתן לפתוח פנייה נוספת  על ידי /start\n" + "תודה :)").then((userConfirmationMsg) => {
            console.log(userConfirmationMsg);
            // send to admin
            bot.sendMessage(consts.adminGroupChatId, formatPermissionRequest(chatState), {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "טופל",
                                callback_data: JSON.stringify({ chat_id: chatId, message_id: userConfirmationMsg.message_id, done: true })
                            },
                            {
                                text: "החזר הודעה",
                                callback_data: JSON.stringify({ chat_id: chatId, message_id: userConfirmationMsg.message_id, reply: true })
                            }
                        ]
                    ]
                }
            });
        });

        // remove chat handler
        chatHandlers.removeChatHandler(chatId);
        //chatHandlers.allHandlers.splice(chatHandlers.allHandlers.findIndex((ch) => ch.chat_id === chatState.chat_id), 1);
    }
}

function returnMessageToAdmin(bot, msg) {
    // shouldn't ever need to init a state casue the adminGroupHandler takes care of it
    let currentChatHandler = getChantHandler(msg/*, returnMessageToAdmin, {}*/);
    let chatId = currentChatHandler.chat_id;
    let chatState = currentChatHandler.state;

    bot.sendMessage(consts.adminGroupChatId, msg.text, {
        reply_to_message_id: chatState.message_id,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "טופל",
                        callback_data: JSON.stringify({ chat_id: chatId, message_id: msg.message_id, done: true })
                    },
                    {
                        text: "החזר הודעה",
                        callback_data: JSON.stringify({ chat_id: chatId, message_id: msg.message_id, reply: true })
                    }
                ]
            ]
        }
    });

    chatHandlers.removeChatHandler(chatId);
}

// ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS - ADMINS

let adminChatState = {

};

function adminGroupHandler(bot, msg) {
    if (adminChatState.reply === true) {
        bot.editMessageReplyMarkup({}, { chat_id: consts.adminGroupChatId, message_id: adminChatState.admin_msg_id });
        bot.sendMessage(adminChatState.chat_id, "הודעה ממנהל המערכת :\n" + msg.text + "\n\n" + "אנא שלח התייחסות", { reply_to_message_id: adminChatState.message_id });

        chatHandlers.allHandlers.push({
            chat_id: adminChatState.chat_id,
            handler: returnMessageToAdmin,
            state: {
                message_id: msg.message_id
            }
        });

        adminChatState = {};

        return;
    }

    if (msg.data === "cancel_admin_reply") {
        bot.editMessageReplyMarkup(
            {
                inline_keyboard: [
                    [
                        {
                            text: "טופל",
                            callback_data: JSON.stringify({ chat_id: chatId, message_id: userConfirmationMsg.message_id, done: true })
                        },
                        {
                            text: "החזר הודעה",
                            callback_data: JSON.stringify({ chat_id: chatId, message_id: userConfirmationMsg.message_id, reply: true })
                        }
                    ]
                ]
            },
            {
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            });
    }

    if (msg.data == null)
        return;
        
    let replyObj = JSON.parse(msg.data);

    if (replyObj.done === true) {
        bot.sendMessage(replyObj.chat_id, "הבקשה טופלה", {
            reply_to_message_id: replyObj.message_id
        });

        bot.editMessageReplyMarkup({}, {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        })

        return;
    }

    if (replyObj.reply === true) {
        adminChatState = { ...adminChatState, ...replyObj, admin_msg_id: msg.message.message_id };

        bot.editMessageReplyMarkup({ inline_keyboard: [[{ text: "ביטול", callback_data: "cancel_admin_reply" }]] }, {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        });

        bot.sendMessage(consts.adminGroupChatId, "אנא כתוב התייחסות");
    }
}

module.exports = {
    oceanPermissionsHandler,
    returnMessageToAdmin,
    adminGroupHandler
};