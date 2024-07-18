const db = require("../models");
const fs = require('fs');
const Op = db.Sequelize.Op;
const Profile = db.profile;
const User = db.user;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};

exports.createProfile = (req, res) => {
    Profile.create({
        payment: req.body.payment,
    }).then(profile => {
        console.log('profile', profile)
        User.findAll({
            where: {
                userId: {
                    [Op.or]: req.body.userId,
                }
            }
        }).then(user => {
            console.log('user', user)
            profile.setUser(user).then(() => {
                res.send({ message: "Profile was updated successfully!" });
            })
        });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    })
};

exports.uploadAvatar = async (req, res) => {
    const file = req.file;
    const img = fs.readFileSync(file.path);
    const query = 'INSERT INTO images(data) VALUES($1) RETURNING *';
    const values = [img];

    try {
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }

    // const profileId = req.body.profileId;

    // Profile.update(
    //     { avatar: avatarPath },
    //     { where: { id: profileId } }
    // )
    // .then(() => {
    //     res.send({ message: "Avatar uploaded successfully!" });
    // })
    // .catch(err => {
    //     res.status(500).send({ message: err.message });
    // });
};

exports.getUserProfile = async (req, res) => {
    try {
        console.log(req.query.id);
        const userId = req.query.id;
        const user = await User.findByPk(userId, {
            include: [{
                model: Profile,
                as: 'profile'
            }]
        });

        if (!user) {
            return res.status(404).send({ message: "User Not Found" });
        }

        res.status(200).send(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};