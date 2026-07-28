import http from 'k6/http';
import { check, sleep } from 'k6';

const API_BASE = __ENV.API_BASE || 'https://api.dntech.id/api/v1';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '60s', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.2'],
  },
};

export default function () {
  const payload = JSON.stringify({
    name: 'k6 user',
    email: `k6-${__VU}-${__ITER}@example.com`,
    message: 'Performance test message with enough characters.',
  });
  const res = http.post(`${API_BASE}/leads`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, {
    'status 2xx/201': (r) => r.status === 200 || r.status === 201,
  });
  sleep(1);
}
