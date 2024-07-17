const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
    {
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Groups"
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        type:{
            type:String,
            //require:true
        },
        text: {
            type: String,
        },
        file:{
            type:String
        }
    },
    { timestamps: true }
)


module.exports = mongoose.model("Messages", MessageSchema);