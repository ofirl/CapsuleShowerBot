let allHandlers = [
    // chat_id: consts.adminGroupChatId,
    // handler: adminGroupHandler,
    // state: {}
];

function removeChatHandler(chat_id) {
    allHandlers.splice(allHandlers.findIndex((ch) => ch.chat_id === chat_id), 1);
}

// let openRequests = [
//     // {
//     //     chat_id: 192,
//     //     state: {
//     //         path: msg.data,
//     //         name: "",
//     //         per_num: "",
//     //         position: ""
//     //     }
//     // }
// ];

module.exports = {
    allHandlers,
    removeChatHandler
};