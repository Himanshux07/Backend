import {v2 as cloudinary} from "cloudinary"
import { response } from "express"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadImage = async (localfilePath) => {
    try{
        if(!localfilePath)  throw new Error("File path is required")
        
        const result = await cloudinary.uploader.upload(localfilePath, {
            resource_type: "auto"
        })
        console.log("File is uploaded on cloudinary" , result.url);
        return result

    }
    catch(err){
        fs.unlinkSync(localfilePath) // Delete the local file
    }
}