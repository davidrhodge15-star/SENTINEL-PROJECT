# 1. Use an official Python base image
FROM python:3.11-slim

# 2. Install Nmap (The engine of your app)
RUN apt-get update && apt-get install -y nmap && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your backend code
COPY . .

# 6. Expose the port FastAPI runs on
EXPOSE 8000

# 7. Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]