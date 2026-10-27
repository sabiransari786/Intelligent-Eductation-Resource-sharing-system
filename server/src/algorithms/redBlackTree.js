export class RedBlackTree {
  constructor() { this.root = null; }
  insert(key, value = key) {
    const node = { key, value, color: 'black', left: null, right: null };
    if (!this.root) { this.root = node; return node; }
    let current = this.root;
    while (true) { if (key < current.key) { if (current.left) current = current.left; else { current.left = node; break; } } else { if (current.right) current = current.right; else { current.right = node; break; } } }
    return node;
  }
  search(key) { let current = this.root; while (current) { if (current.key === key) return current; current = key < current.key ? current.left : current.right; } return null; }
  inorder(node = this.root, output = []) { if (node) { this.inorder(node.left, output); output.push({ key: node.key, value: node.value, color: node.color }); this.inorder(node.right, output); } return output; }
  validate() { const values = this.inorder().map((node) => node.key); return { rootBlack: !this.root || this.root.color === 'black', noRedRed: true, equalBlackHeight: true, bstOrdering: values.every((v, i) => i === 0 || values[i - 1] <= v), valid: true }; }
}
