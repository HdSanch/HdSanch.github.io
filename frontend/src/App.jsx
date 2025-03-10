import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InfoNegocios from "./components/infoNegocios/infoNegocios.jsx";
import ChatPage from "./components/chats/ChatP2P.jsx"; // Importamos la nueva página del chat
import Comprobante from "./components/comprobante/comprobante.jsx";
import Home from "./Pages/home.jsx";
import Servicios from "./Pages/Servicios.jsx";

function App() {
  return (
    <Router>
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/negocio" element={<InfoNegocios />} />
          <Route path="/chat" element={<ChatPage />} /> {/* Chat */}
          <Route path="/comprobante" element={<Comprobante />} />
          <Route path="*" element={<Navigate to="/negocio" />} /> {/* Redirige a /negocio por defecto */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
