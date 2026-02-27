import dotenv from "dotenv"
dotenv.config() // { require('dotenv').config() } :Load environment variables from .env file

import connectDB from "./db/index.js"
import { connect } from "mongoose"
import { app } from "./app.js"

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
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch(err=>{
    console.log(err)
    throw err
})