// src/pages/Servicios.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./servicios.css";

// Importar imagen de empresa con la extensión correcta
import empresaImage from "../assets/empresa.jpg";
import empresaImage2 from "../assets/empresa2.jpeg";
import empresaImage3 from "../assets/empresa3.jpeg";
import empresaImage4 from "../assets/empresa4.jpeg";
import empresaImage5 from "../assets/empresa5.jpeg";
import empresaImage6 from "../assets/empresa6.jpeg";
const Servicios = () => {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  // Definir las categorías
  const categorias = ["Todos", "Profesionales", "Pequeños negocios"];

  // Datos de los profesionales/negocios
  const profesionales = [
    { 
      id: 1, 
      nombre: "Jimmy Design Co", 
      puntuacion: 8.4, 
      etiquetas: ["Diseño gráfico", "Diseño", "Logo"],
      imagen: empresaImage
    },
    { 
      id: 2, 
      nombre: "Jannet Gonzalez", 
      puntuacion: 7.9, 
      etiquetas: ["Diseño gráfico", "Diseño", "Logo"],
      imagen: empresaImage2
    },
    { 
      id: 3, 
      nombre: "Limbo Studio", 
      puntuacion: 7.4, 
      etiquetas: ["Diseño gráfico", "Diseño", "Logo"],
      imagen: empresaImage3
    },
    { 
      id: 4, 
      nombre: "Daphné Repain", 
      puntuacion: 7.2, 
      etiquetas: ["Diseño gráfico", "Logo", "Diseño"],
      imagen: empresaImage4
    },
    { 
      id: 5, 
      nombre: "Jose Luis Star", 
      puntuacion: 5.4, 
      etiquetas: ["Diseño", "Product designer", "Logo"],
      imagen: empresaImage5
    },
    { 
      id: 6, 
      nombre: "Lina Lina Studio", 
      puntuacion: 5.4, 
      etiquetas: ["Branding", "Diseño", "Logo"],
      imagen: empresaImage6
    }
  ];

  // Filtrar los profesionales según la búsqueda
  const profesionalesFiltrados = profesionales.filter(prof => 
    prof.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    prof.etiquetas.some(etiqueta => etiqueta.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleLimpiarBusqueda = () => {
    setBusqueda("");
  };

  return (
    <div className="deuna-emprende-container">
      {/* Botón de regreso y título */}
      <div className="header">
        <Link to="/" className="back-button">
          <span>&#8592;</span>
        </Link>
        <div className="header-content">
          <h1>Deuna Emprende</h1>
          <p>Encuentra profesionales y pequeños negocios para cualquier necesidad y paga de forma fácil</p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <div className="search-icon">🔍</div>
        <input 
          type="text" 
          placeholder="diseño logo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className="clear-button" onClick={handleLimpiarBusqueda}>
            ✕
          </button>
        )}
        <button className="filter-button">☰</button>
      </div>

      {/* Categorías / Tabs */}
      <div className="categorias-tabs">
        {categorias.map(categoria => (
          <button
            key={categoria}
            className={`categoria-tab ${categoriaActiva === categoria ? 'activo' : ''}`}
            onClick={() => setCategoriaActiva(categoria)}
          >
            {categoria}
          </button>
        ))}
      </div>

      {/* Lista de profesionales */}
      <div className="profesionales-lista">
        {profesionalesFiltrados.map(profesional => (
          <div key={profesional.id} className="profesional-card">
            <div className="profesional-info">
              <img src={profesional.imagen} alt={profesional.nombre} className="profesional-imagen" />
              <div className="profesional-detalles">
                <h3>{profesional.nombre}</h3>
                <div className="etiquetas">
                  {profesional.etiquetas.map((etiqueta, index) => (
                    <span key={index} className="etiqueta">{etiqueta}</span>
                  ))}
                </div>
                <div className="puntuacion">
                  <span className="estrella">★</span>
                  <span>{profesional.puntuacion} /10</span>
                </div>
              </div>
            </div>
            <Link to={`/infonegocio/${profesional.id}`} className="ver-perfil-btn">
              Ver perfil
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Servicios;