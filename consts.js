let adminGroupChatId;
if (process.env.NODE_ENV === 'production')
    adminGroupChatId = -1001349493746;
else
    adminGroupChatId = -429033904;

const showerDoneStickers = [
    'CAACAgIAAxkBAAIC415_Q6ABYGrpRapRTU2MzeBkJCDtAAJZAANEDc8X-HZZ1vlXfjgYBA',
    'CAACAgIAAxkBAAIDBF5_RfAwQIOt_5IhU1zje2CObQNZAAIpAAM7YCQUqq0AAVo2etYJGAQ',
    'CAACAgIAAxkBAAIDBl5_Rgy5yGHvQg05xylniCUxdmldAAIjAAOvxlEa96_wqMltMSYYBA',
    'CAACAgIAAxkBAAIDCF5_RkBSKcXt6qInxMP1WtvsrkSRAAI9AQACFkJrCtPHcKCCUMr-GAQ',
    'CAACAgIAAxkBAAIDCl5_Rk8gXmrSKbKO-n947vO2JEFbAALGAAP3AsgP1ZNLutdH3skYBA',
    'CAACAgIAAxkBAAIDDF5_Rld9EonSEcxQaEmmdKO9E827AAI0AwACtXHaBv0iFQNf1vsWGAQ',
];

module.exports = {
    adminGroupChatId,
    showerDoneStickers,
};