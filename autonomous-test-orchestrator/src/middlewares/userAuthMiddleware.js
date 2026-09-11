const jwt = require("jsonwebtoken");

const userAuthMiddleware = async(req,res, next)=>{
    try{

        const authHeader = req.header.authorization;

        if(!authHeader){
            return res.status(401).json({
                message:"Authentication token required"
            });
        }

        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({
                mesage:"Invalid token format"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    }catch(error){
        return res.status(401).json({
            message:"Invalid or expired token"
        });
    }
};

module.exports = userAuthMiddleware;