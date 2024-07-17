const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const orderSchema = require('../models/orderModel')
const userCollection = require('../models/userModel')
const courseCollection = require('../models/courseModel')
const couponSchema = require('../models/couponModel')

const createPayment = async (req, res, next) => {
    try {
        const userId = req.userId
        const { courseId, address, pincode, couponCode } = req.body
        const user = await userCollection.findById(userId);
        const course = await courseCollection.findById(courseId);
        let total = course.price
        const coupon = await couponSchema.findOne({ couponCode })
        if (coupon) {
            total = Math.ceil(total - (total / coupon.discount))
        }
        if (course) {
            const newOrder = new orderSchema({
                total,
                course: courseId,
                user: userId,
                teacher: course.teacher,
                address: { line1: address, pincode },
                purchaseDate: Date.now(),
            })
            newOrder.save().then(async (order) => {
                const session = await stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price_data: {
                                currency: "inr",
                                product_data: {
                                    name: course.name,
                                    images: [course.imageURL],
                                    description: course.about
                                },
                                unit_amount: total * 100,
                            },
                            quantity: 1,
                        }
                    ],
                    mode: 'payment',
                    customer_email: user.email,
                    success_url: `${process.env.SERVER_URL}/verifyPayment/${order._id}`,
                    cancel_url: `${process.env.SERVER_URL}/cancel-payment/${order._id}`,
                })
                return res.status(200).json({ url: session.url })
            })
        } else {
            res.redirect(`${process.env.CLIENT_URL}/course-payment/${courseId}`);
        }
    } catch (error) {
        next(error);
    }
}

const verifyPayment = async (req, res, next) => {
    try {
        const orderId = req.params.orderId
        const order = await orderSchema.findById(orderId);
        if (order) {
            const course = await courseCollection.findById(order.course, { course: 1, _id: 0 })
            const allLessons = course.course.reduce((lessons, chapter) => {
                const chapterLessons = chapter.lessons.map((lesson) => {
                    return {
                        videoId: lesson._id,
                        lastPlaytime: null,
                        completed: false,
                    };
                });
                return [...lessons, ...chapterLessons];
            }, []);
            await orderSchema.findByIdAndUpdate(orderId, { $set: { status: true } })
            userCollection.findByIdAndUpdate(order.user, { $inc: { totalEnrolled: 1 }, $push: { enrolledCourses: { course: order.course,videos:allLessons } } })
                .then(() => {
                    res.redirect(`${process.env.CLIENT_URL}/order-success`);
                })
        } else {
            res.redirect(`${process.env.CLIENT_URL}/cancel-payment/${order.courseId}`);
        }
    } catch (err) {
        next(err);
    }
}

const cancelOrder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId
        const order = await orderSchema.findById(orderId)
        orderSchema.findByIdAndDelete(orderId).then((response) => {
            res.redirect(`${process.env.CLIENT_URL}/course-details/${order.course}`);
        })
    } catch (err) {
        next(err)
    }
}

const userPuchaseHistory = async (req, res, next) => {
    try {
        const userId = req.userId
        orderSchema.find({ user: userId, status: true }, { teacher: 0 })
            .populate('course', '_id name imageURL')
            .populate('user', '-_id name email')
            .sort({ createdAt: -1 })
            .lean()
            .then((response) => {
                res.status(200).json({ orders: response })
            })
            .catch((error) => {
                res.status(501).json({ message: "server error" })
            })
    } catch (error) {
        next(error)
    }
}

module.exports = { createPayment, verifyPayment, cancelOrder, userPuchaseHistory }