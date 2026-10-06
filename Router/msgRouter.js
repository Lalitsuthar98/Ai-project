import express from "express"
import authuserMiddleware from "../middleware/authUserMiddleware.js";
import { getmessage,sendMessage } from "../controller/msgController.js";
import authenticateRateLimiter from "../middleware/authenticatedRateLimiter.js";
import loadUserMiddleware from "../middleware/loadUserMiddleware.js";
import tokenUsageMiddleware from "../middleware/tokenUsageMiddleware.js"

const msgRouter = express.Router();

msgRouter.use(authuserMiddleware);
msgRouter.use(authenticateRateLimiter);

msgRouter.post("/",tokenUsageMiddleware,loadUserMiddleware,sendMessage);
msgRouter.get("/:chatId",loadUserMiddleware,getmessage);
msgRouter.post("/:chatId",tokenUsageMiddleware,loadUserMiddleware,sendMessage);
msgRouter.post(
    "/:chatId/regenerate",
    tokenUsageMiddleware,
    loadUserMiddleware,
    sendMessage
);


export default msgRouter;
