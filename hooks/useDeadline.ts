import { useState, useEffect } from 'react';

interface DeadlineState {
    timeLeft: string;
    isExpired: boolean;
    isCritical: boolean;
    hasDeadline: boolean;
}

export const useDeadline = (timestamp?: number): DeadlineState => {
    const [state, setState] = useState<DeadlineState>({
        timeLeft: '',
        isExpired: false,
        isCritical: false,
        hasDeadline: false
    });

    useEffect(() => {
        if (!timestamp) {
            setState(s => ({ ...s, hasDeadline: false }));
            return;
        }

        const calculate = () => {
            const now = Date.now();
            const diff = timestamp - now;

            if (diff <= 0) {
                setState({
                    timeLeft: 'Expired',
                    isExpired: true,
                    isCritical: true,
                    hasDeadline: true
                });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            let timeStr = '';
            if (days > 0) timeStr = `${days}d ${hours}h`;
            else if (hours > 0) timeStr = `${hours}h ${minutes}m`;
            else timeStr = `${minutes}m`;

            // Critical if less than 24 hours
            const isCritical = diff < (24 * 60 * 60 * 1000);

            setState({
                timeLeft: timeStr,
                isExpired: false,
                isCritical,
                hasDeadline: true
            });
        };

        calculate();
        const interval = setInterval(calculate, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [timestamp]);

    return state;
};