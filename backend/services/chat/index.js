import "dotenv/config";
import express from "express"
import connectDB from "./config/db.js";
import router from "./routes/chat.routes.js";

const app=express();
app.use(express.json())

const PORT = process.env.PORT

app.get("/",(req, res)=>{
    return res.status(200).json({
        message : "Welcome to the Chat Service"
    })
})

app.use('/',router)

app.listen(PORT , ()=>{
    console.log(`Chat has started at port ${PORT}`)
    connectDB()
})