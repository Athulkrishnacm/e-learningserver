const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    totalEnrolled: {
        type: Number,
        default: 0
    },
    loginWithGoogle: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: true
    },
    enrolledCourses: [
        {
          course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
          },
          videos: [
            {
              videoId: {
                type: mongoose.Schema.Types.ObjectId,
              },
              lastPlaytime:{
                type: String,
                default: null
              },
              completed: {
                type: Boolean,
                default: false,
              },
            },
          ],
          lastPlayedVideo: {
            type: String,
            default: null,
          },
          totalCompleted:{
            type: Number,
            default:0
          }
        },
      ],
      groups: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Groups',
    }
},
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)