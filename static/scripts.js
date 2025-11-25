document.addEventListener("DOMContentLoaded", () => {
    const addServerForm = document.getElementById("add-server-form");
    const serverIpInput = document.getElementById("server-ip");
    const deviceTypeInput = document.getElementById("device-type");
    const serverList = document.getElementById("server-list");
    const refreshBtn = document.getElementById("refresh-btn");
    const pcStatusModal = new bootstrap.Modal(document.getElementById('pcStatusModal'));
    const pcStatusModalBody = document.getElementById("pc-status-modal-body");

    // Function to fetch and display server statuses
    async function fetchServerStatuses() {
        try {
            const response = await fetch("/status");
            const statuses = await response.json();

            serverList.innerHTML = ""; // Clear existing list

            statuses.forEach(server => {
                const row = document.createElement("tr");
                const latencyValue = parseFloat(server.latency);
                let latencyClass = "";
                if (server.status === "online") {
                    if (latencyValue < 100) {
                        latencyClass = "latency-low";
                    } else if (latencyValue < 500) {
                        latencyClass = "latency-medium";
                    } else {
                        latencyClass = "latency-high";
                    }
                }

                let actions = `
                    <button class="btn btn-danger btn-sm remove-btn" data-ip="${server.ip}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                `;

                if (server.type === 'pc') {
                    actions += `
                        <button class="btn btn-info btn-sm details-btn" data-ip="${server.ip}">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    `;
                }

                row.innerHTML = `
                    <td>${server.ip}</td>
                    <td>${server.type}</td>
                    <td><span class="status-${server.status}">${server.status}</span></td>
                    <td class="${latencyClass}">${server.latency}</td>
                    <td>${actions}</td>
                `;
                serverList.appendChild(row);
            });

            // Add event listeners to remove buttons
            document.querySelectorAll(".remove-btn").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const ip = e.target.closest("button").dataset.ip;
                    if (ip && confirm(`Are you sure you want to remove ${ip}?`)) {
                        try {
                            await fetch(`/servers/${ip}`, { method: "DELETE" });
                            fetchServerStatuses(); // Refresh the list
                        } catch (error) {
                            console.error("Error removing server:", error);
                        }
                    }
                });
            });

            // Add event listeners to details buttons
            document.querySelectorAll(".details-btn").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const ip = e.target.closest("button").dataset.ip;
                    pcStatusModalBody.innerHTML = "Loading...";
                    pcStatusModal.show();

                    const response = await fetch(`/pc-status/${ip}`);
                    const status = await response.json();

                    if (response.ok) {
                        pcStatusModalBody.innerHTML = `
                            <strong>IP:</strong> ${status.ip} <br>
                            <strong>CPU Usage:</strong> ${status.cpu_usage} <br>
                            <strong>RAM Usage:</strong> ${status.ram_usage} <br>
                            <strong>Disk Space:</strong> ${status.disk_space}
                        `;
                    } else {
                        pcStatusModalBody.innerHTML = `<div class="alert alert-danger">${status.error}</div>`;
                    }
                });
            });

        } catch (error) {
            console.error("Error fetching server statuses:", error);
        }
    }

    // Function to add a new server
    addServerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const ip = serverIpInput.value.trim();
        const type = deviceTypeInput.value;
        if (ip) {
            try {
                await fetch("/servers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ ip, type })
                });
                serverIpInput.value = "";
                fetchServerStatuses(); // Refresh the list
            } catch (error) {
                console.error("Error adding server:", error);
            }
        }
    });

    // Refresh button event listener
    refreshBtn.addEventListener("click", fetchServerStatuses);

    // Fetch statuses on page load and then every 5 seconds
    fetchServerStatuses();
    setInterval(fetchServerStatuses, 5000);
});
