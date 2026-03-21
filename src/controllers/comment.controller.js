import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("owner", "username avatar")

    const totalComments = await Comment.countDocuments({ video: videoId })

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            totalComments,
            currentPage: pageNum,
            totalPages: Math.ceil(totalComments / limitNum)
        }, "Comments retrieved successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { videoId } = req.params
    const { content } = req.body
    const user = req.user

    if(!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    if(!content || content.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty")
    }
    if(!user) {
        throw new ApiError(401, "Unauthorized")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: user._id
    })

    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    )   
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    const user = req.user

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Updated content cannot be empty")
    }

    if (!user) {
        throw new ApiError(401, "Unauthorized")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== user._id.toString()) {
        throw new ApiError(403, "Forbidden: You can only update your own comments")
    }

    comment.content = content.trim()
    await comment.save()

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params
    const user = req.user

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    if (!user) {
        throw new ApiError(401, "Unauthorized")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }
    if (comment.owner.toString() !== user._id.toString()) {
        throw new ApiError(403, "Forbidden: You can only delete your own comments")
    }
    await comment.remove()

    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    )

    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}