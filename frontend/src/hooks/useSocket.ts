import { useEffect } from 'react';
import { socket, connectSocket } from '../sockets/socket';

export function useSocket(boardId?: string, workspaceId?: string) {
    useEffect(() => {
        // Initiate the connection
        connectSocket();

        // 1. Define what happens when we want to join rooms
        const joinRooms = () => {
            if (boardId) {
                socket.emit('board.join', { boardId });
            }
            if (workspaceId) {
                socket.emit('workspace.join', { workspaceId });
            }
        };

        // 2. Check if we are already connected. If yes, join immediately. 
        // If no, wait for the socket to say it is fully connected.
        if (socket.connected) {
            joinRooms();
        } else {
            socket.on('connect', joinRooms);
        }

        // Listen for custom backend socket errors
        const handleError = (error: { message: string }) => {
            console.error("Socket Error from Backend:", error.message);
        };
        socket.on('socket.error', handleError);

        // Cleanup function when component unmounts
        return () => {
            socket.off('connect', joinRooms);
            socket.off('socket.error', handleError);

            if (boardId) {
                socket.emit('board.leave', { boardId });
            }
            if (workspaceId) {
                socket.emit('workspace.leave', { workspaceId });
            }
        };
    }, [boardId, workspaceId]);

    return socket;
}