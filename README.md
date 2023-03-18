# 2do<sup>2</sup>
## Screenshots

## Installation
To install 2do2, first install all python dependencies using pip

`$ pip3 install Flask Flask_Session peewee bcrypt requests`

Then install the WSGI server gunicorn

`$ sudo apt install gunicorn`

run the server using gunicorn with N workers

`$ gunicorn -w [N] 'server:app'`

Forward traffic on port 80 to the server at 127.0.0.1:8000 using a reverse proxy such as nginx. The server block to add to nginx has beed provided

You may need to disable a default page in the .d/ configuration folders first

Alternativly, you can run the server bound to the machine ip, and use port forwarding to connect to the server (not reccomended

`$ gunicorn -w [N] -b 0.0.0.0 'server:app'`
