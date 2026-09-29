import "dotenv/config";
import express from "express"
const app = express();
import connectDB from "./config/db.js";
import router from "./routes/billing.route.js";

app.use(express.json())
app.use("/",router)

const PORT = process.env.PORT

app.get("/",(req, res)=>{
    return res.status(200).json({
        message : "Hello From Billing"
    })
})

app.listen(PORT , ()=>{
    console.log(`Billing has started at port ${PORT}`)
    connectDB()
})