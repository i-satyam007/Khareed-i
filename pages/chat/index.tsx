import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useUser } from '@/lib/hooks/useUser';
import { Send, User, MoreVertical, MessageCircle } from 'lucide-react';

export default function ChatPage() {
    const { user } = useUser();
    const router = useRouter();
    const { userId } = router.query;
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetcher = (url: string) => fetch(url).then((res) => res.json());

    // Fetch Conversations
    const { data: conversations, mutate: mutateConversations } = useSWR(user ? '/api/chat' : null, fetcher);

    // Fetch Messages for selected user
    const { data: messages, mutate: mutateMessages } = useSWR(selectedUser ? `/api/chat/${selectedUser.id}` : null, fetcher, { refreshInterval: 3000 });

    useEffect(() => {
        if (userId && !selectedUser) {
            // Fetch user details if userId is in query
            fetch(`/api/users/${userId}`)
                .then(res => res.json())
                .then(data => setSelectedUser(data))
                .catch(err => console.error(err));
        }
    }, [userId, selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedUser) return;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: selectedUser.id, content: message }),
            });

            if (res.ok) {
                setMessage("");
                mutateMessages();
                mutateConversations();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <Head>
                <title>Messages | Khareed-i</title>
            </Head>

            <div className="flex-1 container mx-auto px-4 py-6 flex gap-6 h-[calc(100vh-100px)]">

                {/* Sidebar: Conversations */}
                <div className={`w-full md:w-80 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations?.map((conv: any) => (
                            <div
                                key={conv.otherUser.id}
                                onClick={() => setSelectedUser(conv.otherUser)}
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?.id === conv.otherUser.id ? 'bg-purple-50' : ''}`}
                            >
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                    {conv.otherUser.avatar ? <img src={conv.otherUser.avatar} className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-gray-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-sm truncate">{conv.otherUser.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        {(!conversations || conversations.length === 0) && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No conversations yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedUser(null)} className="md:hidden text-gray-500">
                                        ←
                                    </button>
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                        {selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full object-cover" /> : <User className="h-5 w-5 text-gray-500" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                                        <p className="text-xs text-green-600 font-medium">Online</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {messages?.map((msg: any) => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-kh-purple text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-kh-purple/20 focus:border-kh-purple transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="p-2 bg-kh-purple text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
