const couponSchema = require('../models/couponModel')

module.exports = {
    applyCoupon: async (req, res, next) => {
        try {
            const couponCode = req.body.couponCode
            const coupon = await couponSchema.findOne({ couponCode })
            if (coupon) {
                res.status(200).json({ discount: coupon.discount, message: "Succesfully applied coupon" })
            } else {
                res.status(200).json({ discount: false, message: "Invalid coupon code" })
            }
        } catch (error) {
            next(error)
        }
    },
    getCouponsData: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1
            const size = 2
            const skip = (page - 1) * size
            const total = await couponSchema.countDocuments()
            await couponSchema.find({}, { password: 0 })
                .lean().sort({ createdAt: 1 }).skip(skip).limit(size).then((response) => {
                    res.status(200).json({ coupons: response, total, page, size })
                }).catch((err) => {
                    res.status(500).json({ status: false, message: "something went wrong " });
                })
        } catch (error) {
            next(error)
        }
    },
    createCoupon: async (req, res, next) => {
        try {
            const { couponCode, discount, selectedDate } = req.body
            if (couponCode) {
                couponSchema.create({
                    couponCode,
                    discount,
                    validTill: selectedDate
                }).then(() => {
                    res.status(200).json({ message: "Coupon Added" })
                })
            }
        } catch (error) {
            next(error)
        }
    },
    deleteCourse: (req, res, next) => {
        try {
            const couponId = req.params.couponId
            couponSchema.deleteOne({ _id: couponId }).then(() => {
                res.status(200).json({ sucess: true, message: "coupon deleted" })
            }).catch(() => {
                res.status(501).json({ sucess: false, message: "failed to delete" })
            })
        } catch (error) {
            next(error)
        }
    }
}