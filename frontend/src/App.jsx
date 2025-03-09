import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InfoNegocios from "./components/infoNegocios/InfoNegocios";

function App() {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/negocio" element={<InfoNegocios />} />
          <Route path="*" element={<Navigate to="/negocio" />} /> {/* Redirige a /negocio */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
