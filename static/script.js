$(document).ready(function() {
	if (window.location.pathname === '/') {
		getTree();
	}
	return;
});

/** Tree that stores data */
var tree;

/** Sends Get request and prints tree and queue view */
function getTree() {
	/** Get entire List */
	$.ajax({
		data : {},
		type: 'Get',
		url: '/list',

	})
	.done(function(data) {
		if (data.error) {
			$('#errorAlert').text(data.error).show();
		} else {
			$('#errorAlert').hide();

			console.log(data); // prints JSON data to console

			tree = new Tree();
			tree.parseJSON(data);
			tree.print();
			tree.display();
			tree.queueView();
			addSortable();
			addColor(tree.getNodeByID(-1));
			console.log(tree.sortDueDate());
		}
	})
	return;
};

/** Get element that opens an add modal */
var addtriggerElement;
var addmodal = document.getElementById('addModal');
$(document).on('shown.bs.modal', addmodal, function(event) {
	addtriggerElement = event.relatedTarget;
	return;
});

/** Get element that opens an edit modal */
var edittriggerElement;
var editmodal = document.getElementById('editModal');
$(document).on('shown.bs.modal', editmodal, function(event) {
	edittriggerElement = event.relatedTarget;
	return;
});

/** Delete current tree and queue and reprint */
function reprintViews() {
	var tasktree = document.getElementById('root');
	var taskqueue = document.getElementById('queue');
	tasktree.innerHTML = "";
	taskqueue.innerHTML = "";
	getTree();
	return;
};

/** Add task to list */
function addList(event) {
	var titleInput = document.getElementById('titleAddInput').value.trim();
	var descInput = document.getElementById('descAddInput').value.trim();
	var targetInput = document.getElementById('targetAddInput').value.trim();
	var dueInput = document.getElementById('dueAddInput').value.trim();
	var lateInput = document.getElementById('lateAddInput').value.trim();

	/** Gets parent ID */
	var parentID;
	if (addtriggerElement.id == "add-root") {
		parentID = -1;
	} else {
		var parentnode = addtriggerElement.parentNode.parentNode.parentNode
		parentID = parentnode.id.substr(0, parentnode.id.length-1);
	}
		
	/** Sends POST request */
	$.ajax({
		data : {
		  title: titleInput,
		  desc: descInput,
		  target: targetInput,
		  due: dueInput,
		  late: lateInput,
		  parent: parentID
		},
		type: 'POST',
		url: '/insert'
	})
	.done(function(data) {
		if (data.error) {
			$('#errorAlert').text(data.error).show();
		} else {
			$('#errorAlert').hide();
			reprintViews();
		}
	});
	$('#addModal').modal('hide');
	return;
};
var add = document.getElementById('add');
if (add !== null) {
	add.addEventListener("click", addList);
}

/** Delete task from list */
function deleteList(event) {
	var parentnode = event.target.parentNode.parentNode.parentNode;
	var idInput = parentnode.id.substr(0, parentnode.id.length-1);

	/** Sends POST request */
	$.ajax({
		data : {
		  id: idInput
		},
		type: 'POST',
		url: '/delete'
	})
	.done(function(data) {
		if (data.error) {
			$('#errorAlert').text(data.error).show();
		} else {
			$('#errorAlert').hide();
			parentnode.remove();
		}
	})

	/** Get current tree */ 
	var node = tree.getNodeByID(idInput);

	/** Delete from database */
	tree.delete(node);
	tree.print();

	/** Reprint Queue */
	var taskqueue = document.getElementById('queue');
	taskqueue.innerHTML = "";
	tree.queueView();
	return;
};

/** Edit task */
function editTask(event) {
	var titleInput = document.getElementById('titleEditInput').value.trim();
	var descInput = document.getElementById('descEditInput').value.trim()
	var targetInput = document.getElementById('targetEditInput').value.trim();
	var dueInput = document.getElementById('dueEditInput').value.trim();
	var lateInput = document.getElementById('lateEditInput').value.trim();

	/** Gets node ID and node info */
	var ele = edittriggerElement.parentNode.parentNode.parentNode;
	var nodeID = ele.id.substr(0, ele.id.length-1);
	var node = tree.getNodeByID(nodeID);

	/** No change if empty */
	if (titleInput.length == 0) {
		titleInput = node.title;
	}
	if (descInput.length == 0) {
		descInput = node.desc;
	}
	if (targetInput.length == 0) {
		targetInput = node.target;
	}
	if (dueInput.length == 0) {
		dueInput = node.due;
	}
	if (lateInput.length == 0) {
		lateInput = node.late;
	}

	/** Sends POST request */
	$.ajax({
		data : {
			id: node.id,
			title: titleInput,
			desc: descInput,
			target: targetInput,
			due: dueInput,
			late: lateInput,
			parent: node.parent.id
		},
		type: 'POST',
		url: '/update'
	})
	.done(function(data) {
		if (data.error) {
			$('#errorAlert').text(data.error).show();
		} else {
			$('#errorAlert').hide();
			reprintViews();
		}
	});
	$('#editModal').modal('hide');
	return;
};
var edit = document.getElementById('edit');
if (edit !== null) {
	edit.addEventListener("click", editTask);
}

/** Add task information to show modal */
function showTask(event) {
	var ele = event.target.parentNode.parentNode.parentNode
	var nodeID = ele.id.substr(0, ele.id.length-1);
	var node = tree.getNodeByID(nodeID);

	var info = document.querySelector("#show-title span");
	info.innerHTML = node.title;

	info = document.querySelector("#show-due span");
	if (node.due_date === "Invalid Date") {
		info.innerHTML = "Undated";
	} else {
		info.innerHTML = node.due_date;
	}

	info = document.querySelector("#show-target span");
	if (node.target_date === "Invalid Date") {
		info.innerHTML = "Undated";
	} else {
		info.innerHTML = node.target_date;
	}

	info = document.querySelector("#show-late span");
	if (node.late_date === "Invalid Date") {
		info.innerHTML = "Undated";
	} else {
		info.innerHTML = node.late_date;
	}
	
	info = document.querySelector("#show-desc span");
	if (node.desc.length == 0) {
		info.innerHTML = "None";
	} else {
		info.innerHTML = node.desc;
	}
	return;
};

/** Login Open and Close Forms */
function openForm() {
	document.getElementById("myForm").style.display = "block";
	return;
};
function closeForm() {
	document.getElementById("myForm").style.display = "none";
	return;
};

/** Nested List SortableJS */
function addSortable() {
	var group = [].slice.call(document.querySelectorAll('.tree'));
	for (var i = 0; i < group.length; i++) {
		new Sortable(group[i], {
			group: {
				name: 'tree',
				put: false
			},
			animation: 150,
			fallbackOnBody: true,
		});
	};
	return;
};

/** Change color */
function addColor(node) {
	if (node.id == -1) {
		node.children.forEach(child => this.addColor(child));
      	return;
	}
	if (node.hasChildren) {
		var ele = document.getElementById(node.id + "l");
		ele.style["background-color"] = "#e9f5f1";
	}
	node.children.forEach(child => this.addColor(child));
	return;
}
