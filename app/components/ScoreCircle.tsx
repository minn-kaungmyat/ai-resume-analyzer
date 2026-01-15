const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);
  const scoreColor = getScoreColor(score);

  return (
    <div className="relative w-[90px] h-[90px] flex-shrink-0">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 90 90"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="45"
          cy="45"
          r={normalizedRadius}
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="white"
        />
        {/* Progress circle */}
        <circle
          cx="45"
          cy="45"
          r={normalizedRadius}
          stroke={scoreColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>

      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-xl text-charcoal">{score}</span>
        <span className="text-[10px] text-muted font-medium">SCORE</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
