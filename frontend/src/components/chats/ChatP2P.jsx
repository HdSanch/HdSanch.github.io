import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, MessageCircle, ShoppingCart, DollarSign } from "lucide-react";
import back from "../../assets/atras.png";
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

  const connectWebSocket = (userId, username) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);
    
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
          transactionId: msg.transactionId || null
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
            transactionId: data.transactionId || null
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
  const sendMessage = (customMessage = null, imageData = null, imageType = null, isPaymentRequest = false) => {
    if (socket && isConnected) {
      const messageText = customMessage || input.trim();
      
      if (messageText !== "" || imageData) {
        const messageData = {
          text: messageText,
          timestamp: new Date().toISOString()
        };
        
        // Si hay datos de imagen, añadirlos al mensaje
        if (imageData) {
          messageData.imageData = imageData;
          messageData.imageType = imageType;
        }
        
        // Si es una solicitud de pago, añadir la información
        if (isPaymentRequest) {
          messageData.isPaymentRequest = true;
          messageData.paymentAmount = paymentData.amount;
          messageData.transactionId = paymentData.internalTransactionReference;
        }
        
        socket.send(JSON.stringify(messageData));
        if (!customMessage) {
          setInput("");
        }

        // Si es una solicitud de pago, añadirla también localmente
        // Este paso es necesario porque el servidor actual podría no manejar los nuevos campos
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
              transactionId: paymentData.internalTransactionReference
            }
          ]);
        }
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

  // Simplificada: función para manejar los cambios en el formulario de pago
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

  // Función simplificada para procesar el pago
  const processPayment = () => {
    // Generar un nuevo ID de transacción único
    const transactionId = generateTransactionId();
    
    // Actualizar el ID de transacción
    setPaymentData(prev => ({
      ...prev,
      internalTransactionReference: transactionId
    }));
    
    // Enviar mensaje con la información del pago
    const paymentMessage = `Se ha generado una solicitud de pago por $${paymentData.amount.toFixed(2)} - ${paymentData.detail}\nID de Transferencia: ${transactionId}`;
    
    // Indica explícitamente que este es un mensaje de pago
    sendMessage(paymentMessage, null, null, true);
    
    // Cerrar el formulario de pago
    setShowPaymentForm(false);
  };

  // Función para redirigir al pagar
  const goToPayment = () => {
    navigate("/comprobante");
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
                  
                  {/* Botón de pago (si es una solicitud de pago) */}
                  {isPaymentMsg && (
                    <button 
                      className="payment-button-in-message"
                      onClick={goToPayment}
                    >
                      Pagar
                    </button>
                  )}
                </div>
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