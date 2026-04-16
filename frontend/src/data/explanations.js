// ── ALGORITHM EXPLANATIONS ───────────────────────────────────
const EXPLANATIONS = {
  'Bubble Sort': {
    how: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The larger elements "bubble up" to the top of the array with each pass. After each full pass, the last unsorted element is guaranteed to be in its correct position.',
    uses: ['Teaching sorting concepts', 'Nearly sorted small arrays', 'When simplicity > performance', 'Detecting if an array is already sorted'],
    props: ['In-place sorting (O(1) space)', 'Stable sort (preserves equal elements order)', 'Adaptive — stops early if no swaps occur', 'n-1 passes maximum', 'Best for very small or nearly sorted arrays'],
  },
  'Selection Sort': {
    how: 'Selection Sort divides the array into a sorted and unsorted region. It repeatedly finds the minimum element from the unsorted region and places it at the beginning of that region. This continues until the entire array is sorted.',
    uses: ['Small datasets', 'Memory-constrained systems', 'When write operations are expensive', 'When number of swaps must be minimized'],
    props: ['In-place sorting (O(1) space)', 'Unstable sort (may reorder equal elements)', 'Always exactly n-1 swaps', 'Always O(n²) comparisons — not adaptive', 'Predictable performance regardless of input'],
  },
  'Insertion Sort': {
    how: 'Insertion Sort builds the sorted array one element at a time. It takes each element from the unsorted part and inserts it into its correct position in the sorted part. Similar to sorting playing cards in your hand.',
    uses: ['Nearly sorted data', 'Online sorting (stream of data)', 'Small arrays (n < 20)', 'As base case in hybrid sorts like TimSort'],
    props: ['In-place sorting (O(1) space)', 'Stable sort', 'Adaptive — very fast on nearly sorted data', 'Simple to implement and understand', 'Used inside TimSort and IntroSort'],
  },
  'Merge Sort': {
    how: 'Merge Sort uses the divide-and-conquer strategy. It recursively splits the array into two halves, sorts each half, then merges them back together. The merge step compares elements from both halves and places them in sorted order.',
    uses: ['Large datasets requiring guaranteed performance', 'Linked list sorting (no random access needed)', 'External sorting (data larger than memory)', 'When stable sorting is required'],
    props: ['Out-of-place (requires O(n) extra memory)', 'Stable sort', 'Guaranteed O(n log n) — always', 'Excellent for linked lists', 'Parallelizable (divide step is independent)'],
  },
  'Quick Sort': {
    how: 'Quick Sort selects a pivot element and partitions the array into two sub-arrays: elements less than the pivot and elements greater than the pivot. It then recursively applies the same process to each sub-array. The pivot ends up in its final sorted position after each partition.',
    uses: ['General-purpose sorting in practice', 'Most standard library sort implementations', 'Cache-efficient in-place sorting', 'Large random datasets'],
    props: ['In-place sorting (O(log n) stack space)', 'Unstable sort', 'Average O(n log n) — fastest in practice', 'Worst case O(n²) with poor pivot choice', 'Cache-friendly memory access pattern'],
  },
  'Heap Sort': {
    how: 'Heap Sort first builds a max-heap from the array (where the largest element is always at the root). It then repeatedly extracts the maximum element from the heap and places it at the end of the array, reducing the heap size by one each time.',
    uses: ['Systems requiring guaranteed O(n log n)', 'Embedded systems with limited memory', 'When predictable worst-case is required', 'Priority queue operations'],
    props: ['In-place sorting (O(1) space)', 'Unstable sort', 'Guaranteed O(n log n) always', 'Not cache-friendly (poor locality)', 'Used in IntroSort for worst-case guarantee'],
  },
  'Shell Sort': {
    how: 'Shell Sort is an optimization of Insertion Sort that allows comparison and swapping of elements far apart. It starts with a large gap between compared elements and reduces the gap until it becomes 1, at which point it performs a final insertion sort pass. The pre-sorted state makes the final pass very efficient.',
    uses: ['Medium-sized arrays', 'Embedded systems (simple implementation)', 'When Insertion Sort is too slow', 'When code simplicity matters'],
    props: ['In-place sorting (O(1) space)', 'Unstable sort', 'Better than Insertion Sort in practice', 'Performance depends on gap sequence', 'Simple to implement, better than O(n²) average'],
  },
};
