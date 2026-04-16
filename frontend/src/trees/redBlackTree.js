// ── RED-BLACK TREE ────────────────────────────────────────────
const RB_RED = 'red', RB_BLACK = 'black';

class RBNode {
  constructor(val) {
    this.val = val; this.color = RB_RED;
    this.left = null; this.right = null; this.parent = null;
  }
}

class RedBlackTree {
  constructor() { this.root = null; this.steps = []; }

  _snap(msg, highlight=[]) {
    this.steps.push({ tree: this._serialize(this.root), msg, highlight: [...highlight] });
  }

  insert(val) {
    const node = new RBNode(val);
    this._snap(`Inserting ${val} as RED node`);
    if (!this.root) {
      this.root = node; this.root.color = RB_BLACK;
      this._snap(`${val} is root → color BLACK`, [val]);
      return;
    }
    this._bstInsert(node);
    this._snap(`BST insert ${val} complete`, [val]);
    this._fixInsert(node);
    this._snap(`Tree balanced after inserting ${val}`, [val]);
  }

  _bstInsert(node) {
    let cur = this.root, par = null;
    while (cur) {
      par = cur;
      if (node.val < cur.val) { this._snap(`${node.val} < ${cur.val}, go LEFT`,[node.val,cur.val]); cur = cur.left; }
      else { this._snap(`${node.val} >= ${cur.val}, go RIGHT`,[node.val,cur.val]); cur = cur.right; }
    }
    node.parent = par;
    if (node.val < par.val) par.left = node;
    else par.right = node;
  }

  _fixInsert(z) {
    while (z.parent && z.parent.color === RB_RED) {
      const gp = z.parent.parent;
      if (!gp) break;
      if (z.parent === gp.left) {
        const uncle = gp.right;
        if (uncle && uncle.color === RB_RED) {
          // Case 1: Uncle is red → recolor
          z.parent.color = RB_BLACK; uncle.color = RB_BLACK; gp.color = RB_RED;
          this._snap(`Case 1: Uncle RED → Recolor parent, uncle BLACK; grandparent RED`,[gp.val]);
          z = gp;
        } else {
          if (z === z.parent.right) {
            z = z.parent; this._rotateLeft(z);
            this._snap(`Case 2: Left-Right → Left rotate at ${z.val}`,[z.val]);
          }
          z.parent.color = RB_BLACK; gp.color = RB_RED;
          this._rotateRight(gp);
          this._snap(`Case 3: Right rotate at grandparent ${gp.val}`,[gp.val]);
        }
      } else {
        const uncle = gp.left;
        if (uncle && uncle.color === RB_RED) {
          z.parent.color = RB_BLACK; uncle.color = RB_BLACK; gp.color = RB_RED;
          this._snap(`Case 1 (mirror): Recolor`,[gp.val]);
          z = gp;
        } else {
          if (z === z.parent.left) {
            z = z.parent; this._rotateRight(z);
            this._snap(`Case 2 (mirror): Right-Left → Right rotate`,[z.val]);
          }
          z.parent.color = RB_BLACK; gp.color = RB_RED;
          this._rotateLeft(gp);
          this._snap(`Case 3 (mirror): Left rotate at ${gp.val}`,[gp.val]);
        }
      }
    }
    this.root.color = RB_BLACK;
    this._snap(`Root always BLACK`,[this.root.val]);
  }

  _rotateLeft(x) {
    const y = x.right; x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x; x.parent = y;
  }

  _rotateRight(x) {
    const y = x.left; x.left = y.right;
    if (y.right) y.right.parent = x;
    y.parent = x.parent;
    if (!x.parent) this.root = y;
    else if (x === x.parent.right) x.parent.right = y;
    else x.parent.left = y;
    y.right = x; x.parent = y;
  }

  _serialize(node) {
    if (!node) return null;
    return { val: node.val, color: node.color, left: this._serialize(node.left), right: this._serialize(node.right) };
  }

  getSteps() { return this.steps; }
}

function generateRBSteps(values) {
  const t = new RedBlackTree();
  for (const v of values) t.insert(v);
  return t.getSteps();
}
