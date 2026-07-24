import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isExtracting: false,
  extractionProgress: 0,
  progressMessage: '',
  extractedData: {
    complaint_source: '',
    customer_name: '',
    product_name: '',
    product_strength_grade: '',
    batch_lot_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity_affected: '',
    complaint_type: '',
    complaint_date: '',
    detailed_description: '',
    initial_severity: '',
    priority: '',
  },
  aiInsights: {
    is_complete: false,
    missing_fields: [],
    risk_assessment: {},
    capa_recommendations: {},
    executive_summary: ''
  }
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    startExtraction: (state) => {
      state.isExtracting = true;
      state.extractionProgress = 10;
      state.progressMessage = 'Analyzing document content...';
    },
    updateProgress: (state, action) => {
      state.extractionProgress = action.payload.progress;
      state.progressMessage = action.payload.message;
    },
    setExtractedData: (state, action) => {
      state.isExtracting = false;
      state.extractionProgress = 100;
      state.progressMessage = 'Extraction complete.';
      
      const payload = action.payload;
      if (payload.extracted_data) {
        state.extractedData = { ...state.extractedData, ...payload.extracted_data };
      }
      
      state.aiInsights = {
        is_complete: payload.is_complete,
        missing_fields: payload.missing_fields || [],
        risk_assessment: payload.risk_assessment || {},
        capa_recommendations: payload.capa_recommendations || {},
        executive_summary: payload.executive_summary || ''
      };
    },
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.extractedData[field] = value;
    },
    resetForm: () => initialState,
  },
});

export const { startExtraction, updateProgress, setExtractedData, updateField, resetForm } = complaintSlice.actions;

export default complaintSlice.reducer;
