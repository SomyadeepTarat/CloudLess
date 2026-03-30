import { useEffect, useState } from 'react';

const useSocket = (url) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5001';
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket connected');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessages((prev) => [...prev, data]);
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnected(false);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setConnected(false);
        };

        setSocket(ws);

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [url]);

    const send = (data) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        }
    };

    return { socket, messages, connected, send };
};

export default useSocket;
