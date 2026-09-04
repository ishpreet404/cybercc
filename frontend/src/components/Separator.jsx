import React from 'react';

export const Separator = ({ variant = 'line', className = '' }) => {
  if (variant === 'equals') {
    return (
      <div className={`text-terminal-border select-none font-mono text-xs overflow-hidden whitespace-nowrap opacity-60 ${className}`}>
        {'========================================================================================================================'}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`text-terminal-border select-none font-mono text-xs overflow-hidden whitespace-nowrap opacity-50 ${className}`}>
        {'························································································································'}
      </div>
    );
  }

  return <hr className={`border-terminal-border my-4 opacity-50 ${className}`} />;
};

export default Separator;
