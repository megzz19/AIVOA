import React, { useState } from 'react';
import ExtractionForm from './components/ExtractionForm';
import UnifiedCopilot from './components/UnifiedCopilot';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  const [rawContext, setRawContext] = useState('');

  return (
    <Provider store={store}>
      <div className="app-container">
        <div className="main-layout">
          
          <div className="left-col">
            <ExtractionForm />
          </div>

          <div className="right-col">
            <div className="copilot-card">
              
              <div className="copilot-header">
                <div className="copilot-title">
                  <span style={{ color: '#3b82f6' }}>✨</span>
                  AI Complaint Intake Assistant
                </div>
                <span className="beta-badge">BETA</span>
              </div>

              {/* Render the UnifiedCopilot component taking up the rest of the height */}
              <UnifiedCopilot rawContext={rawContext} setRawContext={setRawContext} />

            </div>
          </div>

        </div>
      </div>
    </Provider>
  );
}

export default App;
