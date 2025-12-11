import React, { useRef, useState, useCallback } from 'react';

export const useDraggableScroll = <T extends HTMLElement>() => {
    const ref = useRef<T>(null);
    // UI state for cursor/pointer-events
    const [isDragging, setIsDragging] = useState(false);
    
    // Internal physics state
    const startPos = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
    const isMouseDown = useRef(false);
    const hasMoved = useRef(false);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isMouseDown.current || !ref.current) return;
        e.preventDefault();
        
        const dx = e.clientX - startPos.current.x;
        const dy = e.clientY - startPos.current.y;

        // Threshold check: Only treat as drag if moved > 5px
        if (!hasMoved.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            hasMoved.current = true;
            setIsDragging(true); // Now we update UI state to disable pointer-events on children
        }

        if (hasMoved.current) {
            ref.current.scrollLeft = startPos.current.scrollLeft - dx;
            ref.current.scrollTop = startPos.current.scrollTop - dy;
        }
    }, []);

    const onMouseUp = useCallback(() => {
        isMouseDown.current = false;
        
        if (hasMoved.current) {
            // If we dragged, keep the flag true briefly to block any subsequent click events
            setTimeout(() => {
                setIsDragging(false);
                hasMoved.current = false; // Reset for next interaction
            }, 0);
        } else {
            // Clean click
            setIsDragging(false);
            hasMoved.current = false;
        }

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }, [onMouseMove]);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;
        if (e.button !== 0) return; // Left click only

        isMouseDown.current = true;
        hasMoved.current = false;
        
        startPos.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: ref.current.scrollLeft,
            scrollTop: ref.current.scrollTop
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [onMouseMove, onMouseUp]);

    return { 
        scrollContainerRef: ref, 
        onMouseDown, 
        isDragging, 
        hasMoved 
    };
};