export class AVLTree {
  constructor() { this.root = null; }
  height(node) { return node?.height || 0; }
  update(node) { node.height = 1 + Math.max(this.height(node.left), this.height(node.right)); return node; }
  rotateRight(node) { const pivot = node.left; node.left = pivot.right; pivot.right = node; this.update(node); return this.update(pivot); }
  rotateLeft(node) { const pivot = node.right; node.right = pivot.left; pivot.left = node; this.update(node); return this.update(pivot); }
  insert(key, value = key) {
    const add = (node) => {
      if (!node) return { key, value, height: 1, left: null, right: null };
      if (key < node.key) node.left = add(node.left); else node.right = add(node.right);
      this.update(node);
      const balance = this.height(node.left) - this.height(node.right);
      if (balance > 1 && key < node.left.key) return this.rotateRight(node);
      if (balance < -1 && key >= node.right.key) return this.rotateLeft(node);
      if (balance > 1) { node.left = this.rotateLeft(node.left); return this.rotateRight(node); }
      if (balance < -1) { node.right = this.rotateRight(node.right); return this.rotateLeft(node); }
      return node;
    };
    this.root = add(this.root);
    return this.search(key);
  }
  search(key) { let node = this.root; while (node) { if (node.key === key) return node; node = key < node.key ? node.left : node.right; } return null; }
  inorder(node = this.root, output = []) { if (node) { this.inorder(node.left, output); output.push(node); this.inorder(node.right, output); } return output; }
  isBalanced(node = this.root) { if (!node) return true; return Math.abs(this.height(node.left) - this.height(node.right)) <= 1 && this.isBalanced(node.left) && this.isBalanced(node.right); }
}
