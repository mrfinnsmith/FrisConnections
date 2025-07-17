import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onComplete: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onComplete }) => {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShouldShow(true);
            const timer = setTimeout(() => {
                setShouldShow(false);
                setTimeout(onComplete, 300); // Wait for fade out
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="toast-portal">
            <div
                className={`game-toast ${shouldShow ? 'toast-visible' : 'toast-hidden'}`}
                aria-live="assertive"
                data-testid="game-toast"
            >
                <h2>{message}</h2>
            </div>
        </div>
    );
};