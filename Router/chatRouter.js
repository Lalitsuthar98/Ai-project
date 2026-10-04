import express from "express"
import authuserMiddleware  from "../middleware/authUserMiddleware.js";
import { getRecentChat,getSingleChat,createChat,deleteChat } from "../controller/chatController.js";
import authenticateRateLimiter from "../middleware/authenticatedRateLimiter.js";
import loadUserMiddleware from "../middleware/loadUserMiddleware.js";

const chatRouter = express.Router();

chatRouter.use(authuserMiddleware);
chatRouter.use(authenticateRateLimiter);
chatRouter.use(loadUserMiddleware);


// getRecentChat : top 20 , getsinglechar --> chatid, createchat, deletechat  

chatRouter.get("/getRecentChat",getRecentChat);
chatRouter.get("/:chatId",getSingleChat);
chatRouter.post("/createChat",createChat);
chatRouter.delete("/:chatId",deleteChat);

export default chatRouter;
