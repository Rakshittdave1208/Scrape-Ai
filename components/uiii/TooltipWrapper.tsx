
import React from "react";

interface TooltipWrapperProps {
  content: string;
  children: React.ReactNode;
}

const TooltipWrapper = ({ content, children }: TooltipWrapperProps) => {
  return (
    <div className="relative group">
      {children}

      <span className="absolute hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 bottom-full mb-1 whitespace-nowrap">
        {content}
      </span>
    </div>
  );
};

export default TooltipWrapper;
