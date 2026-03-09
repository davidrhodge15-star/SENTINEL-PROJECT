# 🛡️ SENTINEL v1.0
**Sentinel** is a full-stack network discovery dashboard. It provides a modern web interface for [Nmap](https://nmap.org/), allowing users to audit their network, view open services, and maintain a persistent scan history.

## ✨ Key Features
* **Nmap Integration:** Real-time port scanning and service discovery.
* **Persistent History:** Results are saved to a SQLite database for later review.
* **Data Visualization:** Clean React dashboard with pulsing status indicators and port counts.
* **Management Tools:** Individual scan deletion and bulk history clearing.

## 🚀 Setup Instructions

### 1. Prerequisites
* **Nmap:** Install via [Homebrew](https://formulae.brew.sh/formula/nmap) on Mac: `brew install nmap`
* **Python 3.8+** and **Node.js**

### 2. Backend (FastAPI)
```bash
# From the root directory
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy python-nmap
uvicorn main:app --reload

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev