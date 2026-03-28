import React from "react";

type Props = {
  size?: number;
};

const ScrumIcon: React.FC<Props> = ({ size = 8 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect x="0.25" y="0.25" width="7.5" height="7.5" rx="1.75" fill="#ffffff" />

      {/* Top progress bar */}
      <rect x="0.25" y="0.25" width="7.5" height="0.75" rx="0.375" fill="url(#grad)" />

      {/* Column headers */}
      <rect x="1.25" y="1.75" width="1.5" height="0.75" rx="0.25" fill="#AFA9EC" />
      <rect x="3.25" y="1.75" width="1.5" height="0.75" rx="0.25" fill="#5DCAA5" />
      <rect x="5.25" y="1.75" width="1.5" height="0.75" rx="0.25" fill="#97C459" />

      {/* Column 1 cards */}
      <rect x="1.25" y="3" width="1.5" height="1" rx="0.25" fill="#EEEDFE" />
      <rect x="1.25" y="4.5" width="1.5" height="1" rx="0.25" fill="#FAEEDA" />

      {/* Column 2 cards */}
      <rect x="3.25" y="3" width="1.5" height="1" rx="0.25" fill="#E1F5EE" />

      {/* Column 3 cards */}
      <rect x="5.25" y="3" width="1.5" height="1" rx="0.25" fill="#EAF3DE" />
      <rect x="5.25" y="4.5" width="1.5" height="1" rx="0.25" fill="#EAF3DE" />

      {/* Gradient */}
      <defs>
        <linearGradient id="grad" x1="0.25" y1="0.25" x2="7.75" y2="0.25">
          <stop offset="0%" stopColor="#534AB7" />
          <stop offset="60%" stopColor="#7F77DD" />
          <stop offset="100%" stopColor="#AFA9EC" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default ScrumIcon;