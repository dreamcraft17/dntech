import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://dntech.id';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '90s', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'contains DN Tech': (r) => r.body.includes('DN Tech'),
  });
  sleep(1);
}
