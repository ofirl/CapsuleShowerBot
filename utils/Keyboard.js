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

module.exports = {
    createInlineKeyboard,
};