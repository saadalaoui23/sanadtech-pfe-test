import React, { useRef, useEffect, useState } from 'react';

const VirtualScroller = ({ items, renderItem, onLoadMore, hasMore, loading }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      
      // Load more when near bottom
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
        onLoadMore();
      }

      // Calculate visible range for virtualization
      const itemHeight = 60; // Approximate height per item
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(clientHeight / itemHeight) + 5, items.length);
      
      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial calculation
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [items.length, hasMore, loading, onLoadMore]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div ref={containerRef} className="virtual-scroller">
      <div style={{ height: visibleRange.start * 60 }} />
      {visibleItems.map((item, index) => (
        <div key={visibleRange.start + index}>
          {renderItem(item)}
        </div>
      ))}
      <div style={{ height: (items.length - visibleRange.end) * 60 }} />
      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default VirtualScroller;
