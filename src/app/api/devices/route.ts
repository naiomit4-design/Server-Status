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

export async function POST(request: Request) {
  try {
    const device = await request.json();
    const data = await loadData();
    const device_type = device.type;
    const ip = device.ip;
    const name = device.name;

    if (!data[device_type]) {
      return NextResponse.json({ message: 'Invalid device type' }, { status: 400 });
    }

    if (!data[device_type].some(d => d.ip === ip)) {
      data[device_type].push({ ip: ip, name: name });
      await saveData(data);
      return NextResponse.json({ message: `${device_type.slice(0, -1)} added successfully` });
    }
    return NextResponse.json({ message: 'Device already exists' }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
  }
}
