import "dotenv/config";
import express from "express"
import connectDB from "./config/db.js";
import router from "./routes/agent.route.js";

const app=express();
app.use(express.json())
app.use("/", router)

app.use((err,req,res,next)=>{
    console.log(err)
    if(err.status)
    {
        return res.status(err.status).json(err.data)
    }
    return res.status(500).json({message:`agent error : ${error}`})
})

const PORT = process.env.PORT

app.get("/",(req, res)=>{
    return res.status(200).json({
        message : "Welcome to the Agent Service"
    })
})


app.listen(PORT , ()=>{
    console.log(`Agent has started at port ${PORT}`)
    connectDB()
})
