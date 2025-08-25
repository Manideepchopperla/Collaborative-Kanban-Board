import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]); // State for chat messages
  const { user } = useAuth();
  const { roomId } = useParams();

  // Fetch initial chat history
  useEffect(() => {
    if (user && roomId) {
      const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/${roomId}/recent`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
      };
      fetchMessages();
    }
  }, [user, roomId]);

  // Setup socket connection and listeners
  useEffect(() => {
    if (user && roomId) {
      const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
        auth: { token: localStorage.getItem('token') },
      });

      console.log(socketInstance);

      socketInstance.on('connect', () => {
        setConnected(true);
        socketInstance.emit('join_room', { roomId });
      });

      socketInstance.on('update_members', setMembers);

      // Listen for new messages from the server
      socketInstance.on('new_message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socketInstance.on('disconnect', () => setConnected(false));

      setSocket(socketInstance);

      return () => {
        socketInstance.off('new_message');
        socketInstance.close();
      };
    }
  }, [user, roomId]);

  // Function to send a message via socket
  const sendMessage = (content) => {
    if (socket) {
      socket.emit('send_message', { roomId, content });
    }
  };

  const value = {
    socket,
    connected,
    members,
    messages,
    sendMessage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};