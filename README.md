# 🛡️ Sentinel: Advanced Diagnostics Engine

A high-performance system built to process raw data streams and provide real-time diagnostic analytics.

## 🛠️ The Tech Stack
* **Frontend:** React.js, Tailwind CSS, Lucide-React
* **Data Visualization:** Recharts
* **Backend:** Python, FastAPI, Pandas
* **Export:** jsPDF / jspdf-autotable

## 🌟 Key Features
* **CSV Processing Engine:** Custom Python backend using Pandas to sanitize and categorize transaction data.
* **Dynamic Analytics:** Real-time bar chart visualization of spending distribution.
* **Dynamic UI:** Responsive dashboard with conditional formatting (color-coded balance tracking).
* **Professional Export:** Generates formatted PDF statements directly from the browser.

## 📊 Live Preview
<img width="100%" alt="Finance Dashboard Demo" src="https://github.com/user-attachments/assets/9fff7dc7-7723-4616-b3f5-744078ee992b" />

*Note: This dashboard provides a categorized breakdown of monthly spending vs. income.*

## 🚀 How to Run

### 1. Start the Backend
```bash
cd backend
source venv/bin/activate
python main.py
```
### 2. Start the Frontend
```bash
cd frontend
npm run dev
```