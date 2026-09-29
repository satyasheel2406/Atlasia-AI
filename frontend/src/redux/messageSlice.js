import {createSlice} from"@reduxjs/toolkit"

const messageSlice=createSlice({
    name:"messages",

    initialState:{
        messages:[],
        artifacts:[],
        isLoading:false
    },
    reducers:{
        setMessages:(state , action)=>{
           state.messages=action.payload
        },
        addMessage:(state , action)=>{
           state.messages.push(action.payload)
        },
          setArtifacts:(state , action)=>{
           state.artifacts.push(action.payload)
        },
          resetArtifacts:(state)=>{
           state.artifacts=[]
        },
        setLoading:(state , action)=>{
           state.isLoading=action.payload
        }
    }

})

export const {setMessages , addMessage , setArtifacts , resetArtifacts , setLoading}=messageSlice.actions
export default messageSlice.reducer