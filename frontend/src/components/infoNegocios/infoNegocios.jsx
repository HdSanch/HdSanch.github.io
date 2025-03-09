import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Star, Mail, Phone, ShoppingCart, ChevronDown, ChevronUp, Check } from "lucide-react";
import tiendaIcon from "../../assets/icons8-tienda-96.png";
import "./infoNegocios.css"; 

const InfoNegocios = () => {
  const [productos, setProductos] = useState([]);
  const [expandirProductos, setExpandirProductos] = useState(true);
  const [expandirReseñas, setExpandirReseñas] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => {
        setProductos(data.slice(0, 5)); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const negocio = {
    nombre: "Tienda Ejemplo",
    contacto: "contacto@tienda.com",
    telefono: "+123 456 7890",
    logo: tiendaIcon,
    reseña: 4.5,
  };

  const toggleProducto = (producto) => {
    setCarrito((prevCarrito) => {
      if (prevCarrito.some((item) => item.id === producto.id)) {
        return prevCarrito.filter((item) => item.id !== producto.id);
      } else {
        return [...prevCarrito, producto];
      }
    });
  };

  const reseñas = [
    { texto: "Gran tienda, excelente servicio y productos de calidad.", calificacion: 5, autor: "María G." },
    { texto: "Buenos precios y envío rápido. Repetiré compra.", calificacion: 4, autor: "Carlos P." }
  ];

  return (
    <div className="negocio-container">
      {/* Encabezado y Logo */}
      <div className="negocio-header">
        <img src={negocio.logo} alt="Logo" className="negocio-logo" />
        <div>
          <h2 className="negocio-title">{negocio.nombre}</h2>
          <div className="negocio-rating">
            {[...Array(5)].map((_, i) => (
              <Star key={i} 
                    fill={i < Math.floor(negocio.reseña) ? "currentColor" : "none"} 
                    className={`w-5 h-5 ${i < negocio.reseña ? "star-filled" : "star-empty"}`} />
            ))}
            <span className="rating-score">{negocio.reseña}</span>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="contact-grid">
        <div className="contact-item">
          <Mail size={18} className="contact-icon" />
          <span className="contact-text">{negocio.contacto}</span>
        </div>
        <div className="contact-item">
          <Phone size={18} className="contact-icon" />
          <span className="contact-text">{negocio.telefono}</span>
        </div>
      </div>

      {/* Sección de Productos */}
      <div className="products-container">
        <button 
          onClick={() => setExpandirProductos(!expandirProductos)}
          className="toggle-button"
        >
          <span>Productos</span>
          {expandirProductos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandirProductos && (
          <div className="products-list">
            {loading ? (
              <div className="loading-container">
                <div className="loading-indicator"></div>
                <p className="loading-text">Cargando productos...</p>
              </div>
            ) : (
              productos.map((producto) => {
                const isSelected = carrito.some(item => item.id === producto.id);
                return (
                  <div key={producto.id} 
                      className={`product-item ${isSelected ? 'product-item-selected' : ''}`}
                  >
                    <button 
                      onClick={() => toggleProducto(producto)}
                      className={`product-checkbox ${isSelected ? 'product-checkbox-selected' : ''}`}
                    >
                      {isSelected && (
                        <Check size={14} className="text-white" />
                      )}
                    </button>
                    
                    <div className="product-info">
                      <h3 className="product-title">{producto.title}</h3>
                      <p className="product-price">${producto.price}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Sección de Reseñas */}
      <div className="reviews-container">
        <button 
          onClick={() => setExpandirReseñas(!expandirReseñas)}
          className="toggle-button"
        >
          <span>Reseñas</span>
          {expandirReseñas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandirReseñas && (
          <div className="reviews-list">
            {reseñas.map((reseña, index) => (
              <div key={index} className="review-item">
                <p className="review-text">"{reseña.texto}"</p>
                <div className="review-footer">
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} 
                            fill={i < reseña.calificacion ? "currentColor" : "none"}
                            className={`${i < reseña.calificacion ? "star-filled" : "star-empty"}`} />
                    ))}
                  </div>
                  <span className="review-author">{reseña.autor}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de Carrito */}
      <div className="cart-button-container">
        <Button 
          disabled={carrito.length === 0}
          className={`cart-button ${carrito.length > 0 ? 'cart-button-active' : 'cart-button-disabled'}`}
        >
          <ShoppingCart size={20} />
          <span>
            {carrito.length > 0 
              ? `Contactar (${carrito.length})` 
              : "Selecciona productos"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default InfoNegocios;