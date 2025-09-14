import { useMemo } from 'react';
import greetings from './welcomeMessage.js';

const sanitizeInput = (input) => {
    return input.replace(/[<>{}]/g, '');
};

export default function WelcomeMessage({ userName = 'Người dùng' }) {
    const message = useMemo(() => {
        if (!greetings || greetings.length === 0) {
            return `Chào mừng ${sanitizeInput(userName)} đến với hệ thống!`;
        }
        const random = Math.floor(Math.random() * greetings.length);
        return greetings[random].replace('{username}', sanitizeInput(userName));
    }, [userName]);

    return <div>{message}</div>;
}