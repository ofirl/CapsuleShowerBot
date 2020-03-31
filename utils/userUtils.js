function formatName(user) {
    let { first_name, last_name, username } = user;
    return `${first_name || ""} ${last_name || ""}${username ? ` - @${username}` : ""}`;
}

module.exports = {
    formatName,
};