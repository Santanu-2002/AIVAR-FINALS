import mongoose, { mongo } from "mongoose";
import userAuthMiddleware from "../middlewares/userAuthMiddleware";
const userHistorySchema = mongoose.Schema(
    {
        userId:{
            type: String,
            required : true,
            
        },
        url:{
            type: String,
            required: true,
        }
    },{timestamps: true}
);

const UserHistory = mongoose.model("UserHistory", userHistorySchema);

export default UserHistory;