import "dotenv/config";
import express, { response } from "express"
import proxy from "express-http-proxy"
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
import { getCurrentUser } from "./controller/user.controller.js";
import protect from "./middleware/auth.middleware.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
import morgan from "morgan";


app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
app.use(cookieParser())
app.use(morgan("dev"))

app.use("/api/auth" ,proxy(process.env.AUTH_SERVICE))
app.use("/api/chat" ,protect, proxyWithHeader(process.env.CHAT_SERVICE))
app.use("/api/agent" ,protect, proxyWithHeader(process.env.AGENT_SERVICE))
app.use("/api/billing" ,protect, proxyWithHeader(process.env.BILLING_SERVICE))
app.get('/api/me',protect, getCurrentUser)
app.get("/", (req,res)=>{
    return res.status(200).json({
        message : "Hello form Gateway"
    })
})

const PORT = process.env.PORT



app.listen(PORT , ()=>{
    console.log(`Gateway has started at port ${PORT}`)
})