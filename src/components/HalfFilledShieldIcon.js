import React from 'react';

function HalfFilledShieldIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Define a linear gradient that fills only the left 50% of the shape */}
      <defs>
        <linearGradient id="halfFill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5A67BA" />
          <stop offset="50%" stopColor="#5A67BA" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Shield path: half-filled by the gradient, with a stroke for the outline */}
      <path
        d="M12 2L3 5v6c0 5.25 3.6 10.74 9 11.95 5.4-1.21 9-6.7 9-11.95V5l-9-3z"
        fill="url(#halfFill)"
        stroke="#5A67BA"
        strokeWidth="1"
      />
    </svg>
  );
}

export default HalfFilledShieldIcon;
