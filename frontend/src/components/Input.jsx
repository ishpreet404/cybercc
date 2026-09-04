import React from 'react';

export const Input = ({
  type = 'text',
  value,
  onChange,
  onKeyPress,
  placeholder,
  prompt,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`relative flex items-center bg-terminal-black border border-terminal-border focus-within:border-terminal-green px-3 py-2 ${className}`}>
      {prompt && (
        <span className="font-mono text-xs text-terminal-green mr-2 select-none font-bold">
          {prompt}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-transparent font-mono text-sm text-gray-100 placeholder-terminal-muted focus:outline-none"
        {...props}
      />
    </div>
  );
};

export default Input;
