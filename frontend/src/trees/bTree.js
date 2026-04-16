// ── B-TREE (order t, min degree) ─────────────────────────────
class BTreeNode {
  constructor(leaf=true) {
    this.keys = []; this.children = []; this.leaf = leaf;
    this.id = Math.random().toString(36).slice(2,8);
  }
}

class BTree {
  constructor(t=2) { this.t = t; this.root = new BTreeNode(true); this.steps = []; }

  _snap(msg, highlight=[]) {
    this.steps.push({ tree: this._serialize(this.root), msg, highlight: [...highlight] });
  }

  insert(k) {
    this._snap(`Inserting key ${k}`,[k]);
    const r = this.root;
    if (r.keys.length === 2 * this.t - 1) {
      this._snap(`Root is FULL (${2*this.t-1} keys) → Split root`,[k]);
      const s = new BTreeNode(false);
      s.children.push(r);
      this.root = s;
      this._splitChild(s, 0);
      this._insertNonFull(s, k);
    } else {
      this._insertNonFull(r, k);
    }
    this._snap(`Key ${k} inserted successfully`,[k]);
  }

  _splitChild(x, i) {
    const t = this.t, y = x.children[i];
    const z = new BTreeNode(y.leaf);
    const mid = y.keys[t-1];
    z.keys = y.keys.splice(t, t-1);   // right half
    y.keys.pop();                       // remove median from y
    if (!y.leaf) { z.children = y.children.splice(t); }
    x.children.splice(i+1, 0, z);
    x.keys.splice(i, 0, mid);
    this._snap(`Split node: ${mid} promoted to parent`,[mid]);
  }

  _insertNonFull(x, k) {
    let i = x.keys.length - 1;
    if (x.leaf) {
      this._snap(`Leaf node found, inserting ${k} in sorted position`,[k]);
      x.keys.push(null);
      while (i >= 0 && k < x.keys[i]) { x.keys[i+1]=x.keys[i]; i--; }
      x.keys[i+1] = k;
    } else {
      while (i >= 0 && k < x.keys[i]) i--;
      i++;
      this._snap(`Traversing to child[${i}] for key ${k}`,[k]);
      if (x.children[i].keys.length === 2*this.t-1) {
        this._snap(`Child[${i}] is full → Split before descent`,[k]);
        this._splitChild(x, i);
        if (k > x.keys[i]) i++;
      }
      this._insertNonFull(x.children[i], k);
    }
  }

  _serialize(node) {
    if (!node) return null;
    return {
      id: node.id, keys: [...node.keys], leaf: node.leaf,
      children: node.children.map(c => this._serialize(c))
    };
  }

  getSteps() { return this.steps; }
}

function generateBTreeSteps(values, order=2) {
  const t = new BTree(order);
  for (const v of values) t.insert(v);
  return t.getSteps();
}
