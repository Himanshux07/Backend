import { Router } from "express"
import { LogoutUser, registerUser, LoginUser,updateAvatar,updateCoverImage,updateUserProfile,changePassword,getCurrentUser, getUserChannelprofile, getWatchHistory, addVideoToWatchHistory } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser) // or router.post("/register",registerUser)

router.route("/login").post(LoginUser)
router.route("/logout").post(verifyJWT, LogoutUser)
router.route("/change-password").put(verifyJWT, changePassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-profile").patch(verifyJWT, updateUserProfile)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateAvatar)
router.route("/cover-image").put(verifyJWT, upload.single("coverImage"), updateCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelprofile)
router.route("/c/history/:videoId").post(verifyJWT, addVideoToWatchHistory)
router.route("/c/history").get(verifyJWT, getWatchHistory)


export default router
