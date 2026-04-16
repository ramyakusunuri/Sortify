// ── QUICK SORT ───────────────────────────────────────────────
function quickSortSteps(arr) {
  const a = [...arr], s = [];
  function qs(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) s.push({ type:'sorted', idx:lo, msg:`Single element arr[${lo}]=${a[lo]} is in place`, msgType:'sorted', ptrs:{}, pseudo:1, codeLine:1 });
      return;
    }
    s.push({ type:'pivot', idx:hi, msg:`Pivot selected: arr[${hi}]=${a[hi]}`, msgType:'pivot', ptrs:{P:hi}, pseudo:3, codeLine:3 });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      s.push({ type:'compare', i:j, j:hi, msg:`Comparing arr[${j}]=${a[j]} with pivot=${a[hi]}`, msgType:'compare', ptrs:{L:j, R:hi}, pseudo:6, codeLine:6 });
      if (a[j] <= a[hi]) {
        i++;
        s.push({ type:'swap', i:i, j:j, msg:`arr[${j}]=${a[j]} ≤ pivot → swap arr[${i}] ↔ arr[${j}]`, msgType:'swap', ptrs:{L:i, R:j, P:hi}, pseudo:7, codeLine:7 });
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    s.push({ type:'swap', i:i+1, j:hi, msg:`Placing pivot: swap arr[${i+1}] ↔ arr[${hi}]=${a[hi]}`, msgType:'swap', ptrs:{L:i+1, R:hi}, pseudo:9, codeLine:9 });
    [a[i+1], a[hi]] = [a[hi], a[i+1]];
    const p = i + 1;
    s.push({ type:'sorted', idx:p, msg:`Pivot arr[${p}]=${a[p]} is in its final position`, msgType:'sorted', ptrs:{}, pseudo:10, codeLine:10 });
    qs(lo, p - 1);
    qs(p + 1, hi);
  }
  qs(0, a.length - 1);
  s.push({ type:'done', msg:'✓ Array is fully sorted!', msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  return s;
}
