const express = require('express')
const userRoute= express.Router()
const {updateUserProfile,getUserProfile,userAuthentication,verifyUserAndOtpSend,verifyOtp,handleUserLogin} = require('../controllers/userController')
const {userAuth} = require('../middlewares/userAuth')
const {checkUserEnrolledCourse} = require('../middlewares/checkCourseEnrolled')
const {updateProgress,getUserCourses,homePageCourses,courseList,courseDetails,isCourseEnrolled,watchCourse} = require('../controllers/courseController')
const {createPayment,verifyPayment,cancelOrder, userPuchaseHistory} = require('../controllers/paymentController')
const {applyCoupon} = require('../controllers/couponController')
const { createGroup, getAllGroups, joinGroup, getJoinedGroups } = require('../controllers/groupController')
const { createMessage, getMessages, sendImage } = require('../controllers/messageController')
const {reviewCourse, reviewCheckStatus} = require('../controllers/ReviewController')

//user Authentication
userRoute.get('/userAuth',userAuth,userAuthentication)

//signup user
userRoute.post('/user/exist',verifyUserAndOtpSend)
userRoute.post('/verify/signup',verifyOtp)

//signin user
userRoute.post('/signin',handleUserLogin)
userRoute.get('/home-course',homePageCourses)
userRoute.get('/course',courseList) 

//user profile
userRoute.get('/profile',userAuth,getUserProfile)
userRoute.put('/update/profile',userAuth,updateUserProfile)
userRoute.get('/enrolled-course',userAuth,getUserCourses)
userRoute.get('/purchase-history',userAuth,userPuchaseHistory)

//course details
userRoute.get('/course-details/:courseId',courseDetails)
userRoute.get('/is-course-enrolled/:courseId', userAuth, isCourseEnrolled);

//course Review
userRoute.post('/review-course',userAuth,reviewCourse)
userRoute.get('/review-status/:courseId',userAuth,reviewCheckStatus)

//payment 
userRoute.post('/apply-coupon',applyCoupon)
userRoute.post('/create-checkout-session',userAuth,createPayment)
userRoute.get('/verifyPayment/:orderId', verifyPayment);
userRoute.get('/cancel-payment/:orderId', cancelOrder);

//course video watch
userRoute.get('/course/view/:courseId',userAuth,checkUserEnrolledCourse,watchCourse)
userRoute.patch('/update-progress',userAuth,updateProgress)

//group 
userRoute.post('/create-group',createGroup)
userRoute.get('/all-groups',getAllGroups)
userRoute.put('/join-group',userAuth,joinGroup)
userRoute.get('/joined-groups',userAuth,getJoinedGroups)

//message 
userRoute.post('/messages',userAuth,createMessage)
userRoute.get('/messages/:groupId',userAuth,getMessages)
userRoute.post('/messages/send/file/image', userAuth, sendImage)

module.exports=userRoute