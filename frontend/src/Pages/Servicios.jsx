// src/pages/Servicios.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./servicios.css";

const categorias = ["Todos", "Tecnología", "Salud", "Educación", "Alimentos"];

const empresas = [
  { id: 1, nombre: "Tech Solutions", estrellas: 4.5, categoria: "Tecnología", descripcion: "Soluciones de software y hardware." },
  { id: 2, nombre: "Clínica Vida", estrellas: 4.2, categoria: "Salud", descripcion: "Atención médica especializada." },
  { id: 3, nombre: "Escuela Futuro", estrellas: 4.8, categoria: "Educación", descripcion: "Cursos y capacitaciones online." },
  { id: 4, nombre: "Delicias Express", estrellas: 4.0, categoria: "Alimentos", descripcion: "Entrega rápida de comida." },
];

const Servicios = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");

  const empresasFiltradas = categoriaSeleccionada === "Todos"
    ? empresas
    : empresas.filter(emp => emp.categoria === categoriaSeleccionada);

  return (
    <div className="servicios-container">
      <h1>Servicios</h1>
      
      <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
        {categorias.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <div className="empresas-lista">
        {empresasFiltradas.map(empresa => (
          <Link key={empresa.id} to={`/negocio/${empresa.id}`} className="empresa-link">
            <div className="empresa-card">
              <div className="empresa-info">
                <h3>{empresa.nombre}</h3>
                <div className="estrellas">⭐ {empresa.estrellas}</div>
              </div>
              <p>{empresa.descripcion}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Servicios;
