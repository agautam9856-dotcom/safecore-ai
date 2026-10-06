const http = require('http');

async function testApi(payload, type) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ payload, type });
    const req = http.request('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("== RUNNING SRE STRESS TESTS ==");
  
  // VECTOR A
  const resA = await testApi("SBI ALERT: Your NetBanking account is suspended due to expired KYC. Verify your identity immediately at https://sbi-kyc-portal.cc/login to prevent permanent blockage.", "message");
  console.log("VECTOR A - Score:", resA.risk_score, "Level:", resA.risk_level, "Category:", resA.scam_category);
  if (resA.risk_level !== 'CRITICAL') throw new Error("Vector A failed to reach CRITICAL");

  // VECTOR B
  const resB = await testApi("Congratulations! You have been selected for part-time YouTube rating tasks earning Rs 5,000/day. Contact HR on Telegram: https://t.me/job_recruiter_2026.", "message");
  console.log("VECTOR B - Score:", resB.risk_score, "Level:", resB.risk_level, "Category:", resB.scam_category);
  if (resB.risk_level !== 'HIGH') throw new Error("Vector B failed to reach HIGH");

  // VECTOR C
  const resC = await testApi("Hey Aman, are we still meeting in the college library at 4 PM to discuss the project?", "message");
  console.log("VECTOR C - Score:", resC.risk_score, "Level:", resC.risk_level, "Category:", resC.scam_category);
  if (resC.risk_level !== 'LOW') throw new Error("Vector C failed to remain LOW");

  console.log("ALL TESTS PASSED SUCCESSFULLY");
}

runTests().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
