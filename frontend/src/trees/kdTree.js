// ── KD-TREE ───────────────────────────────────────────────────
// K-Dimensional tree for 2D points (k=2)

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

  _snap(msg, highlight=[]) {
    this.steps.push({ tree: this._serialize(this.root), msg, highlight:[...highlight], type:'kd' });
  }

  buildFromPoints(points) {
    this._snap(`Building KD-Tree from ${points.length} 2D points`);
    this.root = this._build([...points], 0);
    this._snap(`KD-Tree construction complete!`);
  }

  _build(pts, depth) {
    if (!pts.length) return null;
    const axis = depth % 2;
    pts.sort((a,b) => a[axis] - b[axis]);
    const mid = Math.floor(pts.length / 2);
    const node = new KDNode(pts[mid], depth);
    const axisName = axis===0 ? 'X' : 'Y';
    this._snap(
      `Depth ${depth}: Split on ${axisName}-axis. Median = (${pts[mid][0]}, ${pts[mid][1]})`,
      [pts[mid]]
    );
    node.left  = this._build(pts.slice(0, mid), depth+1);
    node.right = this._build(pts.slice(mid+1),  depth+1);
    return node;
  }

  search(target) {
    this.steps = [];
    this._snap(`Nearest neighbor search for (${target[0]}, ${target[1]})`,[target]);
    let best = null, bestDist = Infinity;
    const search = (node, depth) => {
      if (!node) return;
      const d = Math.hypot(node.point[0]-target[0], node.point[1]-target[1]);
      this._snap(`Visiting (${node.point[0]},${node.point[1]}), dist=${d.toFixed(2)}`,[node.point]);
      if (d < bestDist) { bestDist=d; best=node.point; this._snap(`New best: (${best[0]},${best[1]}) dist=${d.toFixed(2)}`,[node.point]); }
      const axis = depth%2;
      const diff = target[axis] - node.point[axis];
      const near  = diff<=0 ? node.left  : node.right;
      const far   = diff<=0 ? node.right : node.left;
      search(near, depth+1);
      if (Math.abs(diff) < bestDist) { this._snap(`Checking far subtree (boundary ${Math.abs(diff).toFixed(2)} < ${bestDist.toFixed(2)})`); search(far, depth+1); }
    };
    search(this.root, 0);
    this._snap(`Nearest neighbor found: (${best[0]}, ${best[1]}) at distance ${bestDist.toFixed(2)}`,[best]);
    return best;
  }

  _serialize(node) {
    if (!node) return null;
    return { id:node.id, point:node.point, depth:node.depth, axis:node.axis,
             left:this._serialize(node.left), right:this._serialize(node.right) };
  }

  getSteps() { return this.steps; }
}

function generateKDTreeSteps(points) {
  const t = new KDTree();
  t.buildFromPoints(points);
  return t.getSteps();
}

function generateKDSearchSteps(points, target) {
  const t = new KDTree();
  t.buildFromPoints(points);
  t.search(target);
  return t.getSteps();
}
