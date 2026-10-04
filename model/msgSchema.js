  import mongoose from "mongoose";

  const msgSchema = new mongoose.Schema({
      userId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"user",
          required:true
      },
      chatId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"chat",
          required:true
      },
      role:{
          type:String,
          required:true
      },
      content:{
        type:String,
        required:true
      },
      
      tokens:{
          type:Number,
          default:0
      },
      usage: {
      promptTokens: {
        type: Number,
        default: 0
      },

      completionTokens: {
        type: Number,
        default: 0
      },

      totalTokens: {
        type: Number,
        default: 0
      }
    }
  },{
      timestamps:true
  });

  msgSchema.index({chatId:1,createdAt:1});
  msgSchema.index({userId:1,createdAt:-1});
  const msg = mongoose.model("msg",msgSchema);

  export default msg;