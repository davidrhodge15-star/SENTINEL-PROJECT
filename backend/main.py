from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import uvicorn

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def process_log(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        # Read CSV and drop any rows that are empty or have missing values
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        df = df.dropna() 
        
        # Ensure 'Value' is numeric so the frontend logic works
        df['Value'] = pd.to_numeric(df['Value'], errors='coerce')
        df = df.dropna(subset=['Value'])
        
        return df.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)