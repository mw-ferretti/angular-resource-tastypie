### instructions ###

### Backend:
------------
cd backend/
pip install -r requirements.txt
cd myproject
./manager syncdb
./manager runserver 0.0.0.0:8001

### Frontend:
-------------
cd frontend
python -m SimpleHTTPServer

### END
-------
Now, open your browser and go to 127.0.0.1:8000
