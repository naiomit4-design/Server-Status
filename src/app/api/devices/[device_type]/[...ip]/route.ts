import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function loadData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const jsonData = JSON.parse(data);
    if (!jsonData.pcs) jsonData.pcs = [];
    if (!jsonData.servers) jsonData.servers = [];
    return jsonData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { pcs: [], servers: [] };
    }
    console.error('Error loading data:', error);
    return { pcs: [], servers: [] };
  }
}

async function saveData(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 4));
}

export async function DELETE(request: Request, { params }: { params: { device_type: string; ip: string[] } }) {
  try {
    const { device_type, ip: ip_parts } = params;

    if (!device_type || !ip_parts || !Array.isArray(ip_parts)) {
      return NextResponse.json({ message: 'Invalid request parameters.' }, { status: 400 });
    }

    const ip = ip_parts.join('.');
    const data = await loadData();

    if (!data || typeof data !== 'object') {
        return NextResponse.json({ message: 'Failed to load data.' }, { status: 500 });
    }

    if (!data.hasOwnProperty(device_type) || !Array.isArray(data[device_type])) {
      return NextResponse.json({ message: `Invalid device type: ${device_type}` }, { status: 400 });
    }

    const original_count = data[device_type].length;
    const filtered_devices = data[device_type].filter(d => d && d.ip !== ip);

    if (filtered_devices.length < original_count) {
      data[device_type] = filtered_devices;
      await saveData(data);
      return NextResponse.json({ message: 'Device removed successfully' });
    } else {
      return NextResponse.json({ message: 'Device not found' }, { status: 404 });
    }
  } catch (e) {
    console.error('Error in DELETE handler:', e);
    return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
  }
}
