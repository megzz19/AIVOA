import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateField, resetForm } from '../store/complaintSlice';
import axios from 'axios';

const ExtractionForm = () => {
  const dispatch = useDispatch();
  const { extractedData, aiInsights } = useSelector((state) => state.complaint);

  const handleChange = (e) => dispatch(updateField({ field: e.target.name, value: e.target.value }));
  const handleReset = () => dispatch(resetForm());
  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/complaints', extractedData);
      alert('Complaint saved successfully! ID: ' + response.data.id);
      dispatch(resetForm());
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert(error.response.data.detail);
      } else {
        alert('Error saving complaint');
      }
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div>
          <h1 className="form-title">Log Customer Complaint</h1>
          <p className="form-subtitle">API & FDF Quality Assurance Module</p>
        </div>
        <div className="status-badge">Pending Triage</div>
      </div>

      <div className="form-section">
        <h3 className="section-title">1. Origin & Customer Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Complaint Source</label>
            <input type="text" name="complaint_source" value={extractedData.complaint_source} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input type="text" name="customer_name" value={extractedData.customer_name} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">2. Product & Batch Identification</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" name="product_name" value={extractedData.product_name} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
          <div className="form-group">
            <label className="form-label">Product Strength/Grade</label>
            <input type="text" name="product_strength_grade" value={extractedData.product_strength_grade} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
          <div className="form-group">
            <label className="form-label">Batch/Lot Number</label>
            <input type="text" name="batch_lot_number" value={extractedData.batch_lot_number} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
          <div className="form-group">
            <label className="form-label">Manufacturing Date</label>
            <input type="text" name="manufacturing_date" value={extractedData.manufacturing_date} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input type="text" name="expiry_date" value={extractedData.expiry_date} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
          <div className="form-group input-with-suffix">
            <label className="form-label">Quantity Affected</label>
            <input type="text" name="quantity_affected" value={extractedData.quantity_affected} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
            <span className="input-suffix">kg</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">3. Complaint Details</h3>
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Complaint Type</label>
            <input type="text" name="complaint_type" value={extractedData.complaint_type} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
          <div className="form-group">
            <label className="form-label">Complaint Date</label>
            <input type="text" name="complaint_date" value={extractedData.complaint_date} onChange={handleChange} className="form-input" placeholder="Awaiting AI extraction..." />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Detailed Complaint Description</label>
          <textarea name="detailed_description" value={extractedData.detailed_description} onChange={handleChange} className="form-textarea" placeholder="Awaiting AI extraction..."></textarea>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">4. Initial Assessment & Priority</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Initial Severity</label>
            <select name="initial_severity" value={extractedData.initial_severity} onChange={handleChange} className="form-input" style={{ color: extractedData.initial_severity ? '#1f2937' : '#9ca3af' }}>
              <option value="" disabled hidden>Awaiting AI extraction...</option>
              <option value="Low" style={{ color: '#1f2937' }}>Low</option>
              <option value="Medium" style={{ color: '#1f2937' }}>Medium</option>
              <option value="High" style={{ color: '#1f2937' }}>High</option>
              <option value="Critical" style={{ color: '#1f2937' }}>Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select name="priority" value={extractedData.priority} onChange={handleChange} className="form-input" style={{ color: extractedData.priority ? '#1f2937' : '#9ca3af' }}>
              <option value="" disabled hidden>Awaiting AI extraction...</option>
              <option value="Low" style={{ color: '#1f2937' }}>Low</option>
              <option value="Medium" style={{ color: '#1f2937' }}>Medium</option>
              <option value="High" style={{ color: '#1f2937' }}>High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ai-risk-section">
        <h3 className="ai-risk-title">
          <span style={{ fontSize: '1.25rem' }}>🤖</span> AI Copilot Risk Assessment
        </h3>
        <div className="form-grid" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Severity of Risk</label>
            <input type="text" readOnly value={aiInsights.risk_assessment?.justification || ''} className="form-input ai-risk-input" placeholder="Generated automatically..." />
          </div>
          <div className="form-group">
            <label className="form-label">Preventive Action (CAPA)</label>
            <input type="text" readOnly value={aiInsights.capa_recommendations?.details || ''} className="form-input ai-risk-input" placeholder="Generated automatically..." />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Risk Summary</label>
          <textarea readOnly value={aiInsights.executive_summary || ''} className="form-textarea ai-risk-input" style={{ height: '5rem' }} placeholder="Generated automatically..."></textarea>
        </div>
      </div>

      <div className="form-footer">
        <button onClick={handleReset} className="btn-reset">
          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Reset Form
        </button>
        <button onClick={handleSave} className="btn-save">
          <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          Save Complaint
        </button>
      </div>
    </div>
  );
};

export default ExtractionForm;
