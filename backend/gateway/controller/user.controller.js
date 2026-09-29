import axios from "axios"

export const getCurrentUser = async(req , res)=>{
    try{
           //plan/credits session me stale ho sakte hain (payment ya credit-deduction ke
           //baad), isliye auth service se live values le lo. Fail ho jaaye to bhi
           //session wali stale values dikha do — poora /api/me tootne se behtar hai
           let billing = {}
           try{
              const {data} = await axios.get(`${process.env.AUTH_SERVICE}/user/${req.user.userId}`)
              billing = data
           }catch(error){
              console.log("billing fetch failed, session data use kar rahe hain:", error.message)
           }

           return res.status(200).json({...req.user, ...billing})
    }catch(error){
          return res.status(400).json({
            message : `get current user error ${error}`
          })
    }
}