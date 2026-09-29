import User from "../models/user.model.js"
import{getAuth} from "firebase-admin/auth"
import {app} from "../config/firebase.js"
import crypto from "crypto";
import redis from "../../../shared/redis/redis.js"
export const login = async (req , res) =>{
   try{
      const {token} = req.body
    const decoded = await getAuth(app).verifyIdToken(token);

    let user = await User.findOne({
    firebaseUid: decoded.uid
});
      if(!user)
      {
         user=await User.create({
     firebaseUid: decoded.uid,
            name : decoded.name,
            email:decoded.email,
            avatar:decoded.picture
         })
      }
       
      const sessionId=crypto.randomUUID()
      await redis.set(`session-${sessionId}`,JSON.stringify({
         userId:user._id,
         name:user.name,
         email:user.email,
         avatar:decoded.picture,
         plan:user.plan,
         credits:user.credits,
         totalCredits:user.totalCredits,
         planExpiresAt:user.planExpiresAt
      }),"EX",7*24*60*60)

      res.cookie("session",sessionId,{
         httpOnly:true,
         secure:false,
         sameSite:"strict",
         maxAge:7*24*60*60*1000
      })

      return res.status(200).json(user);
   }
   catch(error)
   {
      return res.status(500).json({
         message: `login error ${error}`
      });
   }
}

export const logout = async(req,res)=>{
   try{
         const sessionId = req.cookies?.session
         await redis.del(`session-${sessionId}`)

         res.clearCookie("session")
         return res.status(200).json({
            message : "User Logged Out Successfully"
         })
   }
   catch(error)
   {
      return res.status(500).json({
      message: error.message,
    });
   }
}

export const updateUserPayment = async (req,res)=>{
   try{

      const{plan,credits,userId}=req.body
      const user = await User.findById(userId)
      if(!user)
         return res.status(404).json({
      message:"User not found"})

      //plan badalne (ya renew karne) par credits fresh allotment se reset hote hain,
      //purane plan ke bache hue credits ke saath add nahi hote
      user.plan=plan
      user.credits=credits
      user.totalCredits=credits
      user.planExpiresAt=new Date(Date.now()+30*24*60*60*1000)
      await user.save()

      return res.status(200).json({success:true})

   }catch(error){
         return res.status(500).json({
            message:`update user payment error ${error}`
         })
   }
}

//gateway /api/me pe hit karte waqt live credits/plan chahiye hote hain — session me
//cache hui values stale ho sakti hain (payment ya credit-deduction ke baad)
export const getUserBilling = async(req,res)=>{
   try{
      const user = await User.findById(req.params.id).select("plan credits totalCredits planExpiresAt")
      if(!user)
         return res.status(404).json({message:"User not found"})

      return res.status(200).json(user)
   }catch(error){
      return res.status(500).json({message:`get user billing error ${error}`})
   }
}

//agent service har request se pehle isko hit karta hai. Atomic $gte check + $inc ek
//hi operation me — isse do concurrent requests dono ek hi aakhri credit par pass nahi ho paatin
export const deductCredit = async(req,res)=>{
   try{
      const { userId, agent} = req.body

      const COST={
         chat : 1,
         search : 5,
         coding : 10,
         pdf : 10,
         ppt : 10,
         vision : 10
      }

      if(!userId)
         return res.status(400).json({message:"userId required"})

      const user = await User.findOneAndUpdate(
         { _id:userId, credits:{ $gte:COST[agent] } },
         { $inc:{ credits:-COST[agent]} },
         { new:true }
      )

      if(!user)
         return res.status(402).json({message:"Insufficient credits"})

      return res.status(200).json({credits:user.credits})
   }catch(error){
      return res.status(500).json({message:`deduct credit error ${error}`})
   }
}