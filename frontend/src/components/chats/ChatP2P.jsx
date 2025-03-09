import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-500 to-purple-600">
      <div className="w-[390px] h-[800px] bg-white shadow-2xl rounded-[40px] overflow-hidden flex flex-col border border-gray-300 relative">
        {/* Encabezado */}
        <div className="bg-blue-700 text-white p-4 text-center font-bold text-lg flex items-center justify-between rounded-t-[40px] shadow-md">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" /> Chat App
          </div>
          <div 
            className="text-sm cursor-pointer hover:underline"
            onClick={updateUsername}
          >
            {username} ✏️
          </div>
        </div>

        {/* Indicador de conexión */}
        {!isConnected && (
          <div className="bg-red-500 text-white p-1 text-center text-xs">
            Reconectando...
          </div>
        )}

        {/* Contenedor de mensajes */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.user_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-[75%] text-sm shadow-md flex flex-col ${
                  msg.user_id === userId
                    ? "bg-blue-600 text-white self-end rounded-br-none"
                    : "bg-gray-300 text-black rounded-bl-none"
                }`}
              >
                <div className="flex justify-between w-full">
                  <p className={`text-xs font-semibold ${msg.user_id === userId ? "text-blue-200" : "text-gray-600"}`}>
                    {msg.user_id !== userId ? msg.sender : "Tú"}
                  </p>
                  {msg.timestamp && (
                    <p className={`text-xs ml-2 ${msg.user_id === userId ? "text-blue-200" : "text-gray-600"}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  )}
                </div>
                <p className="break-words mt-1">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Barra de envío */}
        <div className="flex items-center p-3 bg-white border-t border-gray-300 space-x-2 rounded-b-[40px] shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-3 bg-gray-200 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            placeholder="Escribe un mensaje..."
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected}
            className={`p-3 text-white rounded-full transition flex items-center justify-center ${
              isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;