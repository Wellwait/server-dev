const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const db = require("./models");
const Role = db.role;
const User = db.user;
const Service = db.service;

db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync Db');
    initial();
});

function initial() {
    Role.create({
        id: 1,
        name: "user"
    });
    Role.create({
        id: 2,
        name: "moderator"
    });
    Role.create({
        id: 3,
        name: "admin"
    });

    Service.create({
        id: 1,
        name: "NyLivSpa Nørreport",
        type: "parlour",
        location: "Rosenborggade 2, 2tv 1130 Copenhagen, Denmark",
        open_time: ["10 am - 7 pm", "10 am - 7 pm", "10 am - 7 pm", "10 am - 7 pm", "10 am - 7 pm", "10 am - 3 pm", "break"],
        phone_number: "+45 71 59 79 53",
        website_link: "https://nylivspa.dk",
        latitude: 55.68595613306434,  
        longitude: 12.575426921061219
    });
    Service.create({
        id: 2,
        name: "Aarhus University Hospital",
        type: "hospital",
        location: "Palle Juul-Jensens Boulevard 99, 8200 Aarhus N, Denmark",
        open_time: ["10:00 AM - 8:00 PM", "10:00 AM - 8:00 PM", "10:00 AM - 8:00 PM", "10:00 AM - 8:00 PM", "10:00 AM - 8:00 PM", "10:00 AM - 8:00 PM", "10:00 AM - 8:00 PM"],
        phone_number: "+45 78 45 00 00",
        website_link: "https://www.en.auh.dk/",
        latitude: 57.01796032915623, 
        longitude: 10.495699121772903
    });
    Service.create({
        id: 3,
        name: "Van Den Engh",
        type: "parlour",
        location: "Vesterbrogade 145, 1620 Copenhagen, Denmark",
        open_time: ["9:30 am - 6 pm", "9:30 am - 8 pm", "10 am - 8 pm", "9:30 am - 8 pm", "9:30 am - 6 pm", "8 am - 2 pm", "break"],
        phone_number: "+45 40 54 17 96",
        website_link: "https://vandenengh.dk",
        latitude: 55.670122874763095,  
        longitude: 12.538926786524 
    });
    Service.create({
        id: 4,
        name: "Barberen i Vognmagergade",
        type: "parlour",
        location: "Vognmagergade 9, 1120 Copenhagen, Denmark",
        open_time: ["9:30 am - 5:30 pm", "9:30 am - 5:30 pm", "9:30 am - 5:30 pm", "9:30 am - 5:30 pm", "9:30 am - 5:30 pm", "9:30 am - 5:30 pm", "break"],
        phone_number: "+45 33 12 63 43",
        website_link: "https://barb.dk",
        latitude: 55.68595613306434,  
        longitude: 12.578153006550183
    });
    Service.create({
        id: 5,
        name: "Esha Khamo",
        type: "parlour",
        location: "Løngangsstræde 19 st.th, 1468 Copenhagen, Denmark",
        open_time: ["12 pm - 7 pm", "12 pm - 7 pm", "12 pm - 7 pm", "12 pm - 7 pm", "12 pm - 7 pm", "10 am - 3 pm", "break"],
        phone_number: "+45 33 12 24 00",
        website_link: "https://eshakhamo.dk",
        latitude: 55.679204301676734, 
        longitude: 12.57415702970908
    });
};

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/service.routes')(app);

app.listen(port, (err) => {
    if (err) {
        process.exit(1);
    }
    console.log(`Server is running on port ${port}`);
});
