# SafeCore AI

**Understand the threat. Understand the connection. Understand what happens next. Know what to do.**

SafeCore is a premium, unified digital safety and threat intelligence platform. It replaces isolated security scanners with a comprehensive, interconnected intelligence engine that maps threats, derives risk trends, and provides evidence-backed safety actions.

## 🚀 Key Features

- **Command Center:** A unified dashboard monitoring your real-time digital safety state.
- **Threat DNA:** Extracts behavioral and structural indicators from URLs, SMS, and emails to explain *why* a payload is risky.
- **Threat Memory:** Remembers recurring entities (Domains, IPs, Senders) and escalates their threat profile over time.
- **Threat Constellation:** Maps complex cross-scan correlations (e.g., matching a suspicious SMS sender to a previously scanned malicious URL).
- **Attack Path Replay & Next Move AI:** Visually reconstructs the attacker's journey and uses heuristics to project the most probable next attack stage.
- **Evidence Locker:** Secures raw indicators, timelines, and network traces into an isolated forensic container.
- **Security Insights & Risk Timeline:** Transforms raw scans into longitudinal risk trends (`INCREASING` vs `STABLE`) with explicit time-series graphs.
- **Smart Alert Center:** Contextually suppresses noisy alerts and only triggers action when risk escalates or cross-matrix connections form.
- **URL & Domain Intelligence:** A dedicated laboratory for parsing obfuscated links, safely querying DNS (`A`, `MX`, `TXT`), and applying SSRF-hardened network protections.

## 🏗️ Architecture

SafeCore is built as a progressive, edge-first architecture:
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion.
- **Intelligence Engine:** Client-side orchestration backed by isolated serverless API layers.
- **Security Protocols:** SSRF prevention against loopback & private octal routing (`10.x`, `172.16.x`, `.local`). Web crawling explicitly bypassed to enforce network integrity.

## 🔒 Security & Privacy

- **Data Isolation:** All investigations are strictly encapsulated.
- **SSRF Hardening:** No server-side HTTP proxy fetching is executed on user payloads. 
- **Non-Fabricated Data:** SafeCore strictly outputs *derived* intelligence. We do not invent WHOIS data, fake timestamps, or spoofed community reports. If an external API is offline, the system safely falls back to "Data Unavailable."

## 📱 PWA Support
SafeCore is fully installable as a Progressive Web App (PWA), supporting mobile form factors with `break-all` UI constraints ensuring complex intelligence matrices render cleanly on small devices.

## 🏁 Demo Flow

To test the system locally, try scanning a suspicious payload like:
`URGENT: Your account requires KYC verification. Click here: http://secure-auth-login.example.com`
The platform will immediately isolate the domain, detect the urgency keywords, map the URL structure, evaluate Threat Memory, and graph the predicted attack progression.
