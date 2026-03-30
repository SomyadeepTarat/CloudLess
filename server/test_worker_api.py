import http.client
import json

conn = http.client.HTTPConnection('localhost', 5000)
body = json.dumps({'worker_id': 'test-worker', 'cpu': 10, 'ram': 20, 'status': 'idle'})
conn.request('POST', '/register', body, {'Content-Type': 'application/json'})
print('REGISTER:', conn.getresponse().read().decode())
conn.close()

conn = http.client.HTTPConnection('localhost', 5000)
body = json.dumps({'worker_id': 'test-worker', 'cpu_usage': 5, 'ram_usage': 15})
conn.request('POST', '/heartbeat', body, {'Content-Type': 'application/json'})
print('HEARTBEAT:', conn.getresponse().read().decode())
conn.close()

conn = http.client.HTTPConnection('localhost', 5000)
conn.request('GET', '/job?worker_id=test-worker')
print('GET JOB:', conn.getresponse().read().decode())
conn.close()
