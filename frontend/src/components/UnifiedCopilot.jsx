import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startExtraction, updateProgress, setExtractedData, updateField } from '../store/complaintSlice';
import { addMessage, setLoading } from '../store/chatSlice';
import axios from 'axios';
import { Send, Bot, User, Paperclip } from 'lucide-react';

const UnifiedCopilot = ({ rawContext, setRawContext }) => {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const { isExtracting, extractionProgress, progressMessage, extractedData } = useSelector((state) => state.complaint);
  const [input, setInput] = useState('');
  const fileInputRef = useRef(null);

  const processExtraction = async (formData, isFile) => {
    dispatch(startExtraction());
    dispatch(addMessage({ 
      role: 'user', 
      content: isFile ? `📎 Uploaded document: ${formData.get('file').name}` : formData.get('text')
    }));
    dispatch(setLoading(true));

    try {
      let progress = 10;
      const interval = setInterval(() => {
        progress += 15;
        if (progress <= 90) dispatch(updateProgress({ progress, message: 'Analyzing and extracting details...' }));
      }, 500);

      const response = await axios.post('http://localhost:8000/api/extract', formData, {
        headers: isFile ? { 'Content-Type': 'multipart/form-data' } : {}
      });

      clearInterval(interval);
      setRawContext(response.data.raw_text);
      dispatch(setExtractedData(response.data));
      dispatch(addMessage({ role: 'ai', content: '✅ I have extracted the details and populated the form on the left.\n\nYou can now:\n• Ask me questions about the complaint\n• Tell me to edit any field (e.g. "change severity to Critical" or "update customer name to MedPlus")' }));
    } catch (error) {
      dispatch(updateProgress({ progress: 0, message: 'Error during extraction.' }));
      dispatch(addMessage({ role: 'ai', content: 'Sorry, there was an error processing your complaint.' }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert("File size exceeds 10MB limit.");

    const formData = new FormData();
    formData.append('file', file);
    processExtraction(formData, true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput('');

    // If we don't have a rawContext yet, treat this as the initial complaint text
    if (!rawContext) {
      const formData = new FormData();
      formData.append('text', userMessage);
      processExtraction(formData, false);
      return;
    }

    // We have context — send to the /api/edit endpoint which handles both edits and questions
    dispatch(addMessage({ role: 'user', content: userMessage }));
    dispatch(setLoading(true));

    try {
      // Send to the edit endpoint with the current form data
      const response = await axios.post('http://localhost:8000/api/edit', {
        current_data: extractedData,
        instruction: userMessage
      });

      const { updated_fields, message } = response.data;

      // If the AI returned field updates, apply them to the Redux store
      if (updated_fields && Object.keys(updated_fields).length > 0) {
        for (const [field, value] of Object.entries(updated_fields)) {
          dispatch(updateField({ field, value }));
        }
      }

      dispatch(addMessage({ role: 'ai', content: message }));

    } catch (error) {
      // Fallback to regular chat if edit fails
      try {
        const formData = new FormData();
        formData.append('context', rawContext);
        formData.append('question', userMessage);
        const chatResponse = await axios.post('http://localhost:8000/api/chat', formData);
        dispatch(addMessage({ role: 'ai', content: chatResponse.data.answer }));
      } catch (chatError) {
        dispatch(addMessage({ role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="copilot-body" style={{ position: 'relative' }}>
      
      {/* Progress Bar */}
      {(isExtracting || extractionProgress === 100) && (
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
          <div className="progress-header">
            <span>EXTRACTION PROGRESS</span>
            <span>{extractionProgress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${extractionProgress}%` }}></div>
          </div>
          <p className="progress-msg">{progressMessage || (extractionProgress === 100 ? 'Extraction completed.' : 'Please wait...')}</p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
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

      {/* Unified Input Area */}
      <div className="chat-input-area" style={{ backgroundColor: 'white' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          
          <button 
            onClick={() => fileInputRef.current.click()}
            title="Upload Document"
            style={{
              position: 'absolute', left: '0.75rem', background: 'none', border: 'none',
              cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Paperclip style={{ width: 18, height: 18 }} />
          </button>
          <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt,.eml" />

          <input 
            type="text" 
            className="chat-input"
            style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
            placeholder={rawContext ? "Ask a question or edit fields (e.g. 'change severity to Critical')..." : "Paste complaint text or upload a file..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading || isExtracting}
          />
          
          <button 
            onClick={handleSend}
            disabled={isLoading || isExtracting || !input.trim()}
            className="chat-submit"
            style={{ top: '50%', transform: 'translateY(-50%)', right: '0.5rem' }}
          >
            <Send style={{ width: 14, height: 14 }} />
          </button>
        </div>
        <div className="chat-disclaimer">
          AI responses may contain errors. Please verify information.
        </div>
      </div>
    </div>
  );
};

export default UnifiedCopilot;
