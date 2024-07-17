const groupModel = require('../models/groupModel')
const userModel = require('../models/userModel')

module.exports = {
    createGroup: async (req, res, next) => {
        try {
            const { name, image, description } = req.body
            const group = groupModel.create({
                name,
                image,
                description,
            }).then(() => { res.status(200).json({ message: "Group Created successfully" }) })
                .catch((error) => {
                    console.log(error);
                })
        } catch (error) {
            next(error)
        }
    },
    getAllGroups: async (req, res, next) => {
        try {
            groupModel.find()
                .then((groups) => { res.status(200).json({ groups }) })
                .catch((error) => { res.status(500).json({ error: error }) })
        } catch (error) {
            next(error)
        }
    },
    joinGroup: async (req, res, next) => {
        try {
            const userId = req.userId
            const groupId = req.body.groupId;
            const user = await userModel.findOneAndUpdate(
                { _id: userId },
                { $addToSet: { groups: groupId } },
              )
            groupModel.findByIdAndUpdate(groupId, { $addToSet: { members: userId } })
              .then((group) => {
                if (group) {
                  res.status(200).json({ message: "Successfully joined",group });
                } else {
                  res.status(404).json({ message: "Group not found" });
                }
              })
              .catch((error) => {
                res.status(500).json({ error: error.message });
              });
            
        } catch (error) {
            next(error)
        }
    },
    getJoinedGroups:(req,res,next)=>{
        try{
            const userId = req.userId
            if(userId){
                userModel.findById(userId,{groups:1,_id:0}).populate('groups').then((response)=>{
                    res.status(200).json({groups:response.groups})
                })
            }else{
                throw new Error("User Id is not Provided")
            }
        } catch (err) {
            next(err)
        }
    }
}