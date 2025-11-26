import express from 'express';
import si from 'systeminformation';

const app = express();
const port = 8001;

app.get('/status', async (req, res) => {
  try {
    const cpu = await si.currentLoad();
    const mem = await si.mem();
    const fs = await si.fsSize();

    let disk = fs.find(d => d.mount === '/');
    // If root disk not found, find the largest one
    if (!disk && fs.length > 0) {
        disk = fs.reduce((prev, curr) => (prev.size > curr.size) ? prev : curr);
    }

    res.json({
      cpu_usage: `${cpu.currentLoad.toFixed(2)}%`,
      ram_usage: `${((mem.active / mem.total) * 100).toFixed(2)}%`,
      disk_used: disk ? disk.used : 0, // in bytes
      disk_total: disk ? disk.size : 0, // in bytes
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error getting system status');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Agent listening at http://0.0.0.0:${port}`);
});
