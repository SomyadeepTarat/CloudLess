import http.client
import json

HOST = 'localhost'
PORT = 5000
WORKER_ID = 'test-worker'

conn = http.client.HTTPConnection(HOST, PORT)
register_body = json.dumps({'worker_id': WORKER_ID, 'cpu': 10, 'ram': 20, 'status': 'idle'})
conn.request('POST', '/register', register_body, {'Content-Type': 'application/json'})
print('REGISTER:', conn.getresponse().read().decode())
conn.close()

conn = http.client.HTTPConnection(HOST, PORT)
heartbeat_body = json.dumps({'worker_id': WORKER_ID, 'cpu_usage': 5, 'ram_usage': 15})
conn.request('POST', '/heartbeat', heartbeat_body, {'Content-Type': 'application/json'})
print('HEARTBEAT:', conn.getresponse().read().decode())
conn.close()

conn = http.client.HTTPConnection(HOST, PORT)
job_body = json.dumps({'code': 'print("hello")', 'language': 'python', 'priority': 1})
conn.request('POST', '/job', job_body, {'Content-Type': 'application/json'})
resp = conn.getresponse()
submit_body = resp.read().decode()
print('SUBMIT JOB:', resp.status, submit_body)
conn.close()

submitted_job = None
try:
    submitted_job = json.loads(submit_body).get('job', {})
except Exception:
    submitted_job = None

conn = http.client.HTTPConnection(HOST, PORT)
conn.request('GET', f'/job?worker_id={WORKER_ID}')
resp = conn.getresponse()
job_data = resp.read().decode()
print('GET JOB:', job_data)
conn.close()

assigned_job = None
try:
    assigned_job = json.loads(job_data)
except Exception:
    assigned_job = None

job_id = None
if assigned_job and isinstance(assigned_job, dict):
    job_id = assigned_job.get('job_id') or assigned_job.get('jobId')

if not job_id:
    job_id = submitted_job.get('job_id') if submitted_job else 'test-job'

conn = http.client.HTTPConnection(HOST, PORT)
result_body = json.dumps({'worker_id': WORKER_ID, 'job_id': job_id, 'output': 'hello', 'status': 'completed', 'time_taken': 0.1})
conn.request('POST', '/result', result_body, {'Content-Type': 'application/json'})
resp = conn.getresponse()
print('RESULT:', resp.status, resp.read().decode())
conn.close()

conn = http.client.HTTPConnection(HOST, PORT)
conn.request('GET', f'/status/{job_id}')
print('STATUS:', conn.getresponse().read().decode())
conn.close()
