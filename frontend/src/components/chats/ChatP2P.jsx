import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, MessageCircle, ShoppingCart, DollarSign, Link as LinkIcon } from "lucide-react";
import back from "../../assets/atras.png";
import axios from "axios";
import "./ChatP2P.css";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 5.19,
    detail: "test postman GEO",
    internalTransactionReference: "IXWAHROMYSCEZWQ"
  });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Configuración de las APIs
  const API_REQUEST = "/api/merchant/v1/payment/request";

  // Inicializar usuario y conectar WebSocket
  useEffect(() => {
    // Verificar si existe un usuario en localStorage
    const storedUserId = localStorage.getItem("chat_user_id");
    const storedUsername = localStorage.getItem("chat_username");
    
    let currentUserId = storedUserId;
    let currentUsername = storedUsername;
    
    // Si no existe, crear uno nuevo
    if (!currentUserId) {
      currentUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chat_user_id", currentUserId);
    }
    
    if (!currentUsername) {
      currentUsername = `User${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem("chat_username", currentUsername);
    }
    
    setUserId(currentUserId);
    setUsername(currentUsername);
    
    // Conectar al WebSocket con el ID de usuario
    connectWebSocket(currentUserId, currentUsername);
    
    // Cargar productos seleccionados desde localStorage
    const productsData = localStorage.getItem("selected_products");
    if (productsData) {
      setSelectedProducts(JSON.parse(productsData));
      setShowProductsList(true);
    }
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Verificar si hay confirmación de pago en la navegación
  useEffect(() => {
    const handleLocationChange = () => {
      const state = window.history.state?.state;
      if (state && state.confirmPayment) {
        const confirmMessage = `✅ Pago confirmado por $${state.amount || 'N/A'}\nID de Transferencia: ${state.transactionId || 'N/A'}`;
        sendMessage(confirmMessage);
      }
    };

    // Escuchar cambios en la ubicación
    window.addEventListener('popstate', handleLocationChange);
    
    // Verificar al cargar
    const state = window.history.state?.state;
    if (state && state.confirmPayment) {
      const confirmMessage = `✅ Pago confirmado por $${state.amount || 'N/A'}\nID de Transferencia: ${state.transactionId || 'N/A'}`;
      // Pequeño timeout para asegurar que socket esté listo
      setTimeout(() => {
        sendMessage(confirmMessage);
      }, 500);
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [socket, isConnected]);

  const connectWebSocket = (userId, username) => {
    // const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);
    const ws = new WebSocket(`wss://deuna-backend.onrender.com/ws/${userId}`);
    
    ws.onopen = () => {
      console.log("Conexión WebSocket establecida");
      setIsConnected(true);
      
      // Enviar información de registro
      const registrationData = {
        username: username
      };
      ws.send(JSON.stringify(registrationData));
    };
    
    ws.onclose = () => {
      console.log("Conexión WebSocket cerrada");
      setIsConnected(false);
      
      // Intentar reconectar después de 3 segundos
      setTimeout(() => {
        if (!isConnected) {
          connectWebSocket(userId, username);
        }
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "history") {
        // Cargar historial de mensajes
        setMessages(data.messages.map(msg => ({
          text: msg.text,
          sender: msg.sender,
          user_id: msg.user_id,
          timestamp: new Date(msg.timestamp),
          imageData: msg.imageData || null,
          imageType: msg.imageType || null,
          isPaymentRequest: msg.isPaymentRequest || false,
          paymentAmount: msg.paymentAmount || null,
          transactionId: msg.transactionId || null,
          qrImage: msg.qrImage || null,
          paymentLink: msg.paymentLink || null
        })));
      } else if (data.type === "message") {
        // Añadir nuevo mensaje
        setMessages((prevMessages) => [
          ...prevMessages, 
          {
            text: data.text,
            sender: data.sender,
            user_id: data.user_id,
            timestamp: new Date(data.timestamp),
            imageData: data.imageData || null,
            imageType: data.imageType || null,
            isPaymentRequest: data.isPaymentRequest || false,
            paymentAmount: data.paymentAmount || null,
            transactionId: data.transactionId || null,
            qrImage: data.qrImage || null,
            paymentLink: data.paymentLink || null
          }
        ]);
      }
    };
    
    setSocket(ws);
  };

  // Hacer scroll automático cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Función para enviar mensajes
  const sendMessage = (customMessage = null, imageData = null, imageType = null, isPaymentRequest = false, qrImage = null, paymentLink = null) => {
    if (socket && isConnected) {
      const messageText = customMessage || input.trim();
      
      if (messageText !== "" || imageData) {
        const messageData = {
          text: messageText,
          timestamp: new Date().toISOString()
        };
        socket.send(JSON.stringify(messageData));

        if (isPaymentRequest) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: messageText,
              sender: username,
              user_id: userId,
              timestamp: new Date(),
              isPaymentRequest: true,
              paymentAmount: paymentData.amount,
              transactionId: paymentData.internalTransactionReference,
              qrImage: qrImage,
              paymentLink: paymentLink
            }
          ]);
        }
        
        // Limpiar el input después de enviar
        setInput("");
      }
    }
  };

  // Función para enviar productos seleccionados como mensaje
  const sendSelectedProducts = () => {
    if (selectedProducts.length > 0 && socket && isConnected) {
      const productsList = selectedProducts.map(product => `• ${product.title}`).join("\n");
  
      const messageText = `Hola, estoy interesado en los siguientes productos:\n${productsList}`;
      sendMessage(messageText);
  
      // Limpiar productos del localStorage después de enviarlos
      localStorage.removeItem("selected_products");
      setSelectedProducts([]);
      setShowProductsList(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateUsername = () => {
    const newUsername = prompt("Introduce tu nuevo nombre de usuario:", username);
    if (newUsername && newUsername.trim() !== "") {
      setUsername(newUsername);
      localStorage.setItem("chat_username", newUsername);
      
      // Reconectar para actualizar el nombre
      if (socket) {
        socket.close();
        connectWebSocket(userId, newUsername);
      }
    }
  };

  const formatTime = (date) => {
    const localDate = new Date(date);
    const adjustedDate = new Date(localDate.getTime() - (5 * 60 * 60 * 1000)); // Ajustar a UTC-5
    return adjustedDate.toLocaleTimeString("es-EC", { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  // Función para manejar los cambios en el formulario de pago
  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: name === "amount" ? parseFloat(value) : value
    });
  };

  // Función para generar un ID único para la transacción
  const generateTransactionId = () => {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  // Función para generar QR, enlace de pago y solicitud de pago
  const processPayment = async () => {
    try {
      // Generar un nuevo ID de transacción único
      const transactionId = generateTransactionId();
      
      // Actualizar el ID de transacción
      const updatedPaymentData = {
        ...paymentData,
        internalTransactionReference: transactionId,
        pointOfSale: "4121565",
        qrType: "dynamic",
        format: "2"
      };
      
      setPaymentData(updatedPaymentData);
      
      // Hacer la solicitud para obtener el QR
      const response = await axios.post(API_REQUEST, updatedPaymentData);
      
      // Verificar si la respuesta tiene un código QR
      if (response.data && response.data.qr) {
        const qrImage = response.data.qr;
        
        // Generar enlace de pago (esto es simulado, en realidad vendría de la API)
        // En producción, este enlace debería ser proporcionado por la API junto con el QR
        const paymentLink = `https://deuna.app/pay/${transactionId}?amount=${updatedPaymentData.amount}`;
        
        // Enviar mensaje con la información del pago
        const paymentMessage = `Se ha generado una solicitud de pago por $${updatedPaymentData.amount.toFixed(2)} - ${updatedPaymentData.detail}\nID de Transferencia: ${transactionId}`;
        
        // Enviar el mensaje con el QR y el enlace
        sendMessage(paymentMessage, null, null, true, qrImage, paymentLink);
      } else {
        console.error("No se recibió código QR en la respuesta");
        alert("Error al generar el código QR de pago");
      }
      
      // Cerrar el formulario de pago
      setShowPaymentForm(false);
    } catch (error) {
      console.error("Error al generar el QR de pago:", error);
      alert("Error al generar el código QR de pago");
    }
  };

  // Función para procesar pago inmediatamente (sin ir a comprobante)
  const processPaymentDirectly = (transactionId, amount) => {
    // Enviar mensaje de confirmación de pago
    const confirmMessage = `✅ Pago realizado con éxito por $${amount || 'N/A'}\nID de Transferencia: ${transactionId || 'N/A'}`;
    sendMessage(confirmMessage);
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {/* Encabezado */}
        <div className="chat-header">
          {/* Botón de retroceso */}
          <img 
            src={back} 
            alt="Atrás" 
            className="back-button"
            onClick={() => navigate("/negocio")}
          />
          <div className="chat-header-title">
            <MessageCircle className="chat-header-icon" />
            <span>Chat DeUna</span>
          </div>
          <div className="chat-status">
            <span className={`status-indicator ${isConnected ? "online" : "offline"}`}></span>
            {isConnected ? "Conectado" : "Desconectado"}
          </div>
          <div className="chat-username" onClick={updateUsername}>
            {username}
          </div>
        </div>

        {/* Indicador de conexión */}
        {!isConnected && (
          <div className="connection-status">
            Reconectando...
          </div>
        )}

        {/* Productos seleccionados */}
        {showProductsList && selectedProducts.length > 0 && (
          <div className="selected-products-container">
            <div className="selected-products-header">
              <ShoppingCart className="selected-products-icon" />
              <span>Productos Seleccionados ({selectedProducts.length})</span>
            </div>
            <div className="selected-products-list">
              {selectedProducts.map((product) => (
                <div key={product.id} className="selected-product-item">
                  <img src={product.image} alt={product.title} className="selected-product-image" />
                  <span className="selected-product-title">{product.title}</span>
                </div>
              ))}
            </div>
            <button 
              className="send-products-button"
              onClick={sendSelectedProducts}
            >
              Enviar productos
            </button>
          </div>
        )}

        {/* Formulario de Pago Simplificado */}
        {showPaymentForm && (
          <div className="payment-form-container">
            <div className="payment-form-header">
              <DollarSign className="payment-form-icon" />
              <span>Solicitud de Pago</span>
              <button 
                className="close-form-button"
                onClick={() => setShowPaymentForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="payment-form">
              <div className="form-group">
                <label>Monto</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={handlePaymentInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Detalle</label>
                <input
                  type="text"
                  name="detail"
                  value={paymentData.detail}
                  onChange={handlePaymentInputChange}
                />
              </div>
              
              <button 
                className="generate-payment-button"
                onClick={processPayment}
              >
                Generar Solicitud
              </button>
            </div>
          </div>
        )}

        {/* Contenedor de mensajes */}
        <div className="messages-container">
          {messages.map((msg, index) => {
            // Verificar si es un mensaje de pago
            const isPaymentMsg = msg.text && (
              msg.isPaymentRequest === true || 
              msg.text.includes("Se ha generado una solicitud de pago")
            );
            
            // Extraer el transaction ID y el monto del mensaje de pago
            let transactionId = null;
            let paymentAmount = null;
            
            if (isPaymentMsg) {
              // Intentar extraer ID de transacción del mensaje
              const idMatch = msg.text.match(/ID de Transferencia: ([A-Z0-9]+)/);
              if (idMatch && idMatch[1]) {
                transactionId = idMatch[1];
              } else if (msg.transactionId) {
                transactionId = msg.transactionId;
              }
              
              // Intentar extraer monto del mensaje
              const amountMatch = msg.text.match(/\$([0-9.]+)/);
              if (amountMatch && amountMatch[1]) {
                paymentAmount = parseFloat(amountMatch[1]);
              } else if (msg.paymentAmount) {
                paymentAmount = msg.paymentAmount;
              }
            }
            
            return (
              <div
                key={index}
                className={`message-wrapper ${msg.user_id === userId ? "message-own" : "message-other"}`}
              >
                <div
                  className={`message-bubble ${
                    msg.user_id === userId ? "message-bubble-own" : "message-bubble-other"
                  } ${isPaymentMsg ? "payment-message" : ""}`}
                >
                  {/* Texto del mensaje */}
                  <p className="message-text" style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </p>
                  
                  {/* Imagen del mensaje (si existe) */}
                  {msg.imageData && (
                    <div className="message-image-container">
                      <img 
                        src={msg.imageData.startsWith('data:') 
                          ? msg.imageData 
                          : `data:${msg.imageType || 'image/png'};base64,${msg.imageData}`}
                        alt="Imagen adjunta" 
                        className="message-image"
                        onError={(e) => {
                          console.error("Error loading image:", e);
                          e.target.src = "/placeholder-qr.png"; // Fallback image
                          e.target.style.opacity = 0.5;
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {/* Opciones de Pago (QR o Enlace) - Fuera del bubble principal */}
                {isPaymentMsg && !msg.text.includes("✅ Pago") && (
                  <div className="payment-options-container">
                    {/* QR de Pago (si existe) */}
                    {msg.qrImage && (
                      <div className="qr-container-standalone">
                        <img 
                          src={msg.qrImage}
                          alt="Código QR de pago" 
                          className="qr-image-standalone"
                          onError={(e) => {
                            console.error("Error loading QR image:", e);
                            e.target.src = "/placeholder-qr.png"; // Fallback image
                            e.target.style.opacity = 0.5;
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Botones de Pago */}
                    <div className="payment-buttons-container">
                      {/* Enlace de Pago (si existe) */}
                      {msg.paymentLink && (
                        <a 
                          href={msg.paymentLink} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="payment-link-button"
                        >
                          <LinkIcon className="payment-link-icon" size={16} />
                          Pagar con enlace
                        </a>
                      )}
                      
                      {/* Botón de Pagar Directamente */}
                      <button 
                        className="payment-button-in-message"
                        onClick={() => processPaymentDirectly(transactionId, paymentAmount)}
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Hora del mensaje fuera del contenedor */}
                {msg.timestamp && (
                  <p className={`message-time-below ${msg.user_id === userId ? "message-time-own" : "message-time-other"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Barra de envío */}
        <div className="message-input-container">
          {/* Botón de pago */}
          <button
            className="payment-button-trigger"
            onClick={() => setShowPaymentForm(!showPaymentForm)}
          >
            <DollarSign className="payment-button-icon" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`message-input ${!isConnected ? "message-input-disabled" : ""}`}
            placeholder="Escribe un mensaje..."
            disabled={!isConnected}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!isConnected}
            className={`send-button ${
              isConnected ? "send-button-active" : "send-button-disabled"
            }`}
          >
            <Send className="send-button-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
