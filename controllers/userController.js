const userCollection = require('../models/userModel')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const serviceSid = process.env.SERVICE_SID
const client = require('twilio')(accountSid, authToken);
const jwtSecert = process.env.JWT_SECERT

const verifyUserAndOtpSend = async (req, res, next) => {
    try {
        const phone = req.body.phone
        let user = await userCollection.findOne({ phone })
        if (!user) {
            client.verify.v2.services(process.env.SERVICE_SID)
                .verifications
                .create({ to: '+91' + phone, channel: "sms" })
                .then((verification) => {
                    return res.status(200).json({ otpSend: true })
                })
        } else {
            return res.status(200).json({ otpSend: false })
        }
    } catch (error) {
        next(error)
    }
}

const verifyOtp = async (req, res, next) => {
    try {
        const { name,lastName, email, phone, password,image } = req.body.userData
        if (req.body.googleAuth) {
            let user = await userCollection.findOne({ email })
            if (!user) {
                user = await userCollection
                    .create({
                        name,
                        lastName,
                        email,
                        phone,
                        password,
                        image,
                        loginWithGoogle:true
                    })
            }
            let token = jwt.sign({
                userId: user._id,
                userName: user.name,
                role:'user'
            }, jwtSecert, {
                expiresIn: "1d",
            })
            return res.status(200).json({
                message: "Signin Successful...",
                token
            })
        } else {
            client.verify.v2.services(serviceSid)
                .verificationChecks
                .create({ to: '+91' + phone, code: req.body.code })
                .then((verification) => {
                    if (verification.status === "approved") {
                        (async () => {
                            const encryptedPasword = await bcrypt.hash(password, 10)
                            userCollection
                                .create({
                                   name,
                                    email,
                                    phone,
                                    password: encryptedPasword
                                })
                                .then((data) => {
                                    return res.status(200).json({ verified: true })
                                })
                        })()
                    } else {
                        return res.status(200).json({ verified: false })
                    }
                })
        }
    } catch (error) {
        next(error)
    }
}

const handleUserLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await userCollection.findOne({ email })
        if (user) {
            if (!user.status) return res.status(200).json({ message: "You have no permission" })
            const passwordMatch = await bcrypt.compare(password, user.password)
            if (passwordMatch) {
                let token = jwt.sign({
                    userId: user._id,
                    userName: user.name,
                    role:'user'
                }, jwtSecert, {
                    expiresIn: "1d",
                })
                return res.status(200).json({
                    message: "Signin Successful...",
                    token,
                    userId:user._id
                })
            } else {
                res.status(200).json({ message: "invalid email or password" })
            }
        } else {
            res.status(200).json({ message: "invalid email or password" })
        }
    } catch (error) {
        next(error)
    }
}

const userAuthentication = async (req, res, next) => {
    try {
        const user = await userCollection.findOne({ _id: req.userId, status: true },{image:1,_id:0})
        if (user) {
            return res.status(200).json({ status: true,user })
        } else {
            return res.status(401).json({ status: false, message: "Session expired!, Please Signin." })
        }
    } catch (error) {
        next(error)
    }
}


const getUserProfile = async (req, res) => {
    try {
        await userCollection.findOne({ _id: req.userId}, { password: 0 ,_id:0}).then((response) => {
            return res.status(200).json({ user: response })
        }).catch((error) => {
            return res.status(500).json({ message: "error fetching data" })
        })
    } catch (error) {
        next(error)
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const  userId  = req.userId
        if (req.body.newPassword) {
            const { oldPassword, newPassword } = req.body
            const user = await userCollection.findById(userId)
            const passwordMatch = await bcrypt.compare(oldPassword, user.password)
            if (passwordMatch) {
                const encryptPasword = await bcrypt.hash(newPassword, 10)
                await userCollection.findOneAndUpdate({ _id: userId }, { password:encryptPasword })
                return res.status(200).json({ message: "Password successfully updated" })
            }else{
                return res.status(401).json({ message: "Incorrect Old Password" })
            }
        }
        const { name, lastName, email, image } = req.body
        await userCollection.findOneAndUpdate({ _id: userId }, { name, lastName, email, image }).then((response) => {
            return res.status(200).json({ user: response, message: "Profile Updated Successfully" })
        }).catch((error) => {
            return res.status(500).json({ message: "error updating profile" })
        })
    } catch (error) {
        next(error)
    }
}



module.exports = {
    handleUserLogin,
    verifyUserAndOtpSend,
    verifyOtp,
    userAuthentication,
    getUserProfile,
    updateUserProfile
}