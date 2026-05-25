import React from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform, useAnimationFrame, useMotionValue } from 'motion/react';

const IDS = [
  "1517841905240-472988babdf9", "1534528741775-53994a69daeb", "1524504388940-b1c1722653e1",
  "1507003211169-0a1dd7228f2d", "1529626455594-4ff0802cfb7e", "1506794778202-cad84cf45f1d",
  "1531427186611-ecfd6d936c79", "1494790108377-be9c29b29330", "1528892952291-009c663ce843",
  "1552058544-e397bfc48364", "1544005313-94ddf0286df2", "1543610892-0b1f7e6d8ec1",
  "1539571696593-dff42e541f28", "1519345182560-3f2917c472ef", "1509967419530-da38b4704bc6",
  "1521119989659-a83eee488004"
];

function OrbitRing({ radius, count, direction, duration, startIndex }: { radius: number, count: number, direction: 'cw' | 'ccw', duration: number, startIndex: number }) {
  const baseSpeed = 360 / duration; // degrees per second
  const isCW = direction === 'cw';
  const sign = isCW ? 1 : -1;

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [-1000, 0, 1000], [-0.04, 0, 0.04], { clamp: false });

  const rotation = useMotionValue(0);

  useAnimationFrame((t, delta) => {
    // delta is in ms, roughly 16 for 60fps
    let step = baseSpeed * (delta / 1000);
    // Dynamically increase speed proportionally to scroll velocity
    step += Math.abs(velocityFactor.get()) * delta;
    
    rotation.set(rotation.get() + (step * sign));
  });

  // Counter rotation preserves upright image orientation
  const counterRotation = useTransform(rotation, r => -r);

  return (
    <motion.div className="absolute top-0 left-0 w-0 h-0" style={{ rotate: rotation }}>
      {[...Array(count)].map((_, i) => {
        const angle = (360 / count) * i;
        const imgUrl = `https://images.unsplash.com/photo-${IDS[(startIndex + i) % IDS.length]}?w=200&h=200&fit=crop&q=80`;

        return (
          <div
            key={i}
            className="absolute top-0 left-0"
            style={{ transform: `rotate(${angle}deg) translateX(${radius}px)` }}
          >
            {/* Outer div counter-rotates dynamically */}
            <motion.div
              className="absolute -ml-12 -mt-12 sm:-ml-14 sm:-mt-14 w-24 h-24 sm:w-28 sm:h-28"
              style={{ rotate: counterRotation }}
            >
              {/* Inner div cancels the container's static rotation */}
              <div style={{ transform: `rotate(${-angle}deg)` }} className="w-full h-full">
                <img
                  src={imgUrl}
                  alt="Creator"
                  className="w-full h-full object-cover rounded-[1.5rem] md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/80"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}

export default function OrbitingCreatorsScene() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 z-0 pointer-events-none scale-[0.45] sm:scale-50 md:scale-75 lg:scale-100">
       {/* Ring 1 - Inner */}
       <OrbitRing radius={280} count={6} direction="cw" duration={45} startIndex={0} />
       
       {/* Ring 2 - Mid */}
       <OrbitRing radius={480} count={10} direction="ccw" duration={65} startIndex={6} />
       
       {/* Ring 3 - Outer */}
       <OrbitRing radius={700} count={16} direction="cw" duration={85} startIndex={2} />
    </div>
  );
}
