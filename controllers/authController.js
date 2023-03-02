const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    register: async (req, res, next) => {
        try {
            const { fullname, username, email, password, gender } = req.body
            let newUserName = username.toLowerCase().replace(/ /g, '')

            const user_name = await Users.findOne({ username: newUserName })
            if (user_name) return res.status(400).json({ msg: "This user already exists." })

            const user_email = await Users.findOne({ email })
            if (user_email) return res.status(400).json({ msg: "This user already exists." })

            if (password.length < 6) return res.status(400).json({ msg: "Password must be at least 6 characters" })

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = new Users({ fullname, username: newUserName, email, password: passwordHash, gender })

            const access_token = createAccessToken({ id: newUser._id.toHexString() })
            const refresh_token = createRefreshToken({ id: newUser._id.toHexString() })

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/auth/refresh',
                maxAge: 30 * 7 * 24 * 60 * 60 * 1000
            })

            await newUser.save();

            res.json({
                msg: "Successfully registered.",
                access_token,
                user: {
                    ...newUser._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body

            const user = await Users.findOne({ email: email })
                .populate("followers following", "avatar username fullname followers following")

            if (!user) return res.status(404).json({ msg: "No user registered" })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) if (!user) return res.status(404).json({ msg: "Not correct paasword" })

            const access_token = createAccessToken({ id: user._id.toHexString() })
            const refresh_token = createRefreshToken({ id: user._id.toHexString() })

            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/auth/refresh',
                maxAge: 30 * 7 * 24 * 60 * 60 * 1000
            })

            res.json({
                msg: "Successfully logged in.",
                access_token,
                user: {
                    ...user._doc,
                    password: ''
                }
            })
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    logout: async (req, res, next) => {
        try {
            res.clearCookie('refreshtoken', { path: '/auth/refresh' })
            return res.json({ msg: 'Logged out.' })
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    generateAccessToken: async (req, res, next) => {
        try {
            const rf_token = req.cookies.refreshtoken

            if (!rf_token) return res.status(403).json({ msg: 'Not logged in.' })

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async(err, result) => {
                if(err) return res.status(400).json({msg: "Not logged in."})

                const user = await Users.findById(result.id).select("-password")
                .populate("followers following", "-password")

                if(!user) return res.status(400).json({ msg: 'No user found.' })

                const access_token = createAccessToken({id: result.id})

                res.json({
                    access_token,
                    user
                })
            })


        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })

}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
}

module.exports = authController;