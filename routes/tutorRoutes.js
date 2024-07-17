const express = require('express')
const tutorRoute = express.Router()
const { updateTutorProfile, getTutorProfile, handleTutorSignUp, handleTutorLogin, tutorAuthVerify, getTutorCourses } = require('../controllers/tutorController')
const { uploadCourse, deleteCourse } = require('../controllers/courseController')
const { tutorAuth } = require('../middlewares/tutorAuth')
const { courseViewAndApprove } = require('../controllers/adminController')

tutorRoute.post('/signup', handleTutorSignUp)
tutorRoute.post('/signin', handleTutorLogin)
tutorRoute.use(tutorAuth)
tutorRoute.get('/tutorauth', tutorAuthVerify)
tutorRoute.post('/upload/course', uploadCourse)
tutorRoute.get('/all-course/', getTutorCourses)
tutorRoute.post('/course/view', courseViewAndApprove)
tutorRoute.delete('/delete/:courseId', deleteCourse)
tutorRoute.get('/profile', getTutorProfile)
tutorRoute.put('/profile', updateTutorProfile)

module.exports = tutorRoute