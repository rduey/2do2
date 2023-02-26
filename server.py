#from urllib import request
from xml.etree.ElementInclude import include
from flask import Flask, render_template, request, jsonify, redirect, url_for, abort, session
import db
from playhouse.shortcuts import model_to_dict
from flask_session import Session
import logging

app = Flask(__name__)
app.secret_key = b'\xb5\x81&\xee\xe7&#g_+\xcay\x02\xdaq\xbe'
data = db.Database()
logging.basicConfig(filename='system.log',level=logging.INFO,filemode = 'a')

@app.route("/")
def home():
    try:
       userID = session["id"]
    except:
       logging.info("Redirected user to login")
       return redirect(url_for('login'))
    return render_template("frontend.html")

@app.route("/insert", methods = ["POST"])
def insert():
    title  =  readInfo('title')
    desc = readInfo('desc')
    target = readInfo('target')
    due = readInfo('due')
    late = readInfo('late')
    parent = readInfo('parent')
    userID = session["id"]
    try:
       new = data.insert(title,desc,target,due,late,parent,userID);
       logging.info('Task created ' + str(new.id))
       return jsonify(formatTask(new))
    except Exception as e:
       logging.error('Task creation exception ', exc_info=True)
       #print("Error on add operation: " , e)
       abort(400)
       return None

@app.route("/update", methods = ["POST"])
def update():
    id = readInfo('id')
    title  =  readInfo('title')
    desc = readInfo('desc')
    target = readInfo('target')
    due = readInfo('due')
    late = readInfo('late')
    parent = readInfo('parent')
    userID = session["id"]
    try:
       updated  = data.update(id,title,desc,target,due,late,parent,userID);
       logging.info('Task updated ' + str(id))
       return jsonify(formatTask(updated))
    except Exception as e:
       logging.error('Task update exception ', exc_info=True)
       #print("Error on update operation: " , e)
       abort(400)
       return None

@app.route("/delete", methods = ["POST"])
def delete():
    try:
        id = request.form['id']
        userID = session["id"]
        data.delete(id,userID)
    except:
        logging.error('Error on delete task ', exc_info=True)
        abort(400)
    return str(id)

def readInfo(field):
    try:
       return request.form[field]
    except:
       return None

def formatTask(task):
    item = model_to_dict(task)
    del item['user']
    return item

@app.route("/list", methods = ["GET"])
def list():
    try:
       return jsonify([formatTask(item) for item in data.list(session["id"])])
    except:
       logging.error('Error on returning list of tasks ', exc_info=True)

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        userID = None
        try:
            username = request.form['username']
            password = request.form['password']
            userID = data.getAccount(username, password)
        except:
            logging.info('Account login exception ')
            logging.debug('Account login exception info ', exc_info=True)
        if userID == None:
            error = 'Invalid Credentials. Please try again.'
        else:
            session["id"] = userID
            logging.info('Logged in user ' + str(userID))
            return redirect(url_for('home'))
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('id', None)
    logging.info('Logged out user')
    return redirect(url_for('login'))

@app.route("/create", methods = ["POST"])
def create():
    #userID = None
    try:
       username = request.form['username']
       password = request.form['password']
       passwordRepeat = request.form['passwordRepeat']
       if password != passwordRepeat:
          logging.info('Account creation rejected due to password mismatch')
          return render_template('login.html', createError="Passwords do not match")
       userID = data.createAccount(username, password)
       session["id"] = userID
       logging.info('Created user ' + str(userID))
       return redirect(url_for('home'))
    except Exception as e:
       if "username" in str(e):
          logging.info('Account creation rejected due to username taken')
          return render_template('login.html', createError="Username is already taken")
       logging.error('Account creation error ', exc_info=True)
       abort(400, str(e))

if __name__ == "__main__":
    app.run(debug=True)
