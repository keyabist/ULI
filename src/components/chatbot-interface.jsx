import React, { useState, useEffect, useRef } from 'react';

// Mock data (in a real app, this would come from your Django backend)
const MOCK_CHATS = [
  {
    id: 'openai',
    name: 'ChatGPT',
    type: 'ai',
    lastMessage: 'How can I help you today?',
    lastMessageTime: '2024-03-27T10:30:00Z'
  },
  {
    id: 'user1',
    name: 'Alice Johnson',
    type: 'user',
    lastMessage: 'See you later!',
    lastMessageTime: '2024-03-27T09:15:00Z'
  },
  {
    id: 'user2',
    name: 'Bob Smith',
    type: 'user',
    lastMessage: 'Thanks for the update.',
    lastMessageTime: '2024-03-27T08:45:00Z'
  }
];

// Chat List Component
const ChatList = ({ 
  chats, 
  selectedChat, 
  onSelectChat 
}) => {
  return (
    <div className="w-1/4 bg-gray-100 border-r border-gray-200 overflow-y-auto">
      {chats.map(chat => (
        <div 
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className={`
            p-4 hover:bg-gray-200 cursor-pointer 
            flex items-center 
            ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''}
          `}
        >
          <div className="mr-4">
            {chat.type === 'ai' ? (
              <span className="text-blue-500 font-bold">AI</span>
            ) : (
              <span className="text-green-500 font-bold">👤</span>
            )}
          </div>
          <div className="flex-grow">
            <div className="font-semibold">{chat.name}</div>
            <div className="text-sm text-gray-600 truncate">
              {chat.lastMessage}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(chat.lastMessageTime).toLocaleTimeString([], {
              hour: '2-digit', 
              minute:'2-digit'
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// Message Component
const Message = ({ message, isCurrentUser }) => {
  return (
    <div className={`
      flex mb-4 
      ${isCurrentUser ? 'justify-end' : 'justify-start'}
    `}>
      <div className={`
        p-3 rounded-lg max-w-[70%]
        ${isCurrentUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-black'}
      `}>
        {message.text}
        <div className="text-xs mt-1 opacity-70 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', 
            minute:'2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

// Message Input Component
const MessageInput = ({ 
  onSendMessage, 
  placeholderText = "Type a message..." 
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({
        text: message,
        timestamp: new Date().toISOString()
      });
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex p-4 bg-white border-t">
      <input 
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholderText}
        className="flex-grow p-2 border rounded-l-lg"
      />
      <button 
        onClick={handleSend}
        disabled={!message.trim()}
        className="
          bg-blue-500 text-white p-2 rounded-r-lg 
          hover:bg-blue-600 disabled:opacity-50
        "
      >
        ➤
      </button>
    </div>
  );
};

// Main Chat Interface Component
const ChatInterface = () => {
  const [chats, setChats] = useState(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Simulated message fetching (replace with actual API call)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      setIsLoading(true);
      try {
        // Simulate API call
        const mockMessages = [
          {
            id: '1',
            text: 'Hello there!',
            timestamp: '2024-03-27T10:00:00Z',
            sender: selectedChat.id === 'openai' ? 'ai' : 'user2'
          },
          {
            id: '2',
            text: 'Hi, how are you?',
            timestamp: '2024-03-27T10:05:00Z',
            sender: 'current_user'
          }
        ];
        setMessages(mockMessages);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (newMessage) => {
    // Optimistically add message to UI
    const messageWithSender = {
      ...newMessage,
      id: Date.now().toString(),
      sender: 'current_user'
    };
    setMessages(prev => [...prev, messageWithSender]);

    // Special handling for OpenAI chat
    if (selectedChat.id === 'openai') {
      // TODO: Implement OpenAI API integration
      // Example pseudocode:
      // const aiResponse = await openaiService.getChatCompletion(messages);
      // setMessages(prev => [...prev, aiResponse]);
    } else {
      // TODO: Implement regular user chat message sending via Django backend
      // await apiService.sendMessage(selectedChat.id, newMessage);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Chat List Panel */}
      <ChatList 
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
      />

      {/* Chat Window */}
      <div className="flex-grow flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-gray-100 flex items-center">
              {selectedChat.type === 'ai' ? (
                <span className="mr-3 text-blue-500 font-bold">🤖</span>
              ) : (
                <span className="mr-3 text-green-500 font-bold">👤</span>
              )}
              <h2 className="text-xl font-semibold">
                {selectedChat.name}
              </h2>
            </div>

            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto p-4">
              {isLoading ? (
                <div className="text-center text-gray-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">
                  No messages yet
                </div>
              ) : (
                messages.map(msg => (
                  <Message 
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.sender === 'current_user'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput 
              onSendMessage={handleSendMessage}
              placeholderText={
                selectedChat.id === 'openai' 
                  ? "Ask ChatGPT a question..." 
                  : `Message ${selectedChat.name}...`
              }
            />
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            💬
            <span className="ml-4">Select a chat to start messaging</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;