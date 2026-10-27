export class BST {
  constructor() { this.root = null; }
  insert(key, value = key) {
    const node = { key, value, left: null, right: null };
    if (!this.root) { this.root = node; return node; }
    let current = this.root;
    while (true) {
      if (key < current.key) {
        if (current.left) current = current.left; else { current.left = node; return node; }
      } else {
        if (current.right) current = current.right; else { current.right = node; return node; }
      }
    }
  }
  search(key) {
    let current = this.root;
    while (current) { if (key === current.key) return current; current = key < current.key ? current.left : current.right; }
    return null;
  }
  inorder(node = this.root, output = []) { if (node) { this.inorder(node.left, output); output.push(node); this.inorder(node.right, output); } return output; }
  preorder(node = this.root, output = []) { if (node) { output.push(node); this.preorder(node.left, output); this.preorder(node.right, output); } return output; }
  postorder(node = this.root, output = []) { if (node) { this.postorder(node.left, output); this.postorder(node.right, output); output.push(node); } return output; }
  levelOrder() {
    if (!this.root) return [];
    const queue = [this.root], output = [];
    while (queue.length) { const node = queue.shift(); output.push(node); if (node.left) queue.push(node.left); if (node.right) queue.push(node.right); }
    return output;
  }
}
