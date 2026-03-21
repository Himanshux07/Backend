import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {Comment} from "../models/comment.models.js"
import {Video} from "../models/video.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const user = req.user
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    const existingLike = await Like.findOne({ user: user._id, video: videoId })

    if(existingLike) {
        await existingLike.remove()
        return res.status(200).json(
            new ApiResponse(200, null, "Video unliked successfully")
        )
    }
    const like = await Like.create({ user: user._id, video: videoId })
    return res.status(200).json(
        new ApiResponse(200, like, "Video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const user = req.user

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({
        user: user._id,
        comment: commentId
    })

    if (existingLike) {
        await existingLike.deleteOne()
        return res.status(200).json(
            new ApiResponse(200, null, "Comment unliked successfully")
        )
    }

    const like = await Like.create({
        user: user._id,
        comment: commentId
    })

    return res.status(200).json(
        new ApiResponse(200, like, "Comment liked successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const user = req.user

})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}