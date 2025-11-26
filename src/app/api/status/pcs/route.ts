import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import ping from 'ping';
import axios from 'axios';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function loadData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { pcs: [], servers: [] };
    }
    console.error('Error loading data:', error);
    return { pcs: [], servers: [] };
  }
}

async function getPingStatus(ip) {
  try {
    const res = await ping.promise.probe(ip, {
      timeout: 1,
      extra: ['-c', '1'],
    });
    if (res.alive) {
      return { status: 'online', latency: `${parseFloat(res.time).toFixed(2)} ms` };
    } else {
      return { status: 'offline', latency: 'N/A' };
    }
  } catch (error) {
    return { status: 'offline', latency: 'N/A' };
  }
}

export async function GET() {
  try {
    const data = await loadData();
    const pcs = data.pcs || [];
    const status_list = await Promise.all(
      pcs.map(async (pc) => {
        const pingStatus = await getPingStatus(pc.ip);
        let pc_details = { cpu: 'N/A', ram: 'N/A', disk: 'N/A' };

        if (pingStatus.status === 'online') {
          try {
            const response = await axios.get(`http://${pc.ip}:8001/status`, { timeout: 2000 });
            if (response.status === 200) {
              const agent_data = response.data;
              
              const cpu_usage_str = agent_data.cpu_usage?.replace('%', '') || '0';
              const ram_usage_str = agent_data.ram_usage?.replace('%', '') || '0';
              pc_details.cpu = parseFloat(cpu_usage_str) || 0.0;
              pc_details.ram = parseFloat(ram_usage_str) || 0.0;

              const used_bytes = agent_data.disk_used || 0;
              const total_bytes = agent_data.disk_total || 0;
              pc_details.disk_percent = total_bytes > 0 ? (used_bytes / total_bytes) * 100 : 0.0;
            }
          } catch (error) {
            // Agent not reachable
          }
        }
        return { ...pc, ...pingStatus, details: pc_details, type: 'pc' };
      })
    );
    return NextResponse.json(status_list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
  }
}
