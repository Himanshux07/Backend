import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
export { uploadOnCloudinary } from "../utils/cloudinary.js"


const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message : "ok"
    // })

    const{email,password,fullname,username}=req.body
    console.log("email", email);

    if([fullname,username,email,password].some((feild)=>feild?.trim()==="")){
        throw new ApiError(400,"All feilds are required")
    }
    const existingUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }
    const user = await User.create({
        email,
        password,
        fullname,
        username : username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage.url || ""
    })

    const createUser = await User.findById(user._id)

})

export { registerUser }