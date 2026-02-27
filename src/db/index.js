import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(` \n MongoDB connected: ${connectionInstance.connection.host}`)
        /*
            .Connection state
            .Host name
            .Database name
            .Port
            .Models
            .Configuration options
            .Underlying MongoDB driver connection
            {
                connectionInstance.connection.host      // localhost or cluster URL
                connectionInstance.connection.name      // Database name
                connectionInstance.connection.port      // 27017
                connectionInstance.connection.readyState
            }
        */
    } catch (err) {
        console.log("MongoDB connection error:", err)
        process.exit(1) // Exit the process with a failure code
    }
}

export default connectDB