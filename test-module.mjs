import { POST } from './.next/server/app/api/analyze/route.js';

// Next.js request mock
class MockRequest {
  constructor(body) {
    this._body = body;
  }
  async json() {
    return this._body;
  }
}

async function runTests() {
  console.log("== RUNNING SRE STRESS TESTS ==");
  
  // VECTOR A
  const reqA = new MockRequest({ payload: "SBI ALERT: Your NetBanking account is suspended due to expired KYC. Verify your identity immediately at https://sbi-kyc-portal.cc/login to prevent permanent blockage.", type: "message" });
  const resAObj = await POST(reqA);
  const resA = await resAObj.json();
  console.log("VECTOR A - Score:", resA.risk_score, "Level:", resA.risk_level, "Category:", resA.scam_category);
  if (resA.risk_level !== 'CRITICAL') throw new Error("Vector A failed to reach CRITICAL");

  // VECTOR B
  const reqB = new MockRequest({ payload: "Congratulations! You have been selected for part-time YouTube rating tasks earning Rs 5,000/day. Contact HR on Telegram: https://t.me/job_recruiter_2026.", type: "message" });
  const resBObj = await POST(reqB);
  const resB = await resBObj.json();
  console.log("VECTOR B - Score:", resB.risk_score, "Level:", resB.risk_level, "Category:", resB.scam_category);
  if (resB.risk_level !== 'HIGH') throw new Error("Vector B failed to reach HIGH");

  // VECTOR C
  const reqC = new MockRequest({ payload: "Hey Aman, are we still meeting in the college library at 4 PM to discuss the project?", type: "message" });
  const resCObj = await POST(reqC);
  const resC = await resCObj.json();
  console.log("VECTOR C - Score:", resC.risk_score, "Level:", resC.risk_level, "Category:", resC.scam_category);
  if (resC.risk_level !== 'LOW') throw new Error("Vector C failed to remain LOW");

  console.log("ALL TESTS PASSED SUCCESSFULLY");
}

runTests().catch(console.error);
