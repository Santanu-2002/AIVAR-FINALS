import express from "express";
import UserHistory from "./models/UserHistory.js";
import userAuthMiddleware from "./middlewares/userAuthMiddleware.js";

const router = express.Router();

const addUserHistory = async (req, res)=>{
    try{
        const {userId,url} = req.body;

        if(!url){
            return res.status(400).json({
                message:"URL required"
            });
        }

        if(!userId){
            return res.status(400).json({
                message:"Invalid user info"
            });
        }

        const savedHistory = new UserHistory(userId, url);

        await savedHistory.save();

        return res.status(201).json({
            message:"URL saved succesfully"
        });
    }catch(error){
        return res.status(500).json({
            message: error
        });
    }
};


const fetchUserHistory = async(req, res)=>{
    try{
        const {userId} = req.body;

        if(!userId){
            return res.status(401).json({
                message:"user id not found"
            });
        } 

        const userHData = await UserHistory.find(userId);

        const urlsHistory = userHData.url;

        return res.status(200).json({
            message:"History fetched", urls: urlsHistory
        })
    }catch(error){
        return res.status(500).json({message: error});
    }
};

const deleteHistory = async(req, res)=>{
    try{
        const userId = req.body.userId;

        if(!userId){
            return res.status(404).json({message: "No valid User"});
        }

        await UserHistory.deleteMany({userId: userId});

        return res.status(200).json({message:"Cleared History"});
    }catch(error){

    }
}
module.exports = {addUserHistory};
module.exports = {fetchUserHistory};


router.post('/saved-history', userAuthMiddleware, addUserHistory);
router.get('/fetch-history', userAuthMiddleware, fetchUserHistory);

export default router;