import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105";
  const variants = {
    primary: "bg-secondary text-white hover:bg-blue-600",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
    light: "bg-accent text-primary hover:bg-blue-200"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;