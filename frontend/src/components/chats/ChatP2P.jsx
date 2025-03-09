import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Para navegación en React Router
import { Send, MessageCircle } from "lucide-react";
import back from "../../assets/atras.png"; // Importa la imagen de retroceso
import "./ChatP2P.css";


const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
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
          timestamp: new Date(msg.timestamp)
        })));
      } else if (data.type === "message") {
        // Añadir nuevo mensaje
        setMessages((prevMessages) => [
          ...prevMessages, 
          {
            text: data.text,
            sender: data.sender,
            user_id: data.user_id,
            timestamp: new Date(data.timestamp)
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

  const sendMessage = () => {
    if (socket && input.trim() !== "" && isConnected) {
      const messageData = {
        text: input,
        timestamp: new Date().toISOString()
      };
      
      socket.send(JSON.stringify(messageData));
      setInput("");
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

        {/* Contenedor de mensajes */}
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-wrapper ${msg.user_id === userId ? "message-own" : "message-other"}`}
            >
              <div
                className={`message-bubble ${
                  msg.user_id === userId ? "message-bubble-own" : "message-bubble-other"
                }`}
              >
                <p className="message-text">
                  {msg.text}
                </p>
              </div>
              {/* Hora del mensaje fuera del contenedor */}
              {msg.timestamp && (
                <p className={`message-time-below ${msg.user_id === userId ? "message-time-own" : "message-time-other"}`}>
                  {formatTime(msg.timestamp)}
                </p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Barra de envío */}
        <div className="message-input-container">
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
            onClick={sendMessage}
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