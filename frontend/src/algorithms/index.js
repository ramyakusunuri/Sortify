// ── ALGORITHM DISPATCHER ────────────────────────────────────
function generateSteps(name, arr) {
  switch (name) {
    case 'Bubble Sort':    return bubbleSortSteps(arr);
    case 'Selection Sort': return selectionSortSteps(arr);
    case 'Insertion Sort': return insertionSortSteps(arr);
    case 'Merge Sort':     return mergeSortSteps(arr);
    case 'Quick Sort':     return quickSortSteps(arr);
    case 'Heap Sort':      return heapSortSteps(arr);
    case 'Shell Sort':     return shellSortSteps(arr);
    default: return [];
  }
}
