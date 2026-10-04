import express from "express"
import { login,profile,signup,logout,deleteAccount} from "../controller/userController.js";
import authuserMiddleware from "../middleware/authUserMiddleware.js"
import authenticateRateLimiter from "../middleware/authenticatedRateLimiter.js"
import unauthenticatedRateLimiter from "../middleware/unauthenticatedRateLimiter.js"
import loadUserMiddleware from "../middleware/loadUserMiddleware.js"

const userRouter  = express.Router();

userRouter.post("/login",unauthenticatedRateLimiter,login);
userRouter.post("/signup",signup);
userRouter.get("/profile",authuserMiddleware,authenticateRateLimiter,loadUserMiddleware,profile);
userRouter.post("/logout",authuserMiddleware,authenticateRateLimiter,logout);
userRouter.delete("/deleteprofile",authuserMiddleware,authenticateRateLimiter,loadUserMiddleware,deleteAccount)

export default userRouter;
