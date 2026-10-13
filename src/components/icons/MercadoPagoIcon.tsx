import React from 'react';

interface MercadoPagoIconProps {
  size?: number;
  className?: string;
}

export const MercadoPagoIcon: React.FC<MercadoPagoIconProps> = ({ 
  size = 20, 
  className = "" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Mercado Pago"
    >
      <rect width="48" height="48" rx="12" fill="#009EE3" />
      <path 
        d="M13.5 22.5C13.5 20.0147 15.5147 18 18 18H20.5C21.8807 18 23 19.1193 23 20.5V23.5H16.5C14.8431 23.5 13.5 24.8431 13.5 26.5V22.5Z" 
        fill="white" 
      />
      <path 
        d="M34.5 25.5C34.5 27.9853 32.4853 30 30 30H27.5C26.1193 30 25 28.8807 25 27.5V24.5H31.5C33.1569 24.5 34.5 23.1569 34.5 21.5V25.5Z" 
        fill="white" 
      />
      <path 
        d="M21 21C21 19.8954 21.8954 19 23 19H25C26.1046 19 27 19.8954 27 21V27C27 28.1046 26.1046 29 25 29H23C21.8954 29 21 28.1046 21 27V21Z" 
        fill="white" 
      />
      <path 
        d="M16 25H22V28C22 29.6569 20.6569 31 19 31C17.3431 31 16 29.6569 16 28V25Z" 
        fill="white" 
      />
      <path 
        d="M32 23H26V20C26 18.3431 27.3431 17 29 17C30.6569 17 32 18.3431 32 20V23Z" 
        fill="white" 
      />
    </svg>
  );
};

export default MercadoPagoIcon;
