// ── QUIZ DATA (4+ questions per algorithm) ───────────────────
const QUIZ_DATA = {
  'Bubble Sort': [
    { q:'What is the worst-case time complexity of Bubble Sort?', opts:['O(n)','O(n log n)','O(n²)','O(log n)'], ans:2, exp:'Bubble Sort compares all pairs in the worst case (reverse sorted array), giving O(n²).' },
    { q:'After the FIRST complete pass of Bubble Sort, what is guaranteed?', opts:['Smallest element at index 0','Largest element at last index','Array is sorted','Middle element in place'], ans:1, exp:'The largest element bubbles up to the last position after the first full pass.' },
    { q:'What makes Bubble Sort stop early in the best case?', opts:['Finding the minimum','A sorted pass with no swaps','Reaching the midpoint','None of the above'], ans:1, exp:'If no swaps occur in a pass, the array is sorted — Bubble Sort can terminate early.' },
    { q:'Is Bubble Sort a stable sorting algorithm?', opts:['Yes','No','Depends on implementation','Only for numbers'], ans:0, exp:'Bubble Sort is stable — equal elements maintain their relative order.' },
    { q:'How many swaps does Bubble Sort make in the worst case?', opts:['O(n)','O(n²)','O(n log n)','O(1)'], ans:1, exp:'In the worst case (reverse sorted), every comparison results in a swap — O(n²) swaps.' },
  ],
  'Selection Sort': [
    { q:'What is the maximum number of swaps Selection Sort performs?', opts:['O(n²)','O(n)','O(n log n)','O(1)'], ans:1, exp:'Selection Sort does at most n-1 swaps — one swap per pass to place the minimum.' },
    { q:'Is Selection Sort stable?', opts:['Yes','No','Depends','Only with extra memory'], ans:1, exp:'Selection Sort is NOT stable — it may change the relative order of equal elements during swaps.' },
    { q:'Selection Sort is best when?', opts:['Writes to memory are expensive','Array is already sorted','Array is very large','Order doesn\'t matter'], ans:0, exp:'Selection Sort minimizes writes (n-1 swaps), making it ideal when write operations are costly.' },
    { q:'What does Selection Sort find in each iteration?', opts:['Maximum element','Minimum element','Median element','Pivot element'], ans:1, exp:'Selection Sort finds the minimum element in the unsorted portion and places it at the beginning.' },
    { q:'What is the time complexity of Selection Sort for ALL cases?', opts:['O(n)','O(n log n)','O(n²)','O(log n)'], ans:2, exp:'Selection Sort always makes O(n²) comparisons regardless of input — it is NOT adaptive.' },
  ],
  'Insertion Sort': [
    { q:'What is the best-case time complexity of Insertion Sort?', opts:['O(n²)','O(n log n)','O(n)','O(1)'], ans:2, exp:'When the array is already sorted, each element only needs one comparison — O(n) total.' },
    { q:'Which real use case suits Insertion Sort best?', opts:['Large random arrays','Nearly sorted or small data','Linked list sorting','External sorting'], ans:1, exp:'Insertion Sort is very efficient on nearly sorted data and small arrays.' },
    { q:'Is Insertion Sort stable?', opts:['Yes','No','Depends','Sometimes'], ans:0, exp:'Insertion Sort is stable — equal elements are never swapped past each other.' },
    { q:'Insertion Sort builds the sorted array…', opts:['From right to left','One element at a time from left','Using a divide step','By finding minimum each time'], ans:1, exp:'Insertion Sort grows a sorted subarray from left to right, inserting one element per step.' },
    { q:'Insertion Sort is similar to sorting…', opts:['A stack of books','Playing cards in your hand','Binary search tree','A linked list'], ans:1, exp:'Insertion Sort mimics how you sort playing cards — picking each card and inserting it in the right place.' },
  ],
  'Merge Sort': [
    { q:'Merge Sort is based on which algorithmic paradigm?', opts:['Greedy','Dynamic Programming','Divide and Conquer','Backtracking'], ans:2, exp:'Merge Sort divides the problem in half, solves each half recursively, then combines.' },
    { q:'What is the space complexity of Merge Sort?', opts:['O(1)','O(log n)','O(n)','O(n²)'], ans:2, exp:'Merge Sort requires O(n) auxiliary space to hold the merged subarrays.' },
    { q:'Is Merge Sort stable?', opts:['Yes','No','Depends on implementation','Only for numbers'], ans:0, exp:'Merge Sort is stable — equal elements from the left subarray are placed before right.' },
    { q:'What is the time complexity of the merge step alone?', opts:['O(1)','O(n)','O(n log n)','O(log n)'], ans:1, exp:'Merging two sorted arrays of total size n takes O(n) comparisons.' },
    { q:'Why is Merge Sort preferred for linked lists?', opts:['It uses less memory','It does not need random access','It is faster','It is simpler'], ans:1, exp:'Linked lists do not support random access, but Merge Sort only needs sequential access.' },
  ],
  'Quick Sort': [
    { q:'What element does Quick Sort use to partition the array?', opts:['Minimum element','Maximum element','Pivot element','Median always'], ans:2, exp:'Quick Sort selects a pivot and partitions the array around it.' },
    { q:'What is the average-case time complexity of Quick Sort?', opts:['O(n²)','O(n log n)','O(n)','O(log n)'], ans:1, exp:'On average with good pivots, Quick Sort runs in O(n log n).' },
    { q:'When does Quick Sort have O(n²) worst case?', opts:['Random array','Pivot is always median','Array is already sorted (pivot = last)','All elements are equal'], ans:2, exp:'When the pivot is always the smallest or largest, partitions are unbalanced — O(n²).' },
    { q:'Is Quick Sort stable?', opts:['Yes','No','Only in-place version','Only with 3-way partition'], ans:1, exp:'Quick Sort is NOT stable — equal elements may be reordered during partitioning.' },
    { q:'Quick Sort is generally faster than Merge Sort because?', opts:['Lower time complexity','Better cache performance and in-place','Less code','More stable'], ans:1, exp:'Quick Sort has better cache locality (in-place) and lower constant factors in practice.' },
  ],
  'Heap Sort': [
    { q:'What data structure does Heap Sort primarily use?', opts:['Stack','Queue','Max-Heap (Binary Heap)','BST'], ans:2, exp:'Heap Sort first builds a max-heap, then extracts the root repeatedly.' },
    { q:'Space complexity of Heap Sort?', opts:['O(n)','O(log n)','O(1)','O(n log n)'], ans:2, exp:'Heap Sort is in-place — it only uses O(1) auxiliary space (ignoring recursion stack).' },
    { q:'Is Heap Sort stable?', opts:['Yes','No','Depends','Only for integers'], ans:1, exp:'Heap Sort is NOT stable — elements may be reordered during heapify operations.' },
    { q:'What is the worst-case time complexity of Heap Sort?', opts:['O(n²)','O(n)','O(n log n)','O(log n)'], ans:2, exp:'Heap Sort is guaranteed O(n log n) in all cases — best, average, and worst.' },
    { q:'The first phase of Heap Sort (build heap) takes?', opts:['O(n log n)','O(n)','O(n²)','O(log n)'], ans:1, exp:'Building a max-heap from an unsorted array takes O(n) using bottom-up heapification.' },
  ],
  'Shell Sort': [
    { q:'Shell Sort is an improvement of which algorithm?', opts:['Bubble Sort','Merge Sort','Insertion Sort','Quick Sort'], ans:2, exp:'Shell Sort generalizes Insertion Sort by comparing elements at decreasing gaps.' },
    { q:'What is the initial gap in Shell\'s original gap sequence?', opts:['1','n','n/2','log n'], ans:2, exp:'Shell\'s original sequence starts with gap = n/2 and halves it each time.' },
    { q:'Is Shell Sort stable?', opts:['Yes','No','Depends on gap sequence','Only with gap=1'], ans:1, exp:'Shell Sort is NOT stable — elements can jump over each other during gap-based insertion.' },
    { q:'Shell Sort\'s final pass (gap=1) is equivalent to?', opts:['Bubble Sort','Merge Sort','Insertion Sort','Selection Sort'], ans:2, exp:'When gap=1, Shell Sort becomes a standard Insertion Sort.' },
    { q:'The key advantage of Shell Sort over Insertion Sort is?', opts:['Always O(n log n)','Elements move large distances in one step','Uses less memory','Is always stable'], ans:1, exp:'By using large gaps first, Shell Sort pre-sorts the array so the final Insertion Sort pass is fast.' },
  ],
};
