// ── INSERTION SORT ───────────────────────────────────────────
function insertionSortSteps(arr) {
  const a = [...arr], s = [], n = a.length;
  s.push({ type:'sorted', idx:0, msg:`arr[0]=${a[0]} considered sorted (base case)`, msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  for (let i = 1; i < n; i++) {
    let key = a[i], j = i;
    s.push({ type:'pivot', idx:i, msg:`Key = arr[${i}] = ${key}`, msgType:'info', ptrs:{P:i}, pseudo:2, codeLine:2 });
    while (j > 0) {
      s.push({ type:'compare', i:j-1, j:j, msg:`Comparing arr[${j-1}]=${a[j-1]} with key=${key}`, msgType:'compare', ptrs:{L:j-1,R:j}, pseudo:4, codeLine:4 });
      if (a[j-1] > key) {
        s.push({ type:'swap', i:j-1, j:j, msg:`Shifting arr[${j-1}]=${a[j-1]} right to position ${j}`, msgType:'swap', ptrs:{L:j-1,R:j}, pseudo:5, codeLine:5 });
        a[j] = a[j-1]; j--;
      } else { break; }
    }
    a[j] = key;
    s.push({ type:'place', idx:j, val:key, msg:`Placed key=${key} at index ${j}`, msgType:'info', ptrs:{L:j}, pseudo:7, codeLine:7 });
    for (let k = 0; k <= i; k++) s.push({ type:'sorted', idx:k, msg:`arr[0..${i}] is now sorted`, msgType:'sorted', ptrs:{}, pseudo:1, codeLine:1 });
  }
  s.push({ type:'done', msg:'✓ Array is fully sorted!', msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  return s;
}
