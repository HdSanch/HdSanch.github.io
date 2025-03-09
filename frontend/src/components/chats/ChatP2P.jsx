

import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      const generatedUsername = `User${Math.floor(Math.random() * 1000)}`;
      setUsername(generatedUsername);
    };

    ws.onmessage = (event) => {
      const [sender, text] = event.data.split(":");
      setMessages((prevMessages) => [...prevMessages, { text, sender }]);
    };

    setSocket(ws);

    return () => ws.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (socket && input.trim() !== "") {
      socket.send(`${username}:${input}`);
      setMessages((prevMessages) => [...prevMessages, { text: input, sender: username }]);
      setInput("");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-b from-blue-500 to-purple-600">
      <div className="w-[390px] h-[800px] bg-white shadow-2xl rounded-[40px] overflow-hidden flex flex-col border border-gray-300 relative">
        {/* Encabezado */}
        <div className="bg-blue-700 text-white p-4 text-center font-bold text-lg flex items-center justify-center rounded-t-[40px] shadow-md">
          <MessageCircle className="w-6 h-6 mr-2" /> Chat App
        </div>

        {/* Contenedor de mensajes */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-[75%] text-sm shadow-md flex flex-col ${
                  msg.sender === username
                    ? "bg-blue-600 text-white self-end rounded-br-none"
                    : "bg-gray-300 text-black rounded-bl-none"
                }`}
              >
                <p className="text-xs font-semibold text-gray-600">
                  {msg.sender !== username ? msg.sender : "Tú"}
                </p>
                <p className="break-words">
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
            className="flex-1 p-3 bg-gray-200 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
            placeholder="Escribe un mensaje..."
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
