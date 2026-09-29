import { signInWithPopup } from 'firebase/auth'
import React, { useState } from 'react'
import { googleProvider } from '../../utils/firebase'
import { auth } from '../../utils/firebase'
import api from "../../utils/axios"
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from 'react-redux'
import { setUserdata } from '../redux/userSlice.js'
import SideBar from '../components/SideBar.jsx'
import ChatArea from '../components/ChatArea.jsx'
import Artifact from '../components/Artifact.jsx'

const Home = () => {
    const {userData} = useSelector(state=>state.user)
    const dispatch = useDispatch()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const handleLogin=async(token)=>{
    try{
      const {data}=await api.post("/api/auth/login",{token})
      dispatch(setUserdata(data))
    }
    catch(error)
    {
        console.log(error)
    }
  }

    const googleLogin = async ()=>{
  const data = await signInWithPopup(auth , googleProvider)
  const token = await data.user.getIdToken()
  await handleLogin(token)
}

  return (
    <div className="h-screen w-full flex bg-[#0d0f14] text-white overflow-hidden max-w-full">

   <SideBar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} />
   <ChatArea onMenuClick={()=>setSidebarOpen(true)} />
   <Artifact />

  {!userData && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur p-4">
    <div className="w-full max-w-[340px] bg-[#13151c] border border-white/10 rounded-2xl p-7 flex flex-col gap-5">

      <div className="flex flex-col gap-1">
        <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
          Welcome to AtlasiaAI
        </h2>

        <p className="text-[13px] text-slate-500">
          Please login to continue using the app.
        </p>
      </div>

      <button className="
    w-full flex items-center justify-center gap-3
    py-[11px] rounded-xl
    bg-white text-black/90
    text-sm font-medium
    shadow-sm
    transition-all duration-150 ease-out
    hover:bg-gray-500
    hover:shadow-md
    active:scale-[0.97]
    active:bg-gray-500
    active:shadow-inner
    cursor-pointer
    select-none
  "
        onClick={googleLogin}
        className="w-full flex items-center justify-center gap-3 py-[11px] rounded-xl bg-white text-black/90 text-sm font-medium hover:bg-gray-100 transition-all duration-200"
      >
        <FcGoogle size={18} />
        Continue with Google
      </button>

    </div>
  </div>}

</div>
  )
}

export default Home