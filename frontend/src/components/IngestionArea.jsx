import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startExtraction, updateProgress, setExtractedData } from '../store/complaintSlice';
import { UploadCloud, FileText } from 'lucide-react';
import axios from 'axios';

const IngestionArea = ({ setRawContext }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('file');
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef(null);
  const { isExtracting, extractionProgress, progressMessage } = useSelector((state) => state.complaint);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert("File size exceeds 10MB limit.");

    dispatch(startExtraction());
    const formData = new FormData();
    formData.append('file', file);

    try {
      let progress = 10;
      const interval = setInterval(() => {
        progress += 15;
        if (progress <= 90) dispatch(updateProgress({ progress, message: 'Analyzing document content and extracting key details...' }));
      }, 500);
      const response = await axios.post('http://localhost:8000/api/extract', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      clearInterval(interval);
      setRawContext(response.data.raw_text);
      dispatch(setExtractedData(response.data));
    } catch (error) {
      dispatch(updateProgress({ progress: 0, message: 'Error during extraction.' }));
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    dispatch(startExtraction());
    const formData = new FormData();
    formData.append('text', textInput);
    try {
      const response = await axios.post('http://localhost:8000/api/extract', formData);
      setRawContext(response.data.raw_text);
      dispatch(setExtractedData(response.data));
      setActiveTab('file');
      setTextInput('');
    } catch (error) {
      dispatch(updateProgress({ progress: 0, message: 'Error during extraction.' }));
    }
  };

  return (
    <>
      {activeTab === 'file' && (
        <div className="upload-box" onClick={() => fileInputRef.current.click()}>
          <UploadCloud style={{ width: 24, height: 24, color: '#9ca3af', margin: '0 auto' }} />
          <p>Drag & drop complaint document here</p>
          <p><span>or click to browse</span></p>
          <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.txt,.eml" />
        </div>
      )}

      {activeTab === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <textarea className="form-textarea" placeholder="Paste complaint email or text here..." value={textInput} onChange={(e) => setTextInput(e.target.value)}></textarea>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-save" style={{ flex: 1, justifyContent: 'center' }} onClick={handleTextSubmit}>Process Text</button>
            <button className="btn-paste" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveTab('file')}>Cancel</button>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <>
          <div className="or-divider">OR</div>
          <button className="btn-paste" onClick={() => setActiveTab('text')}>
            <FileText style={{ width: 16, height: 16 }} /> Paste Complaint Text / Email
          </button>
        </>
      )}

      <div className="alert-info">
        <strong>
          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Supported formats: PDF, DOCX, TXT, EML
        </strong>
        <p>Max file size: 10MB</p>
      </div>

      {(isExtracting || extractionProgress === 100) && (
        <div className="progress-section">
          <div className="progress-header">
            <span>EXTRACTION PROGRESS</span>
            <span>{extractionProgress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${extractionProgress}%` }}></div>
          </div>
          <p className="progress-msg">{progressMessage || (extractionProgress === 100 ? 'Extraction completed successfully.' : 'Please wait, this may take a few moments.')}</p>
        </div>
      )}
    </>
  );
};

export default IngestionArea;
