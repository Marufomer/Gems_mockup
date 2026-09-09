export default function GoalBanner() {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 overflow-hidden">
      {/* Target icon */}
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>

      {/* Text */}
      <div>
        <h3 className="font-bold text-gray-900 text-base">Your goal matters</h3>
        <p className="text-gray-500 text-sm">Consistent practice leads to success.</p>
      </div>

      {/* Decorative airplane trail */}
      <div className="absolute right-6 bottom-2 pointer-events-none select-none opacity-40">
        <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" className="w-40 h-14">
          {/* Dashed trail */}
          <path
            d="M10,50 Q60,10 120,30 Q160,45 190,10"
            stroke="#93c5fd"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
          />
          {/* Small plane */}
          <g transform="translate(185,8) rotate(-30)">
            <ellipse cx="0" cy="0" rx="12" ry="4" fill="#2563eb" />
            <polygon points="0,-4 8,-4 12,6 0,6" fill="#1d4ed8" />
            <polygon points="0,4 8,4 12,-6 0,-6" fill="#1d4ed8" />
          </g>
        </svg>
      </div>
    </div>
  )
}
