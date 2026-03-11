import { Router } from "express"
import { LogoutUser, registerUser, LoginUser, verifyJWT } from "../controllers/user.controller.js"
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

export default router
