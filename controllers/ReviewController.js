const courseModel = require('../models/courseModel')
const reviewModel = require('../models/reviewModel')
const orderCollection = require('../models/orderModel')

module.exports = {
    reviewCourse: async (req, res, next) => {
        try {
            const { courseId, rating, review } = req.body;
            const userId = req.userId;
            const reviewed = await reviewModel.create({
                reviewedBy: userId,
                course: courseId,
                rating,
                review
            })
            courseModel.findByIdAndUpdate({ _id: courseId }, { $addToSet: { reviews: reviewed._id } }).then(() => res.status(201).json({ message: "Thank for your Review" }))
        } catch (error) {
            next(error);
        }
    },
    reviewCheckStatus: async (req, res, next) => {
        try {
            const ordered = await orderCollection.findOne({ $and: [{ course: req.params.courseId }, { user: req.userId }] })
            const reviewed = await reviewModel.findOne({ $and: [{ course: req.params.courseId }, { reviewedBy: req.userId }] })
            if (reviewed) {
                res.status(403).json({message:"You already reviewed the course",review:false})
            }else if (!ordered){
                res.status(402).json({message:"You need to buy the course to review.",review:false})
            }else{
                res.status(200).json({review:true})
            }
        } catch (error) {
            next(error);
        }
    }
}