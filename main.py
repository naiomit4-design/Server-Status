from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import subprocess
import httpx
import json
import os
import re
import logging

# --- Setup Logging ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='error.log',
    filemode='w'
)
# ---

app = FastAPI()

app.mount("/static/dist", StaticFiles(directory="static/dist"), name="static_dist")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

DATA_FILE = "data.json"

# Load data from file
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            try:
                data = json.load(f)
                if not isinstance(data, dict):
                    return {"pcs": [], "servers": []}
                if 'pcs' not in data: data['pcs'] = []
                if 'servers' not in data: data['servers'] = []
                return data
            except (json.JSONDecodeError, TypeError):
                return {"pcs": [], "servers": []}
    return {"pcs": [], "servers": []}

# Save data to file
def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/devices")
async def add_device(device: dict):
    try:
        data = load_data()
        device_type = device.get("type")
        ip = device.get("ip")
        
        if device_type not in data:
            return JSONResponse(status_code=400, content={"message": "Invalid device type"})
        
        if not any(d["ip"] == ip for d in data[device_type]):
            data[device_type].append({"ip": ip})
            save_data(data)
            return {"message": f"{device_type.capitalize()[:-1]} added successfully"}
        return JSONResponse(status_code=400, content={"message": "Device already exists"})
    except Exception as e:
        logging.exception("Error in add_device")
        return JSONResponse(status_code=500, content={"message": "An internal error occurred."})


@app.delete("/devices/{device_type}/{ip_address}")
async def remove_device(device_type: str, ip_address: str):
    try:
        data = load_data()
        if device_type in data:
            original_count = len(data[device_type])
            data[device_type] = [d for d in data[device_type] if d["ip"] != ip_address]
            if len(data[device_type]) < original_count:
                save_data(data)
                return {"message": "Device removed successfully"}
        return JSONResponse(status_code=404, content={"message": "Device not found"})
    except Exception as e:
        logging.exception("Error in remove_device")
        return JSONResponse(status_code=500, content={"message": "An internal error occurred."})


async def get_ping_status(ip):
    try:
        output = subprocess.check_output(
            ["ping", "-c", "1", "-W", "1", ip],
            universal_newlines=True,
            stderr=subprocess.DEVNULL
        )
        match = re.search(r"time=([\d.]+)", output)
        latency = f"{float(match.group(1)):.2f} ms" if match else "N/A"
        return {"status": "online", "latency": latency}
    except subprocess.CalledProcessError:
        return {"status": "offline", "latency": "N/A"}

@app.get("/status/servers")
async def get_servers_status():
    try:
        data = load_data()
        servers = data.get("servers", [])
        status_list = []
        for server in servers:
            ping_status = await get_ping_status(server["ip"])
            status_list.append({**server, **ping_status})
        return status_list
    except Exception as e:
        logging.exception("Error in get_servers_status")
        return JSONResponse(status_code=500, content={"message": "An internal error occurred."})


@app.get("/status/pcs")
async def get_pcs_status():
    try:
        data = load_data()
        pcs = data.get("pcs", [])
        status_list = []
        for pc in pcs:
            ping_status = await get_ping_status(pc["ip"])
            pc_details = {"cpu": "N/A", "ram": "N/A", "disk": "N/A"}
            
            if ping_status["status"] == "online":
                try:
                    async with httpx.AsyncClient() as client:
                        response = await client.get(f"http://{pc['ip']}:8001/status", timeout=2)
                        if response.status_code == 200:
                            agent_data = response.json()
                            
                            # Convert CPU and RAM usage to float
                            cpu_usage_str = agent_data.get("cpu_usage", "0%").replace('%', '')
                            ram_usage_str = agent_data.get("ram_usage", "0%").replace('%', '')
                            pc_details["cpu"] = float(cpu_usage_str) if cpu_usage_str.replace('.', '', 1).isdigit() else 0.0
                            pc_details["ram"] = float(ram_usage_str) if ram_usage_str.replace('.', '', 1).isdigit() else 0.0

                            # Parse disk space
                            disk_space_str = agent_data.get("disk_space", "0GB / 0GB")
                            match = re.match(r"([\d.]+)GB / ([\d.]+)GB", disk_space_str)
                            if match:
                                used_gb = float(match.group(1))
                                total_gb = float(match.group(2))
                                pc_details["disk_used"] = used_gb
                                pc_details["disk_total"] = total_gb
                                pc_details["disk_percent"] = (used_gb / total_gb) * 100 if total_gb > 0 else 0.0
                            else:
                                pc_details["disk_used"] = 0.0
                                pc_details["disk_total"] = 0.0
                                pc_details["disk_percent"] = 0.0
                except (httpx.RequestError, httpx.TimeoutException):
                    pass
                    
            status_list.append({**pc, **ping_status, "details": pc_details})
        return status_list
    except Exception as e:
        logging.exception("Error in get_pcs_status")
        return JSONResponse(status_code=500, content={"message": "An internal error occurred."})

@app.get("/pc-status/{ip_address}")
async def get_pc_status(ip_address: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://{ip_address}:8001/status", timeout=2)
            response.raise_for_status()
            data = response.json()
            data['ip'] = ip_address
            
            # Convert CPU and RAM usage to float
            cpu_usage_str = data.get("cpu_usage", "0%").replace('%', '')
            ram_usage_str = data.get("ram_usage", "0%").replace('%', '')
            data["cpu"] = float(cpu_usage_str) if cpu_usage_str.replace('.', '', 1).isdigit() else 0.0
            data["ram"] = float(ram_usage_str) if ram_usage_str.replace('.', '', 1).isdigit() else 0.0

            # Parse disk space
            disk_space_str = data.get("disk_space", "0GB / 0GB")
            match = re.match(r"([\d.]+)GB / ([\d.]+)GB", disk_space_str)
            if match:
                used_gb = float(match.group(1))
                total_gb = float(match.group(2))
                data["disk_used"] = used_gb
                data["disk_total"] = total_gb
                data["disk_percent"] = (used_gb / total_gb) * 100 if total_gb > 0 else 0.0
            else:
                data["disk_used"] = 0.0
                data["disk_total"] = 0.0
                data["disk_percent"] = 0.0
            
            return data
    except (httpx.RequestError, httpx.TimeoutException):
        return JSONResponse(
            status_code=404,
            content={"message": "Could not fetch PC status. Make sure the agent is running on the target PC and not blocked by a firewall."}
        )
