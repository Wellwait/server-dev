module.exports = (sequelize, Sequelize) => {
    const Profile = sequelize.define("profiles", {
        payment: {
            type: Sequelize.STRING,
        },
        avatar: {
            type: Sequelize.STRING,
        }
    });

    return Profile;
};