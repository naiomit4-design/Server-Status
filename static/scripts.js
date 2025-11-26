document.addEventListener("DOMContentLoaded", () => {
    const addPcForm = document.getElementById("add-pc-form");
    const pcIpInput = document.getElementById("pc-ip");
    const pcGrid = document.getElementById("pc-grid");

    const addServerForm = document.getElementById("add-server-form");
    const serverIpInput = document.getElementById("server-ip");
    const serverGrid = document.getElementById("server-grid");

    const pcDetailsModal = new bootstrap.Modal(document.getElementById('pcDetailsModal'));
    const modalPcIp = document.getElementById('modal-pc-ip');
    let pcDetailsIntervalId = null; // To store the interval ID for modal updates

    const createPlaceholder = (message) => {
        return `<div class="col-12"><p class="text-muted text-center">${message}</p></div>`;
    };

    // Function to update circular progress
    const updateCircularProgress = (elementId, textId, value, total, label) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        const circumference = 2 * Math.PI * 15.9155; // 15.9155 is the radius for viewBox 0 0 36 36
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        const circle = document.getElementById(elementId);
        if (circle) {
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = strokeDashoffset;
            circle.style.stroke = percentage > 75 ? '#dc3545' : (percentage > 50 ? '#ffc107' : '#28a745');
        }

        const text = document.getElementById(textId);
        if (text) {
            if (label === 'CPU' || label === 'RAM') {
                text.textContent = `${label}: ${value.toFixed(1)}%`;
            } else if (label === 'Disk') {
                text.textContent = `Disk: ${value.toFixed(1)}GB / ${total.toFixed(1)}GB (${percentage.toFixed(1)}%)`;
            }
        }
    };

    const updatePcDetailsModal = async (ip) => {
        modalPcIp.textContent = ip;
        const response = await fetch(`/pc-status/${ip}`);
        if (!response.ok) {
            const error = await response.json();
            document.getElementById('cpu-text').textContent = `Error: ${error.message}`;
            document.getElementById('ram-text').textContent = '';
            document.getElementById('disk-text').textContent = '';
            updateCircularProgress('cpu-progress', 'cpu-text', 0, 100, 'CPU'); // Reset progress
            updateCircularProgress('ram-progress', 'ram-text', 0, 100, 'RAM');
            updateCircularProgress('disk-progress', 'disk-text', 0, 100, 'Disk');
            return;
        }
        const pcStatus = await response.json();

        updateCircularProgress('cpu-progress', 'cpu-text', pcStatus.cpu, 100, 'CPU');
        updateCircularProgress('ram-progress', 'ram-text', pcStatus.ram, 100, 'RAM');
        updateCircularProgress('disk-progress', 'disk-text', pcStatus.disk_used, pcStatus.disk_total, 'Disk');
    };

    pcDetailsModal._element.addEventListener('hidden.bs.modal', () => {
        if (pcDetailsIntervalId) {
            clearInterval(pcDetailsIntervalId);
            pcDetailsIntervalId = null;
        }
    });

    const renderPcs = async () => {
        const response = await fetch("/status/pcs");
        if (!response.ok) {
            const error = await response.json();
            pcGrid.innerHTML = createPlaceholder(`Error loading PCs: ${error.message}`);
            console.error("Error loading PCs:", error);
            return;
        }
        const pcs = await response.json();
        pcGrid.innerHTML = "";
        if (pcs.length === 0) {
            pcGrid.innerHTML = createPlaceholder("No PCs added yet.");
            return;
        }
        pcs.forEach((pc) => {
            const statusClass = pc.status === 'online' ? 'text-success' : 'text-danger';
            const card = document.createElement("div");
            card.className = "col-lg-4 col-md-6 mb-4";
            card.innerHTML = `
                <div class="card status-card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title"><i class="fas fa-desktop"></i> <a href="#" class="pc-ip-link" data-ip="${pc.ip}">${pc.ip}</a></h5>
                                <p class="card-text ${statusClass}">${pc.status}</p>
                            </div>
                            <button class="btn btn-sm btn-outline-danger remove-btn" data-ip="${pc.ip}" data-type="pcs">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            pcGrid.appendChild(card);
        });

        document.querySelectorAll('.pc-ip-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const ip = e.target.dataset.ip;
                updatePcDetailsModal(ip);
                pcDetailsIntervalId = setInterval(() => updatePcDetailsModal(ip), 3000); // Update every 3 seconds
                pcDetailsModal.show();
            });
        });
    };

    const renderServers = async () => {
        const response = await fetch("/status/servers");
        if (!response.ok) {
            const error = await response.json();
            serverGrid.innerHTML = createPlaceholder(`Error loading Servers: ${error.message}`);
            console.error("Error loading Servers:", error);
            return;
        }
        const servers = await response.json();
        serverGrid.innerHTML = "";
        if (servers.length === 0) {
            serverGrid.innerHTML = createPlaceholder("No servers added yet.");
            return;
        }
        servers.forEach((server) => {
            const statusClass = server.status === 'online' ? 'text-success' : 'text-danger';
            const latencyHtml = server.status === 'online' ? `<p class="card-text"><strong>Latency:</strong> ${server.latency}</p>` : '';

            const card = document.createElement("div");
            card.className = "col-lg-4 col-md-6 mb-4";
            card.innerHTML = `
                <div class="card status-card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title"><i class="fas fa-server"></i> ${server.ip}</h5>
                                <p class="card-text ${statusClass}">${server.status}</p>
                            </div>
                            <button class="btn btn-sm btn-outline-danger remove-btn" data-ip="${server.ip}" data-type="servers">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        ${latencyHtml}
                    </div>
                </div>
            `;
            serverGrid.appendChild(card);
        });
    };

    const addDevice = async (ip, type) => {
        const response = await fetch("/devices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip, type }),
        });
        if (!response.ok) {
            const error = await response.json();
            alert(`Error adding device: ${error.message}`);
        }
        refreshAll();
    };

    addPcForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (pcIpInput.value) {
            addDevice(pcIpInput.value, "pcs");
            pcIpInput.value = "";
        }
    });

    addServerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (serverIpInput.value) {
            addDevice(serverIpInput.value, "servers");
            serverIpInput.value = "";
        }
    });

    document.addEventListener('click', async (e) => {
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const { ip, type } = removeBtn.dataset;
            if (confirm(`Are you sure you want to remove ${ip}?`)) {
                const response = await fetch(`/devices/${type}/${ip}`, { method: "DELETE" });
                if (!response.ok) {
                    const error = await response.json();
                    alert(`Error removing device: ${error.message}`);
                }
                refreshAll();
            }
        }
    });

    const refreshAll = () => {
        renderServers();
        renderPcs();
    };

    // Initial load and periodic refresh
    refreshAll();
    setInterval(refreshAll, 5000);
});