// src/pages/home.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <img src="/logo-pichincha.png" alt="Banco Pichincha" className="logo" />
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/servicios">Servicios</Link></li>
            <li><a href="#">Productos</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </nav>
      </header>

      <main className="home-main">
        <h1>Bienvenido a De Una</h1>
        <p>Accede rápidamente a todas tus opciones bancarias</p>
        <div className="quick-access">
          <button>Consultar Saldo</button>
          <button>Transferencias</button>
          <button>Pagar Servicios</button>
          <Link to="/servicios">
            <button className="services-btn">Servicios</button>
          </Link>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2025 Banco Pichincha - Todos los derechos reservados</p>
      </footer>
    </div>
  );
};

export default Home;
