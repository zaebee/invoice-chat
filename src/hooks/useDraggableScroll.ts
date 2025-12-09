import React, { useRef, useState, useCallback, useEffect } from 'react';

export const useDraggableScroll = <T extends HTMLElement>() => {
    const ref = useRef<T>(null);
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
    const hasMoved = useRef(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        // Only allow left mouse button (0)
        if (e.button !== 0) return;

        setIsDragging(true);
        hasMoved.current = false;
        startPos.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: ref.current.scrollLeft,
            scrollTop: ref.current.scrollTop
        };
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !ref.current) return;
        e.preventDefault();
        
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;

        // Threshold to consider it a drag vs a sloppy click
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMoved.current = true;
        }

        ref.current.scrollLeft = startPos.current.scrollLeft - dx;
        ref.current.scrollTop = startPos.current.scrollTop - dy;
    }, [isDragging]);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, onMouseMove, onMouseUp]);

    return { 
        scrollContainerRef: ref, 
        onMouseDown, 
        isDragging, 
        hasMoved 
    };
};