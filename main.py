from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import subprocess
import httpx
import json
import os
import re

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

DATA_FILE = "data.json"

# Load servers from data file
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        try:
            servers = json.load(f)
        except json.JSONDecodeError:
            servers = []
else:
    servers = []

def save_data():
    with open(DATA_FILE, "w") as f:
        json.dump(servers, f, indent=4)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/servers")
async def add_server(server: dict):
    # Avoid duplicates
    if not any(s["ip"] == server.get("ip") for s in servers):
        servers.append(server)
        save_data()
    return {"message": "Server added successfully"}

@app.delete("/servers/{ip_address}")
async def remove_server(ip_address: str):
    global servers
    original_count = len(servers)
    servers = [s for s in servers if s["ip"] != ip_address]
    if len(servers) < original_count:
        save_data()
    return {"message": "Server removed successfully"}

@app.get("/status")
async def get_status():
    status_list = []
    for server in servers:
        try:
            output = subprocess.check_output(
                ["ping", "-c", "1", "-W", "1", server["ip"]],
                universal_newlines=True,
                stderr=subprocess.DEVNULL
            )
            match = re.search(r"time=([\d.]+)", output)
            latency = f"{float(match.group(1)):.2f} ms" if match else "N/A"
            status_list.append({"ip": server["ip"], "type": server["type"], "status": "online", "latency": latency})
        except subprocess.CalledProcessError:
            status_list.append({"ip": server["ip"], "type": server["type"], "status": "offline", "latency": "N/A"})
    return status_list

@app.get("/pc-status/{ip_address}")
async def get_pc_status(ip_address: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://{ip_address}:8001/status", timeout=2)
            response.raise_for_status()
            data = response.json()
            data['ip'] = ip_address
            return data
    except (httpx.RequestError, httpx.HTTPStatusError):
        return JSONResponse(
            status_code=404,
            content={"error": "Could not fetch PC status. Make sure the agent is running on the target PC and not blocked by a firewall."}
        )