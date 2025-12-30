// src/components/AmountSlider.jsx
import styles from './order.module.css';

export default function AmountSlider({ percent, onChange }) {
  // ✅ 确保 percent 是数字
  const safePercent = typeof percent === 'number' ? percent : 0;

  const handleChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && onChange) {
      onChange(value);
    }
  };

  const handleMarkClick = (p) => {
    if (onChange) onChange(p);
  };

  return (
    <div className={styles.sliderWrap}>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={safePercent}
        onChange={handleChange}
      />
      <div className={styles.sliderMarks}>
        {[0, 25, 50, 75, 100].map(p => (
          <span
            key={p}
            className={safePercent === p ? styles.active : ''}
            onClick={() => handleMarkClick(p)}
          >
            {p}%
          </span>
        ))}
      </div>
    </div>
  );
}