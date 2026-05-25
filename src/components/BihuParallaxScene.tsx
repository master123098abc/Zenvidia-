import React from 'react';

const Japi = ({ className = "" }) => (
  <svg viewBox="0 0 100 60" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 Q 50 10 90 50 L 80 55 Q 50 20 20 55 Z" fill="#dc2626" />
    <path d="M20 55 Q 50 20 80 55 L 70 60 Q 50 30 30 60 Z" fill="#fbbf24" />
    <polygon points="50,5 60,50 40,50" fill="#dc2626" />
    <path d="M5 55 Q 50 5 95 55 Z" fill="none" stroke="#F97316" strokeWidth="2" />
  </svg>
);

const DancerFemale = ({ color = "#06B6D4", className = "" }) => (
  <svg viewBox="0 0 100 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="20" r="15" fill={color} opacity="0.9" />
    <path d="M 35 40 Q 50 30 65 40 L 80 140 Q 50 150 20 140 Z" fill={color} opacity="0.8" />
    <path d="M 35 40 Q 10 60 20 90" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M 65 40 Q 90 60 80 90" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M 25 120 Q 50 130 75 120" fill="none" stroke="#dc2626" strokeWidth="4" />
  </svg>
);

const DancerMale = ({ color = "#F97316", className = "" }) => (
  <svg viewBox="0 0 100 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="20" r="12" fill={color} opacity="0.9" />
    <path d="M 20 15 Q 50 -10 80 15 L 50 25 Z" fill="#dc2626" />
    <path d="M 35 40 L 65 40 L 60 100 L 40 100 Z" fill={color} opacity="0.8" />
    <path d="M 40 100 L 30 140 L 50 120 L 70 140 L 60 100 Z" fill="#FAFAFA" stroke={color} strokeWidth="2" />
    <path d="M 35 45 Q 10 70 40 80" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M 65 45 Q 90 70 60 80" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="50" cy="80" rx="20" ry="10" fill="#dc2626" />
  </svg>
);

const KopouFlower = ({ color = "#06B6D4", className = "" }) => (
  <svg viewBox="0 0 50 50" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M25 5 C 35 15 45 20 45 25 C 45 30 35 40 25 45 C 15 40 5 30 5 25 C 5 20 15 15 25 5 Z" fill={color} opacity="0.7" />
    <circle cx="25" cy="25" r="5" fill="#fff" opacity="0.8" />
  </svg>
);

export default function BihuParallaxScene() {
  return (
    <div className="parallax-container">
      
      {/* ---------------- LAYER 1: BACK (Slowest, smallest, blurriest) ---------------- */}
      <div className="parallax-layer depth-back">
        <div className="move-lr-slow absolute bottom-[20%] w-16" style={{ animationDelay: '-10s' }}>
          <div className="sway-1"><DancerFemale color="#06b6d4" /></div>
        </div>
        <div className="move-rl-slow absolute bottom-[15%] w-16" style={{ animationDelay: '-5s' }}>
          <div className="sway-2"><DancerMale color="#f97316" /></div>
        </div>
        <div className="flower-up-slow absolute left-[20%] w-6" style={{ animationDelay: '-8s' }}>
          <KopouFlower color="#f97316" />
        </div>
        <div className="flower-up-slow absolute left-[80%] w-5" style={{ animationDelay: '-15s' }}>
          <KopouFlower color="#06b6d4" />
        </div>
      </div>

      {/* ---------------- LAYER 2: MID (Medium speed, medium size, slight blur) ---------------- */}
      <div className="parallax-layer depth-mid">
        <div className="move-lr-mid absolute bottom-[10%] w-24" style={{ animationDelay: '-3s' }}>
          <div className="sway-2"><DancerFemale color="#f97316" /></div>
        </div>
        <div className="move-rl-mid absolute bottom-[8%] w-24" style={{ animationDelay: '-14s' }}>
          <div className="sway-1"><DancerMale color="#06b6d4" /></div>
        </div>
        <div className="move-lr-mid absolute bottom-[5%] w-20" style={{ animationDelay: '-20s' }}>
          <div className="sway-1"><DancerFemale color="#0ed7fa" /></div>
        </div>
        <div className="flower-up-mid absolute left-[40%] w-8" style={{ animationDelay: '-4s' }}>
          <KopouFlower color="#06b6d4" />
        </div>
        <div className="flower-up-mid absolute left-[60%] w-7" style={{ animationDelay: '-12s' }}>
          <KopouFlower color="#f97316" />
        </div>
      </div>

      {/* ---------------- LAYER 3: FRONT (Fastest, largest, sharp) ---------------- */}
      <div className="parallax-layer depth-front">
        <div className="move-lr-fast absolute bottom-[-5%] w-36" style={{ animationDelay: '-7s' }}>
          <div className="sway-1"><DancerFemale color="#06b6d4" /></div>
        </div>
        <div className="move-rl-fast absolute bottom-[-2%] w-36" style={{ animationDelay: '-1s' }}>
          <div className="sway-2"><DancerMale color="#f97316" /></div>
        </div>
        
        {/* Falling Flowers */}
        <div className="flower-down-fast absolute left-[30%] w-10 text-orange-500" style={{ animationDelay: '0s' }}>
           <KopouFlower color="#f97316" />
        </div>
        <div className="flower-down-fast absolute left-[70%] w-12 text-cyan-500" style={{ animationDelay: '-5s' }}>
           <KopouFlower color="#06b6d4" />
        </div>
        <div className="flower-down-fast absolute left-[10%] w-8 text-orange-500" style={{ animationDelay: '-8s' }}>
           <KopouFlower color="#f97316" />
        </div>
      </div>
      
    </div>
  );
}
