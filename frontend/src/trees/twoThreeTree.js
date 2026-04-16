// ── 2-3 TREE ─────────────────────────────────────────────────
// A 2-3 tree is a B-tree of order 2 (min degree 2)
// Nodes have 1 or 2 keys, and 2 or 3 children

class TwoThreeNode {
  constructor() {
    this.keys     = [];     // 1 or 2 keys
    this.children = [];     // 0 (leaf) or 2-3 children
    this.id       = Math.random().toString(36).slice(2,8);
  }
  get isLeaf() { return this.children.length === 0; }
  get is2Node() { return this.keys.length === 1; }
  get is3Node() { return this.keys.length === 2; }
}

class TwoThreeTree {
  constructor() { this.root = null; this.steps = []; }

  _snap(msg, highlight=[]) {
    this.steps.push({ tree: this._serialize(this.root), msg, highlight:[...highlight] });
  }

  _serialize(n) {
    if (!n) return null;
    return { id:n.id, keys:[...n.keys], children:n.children.map(c=>this._serialize(c)) };
  }

  insert(val) {
    this._snap(`Inserting ${val} into 2-3 Tree`,[val]);
    if (!this.root) {
      this.root = new TwoThreeNode();
      this.root.keys = [val];
      this._snap(`Tree empty → create root node with ${val}`,[val]);
      return;
    }
    const overflow = this._insertNode(this.root, val);
    if (overflow) {
      // root was split — create new root
      const newRoot = new TwoThreeNode();
      newRoot.keys = [overflow.key];
      newRoot.children = [overflow.left, overflow.right];
      this.root = newRoot;
      this._snap(`Root split! New root created with key ${overflow.key}`,[overflow.key]);
    }
    this._snap(`${val} successfully inserted`,[val]);
  }

  _insertNode(node, val) {
    if (node.isLeaf) {
      // Insert into leaf
      node.keys.push(val);
      node.keys.sort((a,b)=>a-b);
      this._snap(`Inserted ${val} into leaf node [${node.keys.join(',')}]`,[val]);
      if (node.keys.length > 2) return this._split(node);
      return null;
    }
    // Find correct child
    let idx = 0;
    while (idx < node.keys.length && val > node.keys[idx]) idx++;
    this._snap(`At node [${node.keys.join(',')}]: descend to child[${idx}]`,[val]);
    const overflow = this._insertNode(node.children[idx], val);
    if (!overflow) return null;
    // Absorb the overflow
    node.keys.push(overflow.key);
    node.keys.sort((a,b)=>a-b);
    const pos = node.keys.indexOf(overflow.key);
    node.children.splice(pos, 1, overflow.left, overflow.right);
    this._snap(`Absorbed promoted key ${overflow.key} into [${node.keys.join(',')}]`,[overflow.key]);
    if (node.keys.length > 2) return this._split(node);
    return null;
  }

  _split(node) {
    const mid = node.keys[1];
    const left = new TwoThreeNode();
    const right = new TwoThreeNode();
    left.keys  = [node.keys[0]];
    right.keys = [node.keys[2]];
    if (!node.isLeaf) {
      left.children  = node.children.slice(0,2);
      right.children = node.children.slice(2);
    }
    this._snap(`Node overflow! Splitting: [${node.keys[0]}] | ${mid} | [${node.keys[2]}]`,[mid]);
    return { key:mid, left, right };
  }

  getSteps() { return this.steps; }
}

function generateTwoThreeSteps(values) {
  const t = new TwoThreeTree();
  for (const v of values) t.insert(v);
  return t.getSteps();
}
