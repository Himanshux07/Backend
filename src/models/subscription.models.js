import mongoose from "mongoose"

const subcriptionSchema=new mongoose.Schema({
    subscriber:{  // one who subscribe to a channel
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{ // one who is being subscribed to
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps: true})

export const Subscription = mongoose.model("Subscription", subcriptionSchema)