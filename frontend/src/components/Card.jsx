import React from 'react';

export const Card = ({ title, children, className = '', headerAction = null }) => {
  return (
    <div className={`bg-terminal-dark border border-terminal-border rounded-sm shadow-lg overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-terminal-surface border-b border-terminal-border font-mono text-xs uppercase tracking-wider text-terminal-muted">
          <span className="font-bold text-gray-200">{title}</span>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Card;
