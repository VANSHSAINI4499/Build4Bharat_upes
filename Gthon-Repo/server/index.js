require("dotenv").config();
const express = require("express")
const app = require("../server/App/app");
const PORT = process.env.PORT;
const connectDB = require("../server/Utils/db");
const userRouter = require("../server/Routes/userRoutes");
const cors = require("cors");



app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use("/api/v1",userRouter);

app.listen(`${PORT}`,()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
})


connectDB();