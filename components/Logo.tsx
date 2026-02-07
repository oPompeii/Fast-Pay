import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => {
  // Calculate the height from the className prop
  const heightMatch = className.match(/h-(\d+)/);
  const baseHeight = heightMatch ? parseInt(heightMatch[1]) : 8;
  const adjustedHeight = Math.floor(baseHeight * 1.5);
  const adjustedClassName = className.replace(/h-\d+/, `h-${adjustedHeight}`);

  return (
    <div className={adjustedClassName}>
      <svg 
        viewBox="0 0 500 150" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ borderRadius: '12px' }}
      >
        <g>
          {/* Fast - in green */}
          <text
            x="10"
            y="100"
            fontSize="100"
            fontFamily="Arial"
            fontWeight="bold"
            fill="#059669"
            style={{ borderRadius: '8px' }}
          >
            Fast
          </text>
          
          {/* Pay - in slate gray */}
          <text
            x="250"
            y="100"
            fontSize="100"
            fontFamily="Arial"
            fontWeight="bold"
            fill="#b6cbd1"
            style={{ borderRadius: '8px' }}
          >
            Pay
          </text>
        </g>
      </svg>
    </div>
  );
};

export default Logo;