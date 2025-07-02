import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNetworkStatus } from '../hooks';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connectionError: string | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    connectionError: null,
});

export const useSocketContext = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
}

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_BASE_URL || 'http://localhost:3000';

export function SocketProvider({ children }: SocketProviderProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const { isOnline } = useNetworkStatus();

    useEffect(() => {
        if (isOnline && !socketRef.current) {
            console.log('Connecting to socket server...');

            socketRef.current = io(SOCKET_URL, {
                transports: ['websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
                setConnectionError(null);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
                setConnectionError(error.message);
            });

            socketRef.current.on('reconnect', (attemptNumber) => {
                console.log('Socket reconnected after', attemptNumber, 'attempts');
                setIsConnected(true);
                setConnectionError(null);
            });

            socketRef.current.on('reconnect_error', (error) => {
                console.error('Socket reconnection error:', error);
                setConnectionError(error.message);
            });
        }

        if (!isOnline && socketRef.current) {
            console.log('Going offline, disconnecting socket');
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, [isOnline]);

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
                connectionError
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}