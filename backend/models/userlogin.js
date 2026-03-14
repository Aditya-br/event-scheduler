import mongoose from "mongoose";

const userLoginScehma= new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    mobileNumber:{type:String,required:true,unique:true},
    Location:{type:String,required:true},
    Events:{type:[String],default:[]}
})

export const UserLogin=mongoose.model("UserLogin",userLoginScehma);