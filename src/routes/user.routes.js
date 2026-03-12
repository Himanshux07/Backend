import { Router } from "express"
import { LogoutUser, registerUser, LoginUser, verifyJWT, updateAvatar,updateCoverImage,updateUserProfile,changePassword,getCurrentUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js"
import { refreshAccessToken } from "../controllers/user.controller.js"

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
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-avatar").put(verifyJWT, updateAvatar)
router.route("/update-cover-image").put(verifyJWT, updateCoverImage)
router.route("/update-profile").put(verifyJWT, updateUserProfile)
router.route("/change-password").put(verifyJWT, changePassword)
router.route("/me").get(verifyJWT, getCurrentUser)

export default router
