import mongoose from "mongoose"

const organisationLoginSchema= new mongoose.Schema({
    organisationId:{type:String,required:true,unique:true},
    organisationname:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    email:{type:String,required:true,unique:true},                                                          
    mobileNumber:{type:String,required:true,unique:true},
    Location:{type:String,required:true},
    eventHistory:{type:Array,required:true}
})

export const OrganisationLogin=mongoose.model("OrganisationLogin",organisationLoginSchema)