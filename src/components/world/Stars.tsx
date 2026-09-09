/**
 * A faint starfield for the sky, revealed only at dusk/night via the
 * `--star-opacity` CSS variable (set by data-phase). Positions are a fixed,
 * deterministic list so server and client render identically (no hydration
 * mismatch) — they twinkle, they don't wander.
 */
const STARS = [
  [6, 8], [14, 22], [9, 41], [4, 63], [12, 78], [7, 91],
  [20, 15], [24, 34], [18, 52], [26, 70], [22, 88], [30, 6],
  [33, 27], [29, 46], [36, 61], [31, 82], [38, 12], [41, 38],
  [37, 55], [44, 73], [40, 95], [16, 4], [11, 30], [27, 58],
  [34, 96], [8, 50], [19, 66], [42, 24], [13, 87], [23, 3],
  [39, 84], [5, 19], [46, 48], [45, 68], [17, 74], [10, 12],
];

export function Stars() {
  return (
    <div className="stars" aria-hidden>
      {STARS.map(([top, left], i) => (
        <i
          key={i}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            animationDelay: `${(i % 7) * 0.4}s`,
            transform: i % 3 === 0 ? "scale(1.5)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
