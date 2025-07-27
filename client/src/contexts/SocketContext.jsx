import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const { user } = useAuth();
  const { roomId } = useParams(); 

  useEffect(() => {
    // Only establish connection if user is logged in and we have a roomId
    if (user && roomId) {
      const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socketInstance.on('connect', () => {
        setConnected(true);
        socketInstance.emit('join_room', { roomId });
      });

      socketInstance.on('update_members', (roomMembers) => {
          setMembers(roomMembers);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
        setMembers([]);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.emit('leave_room', { roomId });
        socketInstance.close();
      };
    }
  }, [user, roomId]);

  const value = {
    socket,
    connected,
    members 
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};