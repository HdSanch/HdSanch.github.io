import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Star, Mail, Phone } from "lucide-react";
import tiendaIcon from "../../assets/icons8-tienda-96.png";

const InfoNegocios = () => {
  const [productos, setProductos] = useState([]);
  const [expandirProductos, setExpandirProductos] = useState(false);
  const [expandirReseñas, setExpandirReseñas] = useState(false);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => setProductos(data));
  }, []);

  const negocio = {
    nombre: "Tienda Ejemplo",
    contacto: "contacto@tienda.com",
    telefono: "+123 456 7890",
    logo: tiendaIcon,
    reseña: 4.5,
  };

  return (
    <div className="p-6 w-full max-w-[375px] min-h-[714px] bg-white rounded-lg shadow-md border border-purple-500 flex flex-col items-center">
      {/* Logo y Nombre del Negocio */}
      <div className="flex flex-col items-center mb-4">
        <img src={negocio.logo} alt="Logo" className="w-20 h-20 rounded-full mb-2 shadow-md" />
        <h2 className="text-2xl font-bold text-purple-700">{negocio.nombre}</h2>
      </div>

      {/* Información de Contacto */}
      <div className="text-center text-purple-600 mb-4">
        <div className="flex items-center justify-center gap-2">
          <Mail size={18} /> <p className="text-sm">{negocio.contacto}</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Phone size={18} /> <p className="text-sm">{negocio.telefono}</p>
        </div>
      </div>

      {/* Reseñas con Estrellas */}
      <div className="flex items-center justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < negocio.reseña ? "text-yellow-500" : "text-gray-300"}`} />
        ))}
        <span className="ml-2 text-sm text-purple-700">{negocio.reseña} / 5</span>
      </div>

      {/* Botones de Productos y Reseñas */}
      <div className="flex flex-col gap-2 w-full px-4">
        <Button onClick={() => setExpandirProductos(!expandirProductos)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2">
          {expandirProductos ? "Ocultar Productos" : "Mostrar Productos"}
        </Button>
        <Button onClick={() => setExpandirReseñas(!expandirReseñas)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2">
          {expandirReseñas ? "Ocultar Reseñas" : "Mostrar Reseñas"}
        </Button>
      </div>

      {/* Lista de Productos */}
      {expandirProductos && (
        <div className="mt-4 grid grid-cols-1 gap-4 w-full px-4">
          {productos.map((producto) => (
            <Card key={producto.id} className="bg-purple-100 border-purple-500">
              <CardContent>
                <h3 className="text-md font-semibold text-purple-700">{producto.title}</h3>
                <p className="text-purple-500">${producto.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sección de Reseñas */}
      {expandirReseñas && (
        <div className="mt-4 p-4 border rounded-lg bg-purple-100 border-purple-500 w-full px-4">
          <p className="text-purple-700">"Gran tienda, excelente servicio y productos de calidad."</p>
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < 5 ? "text-yellow-500" : "text-gray-300"}`} />
            ))}
            <span className="ml-2 text-sm text-purple-700">5 / 5</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoNegocios;
