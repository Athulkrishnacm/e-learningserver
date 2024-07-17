const adminCollection = require('../models/adminModel')
const bcrypt = require("bcrypt")
const jwtSecert = process.env.JWT_SECERT
const jwt = require("jsonwebtoken")
const userCollection = require('../models/userModel')
const tutorCollection = require('../models/tutorModel')
const courseCollection = require('../models/courseModel')
const orderCollection = require('../models/orderModel')
const couponCollection = require('../models/couponModel')
const Category = require('../models/categoryModel')

const handleAdminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const admin = await adminCollection.findOne({ email })
        if (admin) {
            const isMatch = await bcrypt.compare(password, admin.password)
            if (isMatch) {
                let token = jwt.sign({
                    adminId: admin._id,
                    adminName: admin.name,
                    role:'admin'
                }, jwtSecert, {
                    expiresIn: "1d",
                })
                return res.status(200).json({
                    message: "Login Successful",
                    token
                })
            } else {
                return res.status(200).json({
                    message: "Invalid Credentials"
                })
            }
        } else {
            return res.status(200).json({
                message: "Invalid Credentials"
            })
        }
    } catch (error) {
        next(error)
    }
}

const adminAuthentication = async (req, res, next) => {
    try {
        const admin = await adminCollection.findById(req.adminId )
        if (admin) {
            return res.status(200).json({ status: true })
        } else {
            return res.status(401).json({ status: false})
        }
    } catch (error) {
        next(error)
    }
}

const dashboard = async (req, res, next) => {
    try {
        const userCount = await userCollection.count()
        const tutorCount = await tutorCollection.count()
        const courseCount = await courseCollection.count()
        const orderCount = await orderCollection.count({ status: true })
        const couponCount = await couponCollection.count()
        const orders= await orderCollection.find()
        .populate('course','name  -_id')
        .populate('teacher','name  -_id')
        .populate('user','name image email -_id')
        .sort({createdAt:-1})
        .limit(5)
        res.status(200).json({ userCount, tutorCount, courseCount, orderCount, couponCount,orders })
    } catch (error) {
        next(error)
    }
}

const usersList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const size = 10
        const skip = (page - 1) * size
        const searchQuery = req.query.searchQuery
        const query = {};
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        const total = await userCollection.countDocuments()
        await userCollection.find(query, { password:0,_id:0 })
        .lean().sort({ createdAt: 1 }).skip(skip).limit(size).then((response) => {
            res.status(200).json({ users: response, total, page, size })
        }).catch((err) => {
            res.status(500).json({ status: false, message: "something went wrong " });
        })
    } catch (error) {
        next(error)
    }
}

const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.query
        const user = await userCollection.findById(userId)
        const status = !user.status
        await userCollection.findByIdAndUpdate({ _id: userId }, { status })
        res.status(200).json({ message: "Status updated!" })
    } catch (error) {
        next(error)
    }
}

const tutorsList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const size = 10
        const skip = (page - 1) * size
        const searchQuery = req.query.searchQuery
        const query = {};
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        const total = await tutorCollection.countDocuments()
        await tutorCollection.find(query, { password:0 })
        .lean().sort({ isApproved: 1 }).skip(skip).limit(size).then((response) => {
            res.status(200).json({ tutors: response, total, page, size })
        }).catch((err) => {
            res.status(500).json({ status: false, message: "something went wrong " });
        })
    } catch (error) {
        next(error)
    }
}

const updateTutorStatus = async (req, res, next) => {
    try {
        const { tutorId,approve } = req.query
        if(approve ==='true'){
            await tutorCollection.findByIdAndUpdate({ _id: tutorId }, { isApproved: true, status:true })
            return res.status(200).json({ message: "Successfully Approved" })
        }else{
            const tutor = await tutorCollection.findById(tutorId)
            const status = !tutor.status
            await tutorCollection.findByIdAndUpdate({ _id: tutorId }, { status }).then(()=>{
               return res.status(200).json({ message: "Status updated!" })
            }).catch(()=>{
                res.status(501).json({ message: "server error" })
            })
        }
    } catch (error) {
        next(error)
    }
}

const tutorViewAndApprove = async (req, res, next) => {
    try {
        const { tutorId, status, tutorView } = req.body
        if (tutorId && tutorView) {
            const tutor = await tutorCollection.findById(tutorId)
            return res.status(200).json({ tutor })
        }
        if (!tutorView) {
            await tutorCollection.findByIdAndUpdate({ _id: tutorId }, { isApproved: status, status })
            return res.status(200).json({ message: "Successfully Approved" })
        }
    } catch (error) {
        next(error)
    }
}

const getCourse = async (req, res, next) => {
    try {
        const course = await courseCollection.find().sort({createdAt:-1})
        res.status(200).json({ course })
    } catch (error) {
        next(error)
    }
}

const courseManage = async (req, res, next) => {
    try {
        const courseId = req.body.courseId
        const course = await courseCollection.findById(courseId)
        const newStatus = !course.status
        await courseCollection.findByIdAndUpdate({ _id: courseId }, { status: newStatus }).then(() => {
            return res.status(200).json({ message: "Status updated" })
        }).catch(() => {
            return res.status(501).json({ message: "failed to update" })
        })
    } catch (error) {
        next(error)
    }
}

const courseViewAndApprove = async (req, res, next) => {
    try {
        const { courseId, status } = req.body
        if (courseId && !status) {
            const course = await courseCollection.findById(courseId).populate('category')
            return res.status(200).json({ course })
        }
        if (status) {
            await courseCollection.findByIdAndUpdate({ _id: courseId }, { isApproved: status, status })
            res.status(200).json({ status: true })
        }
    } catch (error) {
        next(error)
    }
}

const addCategory = async (req, res, next) => {
    try {
        if (req.body.categoryName) {
            const name = req.body.categoryName
            Category.create({
                name
            })
        }
        const categories = await Category.find()
        res.status(200).json({ message: "Category Added", categories })
    } catch (error) {
        next(error)
    }
}

const getTransctions = async(req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const total = await orderCollection.countDocuments()
        const size = total < 5 ? total :3
        const skip = (page - 1) * size        
        orderCollection.find()
        .populate('course','name  -_id')
        .populate('teacher','name  -_id')
        .populate('user','name image email -_id')
        .sort({createdAt:-1})
        .skip(skip)
        .limit(size)
        .lean()
        .then((response) => {
            res.status(200).json({ orders: response, total, page, size })
        }).catch((err) => {
            res.status(501).json({ message:"Unable to fetch the data" })
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    handleAdminLogin,
    adminAuthentication,
    dashboard,
    usersList,
    updateUserStatus,
    tutorsList,
    updateTutorStatus,
    tutorViewAndApprove,
    getCourse,
    courseManage,
    courseViewAndApprove,
    addCategory,
    getTransctions,
}