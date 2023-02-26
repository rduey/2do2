import datetime
from peewee import *
import bcrypt

db = SqliteDatabase('todo.db')

class BaseModel(Model):
	class Meta:
		database = db

class User(BaseModel):
	username = TextField(unique = True)
	password = BlobField()
	salt = BlobField()
	created = DateTimeField()

class Task(BaseModel):
	user = ForeignKeyField(User, backref='tasks')
	title =  TextField()
	desc = TextField(null = True)
	target = DateTimeField(null = True)
	due = DateTimeField(null = True)
	late = DateTimeField(null = True)
	parent = IntegerField(null = True)
	created = DateTimeField()

class Database():


	def __init__(self):
		db.connect()
		db.create_tables([Task])
		db.create_tables([User])
		salt = bcrypt.gensalt()
		passDefault = bcrypt.hashpw('7'.encode(encoding = 'UTF-8'),salt) 
		passAdmin = bcrypt.hashpw('admin'.encode(encoding = 'UTF-8'),salt)
		User.get_or_create(id=0,defaults = {'username' : 'default' , 'password' : passDefault 
			, 'created' : datetime.datetime.now() , 'salt' : salt})
		User.get_or_create(id=1,defaults = {'username' : 'admin' , 'password' : passAdmin 
			,'created' : datetime.datetime.now() , 'salt' : salt})
		db.close()

	def insert (self,title,desc = None,target = None,due = None,late = None,parent = None,userID = 0):
		newTask = Task()
		newTask.created = datetime.datetime.now()
		newTask.user = User.get(User.id == userID)
		return self.setTask(newTask,title,desc,target ,due,late , parent)

	def setTask(self,task,title,desc = None,target = None,due = None,late = None ,parent = None):
		task.title = title
		task.desc = desc
		task.target = self.dateTimeParse(target)
		task.due = self.dateTimeParse(due)
		task.late = self.dateTimeParse(late)
		task.parent = parent
		task.save()
		return task

	def dateTimeParse(self , dt):
		if (type(dt) != "string"):
			return dt
		return datetime.strp(dt , "%Y %-m %-d %-H %-M")

	def delete (self,id,userID = 0):
		for item in Task.select().where(Task.parent == id):
			self.delete(item.id)
		curr = Task.get(Task.id == id)
		if curr.user == User.get(User.id == userID):
			curr.delete_instance()

	def update (self,id,title,desc = None,target = None,due = None,late = None,parent = None,userID = 0):
		curr = Task.get(Task.id == id)
		if curr.user == User.get(User.id == userID):
			return self.setTask(curr,title,desc,target ,due,late , parent)

	def list (self,userID = 0):
		return Task.select().join(User).where(User.id  == userID)

	def createAccount(self,username,password):
		newUser = User()
		newUser.created = datetime.datetime.now()
		newUser.username = username
		newUser.salt = bcrypt.gensalt()
		newUser.password = bcrypt.hashpw(password.encode(encoding = 'UTF-8'),newUser.salt)
		newUser.save()
		return newUser.id

	def getAccount(self,username,password):
		curr = User.get(User.username == username)
		if (curr.password == bcrypt.hashpw(password.encode(encoding = 'UTF-8'),curr.salt)):
			return curr.id

if __name__ == "__main__":
	data = Database()
