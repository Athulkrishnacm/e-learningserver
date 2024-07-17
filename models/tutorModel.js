const mongoose = require('mongoose')

const Schema = mongoose.Schema

const tutorSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    certificate:{
        type: String
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    totalCourses: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: false
    },
    image: {
        type: String
    },
},
    { timestamps: true }
)

module.exports = mongoose.model('Tutor', tutorSchema)