import mongoose from "mongoose";   

const dbconnection  = async()=>{
    await mongoose.connect(process.env.MOGNODB_URL);
    console.log("database connecion successfully");
};

export default dbconnection;

