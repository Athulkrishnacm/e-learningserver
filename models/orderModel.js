const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    total:{
        type:Number,
        required:true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor',
        required: true,
    },
    address: {
        type:Object,
        required: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    }
},{ timestamps: true })

module.exports = mongoose.model("Orders", OrderSchema);