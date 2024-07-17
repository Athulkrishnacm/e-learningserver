const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required:true
    },
    members:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Users',  
    },
    status: {
        type: Boolean,
        default: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tutor',
    },
    createdAt: { type: Date, default: Date.now },
})


module.exports = mongoose.model("Groups", GroupSchema);