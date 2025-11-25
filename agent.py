import psutil
from fastapi import FastAPI

app = FastAPI()

@app.get("/status")
async def get_status():
    return {
        "cpu_usage": f"{psutil.cpu_percent(interval=1)}%",
        "ram_usage": f"{psutil.virtual_memory().percent}%",
        "disk_space": f"{psutil.disk_usage('/').used / (1024**3):.2f}GB / {psutil.disk_usage('/').total / (1024**3):.2f}GB"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
