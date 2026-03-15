import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessTokenandRefreshToken = async(userId) => {

    const user = await User.findById(userId)
    const accessToken= user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return { accessToken, refreshToken }
}

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message : "ok"
    // })

    const{email,password,fullname,username}=req.body
    // console.log("email", email);

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

    const createUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createUser){
        throw new ApiError(500,"User registration failed")
    }

    return res.status(201).json(
        new ApiResponse(201, createUser, "User registered successfully")
    )
})

const LoginUser = asyncHandler(async (req,res)=>{

    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }
    if(!password){
        throw new ApiError(400,"Password is required")
    }
    const user= await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User not found")
    }
    const isPasswordMatch = await user.comparePassword(password)
    if(!isPasswordMatch){
        throw new ApiError(401,"Invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,accessToken, refreshToken
        }, "User logged in successfully")
    )

})

const LogoutUser = asyncHandler(async (req,res)=>{

    await User.findByIdAndUpdate(req.user._id,
    { 
        $set :{
            refreshToken: undefined
        }
    }, { new: true })

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(
        new ApiResponse(200, null, "User logged out successfully")
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{

    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken){
            throw new ApiError(400,"Unauthorized: No refresh token provided")
        }
        const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Unauthorized: User not found")
        }
        if(user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401,"Unauthorized: Invalid refresh token")
        }
    
        const options={
            httpOnly: true,
            secure: true,
        }
        const { accessToken, newRefreshToken } = await generateAccessTokenandRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                    accessToken,
                    refreshToken:newRefreshToken
                },
            "Access token refreshed successfully")
        )
    } catch (error) {
        throw new ApiError(401,"Unauthorized: Invalid refresh token")
    }
})

const changePassword = asyncHandler(async (req,res)=>{

    const {currentPassword, newPassword} = req.body
    if(!currentPassword || !newPassword ){
        throw new ApiError(400,"All fields are required")
    }
    const user = await User.findById(req.user._id)
    const isPasswordMatch = await user.comparePassword(currentPassword)
    if(!isPasswordMatch){
        throw new ApiError(401,"Current password is incorrect")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async (req,res)=>{

    const user = await User.findById(req.user._id).select("-password -refreshToken")  
    
    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    )
})

const updateUserProfile = asyncHandler(async (req,res)=>{

    const {fullname,username} = req.body 
    if(!fullname || !username){
        throw new ApiError(400,"All fields are required")
    }
    
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullname,
            username: username.toLowerCase()
        }
    },{new: true}).select("-password -refreshToken")
       
    return res.status(200).json(
        new ApiResponse(200, user, "User profile updated successfully")
    )
})

const updateAvatar = asyncHandler(async (req,res)=>{

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(500,"Error while uploading avatar")
    }

    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar: avatar.url
        }
    },{new: true}).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, avatar.url, "User avatar updated successfully")
    )
})

const updateCoverImage= asyncHandler( async (req,res) =>{

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(500,"Error while uploading cover image")
    }

    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            coverImage: coverImage.url
        }
    },{new: true}).select("-password -refreshToken")
    
    return res.status(200).json(
        new ApiResponse(200, coverImage.url, "User cover image updated successfully")
    )
})

const getUserChannelprofile = asyncHandler(async (req,res)=>{
    const {username} = req.params

    if(!username){
        throw new ApiError(400,"Username is required")
    }

    const channel= await User.aggregate([
        {
            $match:{username: username.toLowerCase()}
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"

            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedChannels"

            }
        },
        {
            $addFields:{
                subscriberCount: {
                    $size: "$subscribers"
                },
                subscribedChannelsCount: {
                    $size: "$subscribedChannels"
                },
                isSubscribed: {
                    $cond:{
                        if: {
                            $in: [req.user._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
            
        },
        {
            $project:{
                username: 1,
                fullname: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                subscribedChannelsCount: 1,
                isSubscribed: 1
            }
        }

    ])

    if(!channel || channel.length === 0){
        throw new ApiError(404,"Channel not found")
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    project:{
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }

                    }
                    {
                        $addFields:{
                            $first: "$owner"
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, user[0].watchHistory, "User watch history fetched successfully")
    )
})

export { registerUser, LoginUser, LogoutUser, refreshAccessToken, changePassword, getCurrentUser, updateUserProfile, updateAvatar, updateCoverImage, getUserChannelprofile, getWatchHistory }