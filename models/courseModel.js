const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category',
    },
    duration: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    pilotVideo: {
        type: String,
    },
    course: [
        {
            chapter: String,
            lessons: [
                {
                    chapterName: String,
                    lessonName: String,
                    videoUrl: String
                }
            ]
        }
    ],
    imageURL: {
        type: String,
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: false,
    },
    reviews: {
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Review'
    },
    createdAt: { type: Date, default: Date.now },
})


module.exports = mongoose.model("Course", CourseSchema);