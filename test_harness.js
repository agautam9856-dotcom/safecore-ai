async function runTest(name, payload) {
  const res = await fetch('http://localhost:3000/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload })
  });
  const data = await res.json();
  
  console.log(`\n========================================`);
  console.log(`TEST CASE: ${name}`);
  console.log(`PAYLOAD: "${payload}"`);
  console.log(`----------------------------------------`);
  console.log(`- Extracted Origin (Node 1): ${data.journey_nodes.find(n => n.id === 'node-1').label}`);
  console.log(`- Extracted Domain (Node 3): ${data.journey_nodes.find(n => n.id === 'node-3').label}`);
  console.log(`- Extracted Indicators: ${data.indicators.join(' | ') || 'None'}`);
  console.log(`- Calculated Risk Score: ${data.risk_score} / 100 (${data.risk_level})`);
  console.log(`- Threat Classification: ${data.scam_category}`);
  console.log(`- Predicted Next Move: ${data.predicted_next_step}`);
}

async function main() {
  await runTest(
    'TEST CASE A (Benign Human Text)',
    'Hey, are we still meeting for the team lunch at 1 PM today?'
  );
  
  await runTest(
    'TEST CASE B (Custom Phishing Link with Unknown TLD)',
    'Alert: Your netbanking profile will be blocked in 2 hours. Submit verification immediately at http://secure-update-hdfc.xyz'
  );
  
  await runTest(
    'TEST CASE C (Custom Contact + Fake Job/Telegram Trap)',
    'Earn ₹4,500 daily by reviewing hotel ratings from home. Contact our HR manager at +91 9812345678 or join @parttime_india on Telegram.'
  );
  
  await runTest(
    'TEST CASE D (Custom Tracking Bait)',
    'Your India Post parcel IP891238912IN could not be delivered due to wrong address. Update details at https://ind-post-redelivery.top within 12 hours.'
  );
}

main();
