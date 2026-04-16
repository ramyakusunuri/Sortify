// ── BUBBLE SORT ──────────────────────────────────────────────
function bubbleSortSteps(arr) {
  const a = [...arr], s = [], n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      s.push({ type:'compare', i:j, j:j+1, msg:`Comparing arr[${j}]=${a[j]} and arr[${j+1}]=${a[j+1]}`, msgType:'compare', ptrs:{L:j,R:j+1}, pseudo:3, codeLine:4 });
      if (a[j] > a[j+1]) {
        s.push({ type:'swap', i:j, j:j+1, msg:`arr[${j}]=${a[j]} > arr[${j+1}]=${a[j+1]}, Swapping`, msgType:'swap', ptrs:{L:j,R:j+1}, pseudo:5, codeLine:5 });
        [a[j], a[j+1]] = [a[j+1], a[j]];
      } else {
        s.push({ type:'noswap', i:j, j:j+1, msg:`No swap — arr[${j}]=${a[j]} ≤ arr[${j+1}]=${a[j+1]}`, msgType:'info', ptrs:{L:j,R:j+1}, pseudo:3, codeLine:4 });
      }
    }
    s.push({ type:'sorted', idx:n-1-i, msg:`arr[${n-1-i}]=${a[n-1-i]} is in correct position`, msgType:'sorted', ptrs:{}, pseudo:2, codeLine:2 });
  }
  s.push({ type:'sorted', idx:0, msg:`arr[0]=${a[0]} is in correct position`, msgType:'sorted', ptrs:{}, pseudo:2, codeLine:2 });
  s.push({ type:'done', msg:'✓ Array is fully sorted!', msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  return s;
}
