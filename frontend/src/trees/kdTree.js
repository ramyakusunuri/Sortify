// ── KD-TREE ───────────────────────────────────────────────────
// K-Dimensional tree for 2D points (k=2)
// FIXED: Steps now show the tree growing progressively node-by-node

class KDNode {
  constructor(point, depth=0) {
    this.point = point;   // [x, y]
    this.depth = depth;
    this.left = null; this.right = null;
    this.id = Math.random().toString(36).slice(2,8);
  }
  get axis() { return this.depth % 2; } // 0=x, 1=y
}

class KDTree {
  constructor() { this.root = null; this.steps = []; }

  _serialize(node) {
    if (!node) return null;
    return { id:node.id, point:node.point, depth:node.depth, axis:node.axis,
             left:this._serialize(node.left), right:this._serialize(node.right) };
  }

  // Build entire tree first, then replay with growing snapshots
  buildFromPoints(points) {
    // Step 1: record entry snap with no tree yet (just a label)
    this.steps.push({ tree: null, msg: `Building KD-Tree from ${points.length} 2D points`, highlight: [] });

    // Step 2: build the full tree silently, collecting insertion order
    const insertionOrder = [];   // [{node, msg, highlight}, ...]
    this.root = this._buildCollect([...points], 0, insertionOrder);

    // Step 3: replay — for each inserted node, serialize the PARTIAL tree up to that point
    // We do this by rebuilding in insertion order and snapping after each node is added
    const tempTree = new KDTree();
    for (let i = 0; i < insertionOrder.length; i++) {
      const { pts, depth, msg, highlight } = insertionOrder[i];
      // Insert this node into tempTree
      tempTree._insertNodeAt(pts, depth);
      this.steps.push({
        tree: tempTree._serialize(tempTree.root),
        msg,
        highlight
      });
    }

    // Final step: full tree complete
    this.steps.push({
      tree: this._serialize(this.root),
      msg: `KD-Tree construction complete! ${points.length} nodes inserted.`,
      highlight: []
    });
  }

  // Build tree and collect insertion order (pts=median point, depth=depth at that node)
  _buildCollect(pts, depth, order) {
    if (!pts.length) return null;
    const axis = depth % 2;
    pts.sort((a,b) => a[axis] - b[axis]);
    const mid = Math.floor(pts.length / 2);
    const axisName = axis===0 ? 'X' : 'Y';
    const node = new KDNode(pts[mid], depth);

    // Record this node insertion
    order.push({
      pts: pts[mid],
      depth,
      msg: `Depth ${depth}: Split on ${axisName}-axis. Node (${pts[mid][0]}, ${pts[mid][1]}) placed as median.`,
      highlight: [pts[mid]]
    });

    node.left  = this._buildCollect(pts.slice(0, mid), depth+1, order);
    node.right = this._buildCollect(pts.slice(mid+1),  depth+1, order);
    return node;
  }

  // Insert a single point into the temp tree (used for progressive snapshot replay)
  _insertNodeAt(point, depth) {
    const node = new KDNode(point, depth);
    if (!this.root) { this.root = node; return; }
    let cur = this.root;
    while (true) {
      const axis = cur.depth % 2;
      if (point[axis] < cur.point[axis]) {
        if (!cur.left) { cur.left = node; break; }
        cur = cur.left;
      } else {
        if (!cur.right) { cur.right = node; break; }
        cur = cur.right;
      }
    }
  }

  getSteps() { return this.steps; }
}

function generateKDTreeSteps(points) {
  const t = new KDTree();
  t.buildFromPoints(points);
  return t.getSteps();
}
