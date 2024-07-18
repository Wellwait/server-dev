const db = require("../models");
const Service = db.service;

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
};

exports.getFilterServices = async (req, res) => {
    try {
        const filters = {};
        
        if (req.query.type) {
            filters.type = req.query.type;
        }

        if (req.query.location) {
            filters.location = req.query.location;
        }

        if (req.query.open_time) {
            filters.open_time = {
                [Sequelize.Op.contains]: [req.query.open_time]
            };
        }

        const services = await Service.findAll({ where: filters });
        res.json(services);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
};

exports.getAvailableTime = async (req, res) => {
    try {
        const service_id = req.query.id;
        const service = await Service.findOne({id: service_id});
        const open_time = service.dataValues.open_time;
        const today = new Date().getDay();
        res.json(open_time[today - 1]);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Internal Server Error"});
    }
}