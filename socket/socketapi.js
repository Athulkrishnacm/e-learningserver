const io = require("socket.io")();
const User =require('../models/userModel');

const socketapi = {
    io: io
};

io.on('connection',(socket)=>{
    //join goup
    socket.on('joinGroup', groupId => {
        socket.join(groupId);
    });

    //send message
    socket.on('sendMessage',async({userId,groupId,text})=>{
        let sender = await User.findOne({ _id: userId }, { name: 1, image:1});
        io.to(groupId).emit('receiveMessage', { sender, groupId, text });
    })


    //send image
    socket.on("sendFile", async ({groupId,sender,type,file,text}) => {
        let user = await User.findOne({ _id: sender }, { name: 1, image:1 });
        io.to(groupId).emit('receiveMessage', { sender:user, text ,type,file,groupId});
    });

    // Clean up when the client disconnects
    socket.on('disconnect', () => {
    });

})

module.exports = socketapi;