import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    eventId: { type: String, required: true },
    username: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
    qrToken: { type: String, required: true, unique: true },
    isUsed: { type: Boolean, default: false },
    checkedIn: { type: Date, default: null }
})

export const Ticket = mongoose.model("Ticket", ticketSchema)
