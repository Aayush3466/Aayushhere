/** Content for the game-room typing tests. */

// A flat pool of typeable words.
const WORD_POOL = [
  "the","of","and","to","in","is","for","it","with","as","on","be","at","by","have","from","or",
  "they","this","that","which","one","were","been","has","when","will","more","other","new","time",
  "into","than","first","only","could","make","world","work","long","learn","model","neural","network",
  "data","train","test","build","system","design","review","deploy","signal","noise","sample","vector",
  "matrix","optimize","search","graph","token","layer","weight","gradient","tensor","feature","score",
  "island","coast","river","ocean","north","harbor","lantern","paper","ink","chart","voyage","compass",
];

/** A random line of words for the typing test. */
export function makeWordsText(count = 34): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
  }
  return out.join(" ");
}

/** Short, real JavaScript snippets for the code-typing test (refresh for more). */
export const CODE_SNIPPETS: string[] = [
  `function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
  `const sum = (nums) => nums.reduce((total, n) => total + n, 0);
const evens = list.filter((x) => x % 2 === 0);
const names = users.map((u) => u.name);`,
  `async function getUser(id) {
  const res = await fetch("/api/users/" + id);
  if (!res.ok) throw new Error("not found");
  return res.json();
}`,
  `function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}`,
  `const unique = (arr) => [...new Set(arr)];
const flat = (arr) => arr.flat(Infinity);
const last = (arr) => arr.at(-1);`,
  `class Stack {
  items = [];
  push(x) { this.items.push(x); }
  pop() { return this.items.pop(); }
  get size() { return this.items.length; }
}`,
  `const groupBy = (list, key) =>
  list.reduce((acc, item) => {
    (acc[item[key]] ??= []).push(item);
    return acc;
  }, {});`,
  `function fib(n) {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}`,
  `const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);
const double = (n) => n * 2;
const inc = (n) => n + 1;`,
  `async function retry(fn, times = 3) {
  for (let i = 0; i < times; i++) {
    try { return await fn(); }
    catch (err) { if (i === times - 1) throw err; }
  }
}`,
  `const memoize = (fn) => {
  const cache = new Map();
  return (n) => cache.get(n) ?? cache.set(n, fn(n)).get(n);
};`,
  `function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size)
    out.push(arr.slice(i, i + size));
  return out;
}`,
  `const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const slugify = (s) => s.toLowerCase().trim().replace(/\\s+/g, "-");`,
  `useEffect(() => {
  const id = setInterval(() => setTick((t) => t + 1), 1000);
  return () => clearInterval(id);
}, []);`,
  `const sorted = [...items].sort((a, b) => a.price - b.price);
const total = items.reduce((sum, i) => sum + i.price, 0);`,
];

export function randomSnippet(): string {
  return CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
}
