import React, { useEffect, useRef } from 'react';

export default function BorderCat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const emoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    // Config
    const s = 32; // size of cat
    
    // Physics
    let x = 0;
    let y = 0;
    let edge = 0; // 0=top, 1=right, 2=bottom, 3=left
    let cw = true; // clockwise
    
    let state = 'walking';
    let actionTimeLeft = 0;
    
    let baseSpeedBase = 100; // pixels per second
    
    // Timers
    let nextBehaviorTime = lastTime + 10000 + Math.random() * 10000;
    let nextFallTime = lastTime + 45000 + Math.random() * 45000;
    let nextEmoteTime = lastTime + 30000 + Math.random() * 30000;
    
    // Fall variables
    let fallVy = 0;
    let rotation = 90;
    let fallRotation = 0;

    let targetRotationOverride: number | null = null;
    let overrideTimeLeft = 0;
    
    const EMOTES = ['😺 Meow!', '😸 Hehe', '😹 LOL', '🐾 *pounce*', '😻 Aww', '💤 Zzz...', '😼 *judging*', '🙀 Boo!'];

    const showEmoteText = (text: string, duration = 2000) => {
      if (!emoteRef.current) return;
      emoteRef.current.textContent = text;
      emoteRef.current.style.opacity = '1';
      emoteRef.current.style.transform = 'translateY(-24px) scale(1)';
      setTimeout(() => {
        if (emoteRef.current) {
          emoteRef.current.style.opacity = '0';
          emoteRef.current.style.transform = 'translateY(0) scale(0.8)';
        }
      }, duration);
    };

    const handleGlobalClick = (e: MouseEvent) => {
      // Disabled the eye tracking on click
    };
    
    window.addEventListener('click', handleGlobalClick);
    
    const update = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // max dt 100ms to prevent glitches if tab is backgrounded
      lastTime = time;
      
      let w = window.innerWidth;
      let h = window.innerHeight;
      
      // Handle overriding face direction from click
      if (overrideTimeLeft > 0) {
         overrideTimeLeft -= dt * 1000;
         if (overrideTimeLeft <= 0) targetRotationOverride = null;
      }

      // Handle timers
      if (state !== 'falling' && state !== 'shaking' && state !== 'looking') {
        if (time > nextFallTime && edge === 0 && x > 50 && x < w - 50) {
            // Initiate fall - must be on top edge!
            state = 'falling';
            fallVy = 0;
            fallRotation = 0;
            nextFallTime = time + 45000 + Math.random() * 45000;
        } else if (time > nextBehaviorTime) {
            const rand = Math.random();
            if (rand < 0.33) {
                state = 'sitting';
                actionTimeLeft = 3000; // sit 3 seconds
            } else if (rand < 0.66) {
                state = 'running';
                actionTimeLeft = 3000; // run 3 seconds
            } else {
                state = 'zoomies';
                cw = !cw; // switch direction
                actionTimeLeft = 4000; // 4 seconds zoom
            }
            nextBehaviorTime = time + 10000 + Math.random() * 15000;
        } else if (time > nextEmoteTime) {
            showEmoteText(EMOTES[Math.floor(Math.random() * EMOTES.length)]);
            nextEmoteTime = time + 30000 + Math.random() * 30000;
        } else if (actionTimeLeft <= 0) {
            state = 'walking';
        }
      }
      
      if (actionTimeLeft > 0) {
          actionTimeLeft -= dt * 1000;
      }
      if (state === 'shaking') {
          if (actionTimeLeft <= 0) state = 'walking';
      }

      // Movement Logic
      let speedMultiplier = 1;
      if (state === 'running') speedMultiplier = 2.5;
      if (state === 'zoomies') speedMultiplier = 3.5;
      if (state === 'sitting' || state === 'looking' || state === 'shaking') speedMultiplier = 0;
      
      let ds = baseSpeedBase * speedMultiplier * dt;
      
      if (state === 'falling') {
         fallVy += 1200 * dt; // gravity
         y += fallVy * dt;
         fallRotation += 720 * dt; // degrees per second
         
         if (y >= h - s) {
             y = h - s;
             state = 'shaking';
             actionTimeLeft = 1000;
             edge = 2; // on bottom edge now
             fallRotation = 0;
         }
      } else if (ds > 0) {
         if (cw) {
           if (edge === 0) { x += ds; if (x >= w - s) { x = w - s; edge = 1; } }
           else if (edge === 1) { y += ds; if (y >= h - s) { y = h - s; edge = 2; } }
           else if (edge === 2) { x -= ds; if (x <= 0) { x = 0; edge = 3; } }
           else if (edge === 3) { y -= ds; if (y <= 0) { y = 0; edge = 0; } }
         } else {
           if (edge === 0) { x -= ds; if (x <= 0) { x = 0; edge = 3; } }
           else if (edge === 3) { y += ds; if (y >= h - s) { y = h - s; edge = 2; } }
           else if (edge === 2) { x += ds; if (x >= w - s) { x = w - s; edge = 1; } }
           else if (edge === 1) { y -= ds; if (y <= 0) { y = 0; edge = 0; } }
         }
      }
      
      // Clamp bounds silently to prevent breaking on window resize 
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > w - s) x = w - s;
      if (y > h - s) y = h - s;

      // Rotation calculations
      if (state === 'falling') {
         rotation = 90 + fallRotation;
      } else if (targetRotationOverride !== null) {
         // Smooth shortest path rotation isn't strictly necessary for a cat, direct override is fine
         rotation = targetRotationOverride;
      } else {
          // Standard edge rotations
          if (cw) {
              if (edge === 0) rotation = 90;
              else if (edge === 1) rotation = 180;
              else if (edge === 2) rotation = 270;
              else if (edge === 3) rotation = 360; 
          } else {
              if (edge === 0) rotation = -90;
              else if (edge === 3) rotation = 180;
              else if (edge === 2) rotation = 90;
              else if (edge === 1) rotation = 0;
          }
      }
      
      // Update DOM
      if (containerRef.current) {
         containerRef.current.style.transform = `translate(${x}px, ${y}px)`;
         containerRef.current.setAttribute('data-state', state);
      }
      if (catRef.current) {
         // manage CSS transition explicitly
         if (state === 'falling') {
             catRef.current.style.transition = 'none';
         } else {
             catRef.current.style.transition = 'transform 0.2s ease-in-out';
         }
         catRef.current.style.transform = `rotate(${rotation}deg)`;
      }
      
      animationFrameId = requestAnimationFrame(update);
    };
    
    animationFrameId = requestAnimationFrame(update);
    
    return () => {
       cancelAnimationFrame(animationFrameId);
       window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <>
      <style>{`
        /* Colors and Glow */
        .cat-container {
            color: #2dd4bf; /* teal by default */
            filter: drop-shadow(0 0 8px rgba(45, 212, 191, 0.8));
            transition: color 0.3s, filter 0.3s;
        }
        .cat-container[data-state="running"], .cat-container[data-state="zoomies"] {
            color: #f97316; /* orange */
            filter: drop-shadow(0 0 10px rgba(249, 115, 22, 1));
        }
        .cat-container[data-state="falling"], .cat-container[data-state="shaking"] {
            color: #c084fc; /* purple */
            filter: drop-shadow(0 0 12px rgba(192, 132, 252, 1));
        }

        /* Animations */
        @keyframes walk-legs-1 {
            0%, 100% { transform: translateY(-2px); }
            50% { transform: translateY(2px); }
        }
        @keyframes walk-legs-2 {
            0%, 100% { transform: translateY(2px); }
            50% { transform: translateY(-2px); }
        }
        @keyframes body-bob {
            0%, 100% { transform: scaleX(1) scaleY(1); }
            50% { transform: scaleX(1.05) scaleY(0.95); }
        }
        @keyframes tail-wag {
            0%, 100% { transform: rotate(-5deg); transform-origin: 16px 26px; }
            50% { transform: rotate(15deg); transform-origin: 16px 26px; }
        }

        /* Applying animations based on state */
        .cat-container[data-state="walking"] .leg-fl,
        .cat-container[data-state="walking"] .leg-br {
            animation: walk-legs-1 0.6s infinite ease-in-out;
        }
        .cat-container[data-state="walking"] .leg-fr,
        .cat-container[data-state="walking"] .leg-bl {
            animation: walk-legs-2 0.6s infinite ease-in-out;
        }

        .cat-container[data-state="running"] .leg-fl,
        .cat-container[data-state="zoomies"] .leg-fl,
        .cat-container[data-state="running"] .leg-br,
        .cat-container[data-state="zoomies"] .leg-br {
            animation: walk-legs-1 0.2s infinite ease-in-out;
        }
        .cat-container[data-state="running"] .leg-fr,
        .cat-container[data-state="zoomies"] .leg-fr,
        .cat-container[data-state="running"] .leg-bl,
        .cat-container[data-state="zoomies"] .leg-bl {
            animation: walk-legs-2 0.2s infinite ease-in-out;
        }

        .cat-container[data-state="walking"] .cat-body-core,
        .cat-container[data-state="walking"] .cat-head {
            animation: body-bob 0.3s infinite alternate;
            transform-origin: center;
        }
        .cat-container[data-state="running"] .cat-body-core,
        .cat-container[data-state="zoomies"] .cat-body-core,
        .cat-container[data-state="running"] .cat-head,
        .cat-container[data-state="zoomies"] .cat-head {
            animation: body-bob 0.15s infinite alternate;
            transform-origin: center;
        }

        .cat-tail {
            animation: tail-wag 1s infinite ease-in-out;
        }
        .cat-container[data-state="running"] .cat-tail,
        .cat-container[data-state="zoomies"] .cat-tail {
            animation: tail-wag 0.3s infinite ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px) rotate(-10deg); }
            75% { transform: translateX(3px) rotate(10deg); }
        }
        .cat-container[data-state="shaking"] .cat-svg {
            animation: shake 0.2s infinite;
        }
      `}</style>

      <div 
         ref={containerRef} 
         className="fixed top-0 left-0 z-[9999] pointer-events-none cat-container"
         data-state="walking"
      >
         {/* Floating Emote */}
         <div 
           ref={emoteRef} 
           className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-[13px] font-bold transition-all duration-300 opacity-0 whitespace-nowrap bg-neutral-900/90 text-white px-2.5 py-1 rounded-xl shadow-xl drop-shadow-[0_0_10px_rgba(45,212,191,0.5)] z-10 font-display flex items-center justify-center border border-white/10"
         >
         </div>
         
         {/* Cat Graphic */}
         <div ref={catRef} className="w-8 h-8 flex items-center justify-center origin-center">
            <svg width="32" height="32" viewBox="0 0 32 32" className="cat-svg w-8 h-8 overflow-visible">
              <g>
                {/* Legs */}
                <rect className="leg-fl" x="6" y="10" width="4" height="6" rx="2" fill="currentColor" />
                <rect className="leg-fr" x="22" y="10" width="4" height="6" rx="2" fill="currentColor" />
                <rect className="leg-bl" x="6" y="19" width="4" height="6" rx="2" fill="currentColor" />
                <rect className="leg-br" x="22" y="19" width="4" height="6" rx="2" fill="currentColor" />
                
                {/* Tail */}
                <path className="cat-tail" d="M 16 25 Q 16 34 8 30" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                
                {/* Body Core */}
                <rect className="cat-body-core" x="10" y="8" width="12" height="19" rx="6" fill="currentColor" />
                
                {/* Head */}
                <g className="cat-head">
                  <circle cx="16" cy="8" r="7" fill="currentColor" />
                  <polygon points="10,4 12,-2 16,3" fill="currentColor" />
                  <polygon points="22,4 20,-2 16,3" fill="currentColor" />
                  <circle cx="13" cy="7" r="1.5" fill="#171717" />
                  <circle cx="19" cy="7" r="1.5" fill="#171717" />
                  <polygon points="15,9 17,9 16,10" fill="#f43f5e" />
                </g>
              </g>
            </svg>
         </div>
      </div>
    </>
  );
}

