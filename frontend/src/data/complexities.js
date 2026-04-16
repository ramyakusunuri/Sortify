// ── COMPLEXITY DATA ──────────────────────────────────────────
const COMPLEXITIES = {
  'Bubble Sort': {
    rows: [['Best','O(n)','O(1)','Already sorted'],['Average','O(n²)','O(1)','Random array'],['Worst','O(n²)','O(1)','Reverse sorted']],
    stable: true, inPlace: true,
  },
  'Selection Sort': {
    rows: [['Best','O(n²)','O(1)','Always n² comparisons'],['Average','O(n²)','O(1)','Always n² comparisons'],['Worst','O(n²)','O(1)','Always n² comparisons']],
    stable: false, inPlace: true,
  },
  'Insertion Sort': {
    rows: [['Best','O(n)','O(1)','Nearly sorted'],['Average','O(n²)','O(1)','Random array'],['Worst','O(n²)','O(1)','Reverse sorted']],
    stable: true, inPlace: true,
  },
  'Merge Sort': {
    rows: [['Best','O(n log n)','O(n)','Always'],['Average','O(n log n)','O(n)','Always'],['Worst','O(n log n)','O(n)','Always']],
    stable: true, inPlace: false,
  },
  'Quick Sort': {
    rows: [['Best','O(n log n)','O(log n)','Good pivot'],['Average','O(n log n)','O(log n)','Random pivot'],['Worst','O(n²)','O(log n)','Already sorted']],
    stable: false, inPlace: true,
  },
  'Heap Sort': {
    rows: [['Best','O(n log n)','O(1)','Always'],['Average','O(n log n)','O(1)','Always'],['Worst','O(n log n)','O(1)','Always']],
    stable: false, inPlace: true,
  },
  'Shell Sort': {
    rows: [['Best','O(n log n)','O(1)','Good gap sequence'],['Average','O(n log²n)','O(1)','Depends on gaps'],['Worst','O(n²)','O(1)','Poor gap sequence']],
    stable: false, inPlace: true,
  },
};
