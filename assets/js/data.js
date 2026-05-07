/* ==============================================================
   HIGHLIGHT DATA — Modular structure like projects
   ============================================================== */
const HIGHLIGHT = {
  title: "Current Highlight",
  sections: [
    { type: "subtitle", content: "banadi" },
    { type: "desc", html: true, content: `AI-powered pentesting and vulnerability triage framework.`},

    { type: "desc", html: true, content: `After recognizing LLM tooling through <a href="https://github.com/vxcontrol/pentagi" target="_blank" rel="noopener">pentagi</a> and Claude Code orchestration through <a href="https://github.com/santifer/career-ops" target="_blank" rel="noopener">career-ops</a>, I created banadi. Banadi combines Claude Code, Dockerized security tooling, CVE intelligence, and LLM-assisted analysis into a modular offensive security workflow. This will probably be my capstone project or used for admissions.`},

    { type: "media", src: "assets/photos/about.gif", alt: "Career-ops demo" },

    { type: "subtitle", content: "/banadi" },
    { type: "desc", html: true, content: `Displays list of available commands.`},
    { type: "subtitle", content: "/banadi-doctor" },
    { type: "desc", html: true, content: `Verifies Docker container, MCP servers, and LLM reachability are green.`},
    { type: "media", src: "assets/photos/banadi-doctor.png", alt: "banadi-doctor demo" },
    { type: "subtitle", content: "/banadi-scope" },
    { type: "desc", html: true, content: `Prints current list of available targets in config/scope.yml`},
    { type: "media", src: "assets/photos/banadi-scope.png", alt: "banadi-scope demo" },
    { type: "subtitle", content: "/banadi-recon <target>" },
    { type: "desc", html: true, content: `Runs an nmap scan on the target in the docker container. Logs ports, OS estimate, and transcript.`},
    { type: "media", src: "assets/photos/banadi-recon.png", alt: "banadi-recon demo" },
    { type: "subtitle", content: "/banadi-vuln" },
    { type: "desc", html: true, content: `Sources <a href="https://hackviser.com/" target="_blank" rel="noopener">hackviser.com</a> for pentesting information/guidance per port.`},
    { type: "media", src: "assets/photos/banadi-vuln.png", alt: "banadi-vuln demo" },
    { type: "comments", html: true, content: `See <a href="https://hackviser.com/tactics/pentesting/services/ssh" target="_blank" rel="noopener">hackviser's document on port 22 (SSH)</a>`},
    { type: "subtitle", content: "/banadi-cve" },
    { type: "desc", html: true, content: `Uses LLM reasoning/history to identify CVE ID for version banner and port service. Uses NVD REST API to capture information and further guidance.`},
    { type: "media", src: "assets/photos/banadi-cve.png", alt: "banadi-cve demo" },
    { type: "subtitle", content: "/banadi-patch" },
    { type: "desc", html: true, content: `Triages a Window host's installed program inventory. Uses LLM reasoning/history to identify CVE ID, malware, remote-access concerns and generates a report.md using template.`},
    { type: "media", src: "assets/photos/banadi-patch.png", alt: "banadi-patch demo" },
    { type: "comments", html: false, content: "results.md template. Results vary."},


    { type: "desc", content: "Last Updated: 5/5/2026" }
  ]
};

const ABOUT = {
  title: "About",
  sections: [
    { type: "desc", content: `I'm a Junior Cybersecurity student at UTRGV (grad. 2027) with hands-on experience in vulnerability management, incident triage, and cloud computing. My information security internship at Cameron County taught me vulnerability scanning through Tenable Nessus, XDR alert triage, XQL threat hunting scripts, and learned foundational language within the cybersecurity world such as CIA, AAA, HIPAA, PCI DSS, and PII. Previously worked as a Student Academic Assistant & Mentor at UTRGV, mentoring 21 students and providing guidance across programming, tooling, and environment setup.` },
    { type: "desc", content: `I prioritize clear documentation, reproducibility, and incremental improvement across all my work.` },
    { type: "desc", html: true, content: `<a href="mailto:mauriciomartinezpersonal@gmail.com">Email</a> &nbsp;·&nbsp; <a href="https://www.linkedin.com/in/mauricio-martinez-44a933264/" target="_blank" rel="noopener">LinkedIn</a> &nbsp;·&nbsp; <a href="https://github.com/mauricodes04" target="_blank" rel="noopener">GitHub</a>` },
    { type: "media", src: "assets/photos/about.gif", alt: "About me demo" }
  ]
};

/* ==============================================================
   PROJECT DATA
   Each project: title + modular sections.
   ============================================================== */
const PROJECTS = [
  {
    title: "Virtual SOC Lab",
    sections: [
      { type: "subtitle", content: "AI-assisted Pentesting w/ PentAGI + Ollama" },
      { type: "media", src: "assets/photos/highlight.png", alt: "PentAGI Highlight" },
      { type: "desc", html: true, content: `<a href="https://github.com/vxcontrol/pentagi" target="_blank" rel="noopener">PentAGI</a> is a fully autonomous agent that automatically determines and executes penetration testing steps. It works using built-in tools like Nmap, Metasploit, sqlmap, search the web, maintain memory across tasks, and generates reports.

<a href="https://ollama.com/" target="_blank" rel="noopener">Ollama</a> allows me to use my own hardware to run a LLM model instead of relying on paid API usage from Anthropic or OpenAI.

I created comparison guidance to find which Ollama model best fits for the hardware it runs on. As of now, I'm unable to select a model because I lack the hardware to run it. I can request a quota increase for my Azure for Students subscription or find a way to get hands on a lab computer.`},
      { type: "comments", html: true, content: "See the <a href=\"assets/ollama-models.html\" target=\"_blank\">Ollama Model Comparison</a> for detailed benchmarks. (AI GENERATED 4/3/26)"},

      { type: "subtitle", content: "Azure-hosted red/blue team training environment" },
      { type: "desc", content: `A full virtual security operations center (VSOC) designed for student training on Azure.`},
      { type: "desc", content: `Red-team: PentAGI + Ollama AI pentesting`},
      { type: "desc", content: `Blue-team: Wazuh SIEM monitoring + Linux and windows vulnerable VMs`},
      { type: "desc", content: `I documented how I setup this environment in Azure. (under $100 credit)`},
      { type: "comments", html: true, content: "See the <a href=\"assets/azure-setup.md\" download>azure-setup.md</a> for detailed setup instructions."},

      { type: "subtitle", content: "Linux target" },
      { type: "desc", content: `Running Ubuntu Server 22.04 LTS - x64 Gen2
      Size: B2als_v2`},
      { type: "media", src: "assets/photos/linux-target.png", alt: "Linux-target configuration" },
      { type: "desc", html: true, content: `Vulnerabilities: Weak SSH credentials, Anonymous FTP login enabled, <a href="https://github.com/digininja/DVWA" target="_blank" rel="noopener">DVWA</a> `},

      { type: "subtitle", content: "Windows target" },
      { type: "desc", content: `Running Windows Server 2022 Datacenter: Azure Edition x64 Gen2
      Size: B2as_v2`},
      { type: "media", src: "assets/photos/windows-target.png", alt: "Windows-target configuration" },
      { type: "desc", content: "Vulnerabilities: Weak RDP credentials, Open file sharing SMB, Disabled Firewall" },

      { type: "desc", content: "Last Updated: 4/30/2026" }
    ]
  },

  {
    title: "tools",
    sections: [
      { type: "subtitle", content: "/career-ops + JobSpy" },
      { type: "desc", html: true, content: `<a href="https://github.com/santifer/career-ops" target="_blank" rel="noopener">career-ops</a> is an AI-powered job application pipeline I'm contributing to by adding JobSpy. It pulls listings from a growing library of direct ATS API integrations (Greenhouse, Lever, Ashby, Workday, and others). 
<a href="https://github.com/speedyapply/JobSpy" target="_blank" rel="noopener">JobSpy</a> scrapes boards like LinkedIn and Indeed. The pipeline evaluates each listing against my profile and target roles, generates tailored CVs and cover letters, and produces employer research summaries.

So far, I've been searching for internships and full-time positions and applying manually. The goal is to increase interview conversion by submitting role-specific application materials at scale.`},

      { type: "media", src: "assets/photos/demo.gif", alt: "Career-ops demo" },
      { type: "subtitle", content: "Portable python utilities" },
      { type: "desc", html: true, content: `My collection of portable programs I use for my day-to-day work.\n<a href="https://github.com/mauricodes04/tools" target="_blank" rel="noopener">Github Repo</a> `},
      { type: "subtitle", content: "Typer" },
      { type: "desc", content: `Type text automatically into another window (useful for VMs)`},
      { type: "media", src: "assets/photos/typer.gif", alt: "Typer demo" },

      { type: "subtitle", content: "OCRTool" },
      { type: "desc", content: `Extract text from images and PDFs`},
      { type: "media", src: "assets/photos/ocrtool.gif", alt: "OCRTool demo" },

      { type: "subtitle", content: "Speech to text" },
      { type: "desc", content: `Record or upload audio/video transcribes to text`},
      { type: "media", src: "assets/photos/speech-to-text.gif", alt: "Speech to text demo" },

      { type: "subtitle", content: "Rockyou" },
      { type: "desc", content: `Record keyboard/mouse actions and replay with password list`},
      { type: "media", src: "assets/photos/rockyou.gif", alt: "Rockyou demo" },

      { type: "desc", content: "Last Updated: 4/30/2026" }
    ]
  },

  {
    title: "Vulnerability Management Workshop",
    sections: [
      { type: "subtitle", content: "OpenVAS, Nmap, and hands-on exploitation demos" },
      { type: "desc", html: true, content: `A workshop under <a href="https://vaqueroisi.org/" target="_blank" rel="noopener">VISI (Vaquero Information Security Initiative)</a> demonstrating vulnerability management tools and techniques. Covers OpenVAS/Greenbone for vulnerability scanning, Nmap for network discovery, Angry IP Scanner for host enumeration, and live demonstrations of SQL injection and path traversal attacks.` },
      { type: "media" },
      { type: "comments", html: true, content: "Download the OpenVAS VM <a href=\"https://utrgv-my.sharepoint.com/:u:/g/personal/mauricio_martinez06_utrgv_edu/IQCVwRd2av39RrgRmhkvG3A4AU0qfXqtnuLHF4-hKLGu7Fw?e=52ViKZ\" download>here</a>."}
    ]
  },

  {
    title: "OSINT Workshop & Toolkit",
    sections: [
      { type: "subtitle", content: "Comprehensive open-source intelligence framework" },
      { type: "desc", content: "The OSINT toolkit." },

      { type: "desc", html: true, content: `Identity & People Lookup \n<a href="https://whatsmyname.app/" target="_blank" rel="noopener">WhatsMyName</a> · <a href="https://www.truepeoplesearch.com/" target="_blank" rel="noopener">TruePeopleSearch</a> · <a href="https://www.familytreenow.com/" target="_blank" rel="noopener">FamilyTreeNow</a> · <a href="https://lookups.io/" target="_blank" rel="noopener">Lookups.io</a> · <a href="https://hunter.io/email-finder" target="_blank" rel="noopener">Hunter Email Finder</a> · <a href="https://jimpl.com/" target="_blank" rel="noopener">Jimpl</a> · <a href="https://phonebook.cz/" target="_blank" rel="noopener">Phonebook.cz</a> · <a href="https://facecheck.id/" target="_blank" rel="noopener">FaceCheck.ID</a> · <a href="https://pimeyes.com/en" target="_blank" rel="noopener">PimEyes</a> · <a href="https://www.nsopw.gov/search-public-sex-offender-registries" target="_blank" rel="noopener">NSOPW Registry</a>` },

      { type: "desc", html: true, content: `Breach, Threat & Malware Intelligence\n<a href="https://haveibeenpwned.com/" target="_blank" rel="noopener">Have I Been Pwned</a> · <a href="https://intelx.io/" target="_blank" rel="noopener">Intelligence X</a> · <a href="https://intelligencesecurity.io/en/" target="_blank" rel="noopener">Intelligence Security</a> · <a href="https://www.shodan.io/" target="_blank" rel="noopener">Shodan</a> · <a href="https://www.virustotal.com/gui/home/upload" target="_blank" rel="noopener">VirusTotal</a> · <a href="https://hybrid-analysis.com/" target="_blank" rel="noopener">Hybrid Analysis</a> · <a href="https://any.run/" target="_blank" rel="noopener">ANY.RUN</a> · <a href="https://metadefender.com/" target="_blank" rel="noopener">MetaDefender</a> · <a href="https://dnsdumpster.com/" target="_blank" rel="noopener">DNSDumpster</a> · <a href="https://app.phishtool.com/sign-up/community" target="_blank" rel="noopener">PhishTool Community</a> · <a href="https://odcrawler.xyz/" target="_blank" rel="noopener">ODCrawler</a> · <a href="https://www.dorkgpt.com/" target="_blank" rel="noopener">DorkGPT</a> · <a href="https://gchq.github.io/CyberChef/" target="_blank" rel="noopener">CyberChef</a>` },

      { type: "desc", html: true, content: `Geospatial, Transport & Surveillance\n<a href="https://www.atlasofsurveillance.org/" target="_blank" rel="noopener">Atlas of Surveillance</a> · <a href="https://deflock.org/map#map=13/25.993461/-97.509499" target="_blank" rel="noopener">DeFlock Map</a> · <a href="https://cctv.masspirates.org/" target="_blank" rel="noopener">MassPirates CCTV Map</a> · <a href="https://www.openrailwaymap.org/index.php" target="_blank" rel="noopener">OpenRailwayMap</a> · <a href="https://www.marinetraffic.com/en/ais/home/centerx:-97.191/centery:26.063/zoom:12" target="_blank" rel="noopener">MarineTraffic</a> · <a href="https://globe.adsbexchange.com/" target="_blank" rel="noopener">ADS-B Exchange</a> · <a href="https://map.netronline.com/" target="_blank" rel="noopener">NETRonline Map</a> · <a href="https://www.faxvin.com/" target="_blank" rel="noopener">FAXVIN</a> · <a href="https://www.carfax.com/vehicle-history-reports/" target="_blank" rel="noopener">CARFAX</a> · <a href="https://wigle.net/#/" target="_blank" rel="noopener">WiGLE</a>` },

      { type: "desc", html: true, content: `Frameworks, References & Workflow\n<a href="https://osintframework.com/" target="_blank" rel="noopener">OSINT Framework</a> · <a href="https://docs.google.com/spreadsheets/d/1KGLi0unSMHpGH1wZBrJ21-ryWqgruksSFNZIrDn5giY/edit?gid=132235969#gid=132235969" target="_blank" rel="noopener">OSINT Reference Sheet</a> · <a href="https://hackviser.com/" target="_blank" rel="noopener">Hackviser</a>` }
    ]
  }
];

/* Project accent color values (must match CSS --project-N) */
const PROJECT_COLORS = ["#004aad", "#ff914d", "#ff4d4d", "#7b8aff"];
