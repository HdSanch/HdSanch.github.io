import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InfoNegocios from "./components/infoNegocios/InfoNegocios";
import Comprobante from "./components/comprobante/comprobante";
import Home from "./Pages/home";
import Servicios from "./Pages/servicios";

function App() {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/negocio" element={<InfoNegocios />} />
          <Route path="/comprobante" element={<Comprobante />} />
          <Route path="*" element={<Navigate to="/negocio" />} /> {/* Redirige a /negocio por defecto */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
