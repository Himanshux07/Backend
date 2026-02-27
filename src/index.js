// require('dotenv').config() // Load environment variables from .env file
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { connect } from "mongoose"
dotenv.config() // Load environment variables from .env file

// import mongoose from "mongoose";
// import { DB_NAME } from "./constant.js";
/*

import express from "express";
const app=express();
;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        app.on("error",(err)=>{
            console.log(err)
            throw err
        })
        app.listen(process.env.PORT,()=>{
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    }
    catch(err){
        console.log(err)
        throw err
    }
})()
*/
connectDB()