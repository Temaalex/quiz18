import { useState, useEffect } from 'react';

// Импортируем все 10 картинок
import img1 from '../img/One.png';
import img2 from '../img/Two.png';
import img3 from '../img/Three.png';
import img4 from '../img/Four.png';
import img5 from '../img/Five.png';
import img6 from '../img/Six.png';
import img7 from '../img/Seven.png';
import img8 from '../img/Eight.png';
import img9 from '../img/Nine.png';
import img10 from '../img/Ten.png';

const glassImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

const RealisticBrokenGlass = ({ duration = 800, crackLevel = 1 }) => {
  const imageSrc = glassImages[(crackLevel - 1) % glassImages.length];

  const [isVisible, setIsVisible] = useState(false);
  const [mask, setMask] = useState('');
  const [flickerOpacity, setFlickerOpacity] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    setFlickerOpacity(0);
    setMask('radial-gradient(circle at 0% 50%, black 100%, transparent 100%)');

    const startTime = performance.now();

  
const flickerIntervals = [0, 50, 100, 150, 200, 300, 400, 550, 700, 900, 1100, 1300, 1500, 1700, 1900];
const flickerDurationMs = 30; // Очень быстрые вспышки

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const p = Math.min(elapsed / duration, 1);

      const inner = 100 - p * 80;
      const feather = 20 + p * 20;
      const outer = Math.min(inner + feather, 100);

      setMask(`radial-gradient(circle at 50% 50%, black ${inner}%, transparent ${outer}%)`);

      let isFlickering = false;
      for (const timePoint of flickerIntervals) {
        if (elapsed >= timePoint && elapsed <= timePoint + flickerDurationMs) {
          isFlickering = true;
          break;
        }
      }
      setFlickerOpacity(isFlickering ? 1 : 0);

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsVisible(false);
      }
    };

    requestAnimationFrame(animate);

    return () => {};
  }, [duration, crackLevel]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <img
        src={imageSrc}
        alt="broken glass"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          animation: 'popIn 0.2s ease-out forwards',
          filter: 'contrast(1.4) brightness(0.8) saturate(1.2)',
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />

      <img
        src={imageSrc}
        alt="flicker"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'contrast(1.4) brightness(0.8) saturate(1.2)',
          opacity: flickerOpacity,
          willChange: 'opacity',
        }}
      />
    </div>
  );
};

export default RealisticBrokenGlass;
