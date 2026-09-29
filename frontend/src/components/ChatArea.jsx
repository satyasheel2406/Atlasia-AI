import React from 'react'
import Nav from './Nav'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import getMessages from '../features/getMessages'
import { resetArtifacts, setMessages } from '../redux/messageSlice'

const ChatArea = ({ onMenuClick }) => {
     const {selectedConversation} = useSelector(state=>state.conversation)
     const dispatch=useDispatch()
    useEffect(() => {
    const getMsg = async () => {

        //naya chat khola hai to purani conversation ke messages/artifacts saaf karo
        if (!selectedConversation) {
            dispatch(setMessages([]));
            dispatch(resetArtifacts());
            return;
        }

        //artifacts abhi DB me save nahi hote (sirf is session ke liye hote hain),
        //isliye conversation badalte hi purane artifacts hata do
        dispatch(resetArtifacts());

        if(selectedConversation.title =="New Chat")return;
        const data = await getMessages(selectedConversation._id);
        dispatch(setMessages(data));
    };

    getMsg();
}, [selectedConversation?._id]);
  return (
    <div className='flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden'>
        <Nav onMenuClick={onMenuClick}/>
        <MessageList/>
        <ChatInput/>
    </div>
  )
}

export default ChatArea