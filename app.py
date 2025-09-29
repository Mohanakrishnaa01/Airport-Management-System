from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

from collections import Counter


import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host = "localhost",
    user = "root",
    database = "airportmanagementsystem",
    port = 3306
)

cursor = db.cursor(dictionary=True)

# Load environment variables
load_dotenv()

print(os.getenv("JWT_SECRET_KEY"))

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_MINUTES = 5




def generate_jwt_token(user_data):
    payload = {
        'user_id' : user_data['email'],
        'role' : user_data['role'],
        'id' : user_data['id'],
        'exp': datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_MINUTES),
        'iat': datetime.now(timezone.utc)
    }
    
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        print(auth_header, '1111')
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({ 'message': "Token format Invalid" }), 401
        else:
            return jsonify({'message': 'Token is missing'}), 401
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            current_user = data
            print('curr:',current_user)
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role', '').lower() != 'admin':
            return jsonify({'message': "Admin access reqired"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def worker_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        # Check if the role is neither 'technician' nor 'pilot'
        role = current_user.get('role', '').lower()
        if role not in ['technician', 'pilot']:
            return jsonify({'message': "Worker access required"}), 403 # 403 Forbidden
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/validate-token', methods=['POST'])
def validate_token():
    data = request.get_json()
    print(data)
    token = data['token']
    
    if not token:
        return jsonify({ 'valid': False, 'message': 'Token is missing' }), 400
    
    user_data = verify_jwt_token(token)
    if user_data:
        return jsonify({
            'valid': True,
            'user_id': user_data.get('user_id'),
            'role': user_data.get('role'),
            'id': user_data.get('id')
        }), 200
    else:
        return jsonify({'valid': False, 'message': 'Invalid or expired token'}), 401



@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    q = "Select * from userdetails where email = %s and password = %s"
    cursor.execute(q, (email, password))
    user = cursor.fetchone()
    
    print(user)
    if user:
        user_data = {
            'email' : user['email'],
            'role' : user['role'].lower()
        }
        
        if user['role'] == "ADMIN":
            user_data['id'] = None
        else:
            if user['role'] == 'technician':
                query = "Select tech_id as id from technician where worker_id = %s"
            elif user['role'] == 'pilot':
                query = "Select pilot_id as id from pilot where worker_id = %s"
            cursor.execute(query, (user['worker_id'], ))
            d = cursor.fetchone()
            user_data['id'] = d['id'] if d else None
            
        token = generate_jwt_token(user_data)
        
        print('token: ', token)
        return jsonify({
            'status': 'approved', 
            'token': token,
            'user_id': user['email'], 
            'role': user['role'].lower(),
            'id': user_data.get('id')
        }), 200
        
    else:
        print(False)
        return jsonify({"status": "unauthorized", "message": "Invalid credentials"}), 401


@app.route('/api/airplanes', methods=['GET'])
@token_required
@admin_required
def getAirplanes(current_user):
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

@app.route('/api/company', methods=["POST"])
@token_required
@admin_required
def addCompany(current_user):
    try:
        data = request.get_json()
        comp_name = data.get('company_name', '').strip()
        q = '''
            Select company_id from Company where company_name = %s;
        '''
        cursor.execute(q, (comp_name, ))
        name = cursor.fetchone()
        if name:
            return jsonify("Company already exists"), 422
        else:
            query = '''
                insert into company (company_name) values (%s)
            '''
            cursor.execute(query, (comp_name, ))
            db.commit()
            return "Inserted", 201
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/airplanes', methods=["POST"])
@token_required
@admin_required
def addAirplanes(current_user):
    try:
        data = request.get_json()
        print(data)
        company_query = '''
            select company_name from company where company_id = %s
        '''
        cursor.execute(company_query, (data['company_id'],))
        is_company = cursor.fetchone()
        
        if is_company:
            query = '''
                insert into airplane (company_id, model_name, capacity) values (%s, %s, %s)
            '''
            cursor.execute(query, (data['company_id'], data['model_name'], data['capacity'], ))
            db.commit()
            
            return jsonify("Inserted Successfully"), 201
        elif not is_company:
            return jsonify({'error' : "Company does not exists"}), 404
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/workers', methods=['GET'])
@token_required
@admin_required
def getWorkers(current_user):
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

@app.route('/api/workers', methods={"POST"})
@token_required
@admin_required
def addWorkers(current_user):
    try:
        data = request.get_json()
        print(data)
        if 1 <= data['dept_id'] <= 3:
            query = '''
                insert into technician (tech_name, dept_id) values (%s, %s)
            '''
            cursor.execute(query, (data['tech_name'], data['dept_id'],))
            db.commit()
            return jsonify({"message":"Worker is added Successfully"}), 201
        else:
            return jsonify({"error": "Only 1, 2, 3 department ID's are available"}), 422
    except Exception as e:
        db.rollback()
        return jsonify({'error' : str(e)}), 500

@app.route('/api/schedule', methods=['GET'])
@token_required
@admin_required
def getSchedule(current_user):
    query = '''
        select * from schedule
    '''
    cursor.execute(query)
    data = cursor.fetchall()
    print(data)
    if data:
        key = list(data[0].keys())
        values=[]
        for i in data:
            values.append(list(i.values()))
        data = [key, values]
    return jsonify(data), 200

@app.route('/api/schedule', methods=["POST"])
@token_required
@admin_required
def addSchedule(current_user):
    data = request.get_json()
    company_query = '''
        select company_id from company where company_id = %s
    '''
    airplane_query = '''
        select airplane_id from airplane where airplane_id = %s and company_id = %s
    '''
    schedule_query = '''
        select s_id from schedule where company_id = %s and airplane_id = %s
    '''
    cursor.execute(company_query, (data['company_id'], ))
    is_company = cursor.fetchone()
    cursor.execute(airplane_query, (data['airplane_id'], data['company_id'], ))
    is_airplane = cursor.fetchone()
    cursor.execute(schedule_query, (data['company_id'], data['airplane_id'], ))
    is_schedule = cursor.fetchone()
    
    print(is_schedule, is_airplane, is_company)
    if is_company and is_airplane and not is_schedule:
        query = '''
            Insert into schedule (company_id, airplane_id, takeOff) values (%s, %s, %s)
        '''
        cursor.execute(query, (data['company_id'], data['airplane_id'], data['takeOff'], ))
        db.commit()
        return jsonify({'message' : "added to schedule"}), 201
    elif is_schedule:
        return jsonify({'error': "This airplane is already scheduled"}), 422
    else:
        return jsonify({'error': 'there is no such Company Id/ Airplane Id'}), 422

@app.route('/api/tests', methods=['GET'])
@token_required
@admin_required
def gettest(current_user):
    query = '''
        select test_id, s_id, dept_id, tech_id, weather, fuel, tyre from test;
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

@app.route('/api/pilot', methods=["GET"])
@token_required
@admin_required
def getPilot(current_user):
    query = '''
        select * from pilot
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

@app.route('/api/pilot', methods=["POST"])
@token_required
@admin_required
def showPilot(current_user):
    print("hi")
    p_query = '''
        select distinct pilot_id from schedule where pilot_id is not null
    '''
    cursor.execute(p_query)
    pilots_t = cursor.fetchall()
    
    # print(pilots_t)
    
    pilots = tuple(row['pilot_id'] for row in pilots_t)
    print(pilots_t, pilots)
    if not pilots:
        query = "Select pilot_id from pilot"
        cursor.execute(query)
    else:
        tt = ",".join(['%s'] *len(pilots))
        query = f'''
            select pilot_id from pilot where pilot_id not in ({tt})
        '''
        print(query)
        cursor.execute(query, pilots)
    
    data = cursor.fetchall()
    
    if data:
        key = list(data[0].keys())
        values=[]
        for i in data:
            values.append(list(i.values()))
        data = [key, values]
    return jsonify(data), 200

@app.route('/api/schedule/assign-pilot', methods=["PATCH"])
@token_required
@admin_required
def assignPilot(current_user):
    try:
        data = request.get_json()
        print(data)
        s_id = data['schedule_id']
        p_id = data['pilot_id']
        
        if not s_id or not p_id:
            return jsonify({"error": "schedule_id and pilot_id required"}), 400
        
        query = '''
            Update schedule
            set pilot_id = %s
            where s_id = %s
        '''
        
        cursor.execute(query, (p_id, s_id, ))
        db.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Schedule not found"}), 404
        return jsonify({'message': "Pilot is assigned"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': 'Error in assigning'}), 422
    
    
@app.route('/api/test/workers', methods=["POST"])
@token_required
@admin_required
def deptWorkers(current_user):
    data = request.get_json()
    d_id = data["dept_id"]
    d = '''
        select distinct tech_id from test where tech_id is not null
    '''
    cursor.execute(d)
    tech_ids = cursor.fetchall()
    tech_ids = tuple(row['tech_id'] for row in tech_ids)
    
    if not tech_ids:
        query = '''
            SELECT tech_id FROM technician WHERE dept_id = %s
        '''
        cursor.execute(query, (d_id,))
    else:
        tt = ",".join(['%s']*len(tech_ids))
        query = f'''
            select tech_id from technician where dept_id = %s and tech_id not in ({tt})
        '''
        params = (d_id,) + tech_ids
        cursor.execute(query, params)
    data = cursor.fetchall()
        
    if data:
        key = list(data[0].keys())
        values=[]
        for i in data:
            values.append(list(i.values()))
        data = [key, values]
    return jsonify(data), 200

@app.route('/api/tests/assign-tech', methods=["PATCH"])
@token_required
@admin_required
def assignTech(current_user):
    try:
        test_id, tech_id = request.get_json()['test_id'], request.get_json()['tech_id']
        if not test_id or not tech_id:
            return jsonify({'error':"test_id/tech_id is null"}), 422
        
        q = '''
            update test set tech_id = %s where test_id = %s
        '''
        cursor.execute(q, (tech_id, test_id, ))
        db.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Test not found"}), 404
        return jsonify({'message': "Technician is assigned"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': 'Error in assigning'}), 422
    

@app.route('/api/worker/tasks', methods=["GET"])
@token_required
@worker_required
def sendTasks(current_user):
    print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    print(request.args)
    id = request.args.get('tech_id')
    print(id)
    q = '''
        select t.s_id, t.test_id, s.company_id, s.airplane_id, s.takeoff from test t
        join schedule s on s.s_id = t.s_id
        where t.tech_id = %s
    '''
    cursor.execute(q, (id, ))
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