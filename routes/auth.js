const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
const fetchuser = require("../middleware/fetchUser")



//Route 1:create a user using :post"/api/auth/createuser". doesn't require login
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
    //if there are errors return bad request and errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //check wheater the user with this email already exists
    try {
        let user = await User.findOne({ email: req.body.email });
        console.log(user);
        if (user) {
            return res.status(400).json({ success, error: "Sorry,user with this email already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        secPassword = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPassword,
            email: req.body.email,
        })

        //     .then(user => res.json(user)).catch(err => {
        //     console.log(err)
        //     res.json({ error: 'Please enter a unique value for email', message: err.message })
        // });
        const data = {
            user: {
                id: user.id,
            }
        }
        const authToken = jwt.sign(data, jwt_secret);
        //console.log(authToken);

        //res.json(user);
        success = true;
        res.json({ success, authtoken: authToken });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured");
    }
})

//Rout 2:Authenticate :post"/api/auth/login". doesn't require login
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    //if there are errors return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Please,try to login with correct crendetials" });
        }
        const pwCompare = await bcrypt.compare(password, user.password);
        if (!pwCompare) {
            return res.status(400).json({ success, error: "Please,try to login with correct crendetials" });
        }
        const data = {
            user: {
                id: user.id,
            }
        }
        const authToken = jwt.sign(data, jwt_secret);
        //console.log(authToken);
        success = true;
        res.json({ success, authtoken: authToken });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured");
    }

});

//Rout 3:Get user details :post"/api/auth/getuser". login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured");
    }
});

module.exports = router;