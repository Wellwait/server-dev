module.exports = (sequelize, Sequelize) => {
    const Service = sequelize.define("service", {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        type: {
            type: Sequelize.ENUM('shop', 'parlour', 'salon', 'hospital'),
            allowNull: false
        },
        location: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        open_time: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: false,
        },
        phone_number: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        website_link: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        latitude: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        },
        longitude: {
            type: Sequelize.DOUBLE,
            allowNull: false,
        }
    });
    
    return Service;
};