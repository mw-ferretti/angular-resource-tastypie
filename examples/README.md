#Instructions

##Backend:
'''
IMPORT - USE PYTHON3
EX:
1. virtualenv env --no-site-packages --python=/usr/bin/python3
2. source env/bin/active
'''

THEN:
1. cd backend/
2. pip install -r requirements.txt
3. cd myproject
4. ./manager syncdb
5. ./manager runserver 0.0.0.0:8001

```
Django admin superuser "admin", password "1234"
```

##Frontend:
1. cd frontend/
2. python3 -m http.server
```
Now, open your browser and go to 127.0.0.1:8000
```
