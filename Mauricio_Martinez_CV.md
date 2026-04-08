# Mauricio Martinez

Brownsville, TX | (956) 371-0886 | mauriciomartinezpersonal@gmail.com
[LinkedIn](https://www.linkedin.com/) | [Portfolio](https://mauricodes04.github.io/Website/)

---

## Professional Summary

Cybersecurity undergraduate focused on network defense, incident triage, vulnerability management, and log/telemetry analysis. Hands-on experience with Tenable Nessus, Wazuh, Cortex XDR/XQL, and OSINT tooling, applied in both an internship environment and a self-built Azure-based virtual SOC. Active in student-led cybersecurity outreach through the Vaquero Information Security Initiative (VISI), with a track record of designing and delivering technical workshops to peers and under-resourced organizations in the Rio Grande Valley.

---

## Education

**University of Texas Rio Grande Valley** — Edinburg, TX
Bachelor of Science in Cybersecurity, August 2023 – Expected 2027
GPA: 3.51 | Dean's List (multiple semesters)

---

## Relevant Coursework

Intrusion Detection, Digital Forensics, Data Communications & Networking, Software Engineering & Project Management, Health Computing Information Systems, Programming Cyber Systems & Reverse Engineering, Foundations of Systems I & II.

---

## Technical Skills

**Vulnerability Management:** Tenable Nessus, OpenVAS / Greenbone, Arctic Wolf Risk Management Platform, CVE triage, patch coordination
**SIEM / EDR / Detection:** Wazuh, Cortex XDR, XQL query development, MITRE ATT&CK mapping
**Network Security:** NMAP, Wireshark, AngryIPScanner, public/private IP and NAT, port security, DMZ design, subnetting, DNS analysis
**Cloud & Infrastructure:** Microsoft Azure (VMs, region/SKU policy, virtual networks), Google Cloud Platform, Active Directory / Entra ID, Group Policy
**OSINT:** WhatsMyName, PimEyes, FaceCheck, Hunter.io, DorkGPT, Shodan, Recon-ng, Subfinder, Amass, IntelX, DeHashed, Have I Been Pwned, Hybrid Analysis, ANY.RUN
**Frameworks & Standards:** NIST SP 800-53, CIS Controls, MITRE ATT&CK, CJIS, HIPAA, PCI DSS, CIA, AAA
**Programming & Data:** Python, JavaScript / TypeScript, Bash, PowerShell, HTML/CSS, NumPy, Pandas, ETL, API ingestion, data cleaning, time-series telemetry
**Systems & Tooling:** Linux (Kali, Ubuntu), Windows Server 2022, VirtualBox, Proxmox, Raspberry Pi, Samba, AdGuard Home, Git

---

## Professional Experience

### Information Security Intern
**Cameron County IT** — Brownsville, TX | December 2025 – February 2026

- Conducted vulnerability scans with Tenable Nessus against suspicious endpoints identified through DHCP scope analysis.
- Administered security awareness training and phishing simulations for staff in compliance with Texas Government Code 2054.519.
- Collaborated with cross-functional IT teams to remediate CVEs through patching and removal of unauthorized software.
- Authored Cortex XDR XQL queries to detect unauthorized or non-CJIS-compliant Remote Monitoring and Management (RMM) tools.
- Triaged XDR alerts to determine severity, distinguishing patch-driven findings from behavioral endpoint risks, and escalated to the appropriate cybersecurity specialist.
- Performed OSINT-driven threat intelligence collection using Unit 42 GitHub IOCs, AlienVault OTX, ThreatFox, Malware Bazaar, and Dark Reading; submitted IOCs to the CISO for blocklist enforcement.
- Gained working knowledge of Active Directory and Entra ID integration, including Group Policy rule construction for user and computer configurations.

### Student Academic Assistant
**University of Texas Rio Grande Valley** — Rio Grande Valley, TX | September 2025 – December 2025

- Developed an internal inventory logging application for departmental use.
- Managed study room reservations and front-desk operations.
- Supported general office functions including printing, message routing, and equipment handling.

### Mentor / Resident Assistant
**University of Texas Rio Grande Valley** — Rio Grande Valley, TX | March 2025 – September 2025

- Mentored 21 students and supported two summer camps as a Resident Assistant, coordinating schedules, materials, and engagement tracking.
- Managed communications and logistics through Microsoft Teams, Zoom, and Canva.

---

## Projects

### Azure Virtual SOC + Self-Hosted AI Pentesting Lab
Designed and deployed a red team / blue team demo lab in Microsoft Azure using two intentionally vulnerable target VMs (Ubuntu and Windows Server 2022) and a Wazuh server for blue-team monitoring. Integrated PentAGI as an autonomous multi-agent penetration testing platform driven by a self-hosted Ollama instance running on a Windows desktop, with a Raspberry Pi 5 acting as the PentAGI host. Azure subscription policy conflicts required full migration to complete self-host using VirtualBox.

### GCP Virtual SOC Lab (VISI Workshop Infrastructure)
Built a prior iteration of the vSOC lab on Google Cloud Platform using custom VMs and OpenVAS / Greenbone running on Kali Linux in VirtualBox. Prepared per-student VMs for hands-on workshops. Resolved persistent OpenVAS feed update failures traced to slow read/write drives.

### Homelab
Operated a Raspberry Pi 5 homelab running Kali Linux with static IP configuration, AdGuard Home for DNS filtering, Samba file sharing, MiniDLNA media streaming, and TightVNC for remote access (cut for security). Paired with a Proxmox-based HP EliteDesk 800 hypervisor. Currently offline due to hardware defects.

### Inventory Scanner Application
Developed a local React Native + Node.js application that scans 1D barcodes and writes entries to CSV. Designed for offline use and simple deployment on Windows or Linux hardware.

### Gulf of Mexico Water Quality Analysis Dashboard
Built a local web application that analyzes Gulf of Mexico water-quality datasets with AI-assisted characteristic matching and basic charting, originally produced for an admission application.

---

## Leadership & Outreach

### Lead, Vaquero Information Security Initiative (VISI)
**University of Texas Rio Grande Valley** | Active

Lead and active member of VISI, a student-run cybersecurity organization working toward formal cyber clinic status to serve under-resourced organizations in the Rio Grande Valley. Responsible for organizing technical workshops, mentoring members, and coordinating outreach. Organization site: https://vaqueroisi.org

#### Vulnerability Management Workshop
Delivered a hands-on workshop covering port scanning and vulnerability assessment with NMAP, AngryIPScanner, and OpenVAS. Explained the CVE system, zero-day vulnerabilities, IP addressing and subnetting, SQL injection, and path traversal. Distributed a preconfigured Kali VirtualBox VM with OpenVAS installed to attendees.

#### OSINT Tools Workshop
Demonstrated open-source intelligence techniques across identity, infrastructure, and incident response domains. Coverage included username enumeration, facial recognition search, metadata and geolocation extraction, domain email enumeration, Google dorking, IP and port reconnaissance, data breach verification, people / property / vehicle lookup, surveillance awareness, malware hash analysis, browser-based sandboxing, phishing email analysis, and subdomain enumeration.

---

## Key Achievements

- Dean's List recognition across multiple semesters at UTRGV.
- Letter of recommendation from the CISO of Cameron County IT.
- Designed and deployed a functioning Azure-based virtual SOC and AI-driven pentesting lab as a personal research initiative.

