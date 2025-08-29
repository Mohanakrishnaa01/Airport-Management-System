from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

from collections import Counter

app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host = "localhost",
    user = "root",
    database = "airportmanagementsystem",
    port = 3306
)

cursor = db.cursor(dictionary=True)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    print(data)
    email = data.get("email")
    password = data.get("password")
    
    q = "Select * from userdetails where email = %s and password = %s"
    cursor.execute(q, (email, password))
    user = cursor.fetchone()
    
    if user:
        print(user)
        return jsonify({'status': 'approved', 'user':user}, 200)
    else:
        print(False)
        return jsonify({"status": "unauthorized"}), 401
    
@app.route('/api/airplanes', methods=['GET'])
def getAirplanes():
    query = '''
        select c.company_id, c.company_name, a.airplane_id, a.model_name, a.capacity
        from Airplane a
        join company c on c.company_id = a.company_id;
    '''
    cursor.execute(query)
    data = cursor.fetchall()
    
    if data:
        key = list(data[0].keys())
        values=[]
        for i in data:
            values.append(list(i.values()))
        data = [key, values]
    return jsonify(data), 200

@app.route('/api/workers', methods=['GET'])
def getWorkers():
    query = '''
        select t.tech_id, t.tech_name, d.dept_id, d.dept_name
        from technician t
        join department d on d.dept_id = t.dept_id
    '''
    cursor.execute(query)
    data = cursor.fetchall()
    
    if data:
        key = list(data[0].keys())
        values=[]
        for i in data:
            values.append(list(i.values()))
        data = [key, values]
    return jsonify(data), 200

@app.route('/api/schedule', methods=['GET'])
def getSchedule():
    query = '''
        select * from schedule
    '''
    cursor.execute(query)
    data = cursor.fetchall()
    
    if data:
        key = list(data[0].keys())
        values=[]
        for i in data:
            values.append(list(i.values()))
        data = [key, values]
    return jsonify(data), 200

@app.route('/api/test', methods=['GET'])
def gettest():
    query = '''
        select * from test;
    '''
    cursor.execute(query)
    data = cursor.fetchall()
    
    if data:
        key = list(data[0].keys())
        values=[]
        for i in data:
            values.append(list(i.values()))
        data = [key, values]
    return jsonify(data), 200

if __name__ == "__main__":
    app.run(debug=True)