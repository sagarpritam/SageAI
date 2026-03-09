# Integrating Advanced OSINT & Intelligence into SageAI

This document outlines the architectural and integration plan for adding the 9 requested intelligence capabilities to SageAI.

## Overview of the Goal
The objective is to transform SageAI into an intelligence-gathering powerhouse by integrating capabilities spanning device search, link analysis, dark web monitoring, and identity de-masking.

## Proposed Changes

---
### 🛠️ Backend Architecture (FastAPI Python)

To support these advanced features without bloating the core scanner logic, we will introduce a dedicated **Intelligence Service module**:

#### [NEW] `app/services/intelligence/`
This directory will house dedicated clients for each ecosystem:
*   **`shodan_pro_client.py`:** Upgrading the existing free InternetDB client to support Shodan Pro features (The Panopticon).
*   **`censys_client.py`:** Real-time server and certificate monitoring (The Global Radar).
*   **`intelx_client.py`:** Connecting to Intelligence X for historical breaches and dark web archives (The Archive of Secrets).
*   **`osint_industries_client.py`:** Intercepting and mapping emails/phone numbers to 1500+ platforms (The Interceptor).
*   **`spiderfoot_runner.py`:** Wrapping and automating SpiderFoot CLI invocations or API calls for automated 100+ source profiling (Recon Automation).
*   **`recon_ng_runner.py`:** Automation scripts to deploy Recon-ng modules programmatically (The Framework).

#### [NEW] `app/services/intelligence/darkweb/`
*   **`babel_x_gateway.py`:** Since Babel X is proprietary and heavily restricted, we will build an integration layer that either connects to Babel X (if you have the enterprise license) or leverages open-source dark web scraping alternatives (like TorBot or AIL framework) to simulate the "Linguistic Mesh" decoding chatter.

#### [NEW] `app/services/intelligence/identity/`
*   **`social_links_api.py`:** Connecting to the Social Links API for neural de-masking, facial recognition, and behavioral tracking.

---
### 📊 Frontend Architecture (React / UI)

The current UI (`Dashboard`, `Scans`, `AssetInventory`) needs to be expanded to display complex intelligence data.

#### [NEW] `frontend/src/pages/IntelligenceHub.jsx`
*   A centralized command center for OSINT gathers.

#### [NEW] `frontend/src/components/NetworkGraph.jsx` (Maltego integration)
*   **Maltego: Link Analysis** requires sophisticated visualization. We will use a library like `react-force-graph` or `vis.js` to create interactive "Digital Detective Boards" linking IPs, domains, people, and emails, mimicking Maltego's powerful visualization right inside SageAI.

---
### 🗄️ Database Changes (SQLAlchemy)

We need new tables to map entities outside of standard IT "Assets".

#### [MODIFY] `app/models/models.py`
*   **`IntelligenceTarget`:** Table for tracking identities, emails, or phone numbers (not just domains/IPs).
*   **`IntelDataPoint`:** Table linking a piece of scraped data to a target (e.g., a dark web forum post linked to an email).

## User Review Required

> [!CAUTION]
> **API Keys & Licensing**
> Tools like CENSYS, INTEL X, OSINT INDUSTRIES, and SOCIAL LINKS require commercial API keys or enterprise licenses. 
> 
> *   Do you currently possess API keys/licenses for these enterprise tools?
> *   If not, would you like me to build the architecture using **free/open-source equivalents** where possible (e.g., using HaveIBeenPwned instead of IntelX, or standard OSINT scraping scripts instead of Babel X) while keeping the system plug-and-play for the premium versions?

## Verification Plan

### Automated Tests
*   `pytest tests/test_intelligence_clients.py`: Mock the API responses from OSINT Industries, Censys, and IntelX to ensure the data is parsed correctly.
*   `pytest tests/test_recon_runners.py`: Ensure SpiderFoot and Recon-ng CLI wrappers execute successfully and handle standard output.

### Manual Verification
*   Run an intelligence trace on a known domain/email to verify the React Network Graph maps the nodes correctly without crashing.
*   Start a dark web sweep and verify the results appear in the Intelligence Hub UI.
