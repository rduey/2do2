from db import *
from flask import jsonify

def printItem(item):
	print(type(item))
	print("ID: " , item.id)
	print("   Title: " , item.title)
	print("   Description: " , item.desc)
	print("   Target Date: " ,item.target)
	print("   Due Date: " , item.due)
	#print(type(item.due))
	print("   Late Date: " , item.late)
	print("   Parent ID: " , item.parent)
	print("   Created date : ", item.created)


def generateTestDB0(data):
	data.insert('clean shoes','remove mud')
	data.insert('get mail')
	p1 = data.insert('pay bills')
	data.insert('water bill',due="22 08 20",parent = p1.id)
	data.insert('power bill',due="22 08 10",parent = p1.id)
	data.insert('internet bill',due="22 09 14",parent = p1.id)
	p2 = data.insert('CSE Project','worth 80% grade',due="22 09 27")
	data.insert('initial presentation',due="22 08 12",parent=p2.id)
	data.insert('part 1',target="22 08 18",due="22 08 22",late="22 08 27",parent=p2.id)
	p3 = data.insert('final',target="22 09 12",parent = p2.id)
	data.insert('final submission',due="22 09 15",parent = p3.id)
	data.insert('presentation',due = "22 09 17 14 00", parent = p3.id)

def generateTestDB1(data):
	p1 = data.insert('replace smoke detector batteries',due="22 09 12")
	#data.insert('buy 9v batterys',due"22 09 10",parent = p1.id)
	p2 = data.insert('class registration',due="22 08 27 15 30" , late="22 09 09 11 00")
	data.insert('drc meeting','with amy',due="22 08 25 16 00" , parent=p2.id)
	p3 = data.insert('fix car')
	data.insert('buy 9v batterys',due = "22 09 10",parent = p1.id)
	p4 = data.insert('take to shop',parent=p3.id)
	data.insert('buy tires', parent = p4.id)
	data.insert('replace hubcap',parent = p4.id)
	data.insert('clean floormats',parent = p3.id)

if __name__ == "__main__":
	data = Database()
	while(True):
		next = input("Enter Command: ")
		if (next == "gen") |( next == "gen0"):
			generateTestDB0(data)
		if next == "gen1":
			generateTestDB1(data)
		if next == "gen2":
			generateTestDB0(data)
			generateTestDB1(data)
		if next == "list":
			for item in data.list():
				printItem(item)
		if next == "del":
			data.delete(int(input("Enter ID number: ")))
		if next == "del all":
			for item in data.list():
				data.delete(item.id)
		if next == "exit":
			break
