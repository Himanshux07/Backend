import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message : "ok"
    // })

    const{email,password,fullname,username}=req.body
    console.log("email", email);

    if([fullname,username,email,password].some((feild)=>feild?.trim()==="")){
        throw new ApiError(400,"All feilds are required")
    }
    
})

export { registerUser }