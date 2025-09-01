import { useState, useLayoutEffect } from 'react';

export function useListMenuPosition(anchorRef, scrollContainerRef) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!anchorRef?.current || !scrollContainerRef?.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const containerRect = scrollContainerRef.current.getBoundingClientRect();

    const top = anchorRect.bottom - containerRect.top + scrollContainerRef.current.scrollTop;
    const left = anchorRect.left - containerRect.left + scrollContainerRef.current.scrollLeft;

    setPosition({ top, left });
  }, [anchorRef, scrollContainerRef]);

  return position;
}