import "dotenv/config";
import express from "express"
import { connect } from "mongoose";
const app = express();
import connectDB from "./config/db.js";
import router from "./routes/auth.route.js";
app.use(express.json())
app.use('/',router)

const PORT = process.env.PORT

app.get("/",(req, res)=>{
    return res.status(200).json({
        message : "Welcome to the auth Service"
    })
})

app.listen(PORT , ()=>{
    console.log(`Auth has started at port ${PORT}`)
    connectDB()
})