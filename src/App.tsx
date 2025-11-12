import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InhouseOfferManager } from './components/manager/InhouseOfferManager';
import { OfferRenderer } from './components/renderer/OfferRenderer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Interface - Offer Management */}
        <Route path="/" element={<InhouseOfferManager />} />
        <Route path="/admin" element={<InhouseOfferManager />} />
        <Route path="/admin/offers" element={<InhouseOfferManager />} />
        
        {/* Public Interface - Offer Renderer */}
        <Route path="/offer/:slug" element={<OfferRenderer />} />
        <Route path="/o/:slug" element={<OfferRenderer />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
