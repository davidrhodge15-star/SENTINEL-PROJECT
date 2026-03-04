from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String)
    # Make sure this name matches exactly what you use in main.py
    result_data = Column(String) 
    scan_time = Column(DateTime, default=datetime.datetime.utcnow)