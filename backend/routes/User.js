const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");


const requireLogin = require("../middleware.js/requireLogin");



router.get("/user/:id", (req, res) => {
    USER.findOne({ _id: req.params.id })
        .select("-password")
        .then(user => {
            if (!user) {
                console.log("error hai");
                return res.status(404).json({ error: "User not found" });
            }
            console.log(user);
            POST.find({ postedBy: req.params.id })
                .populate("postedBy", "_id")
                .then(posts => {
                    res.status(200).json({ user, posts });
                })
                .catch(err => {
                    res.status(422).json({ error: err });
                });
        })
        .catch(err => {
            res.status(404).json({ error: "User not found" });
        });
});

// to follow user
router.put("/follow", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        USER.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followId }
        }, {
            new: true
        }).then(result => {
            res.json(result)

        })
            .catch(err => { return res.status(422).json({ error: err }) })
    }
    )
})

// to unfollow user
router.put("/unfollow", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(req.body.followId, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        USER.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.followId }
        }, {
            new: true
        }).then(result => res.json(result))
            .catch(err => { return res.status(422).json({ error: err }) })
    }
    )
})

// to upload profile pic
router.put("/uploadProfilePic", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(req.user._id, {
        $set: { Photo: req.body.pic }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: er })
        } else {
            res.json(result)
        }
    })
})

module.exports = router;