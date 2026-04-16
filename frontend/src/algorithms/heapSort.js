// ── HEAP SORT ────────────────────────────────────────────────
function heapSortSteps(arr) {
  const a = [...arr], s = [], n = a.length;
  function hfy(sz, i) {
    let lg = i, l = 2*i+1, r = 2*i+2;
    s.push({ type:'compare', i:i, j:l < sz ? l : i, msg:`Heapify: checking node arr[${i}]=${a[i]}`, msgType:'compare', ptrs:{L:i}, pseudo:6, codeLine:6 });
    if (l < sz && a[l] > a[lg]) lg = l;
    if (r < sz && a[r] > a[lg]) lg = r;
    if (lg !== i) {
      s.push({ type:'swap', i:i, j:lg, msg:`Swapping arr[${i}]=${a[i]} ↔ arr[${lg}]=${a[lg]} (larger child)`, msgType:'swap', ptrs:{L:i,R:lg}, pseudo:8, codeLine:8 });
      [a[i], a[lg]] = [a[lg], a[i]];
      hfy(sz, lg);
    }
  }
  s.push({ type:'info', msg:'Phase 1: Building Max-Heap...', msgType:'info', ptrs:{}, pseudo:0, codeLine:0 });
  for (let i = Math.floor(n/2) - 1; i >= 0; i--) hfy(n, i);
  s.push({ type:'info', msg:'Phase 2: Extracting elements from Max-Heap', msgType:'info', ptrs:{}, pseudo:2, codeLine:2 });
  for (let i = n - 1; i > 0; i--) {
    s.push({ type:'swap', i:0, j:i, msg:`Swap root arr[0]=${a[0]} with arr[${i}]=${a[i]}`, msgType:'swap', ptrs:{L:0,R:i}, pseudo:3, codeLine:3 });
    [a[0], a[i]] = [a[i], a[0]];
    s.push({ type:'sorted', idx:i, msg:`arr[${i}]=${a[i]} placed in correct position`, msgType:'sorted', ptrs:{}, pseudo:4, codeLine:4 });
    hfy(i, 0);
  }
  s.push({ type:'sorted', idx:0, msg:`arr[0]=${a[0]} is in correct position`, msgType:'sorted', ptrs:{}, pseudo:4, codeLine:4 });
  s.push({ type:'done', msg:'✓ Array is fully sorted!', msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  return s;
}

// ── SHELL SORT ───────────────────────────────────────────────
function shellSortSteps(arr) {
  const a = [...arr], s = [], n = a.length;
  for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {
    s.push({ type:'info', msg:`Shell Sort gap = ${gap}`, msgType:'info', ptrs:{}, pseudo:1, codeLine:1 });
    for (let i = gap; i < n; i++) {
      let j = i, temp = a[i];
      s.push({ type:'pivot', idx:i, msg:`Key = arr[${i}] = ${temp}, gap = ${gap}`, msgType:'info', ptrs:{P:i}, pseudo:3, codeLine:3 });
      while (j >= gap) {
        s.push({ type:'compare', i:j-gap, j:j, msg:`Comparing arr[${j-gap}]=${a[j-gap]} with key=${temp}`, msgType:'compare', ptrs:{L:j-gap,R:j}, pseudo:5, codeLine:5 });
        if (a[j-gap] > temp) {
          s.push({ type:'swap', i:j-gap, j:j, msg:`Shifting arr[${j-gap}]=${a[j-gap]} right to index ${j}`, msgType:'swap', ptrs:{L:j-gap,R:j}, pseudo:6, codeLine:6 });
          a[j] = a[j-gap]; j -= gap;
        } else { break; }
      }
      a[j] = temp;
      s.push({ type:'place', idx:j, val:temp, msg:`Placed ${temp} at index ${j}`, msgType:'info', ptrs:{L:j}, pseudo:8, codeLine:8 });
    }
  }
  for (let i = 0; i < n; i++) s.push({ type:'sorted', idx:i, msg:`Index ${i} sorted`, msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  s.push({ type:'done', msg:'✓ Array is fully sorted!', msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  return s;
}
