import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setLoading } from '../store/chatSlice';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';

const ChatSidebar = ({ rawContext }) => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || !rawContext) return;
    const userMessage = input;
    dispatch(addMessage({ role: 'user', content: userMessage }));
    setInput('');
    dispatch(setLoading(true));

    const formData = new FormData();
    formData.append('context', rawContext);
    formData.append('question', userMessage);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', formData);
      dispatch(addMessage({ role: 'ai', content: response.data.answer }));
    } catch (error) {
      dispatch(addMessage({ role: 'ai', content: 'Sorry, I encountered an error answering your question.' }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg ${msg.role === 'user' ? 'user' : ''}`}>
            {msg.role === 'ai' ? <Bot style={{ width: 16, height: 16, marginTop: 2 }} /> : null}
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="chat-msg" style={{ color: '#6b7280' }}>
            <Bot style={{ width: 16, height: 16, marginTop: 2 }} />
            <div>Thinking...</div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input 
          type="text" 
          className="chat-input"
          placeholder={rawContext ? "Ask me anything about this complaint..." : "Upload a document first..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={!rawContext || isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={!rawContext || isLoading || !input.trim()}
          className="chat-submit"
        >
          <Send style={{ width: 14, height: 14 }} />
        </button>
        <div className="chat-disclaimer">
          AI responses may contain errors. Please verify information.
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
