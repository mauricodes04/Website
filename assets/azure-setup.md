# Pentagi Demo Lab — Azure Setup Documentation

---

## AZURE INFRASTRUCTURE

-=+=- RESOURCE GROUP -=+=-

Create a resource
Resource Group

Subscription: Azure for Students
Resource Group Name: "Pentagi-Demo"
Region: (US) West US 2

Review, Create

-=+=- VIRTUAL NETWORK -=+=-

Create a resource
Virtual network

Subscription: Azure for Students
	Resource Group: "Pentagi-Demo"

Virtual Network Name: "pentagi-lab-vnet"
Region: (US) West US 2

In IP ADDRESSES tab

Add IPv4 address space
10.0.0.0 /24

+ add a subnet
Name: targets-subnet
IPv4 address range: 10.0.0.0 /24
Network Security Group: "(New) targets-nsg"

Review, Create

-=+=- NSG RULES (targets-nsg) -=+=-

In Azure Dashboard:
Network Security Groups
Select "targets-nsg"
Inbound security rules
+ Add

Rule 1 — Allow all inbound from your IP:
	Source: IP Addresses
	Source IP addresses/CIDR ranges: <YOUR_PUBLIC_IP>/32
		(find at https://ifconfig.me)
	Source port ranges: *
	Destination: Any
	Destination port ranges: *
	Protocol: Any
	Action: Allow
	Priority: 100
	Name: "Allow-MyIP-All"

Rule 2 — Deny everything else (safety net):
	Source: Any
	Source port ranges: *
	Destination: Any
	Destination port ranges: *
	Protocol: Any
	Action: Deny
	Priority: 4096
	Name: "Deny-All-Inbound"


-=+=- LINUX TARGET VM -=+=-

Create a resource
Virtual Machine

Subscription: Azure for Students
	Resource Group: "Pentagi-Demo"

Virtual Machine Name: "linux-target"
Region: (US) West US 2
Availability options: No infrastructure redundancy required
Security type: Standard
Image: Ubuntu Server 22.04 LTS - x64 Gen2
VM architecture: x64
Size: B2als_v2

Administrator account:
	Authentication type: Password
	Username: mauricio
	Password: <STRONG_PASSWORD_FOR_SSH>

In NETWORKING tab
	Virtual network: pentagi-lab-vnet
	Subnet: targets-subnet (10.0.0.0/24)
	Public IP: (new) linux-target-ip
	NIC network security group: None

In MANAGEMENT tab
	Auto-shutdown: Enable
	Shutdown time: 11:00 PM

Review, Create

-=+=- WINDOWS TARGET VM -=+=-

Create a resource
Virtual Machine

Subscription: Azure for Students
	Resource Group: "Pentagi-Demo"

Virtual Machine Name: "windows-target"
Region: (US) West US 2
Availability options: No infrastructure redundancy required
Security type: Standard
Image: Windows Server 2022 Datacenter: Azure Edition - x64 Gen2
VM architecture: x64
Size: B2as_v2

Administrator account:
	Username: mauricio
	Password: <STRONG_PASSWORD_FOR_RDP>

In NETWORKING tab
	Virtual network: pentagi-lab-vnet
	Subnet: targets-subnet (10.0.0.0/24)
	Public IP: (new) windows-target-ip
	NIC network security group: None

In MANAGEMENT tab
	Auto-shutdown: Enable
	Shutdown time: 11:00 PM

Review, Create

-=+=- done with Azure portal -=+=-

---

## POST-DEPLOYMENT: LINUX TARGET SETUP

SSH into linux-target using its public IP:
```
ssh yourname@<LINUX_PUBLIC_IP>
```

-=+=- SYSTEM UPDATE -=+=-
```
sudo apt update && sudo apt upgrade -y
```

-=+=- INSTALL DVWA (Damn Vulnerable Web Application) -=+=-

Install dependencies:
```
sudo apt install -y apache2 mariadb-server php php-mysqli php-gd libapache2-mod-php git
```

Clone DVWA:
```
cd /var/www/html
sudo git clone https://github.com/digininja/DVWA.git
sudo chown -R www-data:www-data /var/www/html/DVWA
```

Configure DVWA database:
```
sudo mysql -u root <<EOF
CREATE DATABASE dvwa;
CREATE USER 'dvwa'@'localhost' IDENTIFIED BY 'dvwa';
GRANT ALL PRIVILEGES ON dvwa.* TO 'dvwa'@'localhost';
FLUSH PRIVILEGES;
EOF
```

Copy config file:
```
cd /var/www/html/DVWA/config
sudo cp config.inc.php.dist config.inc.php
```

Edit config (db_password line):
```
sudo sed -i "s/\$_DVWA\[ 'db_password' \] = 'p@ssw0rd';/\$_DVWA[ 'db_password' ] = 'dvwa';/" config.inc.php
sudo sed -i "s/p@ssw0rd/dvwa/" /var/www/html/DVWA/config/config.inc.php
```

Set PHP allow_url_include (required by DVWA):
```
sudo sed -i 's/allow_url_include = Off/allow_url_include = On/' /etc/php/*/apache2/php.ini

```

Restart Apache:
```
sudo systemctl restart apache2
```

Open browser: http://<LINUX_PUBLIC_IP>/DVWA/setup.php
Click "Create / Reset Database"
Login: admin / password
Go to DVWA Security → set to "Low" for demo

-=+=- INSTALL VSFTPD (Weak FTP) -=+=-
```
sudo apt install -y vsftpd
```

Enable anonymous login:
```
sudo sed -i 's/anonymous_enable=NO/anonymous_enable=YES/' /etc/vsftpd.conf
```

Create anonymous FTP content:
```
echo "Confidential: Q3 revenue projections — do not distribute" | sudo tee /srv/ftp/internal_memo.txt
```

Restart FTP:
```
sudo systemctl restart vsftpd
```

-=+=- CREATE WEAK SSH USER -=+=-
```
sudo useradd -m -s /bin/bash intern
echo "intern:Password123" | sudo chpasswd
```

Ensure password authentication is enabled:
```
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/^PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

-=+=- VERIFY LINUX SERVICES -=+=-
```
sudo ss -tlnp
```

Expected listeners:
- 22/tcp   — SSH (weak creds on "intern" account)
- 80/tcp   — Apache/DVWA (SQL injection, XSS, command injection, file upload)
- 21/tcp   — FTP (anonymous read with sensitive file)
- 3306/tcp — MariaDB (local only, but visible in scan)

-=+=- done with linux target -=+=-

---

## POST-DEPLOYMENT: WINDOWS TARGET SETUP

RDP into windows-target using its public IP:
```
mstsc /v:<WINDOWS_PUBLIC_IP>
```
Login with the admin credentials set during VM creation.

-=+=- DISABLE WINDOWS FIREWALL (for demo only) -=+=-

Open PowerShell as Administrator:
```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

This exposes all services to the network. Bad practice, but done for this project.

-=+=- ENABLE SMB AND CREATE A WEAK SHARE -=+=-

SMB is enabled by default on Server 2022.

Create a shared folder with weak permissions:
```powershell
New-Item -Path "C:\SharedData" -ItemType Directory
New-SmbShare -Name "SharedData" -Path "C:\SharedData" -FullAccess "Everyone"
```

Drop a sensitive-looking file:
```powershell
Set-Content -Path "C:\SharedData\passwords.txt" -Value "admin:Winter2024!`nbackup_svc:Backup@2024`njdoe:Welcome1"
Set-Content -Path "C:\SharedData\network_diagram.txt" -Value "Internal topology: DC01 10.0.0.5, DB01 10.0.0.10, HR-APP 10.0.0.15"
```

-=+=- CREATE WEAK LOCAL ACCOUNTS -=+=-
```powershell
net user intern Password123 /add
net localgroup "Remote Desktop Users" intern /add
```

-=+=- ENABLE IIS WITH DEFAULT PAGE -=+=-
```powershell
Install-WindowsFeature -Name Web-Server -IncludeManagementTools
```

Add a fake internal page:
```powershell
Set-Content -Path "C:\inetpub\wwwroot\index.html" -Value @"
<html><head><title>ACME Corp Intranet</title></head>
<body><h1>ACME Corp Internal Portal</h1>
<p>Employee ID lookup: <a href='/employees'>Directory</a></p>
<!-- TODO: remove debug endpoint before production -->
<!-- /api/debug?token=admin123 -->
</body></html>
"@
```

-=+=- ENABLE WINRM (common in enterprise, scannable) -=+=-
```powershell
Enable-PSRemoting -Force
winrm set winrm/config/service '@{AllowUnencrypted="true"}'
winrm set winrm/config/service/auth '@{Basic="true"}'
```

-=+=- VERIFY WINDOWS SERVICES -=+=-
```powershell
netstat -an | findstr LISTENING
```

Expected listeners:
- 3389/tcp  — RDP (weak creds on "intern" account)
- 445/tcp   — SMB (open share "SharedData" with passwords.txt)
- 80/tcp    — IIS (HTML comments leaking debug endpoint)
- 5985/tcp  — WinRM HTTP (basic auth, unencrypted)
- 5986/tcp  — WinRM HTTPS

-=+=- done with windows target -=+=-

---

## ATTACK SURFACE SUMMARY

| VM | Service | Port | Vulnerability |
|---|---|---|---|
| linux-target | SSH | 22 | Weak creds (intern:Password123) |
| linux-target | FTP | 21 | Anonymous login, sensitive file |
| linux-target | HTTP/DVWA | 80 | SQLi, XSS, command injection, file upload |
| windows-target | RDP | 3389 | Weak creds (intern:Password123) |
| windows-target | SMB | 445 | Open share with credential file |
| windows-target | HTTP/IIS | 80 | HTML comment info leak |
| windows-target | WinRM | 5985 | Basic auth, unencrypted |


-=+=- done -=+=-
