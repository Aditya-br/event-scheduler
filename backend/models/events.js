import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    eventId:{type:String,required:true,unique:true},
    eventName:{type:String,required:true},
    eventDescription:{type:String},
    ticketPrice:{type:Number,required:true},
    eventDate:{type:Date,required:true},
    eventTime:{type:String,required:true},
    ticketsAvailable:{type:Number,required:true},
    totaltickets:{type:Number,required:true},
    eventtype:{type:String,required:true},
    organisationID:{type:mongoose.Schema.Types.ObjectId,ref:'Organisation',required:true}
})

export const Event = mongoose.model('Event',eventSchema)
