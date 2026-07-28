import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://dntech.id';

export const options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '90s', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/products/dnpeople`);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
