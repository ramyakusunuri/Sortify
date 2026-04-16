// ── TREE RENDERER ─────────────────────────────────────────────

function renderTree(containerId, treeData, treeType, highlight=[]) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!treeData) { container.innerHTML = '<div class="tree-empty">No tree data. Press Setup.</div>'; return; }

  const W = container.clientWidth || 800;
  const nodeR = 24;

  // Calculate layout
  const positions = {};
  let maxDepth = 0;

  function layoutNode(node, depth, left, right) {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    const mid = (left + right) / 2;
    positions[node.id || (node.keys?node.keys.join(','):node.val)] = { x: mid * W, y: depth * 80 + 50, node };
    if (node.children) {
      const step = (right - left) / (node.children.length || 1);
      node.children.forEach((c,i) => c && layoutNode(c, depth+1, left+step*i, left+step*(i+1)));
    }
    if (node.left)  layoutNode(node.left,  depth+1, left, mid/W);
    if (node.right) layoutNode(node.right, depth+1, mid/W, right);
  }

  // Use specialized renderers per tree type
  if (treeType === 'rb')   renderRBTree(container, treeData, highlight, W);
  else if (treeType === 'btree' || treeType === '23') renderBTreeLike(container, treeData, highlight, W, treeType);
  else if (treeType === 'kd') renderKDTree(container, treeData, highlight, W);
}

// ── RB TREE RENDERER ──────────────────────────────────────────
function renderRBTree(container, node, highlight, W) {
  const nodes = [], edges = [];
  let nodeId = 0;

  function traverse(n, depth, xMin, xMax) {
    if (!n) return null;
    const id = nodeId++;
    const x = (xMin + xMax) / 2;
    const y = depth * 80 + 50;
    const isHighlighted = highlight.includes(n.val);
    nodes.push({ id, x, y, val: n.val, color: n.color, highlighted: isHighlighted });
    const leftId  = traverse(n.left,  depth+1, xMin, (xMin+xMax)/2);
    const rightId = traverse(n.right, depth+1, (xMin+xMax)/2, xMax);
    if (leftId  !== null) edges.push({ from: id, to: leftId });
    if (rightId !== null) edges.push({ from: id, to: rightId });
    return id;
  }
  traverse(node, 0, 0, 1);

  const height = (nodes.reduce((m,n)=>Math.max(m,n.y),0) || 100) + 80;
  let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${W} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Edges
  edges.forEach(e => {
    const f = nodes[e.from], t = nodes[e.to];
    svg += `<line x1="${f.x*W}" y1="${f.y}" x2="${t.x*W}" y2="${t.y}" stroke="#999" stroke-width="2"/>`;
  });

  // Nodes
  nodes.forEach(n => {
    const cx = n.x * W, cy = n.y;
    const fill   = n.highlighted ? '#f9a825' : (n.color === 'red' ? '#ef5350' : '#37474f');
    const stroke = n.highlighted ? '#e65100' : (n.color === 'red' ? '#b71c1c' : '#1a1a2e');
    svg += `<circle cx="${cx}" cy="${cy}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
    svg += `<text x="${cx}" y="${cy}" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">${n.val}</text>`;
    svg += `<text x="${cx}" y="${cy+16}" dominant-baseline="middle" text-anchor="middle" fill="${n.color==='red'?'#ef9a9a':'#90a4ae'}" font-size="9">${n.color.toUpperCase()}</text>`;
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

// ── B-TREE / 2-3 TREE RENDERER ────────────────────────────────
function renderBTreeLike(container, node, highlight, W, type) {
  const nodes = [], edges = [];

  function traverse(n, depth, xMin, xMax) {
    if (!n) return null;
    const id = n.id || Math.random().toString(36).slice(2);
    const x = (xMin + xMax) / 2;
    const y = depth * 100 + 50;
    nodes.push({ id, x, y, keys: n.keys, leaf: n.leaf });
    if (n.children && n.children.length) {
      const step = (xMax - xMin) / n.children.length;
      n.children.forEach((c,i) => {
        const childId = traverse(c, depth+1, xMin+step*i, xMin+step*(i+1));
        if (childId) edges.push({ from: id, to: childId, fromX: x, fromY: y, toX: null, toY: null });
      });
    }
    return id;
  }
  traverse(node, 0, 0, 1);

  // Build lookup
  const byId = {};
  nodes.forEach(n => { byId[n.id] = n; });
  edges.forEach(e => {
    const t = byId[e.to];
    if (t) { e.toX = t.x; e.toY = t.y; }
  });

  const height = (nodes.reduce((m,n)=>Math.max(m,n.y),0)||100) + 100;
  let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${W} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  edges.forEach(e => {
    if (e.toX!==null)
      svg += `<line x1="${e.fromX*W}" y1="${e.fromY+18}" x2="${e.toX*W}" y2="${e.toY-18}" stroke="#999" stroke-width="2"/>`;
  });

  nodes.forEach(n => {
    const cx = n.x * W, cy = n.y;
    const kw = 30, kh = 36;
    const totalW = n.keys.length * kw + (n.keys.length-1) * 2 + 8;
    const rx = cx - totalW/2;
    const isHL = n.keys.some(k => highlight.includes(k));
    svg += `<rect x="${rx}" y="${cy-kh/2}" width="${totalW}" height="${kh}" rx="5" fill="${isHL?'#fff3e0':'#e3f2fd'}" stroke="${isHL?'#e87722':'#1565c0'}" stroke-width="2"/>`;
    n.keys.forEach((k,i) => {
      const kx = rx + i*(kw+2) + 4 + kw/2;
      if (i > 0) svg += `<line x1="${rx+i*(kw+2)+4}" y1="${cy-kh/2+4}" x2="${rx+i*(kw+2)+4}" y2="${cy+kh/2-4}" stroke="#90caf9" stroke-width="1"/>`;
      svg += `<text x="${kx}" y="${cy}" dominant-baseline="middle" text-anchor="middle" fill="#1a237e" font-size="13" font-weight="700">${k}</text>`;
    });
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

// ── KD-TREE RENDERER ──────────────────────────────────────────
function renderKDTree(container, node, highlight, W) {
  const nodes = [], edges = [];
  let nodeId = 0;

  function traverse(n, depth, xMin, xMax) {
    if (!n) return null;
    const id = nodeId++;
    const x = (xMin + xMax) / 2;
    const y = depth * 90 + 50;
    const isHL = highlight.some(h => Array.isArray(h) ? h[0]===n.point[0]&&h[1]===n.point[1] : false);
    nodes.push({ id, x, y, point: n.point, axis: n.axis, highlighted: isHL });
    const leftId  = traverse(n.left,  depth+1, xMin, (xMin+xMax)/2);
    const rightId = traverse(n.right, depth+1, (xMin+xMax)/2, xMax);
    if (leftId  !== null) edges.push({ from:id, to:leftId });
    if (rightId !== null) edges.push({ from:id, to:rightId });
    return id;
  }
  traverse(node, 0, 0, 1);

  const height = (nodes.reduce((m,n)=>Math.max(m,n.y),0)||100) + 80;
  let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${W} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  edges.forEach(e => {
    const f = nodes[e.from], t = nodes[e.to];
    svg += `<line x1="${f.x*W}" y1="${f.y}" x2="${t.x*W}" y2="${t.y}" stroke="#bbb" stroke-width="2"/>`;
  });

  nodes.forEach(n => {
    const cx = n.x*W, cy = n.y;
    const fill   = n.highlighted ? '#f9a825' : (n.axis===0 ? '#3f51b5' : '#e91e63');
    const stroke = n.highlighted ? '#e65100' : (n.axis===0 ? '#283593' : '#880e4f');
    svg += `<circle cx="${cx}" cy="${cy}" r="26" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
    svg += `<text x="${cx}" y="${cy-5}" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">(${n.point[0]},${n.point[1]})</text>`;
    svg += `<text x="${cx}" y="${cy+10}" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="9">${n.axis===0?'X-axis':'Y-axis'}</text>`;
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

// ── KD-TREE POINT PLOT ────────────────────────────────────────
function renderKDPoints(containerId, points, highlight=[]) {
  const container = document.getElementById(containerId);
  if (!container || !points.length) return;
  const W = container.clientWidth || 400, H = 280;
  const pad = 30;
  const xs = points.map(p=>p[0]), ys = points.map(p=>p[1]);
  const minX=Math.min(...xs), maxX=Math.max(...xs);
  const minY=Math.min(...ys), maxY=Math.max(...ys);
  const sx = x => pad + (maxX===minX ? W/2 : (x-minX)/(maxX-minX)*(W-2*pad));
  const sy = y => H-pad - (maxY===minY ? H/2 : (y-minY)/(maxY-minY)*(H-2*pad));

  let svg = `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${W}" height="${H}" fill="#1e1e2e" rx="8"/>`;
  // Grid
  for(let i=1;i<4;i++){
    svg+=`<line x1="${pad}" y1="${pad+i*(H-2*pad)/4}" x2="${W-pad}" y2="${pad+i*(H-2*pad)/4}" stroke="#333" stroke-width="1"/>`;
    svg+=`<line x1="${pad+i*(W-2*pad)/4}" y1="${pad}" x2="${pad+i*(W-2*pad)/4}" y2="${H-pad}" stroke="#333" stroke-width="1"/>`;
  }
  // Axes
  svg+=`<line x1="${pad}" y1="${H-pad}" x2="${W-pad}" y2="${H-pad}" stroke="#666" stroke-width="1.5"/>`;
  svg+=`<line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H-pad}" stroke="#666" stroke-width="1.5"/>`;
  // Points
  points.forEach(p => {
    const isHL = highlight.some(h=>Array.isArray(h)&&h[0]===p[0]&&h[1]===p[1]);
    svg+=`<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${isHL?8:5}" fill="${isHL?'#f9a825':'#4fc3f7'}" stroke="${isHL?'#e65100':'#0288d1'}" stroke-width="1.5"/>`;
    svg+=`<text x="${sx(p[0])+8}" y="${sy(p[1])-4}" fill="#cdd6f4" font-size="10">(${p[0]},${p[1]})</text>`;
  });
  svg+='</svg>';
  container.innerHTML = svg;
}
