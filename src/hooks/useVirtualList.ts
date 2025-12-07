
import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseVirtualListOptions {
  count: number;
  getScrollElement: () => HTMLElement | null;
  estimateHeight: (index: number) => number;
  overscan?: number;
}

export const useVirtualList = ({ count, getScrollElement, estimateHeight, overscan = 3 }: UseVirtualListOptions) => {
  const [sizeMap, setSizeMap] = useState<Record<number, number>>({});
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Resize Observer for items to support dynamic heights
  const resizeObserver = useMemo(() => new ResizeObserver((entries) => {
      let updates: Record<number, number> = {};
      let hasUpdates = false;

      entries.forEach(entry => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!isNaN(index)) {
              // Use borderBoxSize if available for better accuracy
              const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
              updates[index] = height;
              hasUpdates = true;
          }
      });

      if (hasUpdates) {
          setSizeMap(prev => {
              const next = { ...prev, ...updates };
              // Simple check if actually changed to avoid unnecessary re-renders
              if (Object.keys(updates).some(k => prev[Number(k)] !== updates[Number(k)])) {
                  return next;
              }
              return prev;
          });
      }
  }), []);

  // Update Scroll Element & Listeners
  useEffect(() => {
    const element = getScrollElement();
    if (!element) return;

    const handleScroll = () => {
        setScrollTop(element.scrollTop);
    };

    const handleResize = () => {
        setViewportHeight(element.clientHeight);
    };

    // Initial dimensions
    setViewportHeight(element.clientHeight);
    setScrollTop(element.scrollTop);

    element.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
        element.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
    };
  }, [getScrollElement, resizeObserver]);

  // Measurement Callback Ref to be attached to each item
  const measureElement = useCallback((node: HTMLElement | null) => {
      if (node) {
          resizeObserver.observe(node);
      }
  }, [resizeObserver]);

  // Calculate Offsets and Total Height
  const { items, totalHeight } = useMemo(() => {
    const items = [];
    let currentOffset = 0;
    for (let i = 0; i < count; i++) {
        // Use measured height if available, otherwise estimate
        const height = sizeMap[i] ?? estimateHeight(i);
        items.push({ index: i, offset: currentOffset, height });
        currentOffset += height;
    }
    return { items, totalHeight: currentOffset };
  }, [count, sizeMap, estimateHeight]);

  // Determine Visible Range (Binary Search for Start)
  const startIndex = useMemo(() => {
      if (count === 0) return 0;

      let start = 0;
      let end = count - 1;
      
      while (start <= end) {
          const mid = Math.floor((start + end) / 2);
          const item = items[mid];
          
          if (!item) break;

          const bottom = item.offset + item.height;
          
          if (item.offset <= scrollTop && bottom > scrollTop) {
              return mid;
          } else if (bottom <= scrollTop) {
              start = mid + 1;
          } else {
              end = mid - 1;
          }
      }
      return Math.min(Math.max(0, start), count - 1);
  }, [items, scrollTop, count]);

  // Determine End Index (Linear Search from Start)
  const endIndex = useMemo(() => {
      if (count === 0) return 0;

      const endPos = scrollTop + viewportHeight;
      let idx = startIndex;
      
      while (idx < count && items[idx] && items[idx].offset < endPos) {
          idx++;
      }
      return Math.min(count - 1, idx);
  }, [startIndex, items, scrollTop, viewportHeight, count]);

  // Apply Overscan buffer
  const renderStartIndex = Math.max(0, startIndex - overscan);
  const renderEndIndex = Math.min(count - 1, endIndex + overscan);

  // Filter items to render
  const virtualItems = useMemo(() => {
      if (count === 0) return [];
      return items.slice(renderStartIndex, renderEndIndex + 1);
  }, [items, renderStartIndex, renderEndIndex, count]);

  return {
      virtualItems,
      totalHeight,
      measureElement
  };
};
