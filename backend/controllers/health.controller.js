export function getHealth(req, res) {
  res.json({
    ok: true,
    service: 'E-Learning LMS API',
    timestamp: new Date().toISOString(),
  });
}
