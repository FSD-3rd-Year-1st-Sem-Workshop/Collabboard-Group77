import { useEffect } from 'react';
import { socket, connectSocket } from '../sockets/socket';

export function useSocket(boardId?: string, workspaceId?: string) {
    useEffect(() => {
        connectSocket();

        if (boardId) {
            socket.emit('board.join', { boardId });
        }
        if (workspaceId) {
            socket.emit('workspace.join', { workspaceId });
        }

        return () => {
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
