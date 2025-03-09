import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card"; // Verifica esta importación
import { Button } from "../ui/button"; // Verifica esta importación
import { Star } from "lucide-react";

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
    reseña: 4.5,
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card className="mb-4">
        <CardContent>
          <h2 className="text-xl font-bold">{negocio.nombre}</h2>
          <p className="text-sm text-gray-600">{negocio.contacto}</p>
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < negocio.reseña ? "text-yellow-500" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm">{negocio.reseña} / 5</span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => setExpandirProductos(!expandirProductos)}
        className="w-full mb-2"
      >
        {expandirProductos ? "Ocultar Productos" : "Mostrar Productos"}
      </Button>
      {expandirProductos && (
        <div className="grid grid-cols-1 gap-4">
          {productos.map((producto) => (
            <Card key={producto.id}>
              <CardContent>
                <h3 className="text-lg font-semibold">{producto.title}</h3>
                <p className="text-gray-600">${producto.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        onClick={() => setExpandirReseñas(!expandirReseñas)}
        className="w-full mt-4"
      >
        {expandirReseñas ? "Ocultar Reseñas" : "Mostrar Reseñas"}
      </Button>
      {expandirReseñas && (
        <div className="p-4 border rounded-lg mt-2">
          <p className="text-gray-700">
            "Gran tienda, excelente servicio y productos de calidad."
          </p>
          <div className="flex items-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < 5 ? "text-yellow-500" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm">5 / 5</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoNegocios;
