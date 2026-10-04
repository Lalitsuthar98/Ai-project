import "dotenv/config";
import express from "express"
import cors from "cors"
import dbconnection from "./config/database.js";
import userRouter from "./Router/userRouter.js";
import msgRouter from "./Router/msgRouter.js";
import chatRouter from "./Router/chatRouter.js";
import cookieParser from "cookie-parser";
import { connectRedis } from "./config/redis.js";

console.log("🔥 THIS IS MY PROJECT1 SERVER");

const app = express();
app.use(cookieParser());
app.use(express.json());

// router   
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/user",userRouter);
app.use("/msg",msgRouter);
app.use("/chat",chatRouter);



const serverstart = async()=>{
    try {
      await  dbconnection();
      await  connectRedis();

        app.listen(process.env.SERVER_PORT,()=>{
            console.log(`server is listening on port ${process.env.SERVER_PORT}`);
        })
    } catch (error) {
        console.log(error);
    }
}

serverstart();

