const token = process.env.TOKEN;
let chatHandlers = require('./chatHandlers');
let replyHandlers = require('./replyHandlers');

let consts = require('./consts');

const Bot = require('node-telegram-bot-api');
let bot;

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

/**
 * Creates inline keyboard object
 * @param {Array} keys keys for the keyboard
 * @param {Number} prefix prefix for the callback data
 */
function createInlineKeyboard(keys, prefix) {
  let inlineKeyboard = [];

  keys.forEach(keyArray => {
    let keyRow = [];

    keyArray.forEach((key) => {
      const keyValue = keyArray[key];

      keyRow.push({
        // text: keyValue,
        text: consts.pathTranslations[key],
        callback_data: prefix + "-" + key
      });
    });

    // for (const key in keyArray) {
    //   if (keyArray.hasOwnProperty(key)) {
    //     const keyValue = keyArray[key];

    //     keyRow.push({
    //       // text: keyValue,
    //       text: consts.pathTranslations[key],
    //       callback_data: prefix + "-" + key
    //     });
    //   }
    // }

    inlineKeyboard.push(keyRow);
  });

  return inlineKeyboard;
}

const replysList = [
  // first level
  {
    reply_id: "ocean",
    text: "לאיזו מערכת באוקיינוס אתה נכנס?",
    newInlineKeyboard: createInlineKeyboard([["teum", "trc"]], "ocean")
  },
  {
    reply_id: "portal",
    text: "לאיזה חלק בגשר הפיקוד אתה נכנס?",
    newInlineKeyboard: createInlineKeyboard([["shayit", "bw"]], "portal")
  },

  // second level
  {
    reply_id: "ocean-teum",
    text: "כיצד אפשר לעזור?",
    newInlineKeyboard: createInlineKeyboard(
      [
        ["permissions", "gantt"],
        ["bad_act"]
      ],
      "ocean-teum")
  },
  {
    reply_id: "ocean-trc",
    text: "כיצד אפשר לעזור?",
    newInlineKeyboard: createInlineKeyboard([["permissions"]], "ocean-trc")
  },

  // third level
  {
    reply_id: "ocean-teum-permissions",
    handler: replyHandlers.oceanPermissionsHandler
  },
  {
    reply_id: "ocean-teum-gantt",
    text: "מה לא עובד בגאנט?",
    newInlineKeyboard: createInlineKeyboard(
      [
        ["startup"],
        ["bad_act"]
      ],
      "ocean-teum-gantt")
  },
  {
    reply_id: "ocean-trc-permissions",
    text: "אנא שלח מייל בסודי ביותר עם :\n" +
      "שם מלא, מספר אישי/שם הכרטיס המוקדי עליו צריך הרשאות ותפקיד" + "\n" +
      "לאופיר לוי (יש ממת\"ם או מפת\"ח בשם)",
    newInlineKeyboard: []
  },
  // {
  //   reply_id: "ocean-trc-permissions",
  //   handler: replyHandlers.oceanPermissionsHandler
  // },

  // fourth level
  {
    reply_id: "ocean-teum-gantt-startup",
    text: "מה זה אומר לא נפתח? (מה כן קורה?)",
    newInlineKeyboard: createInlineKeyboard(
      [
        ["white_screen"],
        ["error"]
      ],
      "ocean-teum-gantt-startup")
  },

  // fifth level
  {
    reply_id: "ocean-teum-gantt-startup-white_screen",
    text: "אנא פנו ל3800 (או חוליית מחשב הרלוונטית אליכם) ובקשו מהם להתקין לכם על המחשב flash" + "\n" +
      "זה לוקח בערך 5 דקות מרחוק,\n" + "לפתיחת בקשה נוספת לחץ על /start",
    newInlineKeyboard: []
  }
];

// let chatHandlers = [
//   // {
//   //   chat_id: 192,
//   //   handler: oceanPermissionsHandler,
//   //   state: {}
//   // }
// ];

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
});

bot.onText(/\/start\b(.*)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  //const resp = match[1]; // the captured "whatever"

  let resp = "שלום,\n" + "לאיזו מערכת אתה צריך תמיכה?";

  // send back the matched "whatever" to the chat
  bot.sendMessage(msg.chat.id, resp, {
    reply_markup: {
      //"keyboard": [["Sample text", "Second sample"], ["Keyboard"], ["I'm robot"]]
      inline_keyboard: [[{ text: "אוקיינוס", callback_data: "ocean" }, { text: "גשר הפיקוד", callback_data: "portal" }]]
    }
  });
});

bot.on('callback_query', (msg) => {
  console.log(msg + "\n\n\n");
  // console.log({
  //   chat_id: msg.message.chat.id,
  //   message_id: msg.message.message_id
  // });

  if (msg.message.chat.id === consts.adminGroupChatId) {
    replyHandlers.adminGroupHandler(bot, msg);
    return;
  }

  let newInlineKeyboard = [];
  let newText = "פקודה לא ידועה...\n" + "התחל שוב /start";

  let reply = replysList.find((r) => r.reply_id == msg.data);
  if (reply != null) {
    if (reply.handler != null) {
      reply.handler(bot, msg);
      return;
    }

    newInlineKeyboard = reply.newInlineKeyboard;
    newText = reply.text;
  }

  if (newText != null)
    bot.editMessageText(newText,
      {
        reply_markup: {
          inline_keyboard: newInlineKeyboard
        },
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id
      }
    );
  else
    bot.editMessageReplyMarkup({
      inline_keyboard: newInlineKeyboard,
    },
      {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id
      }
    );
});

bot.on('text', (msg) => {
  // const name = msg.from.first_name;
  // bot.sendMessage(msg.chat.id, 'Testing works, ' + name + '!').then(() => {
  //   // reply sent!
  // });

  let chatHandler = chatHandlers.allHandlers.find((ch) => ch.chat_id === msg.chat.id);
  if (chatHandler == null) {
    // console.log("Unknown command!");
    // console.log(chatHandlers.allHandlers);
    //bot.sendMessage(msg.chat.id, "אפשר להתחיל את הבוט בעזרת הפקודה /start )פשוט תלחצו עליה(");
    return;
  }

  chatHandler.handler(bot, msg);
});

bot.on('message', (msg) => {
  console.log(msg + "\n\n\n");

  //   const name = msg.from.first_name;
  //   bot.sendMessage(msg.chat.id, 'Hello, ' + name + '!').then(() => {
});

bot.on('sticker', (msg) => {
  bot.sendSticker(msg.chat.id, "CAADAQADrwAD82LeB9V0bTtHBQwSAg");
});

module.exports = bot;