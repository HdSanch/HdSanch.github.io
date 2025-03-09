import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InfoNegocios from "./components/infoNegocios/InfoNegocios";

function App() {
  return (
    <Router>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Información del Negocio</h1>
        <Routes>
          <Route path="/negocio" element={<InfoNegocios />} />
          <Route path="*" element={<Navigate to="/negocio" />} /> {/* Redirige a /negocio */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
