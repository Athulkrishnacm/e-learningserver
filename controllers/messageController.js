const Message = require('../models/messageModel');
const User = require('../models/userModel')

module.exports.createMessage = async (req, res, next) => {
    try {
        const userId = req.userId
        const { text, group } = req.body;
        const newMessage = new Message({
            group,
            sender: userId,
            type: "text",
            text
        })
        const savedMessage = await newMessage.save();
        const user = await User.findById(userId,{name:1,image:1})
        res.status(200).json({ group: savedMessage.group, sender: user, text: savedMessage.text });
    } catch (err) {
        next(err)
    }
}

module.exports.getMessages = async (req, res, next) => {
    try {
        const groupId = req.params.groupId
        if (groupId !== "undefined") {
            await Message.find({ group: req.params.groupId }).populate('sender').then((messages) => {
                res.status(200).json({ messages });
            })
        } else {
            console.log('no group id');
        }
    } catch (err) {
        next(err)
    }
}

module.exports.sendImage = async (req, res, next) => {
    try {
        const file = req.body.file
        if (file) {
            const newMessage = new Message({
                group: req.body.group,
                sender: req.userId,
                type: req.body.type,
                text: req.body.text,
                file
            })
            const savedMessage = await newMessage.save();
            const user = await User.findById(req.userId,{name:1,image:1})
            res.status(200).json({ groupId: savedMessage.group, sender: user, text: savedMessage.text, type: savedMessage.type, file: savedMessage.file });
        } else {
            throw new Error("Image is not provided")
        }
    } catch (err) {
        next(err)
    }
}
