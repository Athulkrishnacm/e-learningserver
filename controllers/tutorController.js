const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const tutorCollection = require('../models/tutorModel')
const jwtSecert = process.env.JWT_SECERT
const courseModel = require('../models/courseModel')
const { response } = require('express')

const handleTutorSignUp = async (req, res, next) => {
    try {
        const { name, phone, email, password, about, otp } = req.body.tutorData
        const tutor = await tutorCollection.findOne({ email })
        if (tutor) {
            return res.status(200).json({ status: false, message: "Already Registred" })
        } else if (otp) {
            const encryptedPass = await bcrypt.hash(password, 10)
            tutorCollection.create({
                name,
                email,
                phone,
                password: encryptedPass,
                about,
                certificate: req.body.imageUrl
            })
            return res.status(200).json({ signed: true })
        } else {
            return res.status(200).json({ status: true })
        }
    } catch (error) {
        next(error)
    }
}

const handleTutorLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        let tutor = await tutorCollection.findOne({ email })
        if (tutor) {
            if (!tutor.status) return res.status(200).json({ message: "You have no permission" })
            const passwordMatch = await bcrypt.compare(password, tutor.password)
            if (passwordMatch) {
                let token = jwt.sign({
                    tutorId: tutor._id,
                    tutorName: tutor.name,
                    role:'tutor'
                }, jwtSecert, {
                    expiresIn: "1d",
                })
                return res.status(200).json({
                    message: "Signin Successful...",
                    token,
                    name:tutor.name
                })
            } else {
                return res.status(200).json({ message: "invalid email or password" })
            }
        } else {
            return res.status(200).json({ message: "invalid email or password" })
        }
    } catch (error) {
        next(error)
    }
}

const tutorAuthVerify = async (req, res, next) => {
    try {
        const tutor = await tutorCollection.findOne({ _id: req.tutorId, status: true })
        if (tutor) {
            return res.status(200).json({ status: true, tutorName:tutor.name})
        } else {
            return res.status(401).json({ status: false, message: "Session expired!, Please Signin." })
        }
    } catch (error) {
        next(error)
    }
}

const getTutorCourses = async (req, res, next) => {
    try {
          await courseModel.find({ teacher:req.tutorId }).then((response)=>{
            return res.status(200).json({ courses:response})
        }).catch((error) => {
            return res.status(501).json({message:"server error"})
        })
    } catch (error) {
        next(error)
    }
}

const getTutorProfile = async (req,res,next)=>{
    try {
        tutorCollection.findOne({_id :req.tutorId},{password:0,_id:0}).then((response)=>{
            res.status(200).json({tutor:response})
        }).catch(()=>{
            res.status(501).json({message:"Failed to profile"})
        })
    } catch (error) {
       next(error) 
    }
}

const updateTutorProfile = async (req, res) => {
    try {
        const { image,name, email, about } = req.body
        await tutorCollection.findOneAndUpdate({ _id: req.tutorId }, { name, email, image,about }).then((response) => {
            return res.status(200).json({ tutor: response, message: "Profile Updated Successfully" })
        }).catch((error) => {
            return res.status(500).json({ message: "error updating profile" })
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    handleTutorSignUp,
    handleTutorLogin,
    tutorAuthVerify,
    getTutorCourses,
    getTutorProfile,
    updateTutorProfile
}