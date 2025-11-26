import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json({ message: 'IP address is required' }, { status: 400 });
    }

    const response = await axios.get(`http://${ip}:8001/status`, { timeout: 2000 });
    response.data.ip = ip;

    const data = response.data;
    const cpu_usage_str = data.cpu_usage?.replace('%', '') || '0';
    const ram_usage_str = data.ram_usage?.replace('%', '') || '0';
    data.cpu = parseFloat(cpu_usage_str) || 0.0;
    data.ram = parseFloat(ram_usage_str) || 0.0;

    const used_bytes = data.disk_used || 0;
    const total_bytes = data.disk_total || 0;
    data.disk_percent = total_bytes > 0 ? (used_bytes / total_bytes) * 100 : 0.0;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: 'Could not fetch device status. Make sure the agent is running on the target device and not blocked by a firewall.' },
      { status: 404 }
    );
  }
}
