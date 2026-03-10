import { Router } from "express"
import { LogoutUser, registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js"
import { LoginUser } from "../controllers/user.controller.js"
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

export default router
