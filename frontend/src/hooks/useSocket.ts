import { useEffect } from 'react';
import { socket, connectSocket } from '../sockets/socket';

export function useSocket(boardId?: string, workspaceId?: string) {
    useEffect(() => {
        connectSocket();

        const joinRooms = () => {
            if (boardId) socket.emit('board.join', { boardId });
            if (workspaceId) socket.emit('workspace.join', { workspaceId });
        };

        if (socket.connected) {
            joinRooms();
        }

        socket.on('connect', joinRooms);

        return () => {
            socket.off('connect', joinRooms);
            if (boardId && socket.connected) {
                socket.emit('board.leave', { boardId });
            }
            if (workspaceId && socket.connected) {
                socket.emit('workspace.leave', { workspaceId });
            }
        };
    }, [boardId, workspaceId]);

    return socket;
}
