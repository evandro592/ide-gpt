import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ResizableLayoutProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLeftWidth?: number;
  defaultRightWidth?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
}

export function ResizableLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultLeftWidth = 320,
  defaultRightWidth = 384,
  minLeftWidth = 200,
  minRightWidth = 300,
}: ResizableLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [rightWidth, setRightWidth] = useState(defaultRightWidth);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResizeLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  }, []);

  const startResizeRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      if (isResizingLeft) {
        const newLeftWidth = e.clientX - containerRect.left;
        if (newLeftWidth >= minLeftWidth && newLeftWidth <= containerRect.width - rightWidth - 100) {
          setLeftWidth(newLeftWidth);
        }
      }

      if (isResizingRight) {
        const newRightWidth = containerRect.right - e.clientX;
        if (newRightWidth >= minRightWidth && newRightWidth <= containerRect.width - leftWidth - 100) {
          setRightWidth(newRightWidth);
        }
      }
    },
    [isResizingLeft, isResizingRight, leftWidth, rightWidth, minLeftWidth, minRightWidth]
  );

  // Mouse event listeners
  React.useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);

      return () => {
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
      };
    }
  }, [isResizingLeft, isResizingRight, resize, stopResize]);

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden">
      {/* Left Panel */}
      <div
        className="bg-vs-surface border-r border-vs-border flex flex-col"
        style={{ width: `${leftWidth}px` }}
      >
        {leftPanel}
      </div>

      {/* Left Resize Handle */}
      <div
        className={cn(
          "w-1 bg-vs-border hover:bg-vs-accent transition-colors cursor-col-resize",
          isResizingLeft && "bg-vs-accent"
        )}
        onMouseDown={startResizeLeft}
      />

      {/* Center Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {centerPanel}
      </div>

      {/* Right Resize Handle */}
      <div
        className={cn(
          "w-1 bg-vs-border hover:bg-vs-accent transition-colors cursor-col-resize",
          isResizingRight && "bg-vs-accent"
        )}
        onMouseDown={startResizeRight}
      />

      {/* Right Panel */}
      <div
        className="bg-vs-surface border-l border-vs-border flex flex-col"
        style={{ width: `${rightWidth}px` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}
