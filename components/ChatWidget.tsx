import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { useUser } from '../lib/hooks/useUser';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ChatWidget() {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Listen for custom event to open chat
    useEffect(() => {
        const handleOpenChat = (e: CustomEvent) => {
            setIsOpen(true);
            setIsMinimized(false);
            if (e.detail?.userId) {
                // Fetch user details if needed, or just set ID for now
                // For simplicity, we'll assume we need to fetch the conversation or start one
                setSelectedUser({ id: e.detail.userId, name: "Loading..." });
                // Ideally fetch user details here
                fetch(`/api/users/${e.detail.userId}`).then(res => res.json()).then(u => setSelectedUser(u));
            }
        };

        window.addEventListener('open-chat', handleOpenChat as EventListener);
        return () => window.removeEventListener('open-chat', handleOpenChat as EventListener);
    }, []);

    // Fetch conversations
    const { data: conversations } = useSWR(user && isOpen ? "/api/chat/conversations" : null, fetcher, { refreshInterval: 3000 });

    // Fetch messages for selected user
    const { data: messages, mutate: mutateMessages } = useSWR(
        user && selectedUser ? `/api/chat/messages?userId=${selectedUser.id}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedUser) return;

        try {
            await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: selectedUser.id, content: message }),
            });
            setMessage("");
            mutateMessages();
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (!user) return null;

    if (!isOpen) {
        return null; // Or return a trigger button if we want it always visible
    }

    return (
        <div className={`fixed bottom-4 right-4 z-[60] bg-white shadow-2xl rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px] flex flex-col'}`}>

            {/* Header */}
            <div className="bg-kh-purple text-white p-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-bold text-sm">
                        {selectedUser ? selectedUser.name || selectedUser.username : "Messages"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:bg-white/20 p-1 rounded">
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:bg-white/20 p-1 rounded">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {selectedUser ? (
                        // Chat View
                        <>
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                                <button onClick={() => setSelectedUser(null)} className="text-xs text-gray-500 hover:text-kh-purple mb-2 flex items-center gap-1">
                                    ← Back to all chats
                                </button>

                                {messages?.map((msg: any) => (
                                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.senderId === user.id ? 'bg-kh-purple text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-kh-purple"
                                />
                                <button type="submit" className="bg-kh-purple text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </>
                    ) : (
                        // Conversation List
                        <div className="flex-1 overflow-y-auto">
                            {conversations?.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No conversations yet.
                                </div>
                            ) : (
                                conversations?.map((conv: any) => {
                                    const otherUser = conv.senderId === user.id ? conv.receiver : conv.sender;
                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedUser(otherUser)}
                                            className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                                                {otherUser.avatar ? <img src={otherUser.avatar} className="w-full h-full rounded-full object-cover" /> : otherUser.name?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{otherUser.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{conv.content}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-400">{new Date(conv.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
