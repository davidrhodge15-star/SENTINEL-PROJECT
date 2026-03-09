from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nmap
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Database Configuration
DATABASE_URL = "sqlite:///./sentinel.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class ScanResult(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    target = Column(String)
    result_data = Column(JSON)
    scan_time = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

# 2. FastAPI Setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, this ensures no blocks
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    target: str

@app.post("/scan")
async def run_scan(request: ScanRequest):
    db = SessionLocal()
    try:
        # 1. Initialize Nmap (Homebrew Path)
        # Note: Ensure nmap is installed via 'brew install nmap'
        # 1. Initialize Nmap (Universal Path for Docker & Mac)
        # This checks the Docker path first, then the Mac Homebrew path
        nm = nmap.PortScanner(nmap_search_path=('/usr/bin/nmap', '/opt/homebrew/bin/nmap'))
        
        # 2. Run Scan (Clean the target string)
        target_ip = request.target.strip()
        scan_info = nm.scan(target_ip, arguments='-F')
        
        # 3. Extract Data
        target_data = scan_info['scan'].get(target_ip, {})

        # 4. Save to Database
        new_entry = ScanResult(target=target_ip, result_data=target_data)
        db.add(new_entry)
        db.commit()

        return {"target": target_ip, "summary": target_data}
        
    except Exception as e:
        db.rollback()
        print(f"DEBUG ERROR: {str(e)}") # This shows up in your terminal
        raise HTTPException(status_code=500, detail=f"Scanner Error: {str(e)}")
    finally:
        db.close() # Crucial to prevent SQLite locks

@app.get("/scans")
async def get_history():
    db = SessionLocal()
    try:
        scans = db.query(ScanResult).order_by(ScanResult.scan_time.desc()).all()
        
        history = []
        for s in scans:
            # --- ROBUST PORT COUNT CHECK ---
            port_count = 0
            # This checks if result_data is a dictionary and safely pulls the 'tcp' data
            if isinstance(s.result_data, dict) and 'tcp' in s.result_data:
                port_count = len(s.result_data.get('tcp', {}))
            # -------------------------------
                
            history.append({
                "id": s.id,
                "target": s.target,
                "scan_time": s.scan_time,
                "result_data": s.result_data,
                "port_count": port_count 
            })
        
        return history
    finally:
        db.close()

# PASTE THE NEW CODE HERE:
@app.delete("/scans")
async def clear_all_scans():
    db = SessionLocal()
    try:
        db.query(ScanResult).delete()
        db.commit()
        return {"message": "All history cleared"}
    finally:
        db.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)