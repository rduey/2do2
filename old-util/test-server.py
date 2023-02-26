import requests

server = "http://127.0.0.1:5000"

def insert():
	print("Enter new task info , or leave field (other than title) blank")
	title = input("Enter title: ")
	desc = input("Enter description: ")
	print("Datetime in format YY MM DD HH MM")
	target = input("Enter target date: ")
	due = input("Enter due date: ")
	late = input("Enter late date: ")
	parent = input("Enter parent ID: ")
	requests.post((server + "/insert") , {'title' : title , 'desc' : desc ,
		'target' : target , 'due' : due , 'late' : late , 'parent' : parent})

def delete(id):
	requests.post((server + "/delete") , {'id' : id})

def list():
	data = requests.get((server + '/list'))
	for item in data:
		print(item)

if __name__ == "__main__":
	while(True):
		next = input("Enter Command: ")
		if next == "exit": break
		if next[0:4] == "send":
			if True: #len(next) == 4:
				insert()
			#else:
			#	insert(next[5:])
		if next == "delete":
			delete(input("Enter ID: "))
		if next == "list":
			list()
