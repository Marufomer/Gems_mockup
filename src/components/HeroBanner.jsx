export default function HeroBanner({ onStartLearning }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-8"
      style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #93c5fd 100%)',
        minHeight: '200px',
      }}
    >
      {/* Text content */}
      <div className="relative z-10 p-5 sm:p-8 max-w-md">
        <p className="text-blue-700 text-xs sm:text-sm font-medium mb-1">Good Day,</p>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
          Welcome to, Gems-Mockups!
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
          Continue your learning journey. Take your exams,
          <br className="hidden sm:inline" />
          {' '}track your progress and achieve your goals.
        </p>
        <button
          onClick={onStartLearning}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-all duration-200 shadow-md cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z"
              clipRule="evenodd"
            />
          </svg>
          Start Learning
        </button>
      </div>

      {/* Decorative airplane illustration */}
      <div className="absolute right-0 top-0 bottom-0 flex items-end justify-end pointer-events-none select-none overflow-hidden">
        <svg
          viewBox="0 0 420 200"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto opacity-35 sm:opacity-90 transition-opacity"
        >
          {/* Sky background gradient shapes */}
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>

          {/* Cloud 1 */}
          <ellipse cx="320" cy="40" rx="45" ry="18" fill="white" opacity="0.8" />
          <ellipse cx="350" cy="32" rx="30" ry="22" fill="white" opacity="0.8" />
          <ellipse cx="290" cy="38" rx="28" ry="14" fill="white" opacity="0.8" />

          {/* Cloud 2 */}
          <ellipse cx="200" cy="55" rx="32" ry="13" fill="white" opacity="0.6" />
          <ellipse cx="225" cy="46" rx="22" ry="17" fill="white" opacity="0.6" />

          {/* Airplane */}
          <g transform="translate(270,60) rotate(-10)">
            {/* Fuselage */}
            <ellipse cx="0" cy="0" rx="50" ry="11" fill="#2563eb" />
            {/* Nose */}
            <ellipse cx="45" cy="0" rx="12" ry="7" fill="#3b82f6" />
            {/* Tail */}
            <polygon points="-50,0 -65,-18 -45,-2" fill="#1d4ed8" />
            <polygon points="-50,0 -65,18 -45,2" fill="#1d4ed8" />
            {/* Wings */}
            <polygon points="-10,-11 20,-11 35,30 -5,30" fill="#1e40af" />
            <polygon points="-10,11 20,11 35,-30 -5,-30" fill="#1e40af" />
            {/* Window row */}
            <rect x="-5" y="-5" width="38" height="10" rx="5" fill="white" opacity="0.3" />
            {/* Engines */}
            <ellipse cx="18" cy="30" rx="9" ry="4" fill="#1d4ed8" />
            <ellipse cx="18" cy="-30" rx="9" ry="4" fill="#1d4ed8" />
          </g>

          {/* Person silhouette (student with backpack) */}
          <g transform="translate(360,95)">
            {/* Body */}
            <rect x="-14" y="20" width="28" height="60" rx="10" fill="#374151" />
            {/* Head */}
            <circle cx="0" cy="12" r="16" fill="#92400e" />
            {/* Hair */}
            <path d="M-16,10 Q-16,-10 0,-14 Q16,-10 16,10" fill="#1c1917" />
            {/* Backpack */}
            <rect x="10" y="25" width="18" height="35" rx="5" fill="#1d4ed8" />
            <rect x="12" y="30" width="14" height="5" rx="2" fill="#3b82f6" />
            {/* Arms */}
            <rect x="-22" y="22" width="10" height="35" rx="5" fill="#374151" />
          </g>

          {/* Airport/ground elements */}
          <rect x="0" y="170" width="420" height="30" fill="#bfdbfe" opacity="0.5" />
          {/* Runway */}
          <rect x="60" y="165" width="250" height="8" rx="3" fill="#93c5fd" opacity="0.6" />
          {/* Dashed runway marks */}
          {[80, 130, 180, 230, 270].map((x, i) => (
            <rect key={i} x={x} y="167" width="25" height="4" rx="1" fill="white" opacity="0.7" />
          ))}
          {/* Control tower */}
          <rect x="340" y="100" width="18" height="70" rx="3" fill="#93c5fd" />
          <rect x="333" y="90" width="32" height="18" rx="4" fill="#60a5fa" />
        </svg>
      </div>
    </div>
  )
}
