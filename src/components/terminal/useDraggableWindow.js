import { useCallback, useEffect, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function useDraggableWindow(initialPosition = { x: 24, y: 24 }) {
  const [position, setPosition] = useState(initialPosition);
  const dragRef = useRef(null);

  const stopDragging = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onDragMove = useCallback((event) => {
    if (!dragRef.current) return;

    const { offsetX, offsetY } = dragRef.current;
    const nextX = event.clientX - offsetX;
    const nextY = event.clientY - offsetY;

    const maxX = Math.max(8, window.innerWidth - 260);
    const maxY = Math.max(8, window.innerHeight - 120);

    setPosition({
      x: clamp(nextX, 8, maxX),
      y: clamp(nextY, 8, maxY),
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [onDragMove, stopDragging]);

  const startDragging = useCallback(
    (event) => {
      if (event.button !== 0) return;
      event.preventDefault();

      dragRef.current = {
        offsetX: event.clientX - position.x,
        offsetY: event.clientY - position.y,
      };
    },
    [position.x, position.y],
  );

  return { position, startDragging, setPosition };
}
