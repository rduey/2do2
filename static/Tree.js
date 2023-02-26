class TreeNode {
  constructor(id = null, parent = null, title) {
    this.id = id;
    this.parent = parent;
    this.children = [];

    this.title = title;
    this.desc = null;
    this.target = null;
    this.due = null;
    this.late = null;
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }

  get target_date() {
    let dateString = (this.target).toUTCString();
    dateString = dateString.slice(0, -13);
    return dateString;
  }

  get due_date() {
    let dateString = (this.due).toUTCString();
    dateString = dateString.slice(0, -13);
    return dateString;
  }

  get late_date() {
    let dateString = (this.late).toUTCString();
    dateString = dateString.slice(0, -13);
    return dateString;
  }
}

class Tree {
  constructor() {
    this.root = new TreeNode(-1, null, 'root');
  }

  // adds a new node as a child of the specified parent
  add(id, parent, title, desc = null) {
    let node = new TreeNode(id, parent, title);
    node.desc = desc;
    parent.children.push(node);
    return node;
  }

  // deletes a node
  delete(node) {
    if (node.id == -1){
      console.log('cannot delete root node');
      return;
    }
    let siblings = node.parent.children;
    const index = siblings.indexOf(node);
    siblings.splice(index, 1);
  }

  // return node object by its ID #
  getNodeByID(id, node = this.root) {
    if (node.id == id) {
      return node;
    }
    for(let i = 0; i < node.children.length; i++){
      let found = this.getNodeByID(id, node.children[i]);
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  // parse the JSON object returned by the server
  parseJSON(data) {
    for (let i = 0; i < data.length; i++){
      let jsonObj = data[i];
      let parent = this.root;
      if (jsonObj.parent != null){
        parent = this.getNodeByID(jsonObj.parent);
      }
      let node = this.add(jsonObj.id, parent, jsonObj.title, jsonObj.desc);
      node.target = new Date(jsonObj.target);
      node.due = new Date(jsonObj.due);
      node.late = new Date(jsonObj.late)
    }
  }

  // print the tree to the console
  print(node = this.root, indent = 0){
    if (node.id == -1) {
      console.log('_'.repeat(27) + 'To Do List' + '_'.repeat(27));
      node.children.forEach(child => this.print(child, indent));
      console.log('_'.repeat(64))
      return;
    }
    let dashes = ' '.repeat(6);
    dashes = dashes.repeat(indent);
    console.log(dashes + node.title + ' | id: ' + node.id);
    node.children.forEach(child => this.print(child, indent + 1));
  }

  // adds date to clone node
  addDate(clone, node) {
    if (node.due_date === "Invalid Date") {
      clone.querySelector("span").insertAdjacentHTML("beforeend", "Undated");
    } else {
      clone.querySelector("span").insertAdjacentHTML("beforeend", node.due_date);
    }
    return;
  }

  // display the tree on the webpage
  display(node = this.root) {
    if (node.id == -1){
      node.children.forEach(child => this.display(child));
      return;
    }
    var template = document.getElementById("task-list-template");
    var clone = template.content.cloneNode(true);
    clone.querySelector("div").id = node.id + "l";
    clone.querySelector("a").insertAdjacentHTML("afterbegin", node.title);
    clone.querySelector("a").href = "#" + "link" + node.id;
    clone.querySelector("div div").id = "link" + node.id;
    this.addDate(clone, node);
    
    var parent;
    if (node.parent.id == -1) {
      parent = document.getElementById("root");
    } else {
      parent = document.getElementById("link" + node.parent.id);
    }
    parent.appendChild(clone);
    node.children.forEach(child => this.display(child));
  }

  // display only the leaves on the webpage
  queueView(node = this.root) {
    let leaves = this.sortDueDate();
    for (var i = 0; i < leaves.length; i++) {
      var queue = document.getElementById("queue");
      var template = document.getElementById("queue-template");
      var clone = template.content.cloneNode(true);

      clone.querySelector("li").insertAdjacentHTML("afterbegin", leaves[i].title);
      clone.querySelector("li").id = leaves[i].id + "q";
      this.addDate(clone, leaves[i]);

      var parenttitle = leaves[i].parent.title;
      while (parenttitle != "root") {
        clone.querySelector("li").prepend(parenttitle + " > ");
        leaves[i] = leaves[i].parent;
        parenttitle = leaves[i].parent.title;
      }
      queue.appendChild(clone);
    }
  }

  sortDueDate(node = this.root, list){
    if (node.id == -1) {
      var newList = [];
      node.children.forEach(child => this.sortDueDate(child, newList));
      newList.sort((a, b) => a.due - b.due);
      return newList;
    }
    if (node.isLeaf) {
      list.push(node);
    }
    node.children.forEach(child => this.sortDueDate(child, list));
  }
}

// creates a template tree for testing
function tempTree(){
  let tree = new Tree();
  let hw1 = tree.add(0, tree.root, 'Homework 1');
  tree.add(1, hw1, 'Part A');
  let part_b = tree.add(2, hw1, 'Part B');
  tree.add(3, part_b, 'Question 1');
  tree.add(4, part_b, 'Question 2');
  tree.add(5, hw1, 'Part C');
  let hw2 = tree.add(6, tree.root, 'Homework 2');
  tree.add(7, hw2, 'Multiple Choice');
  tree.add(8, hw2, 'Free Response');
  tree.add(9, tree.root, 'Essay 1');
  //tree.delete(tree.getNodeByID(6))
  return tree;
}
