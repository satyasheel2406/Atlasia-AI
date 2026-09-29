import React from 'react'
import api from '../../utils/axios'

async function sendMessage(payload) {
try{
 const{data}= await api.post("/api/agent/chat" , payload)
 return data
}catch(error){
  console.log(error)
  //error.response.data me backend ka asli message hota hai (jaise "out of credits"),
  //null return karne se caller ye khaas jaankari kho deta
  return error.response?.data || null;
}
}

export default sendMessage