const courseModel = require('../models/courseModel')
const categoryModal = require('../models/categoryModel')
const tutorCollection = require('../models/tutorModel')
const orderCollection = require('../models/orderModel')
const userCollection = require('../models/userModel')
const Review = require('../models/reviewModel')


const uploadCourse = async (req, res, next) => {
    try {
        const tutorId = req.tutorId
        const { name, about, duration, language, price, description, category, course } = req.body.courseData
        const imageURL = req.body.imageURL
        const pilotVideo = req.body.pilotVideoURL
        const coure = courseModel.create({
            name,
            about,
            pilotVideo,
            duration,
            language,
            price,
            description,
            category,
            imageURL,
            teacher: tutorId,
            category,
            course
        }).then(async () => {
            await tutorCollection.findByIdAndUpdate(tutorId, { $inc: { totalCourses: 1 } });
            res.status(200).json({ status: true })
        })
            .catch(err => res.status(500).json({ message: "failed to upload course" }))
    } catch (error) {
        next(error)
    }
}

const homePageCourses = async (req, res, next) => {
    try {
        const limit = 5
        const skip = req.query.size * limit - limit
        const total = await courseModel.countDocuments({ status: true })
        courseModel.find({ status: true }, { isApproved: 0, status: 0, })
            .populate('teacher', '-_id name')
            .lean()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .then((response) => {
                return res.status(200).json({ courseData: response, total })
            }).catch((err) => {
                res.status(500).json({ status: false, message: "something went wrong " });
            })
    } catch (error) {
        next(error)
    }
}

const courseList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1
        const size = parseInt(req.query.size) || 3
        const skip = (page - 1) * size
        const searchQuery = req.query.searchQuery
        const category = req.query.category
        const query = {
            status: true,
        };
        if (searchQuery) {
            query.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        if (category) {
            query.category = category
        }
        const categoryData = await categoryModal.find().limit(4)
        const total = await courseModel.countDocuments(query)
        await courseModel.find(query, { isApproved: 0, status: 0, }).populate({
            path: 'teacher',
            select: '-_id name about'
        }).lean().sort({ createdAt: -1 }).skip(skip).limit(size).then(async (response) => {
            const courseIds = response.map(course => course._id);
            const courseRatings = await Review.aggregate([
                {
                    $match: { course: { $in: courseIds } }
                },
                {
                    $group: {
                        _id: "$course",
                        averageRating: { $avg: "$rating" },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);
            const courseRatingsMap = new Map();
            courseRatings.forEach(rating => courseRatingsMap.set(rating._id.toString(), {
                averageRating: rating.averageRating,
                totalReviews: rating.totalReviews
              }));
            const coursesWithRating = response.map(course => ({
                ...course,
                rating: courseRatingsMap.get(course._id.toString()) || {averageRating:0,totalReviews:0}
            }));
            res.status(200).json({ courseData: coursesWithRating, categoryData, total, page, size })
        }).catch((err) => {
            next(err)
        })
    } catch (error) {
        next(error)
    }
}

const courseDetails = async (req, res, next) => {
    try {
        await courseModel.findOne({ _id: req.params.courseId }, { isApproved: 0, status: 0, createdAt: 0, 'course.lessons.videoUrl': 0, 'course.lessons._id': 0 })
            .populate('teacher', '-_id name about image').populate({
                path: 'reviews',
                select: '-_id',
                populate: {
                    path: 'reviewedBy',
                    select: '-_id name createdAt image'
                }
            })
            .lean().then((response) => {
                res.status(200).json({ courseDetails: response });
            }).catch((err) => {
                next(err)
            })
    } catch (error) {
        next(error)
    }
}

const isCourseEnrolled = (req, res, next) => {
    try {
        const userId = req.userId
        orderCollection.findOne({ user: userId, course: req.params.courseId, status: true }).then((response) => {
            if (response) {
                res.status(200).json({ enrolled: true, message: "Course already  exist" });
            } else {
                res.status(200).json({ enrolled: false, message: "Course not  exist" });
            }
        }).catch(() => {
            res.status(200).json({ enrolled: false, message: "Course not  exist" });
        })
    } catch (error) {
        next(error)
    }
}

const watchCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId
        await courseModel.findOne({ _id: courseId }, { isApproved: 0, status: 0, createdAt: 0 }).populate({
            path: 'teacher',
            select: '-_id name about'
        }).lean().then((response) => {
            res.status(200).json({ status: true, courseDetails: response });
        }).catch((err) => {
            res.status(500).json({ status: false, message: "something went wrong " });
        })
    } catch (error) {
        next(error)
    }
}

const deleteCourse = (req, res, next) => {
    try {
        const courseId = req.params.courseId
        courseModel.deleteOne({ _id: courseId }).then(() => {
            res.status(200).json({ sucess: true, message: "course deleted" })
        }).catch(() => {
            res.status(501).json({ sucess: false, message: "failed to delete" })
        })
    } catch (error) {
        next(error)
    }
}

const getUserCourses = async (req, res, next) => {
    try {
        const userId = req.userId
        userCollection.findOne({ _id: userId, status: true }, { enrolledCourses: 1, _id: 0 })
            .populate({
                path: 'enrolledCourses.course',
                select: '_id name imageURL',
                populate: {
                    path: 'teacher',
                    select: '-_id name'
                }
            })
            .lean()
            .then((response) => {
                res.status(200).json({ enrolledCourses: response.enrolledCourses });
            })
            .catch((error) => {
                res.status(501).json({ message: "server error" })
            })
    } catch (error) {
        next(error)
    }
}

const updateProgress = async (req, res, next) => {
    try {
        const userId = req.userId
        const { courseId, videoId } = req.body;
        const courseProgress = await userCollection.findOneAndUpdate(
            {
                _id: userId,
                "enrolledCourses.course": courseId,
                "enrolledCourses.videos.videoId": videoId
            },
            {
                $set: {
                    "enrolledCourses.$[courseElem].videos.$[videoElem].completed": true
                }
            },
            {
                arrayFilters: [
                    { "courseElem.course": courseId },
                    { "videoElem.videoId": videoId }
                ],
                new: true
            }
        );
        if (courseProgress) {
            const completedVideosCount = courseProgress.enrolledCourses
                .find(course => course.course.toString() === courseId)
                .videos.filter(video => video.completed).length;
            const totalVideosCount = courseProgress.enrolledCourses
                .find(course => course.course.toString() === courseId)
                .videos.length;
            const percentage = Math.floor((completedVideosCount / totalVideosCount) * 100);
            courseProgress.enrolledCourses.find(course => course.course.toString() === courseId).totalCompleted = percentage;
            await courseProgress.save();
        }
        res.status(200).json({})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    uploadCourse,
    homePageCourses,
    courseList,
    courseDetails,
    watchCourse,
    deleteCourse,
    getUserCourses,
    isCourseEnrolled,
    updateProgress
}