const mongoose = require("mongoose");
const MONGODB = process.env.MONGODB


const connectDB = ()=>{
    try {
        mongoose.connect(`${MONGODB}`).then(()=>{
            console.log("Database Connected Successfully")
        }).catch(()=>{
            console.log("Database connection Failed")
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB;