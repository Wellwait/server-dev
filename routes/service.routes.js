const controller = require('../controllers/service.controller');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/service/get_all", controller.getAllServices);
    app.get("/api/service/get_filter", controller.getFilterServices);
    app.get("/api/service/get_time", controller.getAvailableTime);
}