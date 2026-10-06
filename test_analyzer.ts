import { analyzePayload } from './src/lib/threat-analyzer'

console.log("=== TEST 1 ===")
const res1 = analyzePayload("Dear user, your electricity connection will be disconnected tonight at 9:30 PM. Update your bill immediately: https://power-bill-pay.xyz")
console.log("Node 1 Label:", res1.journey_nodes[0].label)
console.log("Node 1 Type:", res1.journey_nodes[0].type)
console.log("Indicators:", res1.indicators)

console.log("=== TEST 2 ===")
const res2 = analyzePayload("Call +91 9876543210 immediately to claim your pending refund.")
console.log("Node 1 Label:", res2.journey_nodes[0].label)
console.log("Node 1 Type:", res2.journey_nodes[0].type)
