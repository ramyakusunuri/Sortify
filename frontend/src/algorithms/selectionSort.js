// ── SELECTION SORT ───────────────────────────────────────────
function selectionSortSteps(arr) {
  const a = [...arr], s = [], n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    s.push({ type:'pivot', idx:m, msg:`Pass ${i+1}: Assume arr[${i}]=${a[i]} is minimum`, msgType:'info', ptrs:{L:i}, pseudo:2, codeLine:2 });
    for (let j = i + 1; j < n; j++) {
      s.push({ type:'compare', i:m, j:j, msg:`Comparing current min arr[${m}]=${a[m]} with arr[${j}]=${a[j]}`, msgType:'compare', ptrs:{L:m,R:j}, pseudo:4, codeLine:4 });
      if (a[j] < a[m]) {
        s.push({ type:'pivot', idx:j, msg:`New minimum found: arr[${j}]=${a[j]}`, msgType:'pivot', ptrs:{L:j}, pseudo:5, codeLine:5 });
        m = j;
      }
    }
    if (m !== i) {
      s.push({ type:'swap', i:i, j:m, msg:`Swapping arr[${i}]=${a[i]} ↔ minimum arr[${m}]=${a[m]}`, msgType:'swap', ptrs:{L:i,R:m}, pseudo:7, codeLine:7 });
      [a[i], a[m]] = [a[m], a[i]];
    }
    s.push({ type:'sorted', idx:i, msg:`arr[${i}]=${a[i]} placed in sorted position`, msgType:'sorted', ptrs:{}, pseudo:8, codeLine:8 });
  }
  s.push({ type:'sorted', idx:n-1, msg:`arr[${n-1}]=${a[n-1]} is in correct position`, msgType:'sorted', ptrs:{}, pseudo:8, codeLine:8 });
  s.push({ type:'done', msg:'✓ Array is fully sorted!', msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  return s;
}
