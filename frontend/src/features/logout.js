import React from 'react'
import api from '../../utils/axios'

const logout = async () => {
  try {
    const {data} = await api.post("/api/auth/logout")
    console.log(data)
  } catch (error) {
    console.error("Error occurred while logging out:", error)
  }
}

export default logout;   