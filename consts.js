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
    'CAACAgIAAxkBAAIHpF6EheRntRtD8C4OwdoMPAREna_EAAKrBAACz1-LBxuvXdA_2Zz_GAQ',
    'CAACAgIAAxkBAAIHpl6EhfI3MmnPKOLBUO6WgsDbx0CoAAKACAACYyviCczYJsKBx06uGAQ',
    'CAACAgIAAxkBAAIHqF6EhgTApFFw6rcz3xkhamwE7ZkVAAI0AAOvxlEavZYLhXXpOrMYBA',
    'CAACAgIAAxkBAAIHql6Ehic13hgxbgWMmVNdrJ5TDhl5AAIMAQACMNSdETGZSOGtgpzfGAQ',
    'CAACAgIAAxkBAAIHvF6Ehnpf51OvwnVT-VU7f79mBf3dAAIpAAOQ_ZoVDYC2OEIbKcsYBA',
];

module.exports = {
    adminGroupChatId,
    showerDoneStickers,
};