// ── MERGE SORT ───────────────────────────────────────────────
function mergeSortSteps(arr) {
  const a = [...arr], s = [];
  function ms(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    ms(l, m);
    ms(m + 1, r);
    mg(l, m, r);
  }
  function mg(l, m, r) {
    const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
    s.push({ type:'info', msg:`Merging subarrays [${l}..${m}] and [${m+1}..${r}]`, msgType:'info', ptrs:{L:l, R:r, P:m+1}, pseudo:6, codeLine:6 });
    let i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) {
      s.push({ type:'compare', i:l+i, j:m+1+j, msg:`Comparing L[${i}]=${L[i]} with R[${j}]=${R[j]}`, msgType:'compare', ptrs:{L:l+i, R:m+1+j}, pseudo:7, codeLine:7 });
      if (L[i] <= R[j]) { a[k] = L[i++]; }
      else              { a[k] = R[j++]; }
      s.push({ type:'set', idx:k, val:a[k], msg:`Placed ${a[k]} at index ${k}`, msgType:'info', ptrs:{}, pseudo:7, codeLine:7 });
      k++;
    }
    while (i < L.length) { a[k] = L[i++]; s.push({ type:'set', idx:k++, val:a[k-1], msg:`Copying L[${i-1}]=${a[k-1]}`, msgType:'info', ptrs:{}, pseudo:8, codeLine:8 }); }
    while (j < R.length) { a[k] = R[j++]; s.push({ type:'set', idx:k++, val:a[k-1], msg:`Copying R[${j-1}]=${a[k-1]}`, msgType:'info', ptrs:{}, pseudo:8, codeLine:8 }); }
  }
  ms(0, a.length - 1);
  for (let i = 0; i < a.length; i++) s.push({ type:'sorted', idx:i, msg:`Index ${i} is sorted`, msgType:'sorted', ptrs:{}, pseudo:10, codeLine:10 });
  s.push({ type:'done', msg:'✓ Array is fully sorted!', msgType:'sorted', ptrs:{}, pseudo:0, codeLine:0 });
  return s;
}
