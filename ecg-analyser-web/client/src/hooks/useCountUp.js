import { useEffect, useState } from 'react';

export default function useCountUp(end, duration = 1500, startOn = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startOn) return;

    let startTimestamp = null;
    const numericEnd = parseFloat(end) || 0;
    const isDecimal = numericEnd % 1 !== 0;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(isDecimal ? parseFloat((progress * numericEnd).toFixed(1)) : Math.floor(progress * numericEnd));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [end, duration, startOn]);

  const str = end.toString();
  if (str.includes('+')) return `${count}+`;
  if (str.includes('%')) return `${count}%`;
  return count.toString();
}
