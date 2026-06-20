export function FloraFileIcon({ className, size = 24 }: { className?: string; size?: number | string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="1 0.5 22 22" 
      width={size} 
      height={size}
      className={className}
    >
      {/* Folder outline */}
      <path 
        d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Filled Leaf */}
      <g transform="translate(5.675, 6.3) scale(0.55)">
        <path d="M11 20A7 7 0 0 1 14 6h7v7a7 7 0 0 1-7 7h-3Z" fill="currentColor" />
        <path d="M2 22l6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
