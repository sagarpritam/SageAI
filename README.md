# 🛡️ SageAI — Sovereign Autonomous Enterprise Cybersecurity & OSINT Intelligence Platform

> **SageAI** is a production-grade, enterprise sovereign AI cybersecurity and defense ecosystem designed for **Autonomous Vulnerability Assessment**, **Dynamic Binary Reverse Engineering**, **Deception Technology (Honeypots)**, **Web/Network Intrusion Detection (WAF/NIDS)**, **Continuous Threat Intelligence**, and **Automated Incident Response (SOAR)** with zero-trust safety safeguards.
> Powered by **FastAPI**, **Next.js (Turbopack)**, **PostgreSQL (Supabase RLS)**, and a **Multi-Model AI Consensus Engine** (GPT-4o, Claude 3.7 Sonnet, DeepSeek R1, Nemotron 70B, Gemini 2.5 Pro).

[![Tests](https://img.shields.io/badge/tests-447%20passing-brightgreen?style=for-the-badge&logo=pytest)](tests/)
[![Routes](https://img.shields.io/badge/Next.js-183%20Routes%20Compiled-blue?style=for-the-badge&logo=next.js)](sage-web/)
[![FastAPI](https://img.shields.io/badge/FastAPI-175%20Endpoints-009688?style=for-the-badge&logo=fastapi)](app/)
[![Version](https://img.shields.io/badge/version-4.0.0%20Planetary%20Defense-blueviolet?style=for-the-badge)](CHANGELOG.md)
[![Compliance](https://img.shields.io/badge/compliance-SOC2%20Type%20II%20%7C%20ISO%2027001%20%7C%20FedRAMP-orange?style=for-the-badge)](app/services/audit_chain.py)
[![Dual Sync](https://img.shields.io/badge/remotes-GitHub%20%26%20GitLab-informational?style=for-the-badge&logo=git)](https://github.com/sagarpritam/SageAI.git)

---

## 🏛️ Executive Architecture: The 10-Pillar Sovereign Defense Grid

SageAI combines autonomous offensive capabilities (red teaming, reverse engineering, cyber range drills) with active defensive safeguards (WAF, NIDS, deception canaries, SOAR auto-containment, and cryptographic Merkle proof seals):

```mermaid
flowchart TD
    subgraph Ingress ["1. Ingress & Perimeter Defense"]
        Traffic[HTTP/API & Network Traffic]
        SuspiciousBinaries[Uploaded / Staged Binaries & Scripts]
        Adversary[Adversary Scanners & Recon Probes]
    end

    subgraph DefenseGrid ["2. SageAI Sovereign Defense Grid"]
        Traffic --> WAF[Pillar 3: Next-Gen WAF: SQLi/XSS/CMDi/SSRF/LFI]
        Traffic --> NIDS[Pillar 4: NIDS & C2 Low-Jitter Monitor]
        Adversary --> Deception[Pillar 2: Deception Mesh & Canary Honeytokens]
        SuspiciousBinaries --> RevEng[Pillar 1: Reverse Engineering & Disassembly Sandbox]
    end

    subgraph Intelligence ["3. Correlation & Threat Intelligence Hub"]
        WAF --> Correlator[Security Event Correlator & Knowledge Graph]
        NIDS --> Correlator
        Deception --> Correlator
        RevEng --> Correlator
        ThreatFeed[Pillar 5: CISA KEV Feed & Rule Synthesizer] --> Correlator
    end

    subgraph Analytics ["4. UEBA & Frontier AI Resilience"]
        Correlator --> UEBA[Pillar 6: Behavioral Anomaly UEBA Engine]
        Correlator --> RedTeam[Pillar 8: NeMo Guardrails & Multi-AI Red-Team]
        Correlator --> CyberRange[Pillar 9: Autonomous Cyber Range APT Simulator]
    end

    subgraph Response ["5. SOAR & Cryptographic Governance"]
        UEBA --> SOAR[Pillar 7: Automated Incident Response SOAR Engine]
        SOAR -->|Safe Action| AutoContain[Virtual WAF Patch & SOC Webhook Alert]
        SOAR -->|High-Impact Action| HumanGate{CISO / SecOps Approval Gate}
        HumanGate -->|Approved| BlockAction[Perimeter Firewall Block & Host Quarantine]
        SOAR --> MerkleLedger[Pillar 10: Cryptographic Merkle Audit Hash Chain]
        MerkleLedger --> WarRoom[Real-Time War Room & SOC Telemetry]
    end
```

---

## 🛡️ The 10 Enterprise Capabilities Matrix

| # | Enterprise Capability | Core Service Module | Primary Technical Capabilities | MITRE ATT&CK |
| :-: | :--- | :--- | :--- | :--- |
| **01** | **Dynamic Binary Reverse Engineering** | [`ReverseEngineeringEngine`](app/services/malware/reverse_engineer.py) | Static PE/ELF disassembly, section entropy calculation (detecting packed shellcode), IAT evasion API enumeration (`VirtualAllocEx`, `WriteProcessMemory`, `CreateRemoteThread`), and single-byte XOR string de-obfuscation. | T1027, T1055, T1059 |
| **02** | **Honeypots & Deception Mesh** | [`DeceptionHoneypotService`](app/services/deception/honeypot_service.py) | Low-interaction deception decoys (`/.env`, `/.aws/credentials`, `/wp-login.php`), synthetic AWS/JWT/DB honeytokens with **100% confidence zero false-positive** detection. | T1078, T1552, T1589 |
| **03** | **Next-Gen WAF Attack Detector** | [`AttackDetector`](app/services/detection/attack_detector.py) | In-line deep HTTP request inspection for OWASP Top 10: SQL Injection, XSS, Command Injection, Cloud Metadata SSRF (`169.254.169.254`), Path Traversal, and sliding-window credential brute force blocking. | T1190, T1059, T1110 |
| **04** | **NIDS & C2 Beacon Monitor** | [`NIDSMonitor`](app/services/detection/nids_monitor.py) | Inbound network port sweep identification, low-jitter periodic C2 heartbeat beaconing detection (Coefficient of Variation $CV < 0.25$), and high-entropy DNS tunneling exfiltration analysis. | T1595, T1071, T1048 |
| **05** | **Threat Intelligence Hub** | [`CVEIndexer`](app/services/threat_feed/cve_indexer.py) | Automated CISA KEV catalog synchronization, NVD CVSS scoring, threat actor attribution (APT-29, CozyBear), and instant auto-synthesis of YARA signatures, Sigma rules, and Nuclei templates. | T1588, T1587, T1584 |
| **06** | **Behavioral UEBA Anomaly Engine** | [`BehavioralAnomalyEngine`](app/services/detection/anomaly_engine.py) | Sliding-window continuous Gaussian baseline tracking of API endpoint request frequency and payload volume, evaluating $Z\text{-score} > 3.0\sigma$ deviations for zero-day exploitation flags. | T1030, T1041, T1078 |
| **07** | **Automated SOAR Incident Engine** | [`IncidentResponseEngine`](app/services/incident_response/soar_engine.py) | Unified multi-vector incident escalation, automated safe actions (virtual WAF patching), and guarded human-in-the-loop authorization gates for perimeter IP blocking and host isolation. | T1078, T1562, T1082 |
| **08** | **Autonomous AI Red-Teaming** | [`NeMoAuditor`](app/services/redteam/nemo_auditor.py) & [`ai_resilience`](app/services/ai_resilience.py) | Adversarial prompt injection defense, frontier benchmark testing across 5 flagship LLMs (GPT-4o, Claude 3.7, Nemotron 70B, DeepSeek R1, Gemini 2.5), and automated Colang 2.0 guardrail synthesis. | AML.T0051, AML.T0054 |
| **09** | **Autonomous Cyber Range Simulator** | [`CyberRangeSimulator`](app/services/simulation/cyber_range_simulator.py) | Multi-stage red-vs-blue attack scenario detonations (e.g. APT-29 Supply Chain breach), validating full 6-stage kill chain containment with 100% autonomous mitigation efficiency. | T1595, T1190, T1071 |
| **10** | **Cryptographic Merkle Audit Ledger** | [`ImmutableAuditChain`](app/services/audit_chain.py) | SHA-256 chained hash ledger guaranteeing mathematical non-repudiation and audit trail integrity for SOC 2 Type II, ISO/IEC 27001:2022, and FedRAMP High, coupled with real-time War Room telemetry. | T1565, T1070 |

---

## ⚡ Additional Flagship Capabilities

### 🕵️ 1. OSINT Intelligence Hub — 9 Intelligence Modules
Every OSINT module operates **immediately without mandatory API keys** using resilient public sources, with instant auto-upgrade when premium keys are provided:
- **01: Shodan (The Panopticon)**: Open ports, SSL certificates, host vulnerabilities via InternetDB and full Shodan Pro APIs.
- **02: Maltego (Link Analysis)**: Canvas-rendered entity relationship graph with dynamic radial and force layouts.
- **03: Babel X (The Linguistic Mesh)**: Dark web Tor onion indexing (Ahmia.fi), paste dumps, and Google dork discovery.
- **04: SpiderFoot (Recon Automation)**: IP info, ThreatCrowd, and URLScan multi-source enrichment.
- **05: Social Links (Neural De-Masking)**: Sherlock-style cross-platform username enumeration across 11+ networks.
- **06: Intel X (Archive of Secrets)**: HaveIBeenPwned breach verification and Wayback Machine historical artifact extraction.
- **07: Recon-ng (The Framework)**: HackerTarget and automated HTTP technology fingerprinting.
- **08: Censys (The Global Radar)**: Certificate Transparency (crt.sh) logs and live TLS handshake inspection.
- **09: OSINT Industries (The Interceptor)**: Gravatar, GitHub, and DNS MX reverse identity correlation.

### 🤖 2. Multi-Model AI Consensus Arena
- **Multi-AI Debate Grid**: Pits **GPT-4o**, **Claude 3.7 Sonnet**, **DeepSeek R1**, and **NVIDIA Nemotron 70B** against each other on complex vulnerability findings.
- **Consensus Voting**: Computes cross-model alignment scores, surfaces false positives, and generates unanimous remediation recommendations.

### 🛠️ 3. SagePatch Phase 04 Code Remediation Studio
- **Sandboxed AST Validation**: Validates AI-generated code patches using Python `ast` syntax parsing.
- **Security Guardrails**: Rejects dangerous function calls (`eval`, `exec`, `__import__`), file traversal, and oversized diffs ($>150$ lines changed).
- **PR Proposal & Review**: One-click GitHub pull request generation with interactive diff visualization in the Command Center.

### 🌐 4. Real-Time SOC War Room
- **Hybrid WebSocket + HTTP Polling Fallback**: Real-time threat telemetry resilient to serverless cold starts.
- **Distributed Event Bus**: Connects SageStrike Kafka/Redis streaming telemetry with live attack maps, geo-coordinates, and pulse simulations.

### 🔒 5. Multi-Region Zero Data Egress Edge Enclaves
- **Sovereign Regional Enclaves**: Partitioned execution zones across **Americas (us-east-1)** (NIST SP 800-53 / FedRAMP High), **European Union (eu-central-1)** (GDPR Chapter V Art. 44-49 / BSI C5), and **Asia-Pacific (ap-southeast-1)** (Singapore PDPA / MAS TRM Level 3).
- **Client-Side Envelope Encryption**: AES-256-GCM + HKDF-SHA256 authenticated key derivation with region-bound Authenticated Associated Data (AAD), mathematically prohibiting cross-regional data movement even under credential compromise.
- **Zero-Egress Secret Scrubbing**: Real-time regex and Shannon entropy tokenization engine that catches AWS credentials, asymmetric private keys, database URIs, JWTs, high-entropy API secrets, and PII before cross-boundary transmission.
- **Cryptographic Sovereignty Verification**: Autonomous multi-region verification drill with real-time Merkle audit ledger anchoring guaranteeing zero-leakage compliance.

### 📐 6. Automated Threat Modeling Engine (STRIDE + DREAD)
- **Architectural Decomposition**: Automated parsing of OpenAPI specifications, Terraform HCL, and Kubernetes manifests into components, data flows, and trust boundaries.
- **STRIDE Threat Enumeration**: Comprehensive coverage of **S**poofing, **T**ampering, **R**epudiation, **I**nformation Disclosure, **D**enial of Service, and **E**levation of Privilege mapped to MITRE ATT&CK techniques.
- **Quantitative DREAD Risk Scoring**: Calculates composite risk across Damage (0-10), Reproducibility (0-10), Exploitability (0-10), Affected Users (0-10), and Discoverability (0-10).
- **Automated Mitigation Tickets**: Generates prioritized Jira and GitHub Issues action checklists with tamper-evident Merkle seal receipts.

### ⚛️ 7. Post-Quantum Cryptography (PQC) Migration Layer
- **NIST FIPS 203 ML-KEM-768 (Kyber)**: Lattice-based Module Learning with Errors (M-LWE) key encapsulation mechanism paired with Classical X25519 in a dual-layer hybrid architecture (RFC 7748 + FIPS 203).
- **NIST FIPS 204 ML-DSA-65 (Dilithium-3)**: Lattice-based Module Learning with Rounding (M-LWR) unforgeable digital signatures paired with Classical Ed25519 (RFC 8032 + FIPS 204).
- **Future-Proof Zero-Egress Sovereign Payloads**: Seals sensitive cross-enclave packets with zero-leakage tokenization, Kyber-768 hybrid encapsulation, Dilithium-3 digital signatures, and sovereign regional boundary binding (US FedRAMP, EU GDPR, APAC PDPA) anchored in the SHA-256 Merkle chain.
- **HNDL Quantum Risk Scanner**: Audits TLS ciphersuites and certificates against cryptanalytically relevant quantum computers (CRQCs) with automated migration paths to satisfy the 2030 CNSA 2.0 quantum mandate.

### ⚡ 8. Decentralized SIEM & eBPF Telemetry Agent
- **Kernel-Space Syscall Probes**: Lightweight eBPF tracepoints (`sys_enter_execve`, `sys_enter_connect`, `sys_enter_openat`, `sys_enter_ptrace`, `sys_enter_setns`) operating under 0.2% CPU overhead.
- **Container Escape Detection**: Detects namespace switching to host (`CLONE_NEWNS`, `setns`), Docker socket mounting, and `CAP_SYS_ADMIN` escalation.
- **Zero-Overhead Ring Buffer**: In-memory circular FIFO stream with zero drop rate under heavy syscall load.
- **Autonomous Process Quarantine**: Immediate process isolation (SIGKILL emulation), network socket traffic drop, and cgroup freeze anchored in the SHA-256 Merkle chain.

### ☁️ 9. Autonomous Cloud Security Posture Management (CSPM & CIEM)
- **Multi-Cloud CIS Benchmarks**: Continuous automated compliance evaluation across **AWS**, **Azure**, **GCP**, and **Kubernetes** with detailed severity scoring and audit evidence trails.
- **Toxic Combination Risk Correlation**: Identifies compound attack paths where publicly accessible network interfaces, over-privileged IAM roles (`AdministratorAccess`, `iam:*`), and unencrypted sensitive data stores intersect.
- **IAM Privilege Escalation Analysis**: Detects dangerous permission combinations (`iam:PassRole`, `sts:AssumeRole`, `ec2:RunInstances`) that permit horizontal and vertical privilege escalation.
- **Automated Remediation Script Synthesis**: One-click generation of hardened Terraform HCL and AWS CLI / Azure CLI remediation scripts.

### 📦 10. Software Supply Chain Security & CycloneDX 1.5 SBOM
- **Multi-Ecosystem Manifest Ingestion**: Parses Python (`requirements.txt`, `Pipfile`), Node.js (`package.json`), and lockfiles to construct deep dependency trees.
- **CycloneDX 1.5 JSON Compliance**: Generates standards-compliant Software Bill of Materials (SBOM) with canonical package URLs (`purl`), licenses, and deterministic SHA-256 cryptographic component digests.
- **Typosquatting & Impersonation Engine**: Employs Levenshtein distance analysis across package registries (PyPI, npm) to flag malicious lookalikes (e.g. `requsts`, `colorama`, `lodsh`).
- **Transitive CVE & EPSS Correlation**: Maps vulnerabilities through multi-tier transitive dependency trees with EPSS exploit prediction scoring and one-click patch recommendations.

### 🛡️ 11. Zero-Trust Network Access (ZTNA) & Identity-Aware Micro-Segmentation
- **Dynamic Contextual Trust Scoring (0-100)**: Evaluates authenticated identity, device compliance posture (CrowdStrike, Microsoft Defender), hardware MFA (FIDO2 / WebAuthn, YubiKey), hardware disk encryption (BitLocker / FileVault), and geolocation / IP risk indicators.
- **Continuous Policy Enforcement**: Four-tier adaptive access control decisions: `ALLOW_FULL_ACCESS` ($\ge 75$), `REQUIRE_STEP_UP_MFA` ($50-74$), `RESTRICTED_SANDBOX_ACCESS` ($25-49$), and `TERMINATE_AND_QUARANTINE` ($< 25$).
- **L7 NetworkPolicy Synthesizer**: Generates production-ready **Cilium L7 NetworkPolicy** and Envoy Service Mesh configurations for cryptographically isolated, least-privilege east-west pod and service communication.

### 🎯 12. Autonomous Adversary Emulation & Interactive MITRE ATT&CK Matrix
- **Complete 14-Tactic MITRE ATT&CK Matrix**: Comprehensive visualization covering Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command & Control, Exfiltration, Impact, Resource Development, and Reconnaissance.
- **APT Adversary Profiles**: Pre-calibrated emulation playbooks for **APT29 (Cozy Bear / SVR)**, **FIN7 (Carbanak)**, and **Volt Typhoon (Living-off-the-Land)**.
- **Autonomous BAS Drill Runner**: Simulates multi-stage adversarial operations, measures detection latency, validates defensive telemetry (eBPF, WAF, NIDS), and surfaces actionable detection gap remediation.

### 🔭 13. Continuous External Attack Surface Management (EASM) & Shadow IT Hunter
- **Perimeter Reconnaissance & Asset Discovery**: Enumerates public domains, subdomains, certificates, open ports, and cloud service endpoints.
- **Dangling DNS & Subdomain Takeover Hunter**: Non-intrusive heuristic detection of orphan CNAME records pointing to deprovisioned cloud services across AWS S3 (`NoSuchBucket`), GitHub Pages (`404`), Heroku (`No such app`), and Azure Traffic Manager.
- **Shadow IT Discovery**: Uncovers unmanaged cloud storage buckets, unprotected staging/dev environments, exposed CI/CD instances, and orphaned microservice endpoints.
- **Perimeter Security Grade ($A+$ to $F$)**: Calculates holistic exposure grades with step-by-step containment instructions.

### 🧠 14. Autonomous AI SOC & Neural Alert Triage Engine
- **Neural Alert Deduplication & Clustering**: Correlates high-volume alerts across IP, targeted entity, and 5-minute sliding time buckets, achieving **90%+ alert fatigue reduction**.
- **Autonomous 3-Tier Triage**: Automatically categorizes alerts into `TIER_1_AUTO_RESOLVED` (routine internet noise & port sweeps), `TIER_2_INVESTIGATION` (multi-vector anomalies), and `TIER_3_CRITICAL_ESCALATION` (active breaches, eBPF escapes, honeytoken hits).
- **Automated Root-Cause Hypotheses**: Generates contextual attack trajectory reasoning explaining adversary objectives and lateral movement paths.
- **Executive CISO Incident Briefings**: Produces automated board-level incident debriefs and phased containment playbooks with Merkle ledger anchoring.

### 🏹 15. AI-Powered Threat Hunting & Multi-SIEM Query Forge
- **Multi-SIEM Query Forge**: Translates natural-language hunting hypotheses into vendor-standard detection rules across **Sigma YAML**, **Microsoft Sentinel KQL**, **Splunk SPL**, and **Elastic EQL**.
- **Hypothesis-Driven Hunting Runner**: Evaluates hypotheses against eBPF syscalls, WAF events, and NIDS telemetry to uncover stealthy Living-off-the-Land (LotL) execution, C2 beaconing, and credential dumping.
- **Continuous Retrospective IOC Sweeping**: Matches historical telemetry logs against emerging adversary indicators with deterministic confidence scoring.

### 🛑 16. Autonomous Anti-Ransomware Defense & Canary Trap Engine
- **Shannon Entropy Burst Detection**: Real-time sliding-window entropy calculation ($H > 7.50 / 8.00$) flagging active symmetric encryption bursts across host filesystems.
- **Volume Shadow Copy (VSS) Shield**: Intercepts and terminates commands attempting to destroy system restore points (`vssadmin delete shadows`, `wbadmin delete catalog`).
- **Honeytoken Canary File Mesh**: Arms transparent decoy trap files (`.docx`, `.xlsx`, `.pdf`, `.kdbx`) that trigger sub-second autonomous process tree kills (`SIGKILL`) upon tampering.

### 📊 17. Autonomous Cloud Data Security Posture Management (DSPM)
- **Multi-Cloud Sensitive Data Discovery**: Scans and classifies data at rest across AWS S3, Azure Blob, Google Cloud Storage, and RDS databases for PII (SSN, emails), PCI-DSS credit cards, and HIPAA protected health information (PHI).
- **Toxic Data Exposure Analysis**: Automatically identifies compound data risks (e.g. unencrypted HIPAA records in publicly accessible S3 buckets).
- **Data Lineage & Egress Flow Graph**: Visualizes data paths from ingestion APIs to cloud storage and cross-jurisdictional egress points.
- **Least-Privilege Remediation**: Generates automated Terraform HCL and CLI remediation scripts enforcing bucket public access blocks and KMS CMEK encryption.

### 🌐 18. Decentralized Cyber Threat Intelligence (CTI) STIX 2.1 / TAXII 2.1 Hub
- **OASIS STIX 2.1 Serialization**: Constructs and parses valid STIX 2.1 JSON bundles linking threat actors, indicators of compromise, attack patterns, and campaigns.
- **Nation-State Threat Actor Profiles**: Pre-calibrated dossiers covering **APT28 (Fancy Bear)**, **Lazarus Group**, **Scattered Spider**, and **LockBit 3.0**.
- **TAXII 2.1 Collection Server**: Provides standard TAXII 2.1 `/taxii2/collections/` endpoints for seamless threat intelligence ingestion into Splunk, Microsoft Sentinel, and Cortex XSOAR.

### ⚔️ 19. Autonomous Red Team Adversary Emulation (MITRE Caldera & Atomic Red Team)
- **Atomic Red Team Automation**: Pre-calibrated execution catalog covering **T1059.001** (PowerShell), **T1003.001** (LSASS Dump), **T1547.001** (Run Keys), **T1078.004** (Cloud Accounts), **T1021.002** (SMB Shares), and **T1486** (Ransomware Impact).
- **Caldera-Style Autonomous Planner**: Multi-stage attack graph orchestration in unprivileged, zero-egress sandboxes with dependency validation.
- **Blue Team Telemetry & MTTD Measurement**: Measures detection latency in milliseconds, quantifies defensive coverage percentages, and identifies blindspots.
- **Automated Detection Engineering**: Synthesizes Sigma YAML, Snort, and YARA rules to proactively remediate uncovered telemetry gaps.

### ☁️ 20. Cloud Infrastructure-as-Code (IaC) Drift & Remediation Engine
- **Bidirectional IaC vs. Runtime Reconciliation**: Compares declared **Terraform** HCL, **Kubernetes Helm** manifests, and **CloudFormation** templates against live AWS, Azure, and GCP runtime configurations.
- **Autonomous Drift Classifications**: Pinpoints critical regressions including open ingress (`0.0.0.0/0` on ports 22/3389), disabled storage encryption (S3 SSE-KMS), console-granted IAM wildcards (`AdministratorAccess`), and privileged container flags.
- **Autonomous Git PR Generation**: Automatically drafts GitHub/GitLab Pull Requests with unified Terraform HCL diffs and zero-trust rollback snapshots.
- **Instant CLI Reconciliation Scripts**: Emits executable AWS CLI and `kubectl` patches for immediate out-of-band remediation.

### 📦 21. Software Bill of Materials (SBOM) & OpenVEX Attestation Engine
- **Multi-Standard SBOM Export**: Generates standards-compliant **CycloneDX 1.5 JSON** and **SPDX 2.3 JSON** inventories across Python, Node.js, and container packages.
- **OpenVEX v0.2.0 Specification Compliance**: Authors machine-readable Vulnerability Exploitability eXchange statements with standard justifications (`inline_mitigations_exist`, `vulnerable_code_not_in_execute_path`, `vulnerable_code_cannot_be_controlled_by_adversary`).
- **SLSA Level 3 Build Provenance**: Cryptographically signs build definitions, external parameters, and component digests with SHA-256 Merkle root verification.

### 🔑 22. Identity Threat Detection and Response (ITDR)
- **Multi-IdP Telemetry Ingestion**: Integrates with **Microsoft Entra ID (Azure AD)**, **Okta Universal Directory**, and **AWS IAM**.
- **High-Fidelity Identity Attack Detectors**:
  - *Impossible Travel*: Geo-velocity anomaly calculation ($>800\text{ km/h}$) flagging cross-continent logins within minutes.
  - *MFA Fatigue / Push Bombing*: Detects rapid bursts of denied push notifications ($>5$ in $<120\text{s}$) followed by fraudulent approval (MITRE T1621).
  - *Shadow Admin Escalation*: Detects stealthy role assignment to `Global Administrator` or `iam:PutUserPolicy`.
- **Autonomous SOAR Containment Playbooks**: One-click instant revocation of active user sessions, OAuth refresh token invalidation, and mandatory step-up FIDO2/WebAuthn enforcement.

### 🗺️ 23. Continuous Attack Path & Graph Choke-Point Analysis (CART)
- **Enterprise Attack Graph Modeling**: Directed graph $G = (V, E)$ interconnecting public entrypoints, internal jump-boxes, IAM roles, databases, and Crown Jewels.
- **Crown Jewel Kill-Chain Traversal**: Traverses all multi-hop attack vectors to high-value assets (Customer PII Database, Active Directory Domain Controller, S3 Master Data Vault).
- **Graph Centrality & Choke-Point Identification**: Computes path intersection centrality to pinpoint the singular bottleneck node or edge whose severance breaks **80%+ of all attack paths**.
- **Dynamic Blast Radius Metric & Auto-Severance**: Computes a 0-100 blast radius score and executes automated network microsegmentation and IAM privilege stripping to collapse attack vectors.

### 🤖 24. AI Security Posture Management (AI-SPM) & LLM Defense
- **Continuous OWASP Top 10 for LLMs Auditing**: Real-time evaluation of prompt injection (LLM01), sensitive data disclosure (LLM02), supply chain poisoning (LLM03), and unconstrained agency (LLM06).
- **Real-Time Jailbreak & Semantic Filtering**: Intercepts role-override jailbreaks (`ignore previous instructions`, `DAN`, `developer mode`) and sensitive secret leaks.
- **RAG Knowledge Store Scanning**: Scans vector embedding chunks for data contamination and indirect prompt injection.
- **Automated Colang 2.0 Guardrails**: Auto-synthesizes NeMo guardrail policies for boundary enforcement.

### 🔐 25. Sovereign KMS HSM & Shamir's Secret Sharing Quorum
- **FIPS 140-3 Level 3 Hardware Security Module**: Automated cryptographic key rotation, versioning, and real-time memory zeroization.
- **Shamir's Secret Sharing ($k$-of-$n$ Quorum)**: Splits critical master secrets into $n$ threshold shares over a 521-bit Mersenne prime field ($GF(2^{521}-1)$), requiring a minimum threshold of $k$ custodian shares to authorize high-impact actions.
- **Multi-Custodian Governance**: Prohibits unilateral rogue destruction of production assets or firewall isolation without multi-party cryptographic quorum.

### 🏰 26. Active Directory & BloodHound Attack Graph Engine
- **Tier-0 Domain Attack Topology**: Deep graph modeling of Windows Active Directory and Entra ID forests, domain controllers, and admin groups.
- **High-Risk Kerberos Attack Vectors**:
  - *Kerberoasting (T1558.003)*: Service accounts with registered SPNs and legacy RC4-HMAC ciphers.
  - *AS-REP Roasting (T1558.004)*: Accounts configured with `DONT_REQ_PREAUTH`.
  - *DCSync Rights*: Non-admin identities with `DS-Replication-Get-Changes-All` permissions capable of dumping all NTDS.dit hashes.
  - *Unconstrained Delegation*: Machine accounts permitted to forward TGTs.
- **Automated PowerShell Lockdown**: Emits production-ready PowerShell scripts for instant Active Directory ACL remediation.

### 🔬 27. Autonomous Live Forensics & Volatility Acquisition Engine
- **Non-Disruptive Memory Acquisition**: Captures volatile memory, parent-child process anomalies (e.g. `nginx` -> `sh` -> `/dev/shm/.beacon`), and active C2 sockets.
- **Unbacked RWX Shellcode Carving**: Inspects unbacked executable memory allocations (`PAGE_EXECUTE_READWRITE`) and renders byte hex previews.
- **Chain of Custody Legal Preservation**: Generates SHA-256 evidence seals, encrypted TAR packages, and RFC 3161 cryptographic timestamp receipts.

### 🛡️ 28. API Security & Microservices Boundary Shield (BOLA/BFLA Engine)
- **OWASP API Security Top 10 Discovery**: Tests REST, GraphQL, and gRPC microservices for Broken Object Level Authorization (BOLA/IDOR), Mass Assignment, and Broken Function Level Authorization (BFLA).
- **Tenant Scope Enforcement**: Flags endpoints accepting unvalidated resource IDs in URI paths.
- **Open Policy Agent (OPA) Rego Synthesis**: Generates production-ready OPA Rego authorization policies and Envoy service mesh filter rules.

### 🪙 29. Web3 & Smart Contract Security Auditor
- **Multi-Chain Smart Contract Auditing**: AST and bytecode static/symbolic analysis across EVM (Solidity/Vyper), Solana (SVM/Rust Anchor), and Aptos/Sui (Move).
- **Vulnerability Detectors**: Flagging SWC-107 (Reentrancy with state changes after external calls), SWC-105 (Missing access controls on drain functions), and Flash Loan Oracle Manipulation (spot reserve pricing lacking TWAP/Chainlink).
- **Automated Foundry Exploit Generation**: Automatically synthesizes `forge-std/Test.sol` exploit harnesses proving vulnerability reproducibility prior to deployment.

### ⚡ 30. Autonomous SDN Ephemeral Network Isolation (Micro-Shield)
- **Sub-Second Multi-Cloud Containment**: Enforces network quarantines across AWS VPC Security Groups, Azure NSGs, GCP Firewalls, and Kubernetes Calico/Cilium meshes in under 45ms.
- **Deceptive Lateral Deflection**: Automatically diverts suspicious attacker lateral movement attempts into deceptive high-interaction honeynet sinks.
- **Self-Expiring TTL Quarantines**: Ephemeral isolation with automated network restoration and audit trails once SecOps verification passes.

### 💀 31. Dark Web & Infostealer Intelligence Radar
- **Botnet Log Telemetry Ingestion**: Continuous ingestion and threat intelligence mining of stealer logs (LummaC2, RedLine, Vidar, Raccoon, Stealc).
- **Live Active Session Cookie Interception**: Pinpoints compromised corporate SSO and MFA session cookies circulating in clandestine C2 forums.
- **One-Click Multi-IdP Session Invalidation**: Executes autonomous revocation playbooks invalidating tokens across Okta, Google Workspace, Microsoft Entra ID, and AWS IAM Identity Center.

### 📜 32. Zero-Knowledge Proof (ZKP) Compliance Attestation (zk-SNARKs)
- **Cryptographic Zero-Knowledge Audit Proofs**: Groth16 zk-SNARK attestation over the BN254/alt_bn128 curve proving SOC 2 Type II, ISO/IEC 27001, and FedRAMP compliance.
- **Zero Information Leakage**: Verifies that 100% of storage is encrypted, zero critical CVEs remain unpatched past 24h, and MFA is enforced across all accounts without revealing IP addresses, hostnames, or confidential configuration parameters.
- **Mathematical Bilinear Pairing Verification**: Complete algebraic proof verification: $e(A, B) = e(\alpha, \beta) \cdot e(x, \gamma) \cdot e(C, \delta)$.

### 🕸️ 33. MITRE D3FEND Defensive Countermeasure Matrix & Graph Engine
- **Bi-Directional Offense-to-Defense Graph Fusion**: Connects MITRE ATT&CK adversary tactics directly with D3FEND defensive countermeasures across 5 domains (MODEL, HARDEN, DETECT, ISOLATE, DECEIVE).
- **Defense Maturity Index (DMI)**: Real-time quantification of enterprise defensive posture and countermeasure saturation.
- **Interactive Graph Querying**: Resolves precise defensive enforcers (eBPF syscall hooks, WAF inspectors, AppLocker, microsegmentation) for any given adversary technique.

### 🔒 34. Confidential Hardware Enclave Remote Attestation Engine
- **Multi-Silicon Hardware Attestation**: Cryptographic attestation verification across **AWS Nitro Enclaves** (COSE_Sign1 and PCR0/1/2/8 validation), **AMD SEV-SNP** (VCEK and ECDSA P-384 hardware measurement certificates), and **Intel SGX / TDX** (DCAP Quotes).
- **Golden Reference PCR Integrity**: Enforces strict Golden Reference measurement matching for hypervisors, Linux kernels, and container runtimes, automatically rejecting tampered kernels.
- **Attested Sovereign Key Release (Unsealing)**: Seals tenant encryption keys, database credentials, and HSM seeds inside hardware enclaves; unseals strictly upon valid silicon remote attestation and zeroizes memory on tampering.

### 🤖 35. Autonomous Multi-Agent Threat Hunting Swarm
- **Four-Agent Reasoning Pipeline**: Coordinated AI swarm executing continuous, prompt-free hypothesis generation (`HypothesisAgent`), kernel eBPF probe collection (`TelemetryAgent`), entity blast radius correlation (`CorrelationAgent`), and SOAR decision arbitration (`ArbiterAgent`).
- **Sub-Second Persistence Discovery**: Autonomous hunting for memory hollowing, unbacked RWX shellcode, Active Directory DCSync queries, and cloud console MFA bypasses.
- **Automated Arbiter Containment**: Immediate process suspension, network microsegmentation, and credential revocation upon multi-agent consensus verification.

### 🪤 36. Dynamic Synthetic Honeytoken & Active Canary Fabric
- **Multi-Ecosystem Honeytokens**: Autonomous synthesis and distribution of realistic bait credentials across AWS STS session keys, GitHub Enterprise tokens, PostgreSQL database rows, and Active Directory Kerberos SPN accounts.
- **Zero-Tolerance Tripwire Trigger**: Any interaction with synthetic canaries represents a 100% true-positive breach indicator with zero false positives.
- **Sub-Second Ephemeral SDN Isolation**: Automatically triggers SDN Micro-Shield network quarantine on the accessing adversary IP or workload with deceptive honeynet redirection.

### 🧩 37. Symbolic Binary Execution & Polymorphic De-Obfuscator
- **Control Flow Flattening (CFF) Elimination**: Employs symbolic execution (Angr / Triton) to dismantle state variable dispatcher loops, reducing cyclomatic complexity by over 85% and restoring linear CFGs.
- **Z3 SMT Opaque Predicate Pruning**: Identifies and eliminates mathematical invariant predicates (e.g. `(x * (x + 1)) % 2 == 0`), stripping dead junk blocks.
- **API Unhashing & YARA-L Synthesis**: Automatically resolves ROR13, CRC32, and FNV-1a obfuscated hashes to Windows APIs (`VirtualAlloc`, `WriteProcessMemory`, `CreateRemoteThread`) and authors production YARA-L v2 rules.

### 🌐 38. Continuous Zero-Trust Workload Identity Fabric (SPIFFE/SPIRE)
- **Short-Lived X.509 SVIDs**: Eliminates static API keys by issuing 60-minute rotating X.509 certificates with automated 30-minute renewal intervals.
- **In-Kernel Cilium eBPF Layer-7 Enforcement**: Evaluates workload-to-workload mTLS identities directly at the kernel socket layer with sub-0.1ms overhead.
- **Autonomous Microsegmentation Policy**: Blocks unauthorized cross-service calls before packets enter user space, broadcasting instant cryptographic revocation to eBPF maps upon breach.

### ⚡ 39. Autonomous Kernel & Bytecode Micro-Hotpatching
- **Zero-Downtime eBPF Trampoline Ingestion**: In-memory patching of critical vulnerabilities (CVE-2024-6387 RegreSSHion, CVE-2023-44487 Rapid Reset, CVE-2021-44228 Log4Shell) without process restarts or reboots.
- **Z3 Symbolic Invariant Verification**: Formally proves memory safety, stack alignment (SysV ABI), and absence of segfaults prior to in-memory prologue trampoline execution.
- **Atomic Rollback Architecture**: Instantly restores original prologue instructions and detaches kprobes/uprobes with sub-40ns latency overhead.

### ⚔️ 40. Multi-Agent Autonomous Red-Team Swarm (Continuous Adversary Simulation / CAS)
- **Four Collaborative Offensive Personas**: Coordinated multi-agent swarm (`ReconAgent`, `ExploitCrafterAgent`, `PrivilegeEscalationAgent`, `EvasionAgent`) executing multi-round continuous offensive drills.
- **Dynamic Payload & Breakout Synthesis**: Synthesizes living-off-the-land exploit chains, IAM token hijacking vectors, and polymorphic WAF bypass payloads.
- **Live MITRE ATT&CK Matrix Correlation**: Continuously maps offensive discoveries against MITRE ATT&CK techniques (T1595, T1190, T1078, T1027) with automated posture scoring.

### 🌐 41. CTI Graph Fusion & APT Actor Attribution Engine
- **Multi-Source STIX 2.1 Graph Knowledgebase**: Fuses indicators, malware families, and Diamond Model relationships into an interactive graph.
- **JA3 / JA4 TLS Client Fingerprinting**: Dissects cryptographic TLS Client Hello handshakes to attribute adversary C2 traffic even when hostnames and IP addresses change.
- **Nation-State Adversary Clustering**: High-confidence attribution models for Volt Typhoon, Lazarus Group (Hidden Cobra), and APT29 (Midnight Blizzard / Cozy Bear).

### 🏛️ 42. Cloud Forensic Snapshot & RFC 3161 Timestamp Vault
- **Instant Cloud Snapshot Isolation**: Zero-delay automated snapshotting of AWS EBS, Azure Managed Disks, GCP Persistent Disks, and ephemeral RAM upon critical incidents.
- **Dual SHA-256 / SHA-512 Chain of Custody**: Computes cryptographic Merkle tree digests across raw block device streams.
- **Federal Rules of Evidence FRE 902 Compliance**: Issues court-admissible RFC 3161 cryptographic timestamp certificates and tamper-evident legal manifests.

### 🛰️ 43. Multi-Cloud Zero-Trust Cross-Plane Mesh
- **Declarative Intent Policy Translation**: Automatically compiles high-level zero-trust intent into AWS Security Groups, Azure Network Security Groups, GCP Firewall Rules, and Cilium eBPF NetworkPolicies.
- **Cross-Cloud Identity Federation**: Bridges SPIFFE/SPIRE SVIDs across AWS IAM Roles Anywhere, Azure Workload Identity, and GCP Workload Identity Pools.
- **Mesh Drift Detection & Auto-Reconciliation**: Identifies rogue ingress rules across clouds and applies atomic auto-reconciliation to maintain zero-trust compliance.

---

## 🏗️ Technology Stack

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js 16.4.4 Frontend (Turbopack)                  │
│  Command Center │ War Room │ Defense Grid │ Deception │ Malware Lab    │
│  AutoFix Studio │ Red Team │ Intel Hub    │ Cyber Range │ Audit Seal   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API + WebSockets
┌───────────────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend (85+ Endpoints)                     │
│  Enterprise Orchestrator │ WAF │ NIDS │ UEBA │ SOAR │ Audit Chain      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  10-Pillar Sovereign Defense & Offense Grid                     │  │
│  │  Reverse Engineering → Deception → WAF → NIDS → Threat Intel →  │  │
│  │  UEBA Analytics → SOAR Engine → AI Red-Team → Cyber Range       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Multi-Agent Autonomous Swarm & Copilot Engine                  │  │
│  │  ReconAgent → ScannerAgent → ExploitAgent → ReportAgent         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Security Middleware: SlowAPI │ Audit Chaining │ RBAC │ Tracing │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────┬──────────────┬──────────────┬──────────────────┬───────────────┘
        │              │              │                  │
        ▼              ▼              ▼                  ▼
  PostgreSQL 17.6   Redis 7     Celery Workers     Vector Database
  (Supabase RLS)   Event Bus    (Background Scans)   (FAISS / RAG)
```

- **Backend**: Python 3.13+, FastAPI, SQLAlchemy (asyncpg), Pydantic v2, SlowAPI, PyJWT, Cryptography, ReportLab.
- **Frontend**: Next.js 16.4.4 (Turbopack App Router), React 19, TypeScript 5, Tailwind CSS, Lucide React, Axios.
- **Database & Storage**: PostgreSQL 17.6 on Supabase (`jiawtheciauiwhcgswde`) with Row-Level Security (RLS) on all 16 tables.
- **AI & Frontier Models**: OpenAI (GPT-4o), Anthropic (Claude 3.7), Google Gemini (Gemini 2.5), DeepSeek (R1), NVIDIA NIM (Nemotron 70B / NeMo Microservices).

---

## 🗄️ Database Architecture (17 Models)

| Model | Table Name | Purpose |
| :--- | :--- | :--- |
| `Organization` | `organizations` | Multi-tenant tenant boundary & subscription tier |
| `User` | `users` | User credentials, roles (`admin`, `manager`, `member`, `viewer`), MFA |
| `Role` | `roles` | Granular permission matrix |
| `Scan` | `scans` | Vulnerability assessment run metadata and execution state |
| `Finding` | `findings` | Atomic vulnerability entries with CVSS scores, OWASP, and CWE |
| `Asset` | `assets` | External attack surface inventory with verification challenges |
| `AssetDiff` | `asset_diffs` | Historical attack surface delta snapshots |
| `ASMEvent` | `asm_events` | Attack surface state change events and webhook dispatches |
| `KnowledgeGraph`| `knowledge_graph` | Security knowledge graph nodes and attack path relations |
| `AgentLog` | `agent_logs` | AI reasoning steps, tool invocations, and execution trails |
| `RemediationPatch`| `remediation_patches` | SagePatch proposals, unified diffs, and approval workflows |
| `AuditLog` | `audit_logs` | High-level user activity and system audit log |
| `ScanSchedule` | `schedules` | Cron-based continuous scanning configuration |
| `APIKey` | `api_keys` | Scoped programmatic developer API tokens |
| `Webhook` | `webhooks` | Outbound HMAC-SHA256 signed event notifications |
| `Notification` | `notifications` | In-app user notifications and dispatch status |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.13+
- **Node.js**: 20+
- **PostgreSQL**: 16+ or Supabase account
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/sagarpritam/SageAI.git
cd SageAI
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows PowerShell
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials, SECRET_KEY, and optional LLM keys

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd sage-web

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
Frontend Command Center will be live at `http://localhost:3000`.

---

## 🧪 Comprehensive Verification & Test Suite

The SageAI test suite enforces rigorous quality assurance across all 10 pillars, tenant isolation, and cryptographic auditing:

```bash
# Activate virtual environment
venv\Scripts\activate

# Run the complete test suite (349 tests)
pytest -v

# Run enterprise security orchestrator tests
pytest tests/test_enterprise_orchestrator_drill.py -v

# Run AI red-team & guardrail tests
pytest tests/test_pillar8_redteam_adversarial_battery.py -v

# Run SagePatch AST remediation tests
pytest tests/test_phase04_sagepatch.py -v
```

### Test Suite Summary:
```text
======================== 396 passed, 2 warnings in 65.98s ========================
- 10-Capability Enterprise Security Drill Suite: 4/4 passed (100%)
- AI Red-Teaming & Adversarial Guardrails: 8/8 passed (100%)
- War Room Telemetry & Distributed Events: 2/2 passed (100%)
- SagePatch Sandboxed AST Remediation: 10/10 passed (100%)
- Multi-Tenant Isolation & RLS Security: 5/5 passed (100%)
- Zero Egress Enclaves & Tokenizer: 8/8 passed (100%)
- Threat Modeling STRIDE/DREAD Engine: 8/8 passed (100%)
- Post-Quantum Hybrid Cryptography (Kyber + Dilithium): 14/14 passed (100%)
- Decentralized SIEM & eBPF Telemetry: 7/7 passed (100%)
- Unified Defense Wave 1 (CSPM, SBOM, ZTNA, MITRE BAS, EASM): 8/8 passed (100%)
- Unified Defense Wave 2 (AI SOC, Threat Hunting, Anti-Ransomware, DSPM, CTI): 6/6 passed (100%)
- Total Pytest Test Suite: 396 / 396 passing (100%)
- Next.js Turbopack Build: 128 / 128 routes compiled with 0 errors
```

---

## 📡 API Reference Overview (115+ Endpoints)

### 1. Enterprise Security Grid & Orchestrator
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/security/enterprise-capabilities` | Live operational status across all 10 platform defense capabilities |
| `POST` | `/security/enterprise-audit-drill` | Executes complete 10-stage end-to-end security drill with Merkle seal |
| `GET` | `/security/enterprise-report` | Generates executive SOC2 / ISO 27001 / FedRAMP compliance audit report |

### 2. Autonomous Cyber Range & Simulation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/simulation/scenarios` | Lists pre-configured APT and adversary simulation templates |
| `POST` | `/simulation/run-apt-drill` | Executes live red-vs-blue APT simulation across the defense grid |

### 3. Honeypots & Deception Mesh
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/deception/decoys` | Lists active deception decoy endpoints (`/.env`, `/.aws/credentials`) |
| `POST` | `/deception/canary` | Generates high-fidelity canary honeytokens (AWS, JWT, DB, DNS) |
| `GET` | `/deception/alerts` | Fetches zero-false-positive intrusion alerts triggered by decoys |
| `POST` | `/deception/simulate-attack` | Simulates decoy penetration and automated SOAR escalation |

### 4. Intrusion Detection & WAF
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/intrusion/analyze-request` | In-line WAF inspection for SQLi, XSS, CMDi, SSRF, and Traversal |
| `POST` | `/intrusion/nids-probe` | Evaluates network connection probes for port sweeps and C2 jitter |
| `POST` | `/intrusion/anomaly-check` | Real-time UEBA Gaussian statistical anomaly check ($Z\text{-score} > 3.0$) |
| `GET` | `/intrusion/audit-chain` | Cryptographic SHA-256 Merkle chain verification endpoint |

### 5. Automated Incident Response (SOAR)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/incidents` | Lists active security incidents prioritized by severity |
| `POST` | `/incidents` | Correlates findings into unified incident |
| `POST` | `/incidents/{id}/execute-action` | Executes guarded high-impact containment with CISO role verification |
| `POST` | `/incidents/{id}/remediate` | Generates virtual patch and initiates SagePatch AST remediation |

### 6. Autonomous Red-Team & NeMo Guardrails
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/redteam/presets` | Retrieves frontier benchmark targets (GPT-4o, Claude 3.7, Nemotron 70B) |
| `POST` | `/redteam/evaluate-guardrail` | Evaluates adversarial prompt injection and synthesizes Colang 2.0 rails |
| `POST` | `/redteam/jobs` | Dispatches autonomous red-team audit battery against selected model |

### 7. Real-Time War Room Telemetry
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/warroom/events` | Fetches recent threat event history with geo-coordinates |
| `POST` | `/warroom/events` | Emits high-priority threat telemetry pulse to all active listeners |
| `WS` | `/warroom/ws` | Real-time bi-directional threat streaming WebSocket |

### 8. Cloud Security Posture Management (CSPM & CIEM)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/cspm/audit` | Multi-cloud CIS benchmark audit, IAM escalation, and toxic combination evaluation |
| `POST` | `/cspm/remediation-script` | Generates automated Terraform HCL and CLI remediation script for misconfigurations |

### 9. Software Supply Chain Security & SBOM
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/supply-chain/scan` | Parses manifests, generates CycloneDX 1.5 JSON SBOM, flags typosquats, maps CVEs |

### 10. Zero-Trust Network Access (ZTNA) & Microsegmentation
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ztna/evaluate-trust` | Dynamic contextual trust score ($0-100$) from identity, device posture, and MFA |
| `POST` | `/ztna/synthesize-policy` | Synthesizes Cilium L7 NetworkPolicy and Envoy service mesh configurations |

### 11. Autonomous Adversary Emulation & MITRE ATT&CK Matrix
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/adversary/matrix` | Retrieves full 14-tactic MITRE ATT&CK Enterprise matrix & APT profiles |
| `POST` | `/adversary/run-drill` | Dispatches autonomous Breach and Attack Simulation (BAS) drill with telemetry audit |

### 12. Continuous External Attack Surface Management (EASM)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/easm/scan` | Discovers perimeter assets, detects dangling DNS takeovers, and grades security posture |

### 13. Post-Quantum Cryptography (ML-KEM / ML-DSA) & Zero-Egress Payloads
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/pqc/generate-keys` | Generates dual Classical X25519 + NIST FIPS 203 ML-KEM-768 (Kyber) keypair |
| `POST` | `/pqc/generate-signing-keys` | Generates dual Classical Ed25519 + NIST FIPS 204 ML-DSA-65 (Dilithium) signing keypair |
| `POST` | `/pqc/sign` | Digitally signs payload with unforgeable hybrid Ed25519 + ML-DSA-65 signatures |
| `POST` | `/pqc/verify-signature` | Cryptographically verifies both Ed25519 and ML-DSA-65 digital signatures |
| `POST` | `/pqc/encrypt` | Quantum-safe envelope encryption using hybrid KEM encapsulation and AES-256-GCM |
| `POST` | `/pqc/decrypt` | Decapsulates shared secret and decrypts quantum-safe payload |
| `POST` | `/pqc/scan-risk` | Audits TLS ciphersuites against Harvest-Now-Decrypt-Later (HNDL) quantum risk |
| `POST` | `/pqc/zero-egress/seal` | Sanitizes, hybrid encapsulates (Kyber), and signs (Dilithium) zero-egress payloads |
| `POST` | `/pqc/zero-egress/unseal` | Validates enclave boundary, verifies Dilithium signature, and decapsulates zero-egress data |

### 14. Autonomous AI SOC & Neural Alert Triage
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ai-soc/triage` | Correlates raw alert streams, computes noise reduction, and assigns 3-tier triage verdicts |
| `POST` | `/ai-soc/briefing` | Generates board-level CISO incident debriefs and autonomous containment playbooks |

### 15. AI-Powered Threat Hunting & Multi-SIEM Query Forge
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/threat-hunting/templates` | Lists standard pre-configured enterprise threat hunting hypothesis playbooks |
| `POST` | `/threat-hunting/forge-query` | Translates natural-language hypotheses to Sigma YAML, Sentinel KQL, Splunk SPL, and Elastic EQL |
| `POST` | `/threat-hunting/hunt` | Executes retrospective telemetry hunt with indicator matching and confidence scoring |

### 16. Autonomous Anti-Ransomware Defense & Canary Traps
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/ransomware/deploy-canaries` | Arms strategic directories with transparent honeytoken canary files |
| `POST` | `/ransomware/analyze-stream` | Real-time file stream Shannon entropy analysis ($H > 7.5$) and VSS tamper interception |
| `POST` | `/ransomware/simulate-attack` | Simulates safe ransomware detonation demonstrating sub-second process tree kill |

### 17. Cloud Data Security Posture Management (DSPM)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/dspm/scan` | Discovers and classifies sensitive data (PII, PCI-DSS, HIPAA) across cloud buckets |
| `GET` | `/dspm/lineage` | Visualizes cross-boundary data lineage and egress exposure risk graphs |
| `POST` | `/dspm/remediation-plan` | Synthesizes Terraform HCL and CLI commands enforcing bucket encryption & isolation |

### 18. Decentralized Cyber Threat Intelligence (CTI) & STIX/TAXII
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/cti/threat-actors` | Retrieves nation-state and cybercrime threat actor profiles (APT28, Lazarus, etc.) |
| `POST` | `/cti/generate-bundle` | Synthesizes OASIS STIX 2.1 compliant JSON bundles linking actors, indicators, and campaigns |
| `POST` | `/cti/parse-stix` | Parses external STIX 2.1 bundles into normalized threat indicators |
| `GET` | `/cti/taxii/collections` | Serves standard TAXII 2.1 Collection server metadata and feed access |

---

## 🔒 Enterprise Governance & Compliance

- **SOC 2 Type II**: CC6.1 (Access Controls), CC6.6 (Perimeter Defense), CC6.8 (Malware Defense), CC7.2 (Event Logging).
- **ISO/IEC 27001:2022**: Controls A.8.7 (Malware protection), A.8.16 (Monitoring activities), A.8.20 (Network security).
- **NIST SP 800-53 Rev. 5**: Controls SI-3, SI-4, IR-4, AU-9 (Protection of Audit Information).
- **FedRAMP High**: Non-repudiation cryptographic Merkle chaining and strict human-in-the-loop authorization gates.

---

## 📁 Repository Structure

```text
SageAI/
├── app/
│   ├── core/              # Config, database engine, JWT, rate limiting, telemetry
│   ├── models/            # 17 SQLAlchemy models (Scan, Finding, Asset, RemediationPatch...)
│   ├── routers/           # 50 API router modules (AI SOC, Threat Hunting, Ransomware, DSPM, CTI...)
│   ├── schemas/           # Pydantic request & response validators
│   ├── services/
│   │   ├── ai_soc/                  # 🆕 Neural alert clustering, 90%+ noise reduction & CISO briefings
│   │   ├── threat_hunting/          # 🆕 Multi-SIEM query forge (Sigma/KQL/SPL/EQL) & retro hunting
│   │   ├── ransomware/              # 🆕 Shannon entropy burst detection, VSS shield & canary traps
│   │   ├── dspm/                    # 🆕 Sensitive data classification, data lineage & remediation
│   │   ├── cti/                     # 🆕 OASIS STIX 2.1 serialization & TAXII 2.1 collection server
│   │   ├── orchestrator/            # Enterprise Security Orchestrator (10 Pillars)
│   │   ├── cloud_posture/           # Multi-cloud CSPM, CIEM & toxic combination engine
│   │   ├── supply_chain/            # CycloneDX 1.5 SBOM generator & typosquat detector
│   │   ├── ztna/                    # Contextual Zero-Trust scoring & Cilium L7 synthesizer
│   │   ├── adversary/               # MITRE ATT&CK 14-tactic matrix & BAS emulator
│   │   ├── easm/                    # External surface recon & dangling DNS takeover hunter
│   │   ├── enclave/                 # Multi-region zero data egress edge enclaves
│   │   ├── threat_modeling/         # STRIDE + DREAD threat modeling engine
│   │   ├── pqc/                     # NIST FIPS 203/204 Post-Quantum Cryptography layer
│   │   ├── ebpf/                    # Kernel-space eBPF SIEM & process quarantine agent
│   │   ├── malware/                 # Reverse engineering & PE/ELF disassembly sandbox
│   │   ├── deception/               # Honeypot decoys, canary tokens, intrusion mesh
│   │   ├── detection/               # Ingress WAF, NIDS monitor, UEBA anomaly engine
│   │   ├── incident_response/       # SOAR engine & guarded human-in-the-loop playbooks
│   │   ├── threat_feed/             # CISA KEV indexer & YARA/Sigma/Nuclei rule forge
│   │   ├── redteam/                 # NeMo microservices & multi-model adversarial audits
│   │   ├── simulation/              # Cyber Range simulator & APT kill chain scenarios
│   │   ├── sagepatch/               # AST code remediation & PR generation studio
│   │   ├── intelligence/            # 9 OSINT intelligence modules (Shodan, Censys, Babel X...)
│   │   ├── agent/                   # Multi-agent autonomous swarm (Recon, Scanner, Exploit)
│   │   ├── audit_chain.py           # Cryptographic SHA-256 Merkle hash chain ledger
│   │   └── warroom_service.py       # Distributed event streaming & War Room manager
│   └── middleware/        # Security headers, SlowAPI rate limiter, audit trail middleware
├── sage-web/src/          # Next.js 16.4.4 Production SSR Frontend (Turbopack)
│   ├── app/               # App Router pages (Dashboard, Scans, Intel, War Room, Command Center)
│   ├── app/api/           # 128 API routes and proxy endpoints
│   └── components/        # 59 Tailwind & Lucide React UI Components
│       ├── AISOCCommandCenter.tsx     # 🆕 Neural alert triage, fatigue reduction & CISO briefs
│       ├── ThreatHuntingStudio.tsx    # 🆕 Sigma/KQL/SPL/EQL query forge & retrospective hunter
│       ├── AntiRansomwareShield.tsx   # 🆕 Shannon entropy burst detector & canary trap mesh
│       ├── DSPMHub.tsx                # 🆕 Sensitive data discovery, lineage & toxic risk
│       ├── CTIHub.tsx                 # 🆕 OASIS STIX 2.1 bundle forge & TAXII 2.1 collections
│       ├── QuantumSafeStudio.tsx      # NIST Kyber KEM, Dilithium DSA & Zero-Egress Sealer
│       ├── CSPMHub.tsx                # Multi-cloud CIS Benchmarks & toxic combinations
│       ├── SupplyChainStudio.tsx      # CycloneDX 1.5 SBOM viewer & typosquat alerts
│       ├── ZTNAManager.tsx            # Zero-Trust trust scoring & microsegmentation
│       ├── AdversaryMatrixViewer.tsx  # MITRE ATT&CK 14-tactic heatmap & BAS drills
│       ├── EASMHunter.tsx             # Dangling DNS takeover scanner & shadow IT hunter
│       ├── ThreatModelingStudio.tsx   # STRIDE + DREAD threat modeling canvas
│       ├── EBPFTelemetryCenter.tsx    # Kernel syscall telemetry & container sandbox
│       ├── ZeroEgressEnclave.tsx      # Multi-region zero data egress enclave monitor
│       ├── EnterpriseSecurityHub.tsx  # 10-Capability Command Center & Drill Console
│       ├── WarRoom.tsx                # Real-time threat telemetry & geographic map
│       ├── AutoFixPanel.tsx           # SagePatch proposal studio & AST diff editor
│       └── RedTeamPanel.tsx           # Multi-model adversarial audit playground
├── tests/                 # 396 tests across 66 test suites (100% passing)
├── alembic/               # Database migrations & revision history
└── docker/                # Multi-service Docker Compose configurations
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <strong>Built with precision for the sovereign enterprise cybersecurity community</strong><br>
  <sub>SageAI — Autonomous Attack Surface Discovery, Deep Reverse Engineering, Active Deception & SOAR Containment</sub><br><br>
  <em>"In 2026, cybersecurity is either autonomous, or it is compromised.<br>
  <strong>SECURE YOUR SHADOW.</strong>"</em>
</div>
