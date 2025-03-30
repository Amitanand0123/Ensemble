import {useState} from 'react'
import { useSelector } from 'react-redux'
import { Button } from '../ui/button'
import { MessageSquare, X } from 'lucide-react'
import { Card } from '../ui/card'
import ChatWindow from './ChatWindow'

const ChatSidebar = ({type,targetId}) => {
    const [isOpen,setIsOpen] = useState(false)
    const unreadCount=useSelector(state=>state.chat.unreadCount)

    return (
        <>
            <Button
                onClick={()=>setIsOpen(!isOpen)}
                variant="ghost"
                className='fixed bottom-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-full shadow-lg'
            >
                <MessageSquare className='h-6 w-6' />
                {unreadCount>0 && (
                    <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                        {unreadCount}
                    </span>
                )}
            </Button>
            <div className={`fixed right-0 top-0 h-full w-96 bg-gray-900 shadow-xl transform transition-transform-300 ease-in-out ${isOpen?'translate-x-0':'translate-x-full'}`}>
                <Card className='h-full border-l border-gray-700'>
                    <div className='flex items-center justify-between p-4 border-b border-gray-700'>
                        <h2 className='text-lg font-semibold'>
                            {type==='workspace'?'Workspace Chat':'Project Chat'}
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={()=>setIsOpen(false)}
                        >
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                    <div>
                        <ChatWindow
                            chatType={type==='workspace' ? 'workspace':'project'}
                            targetId={targetId}
                        />
                    </div>
                </Card>
            </div>
        </>
    )
}

export default ChatSidebar;