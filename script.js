/* ===============================
   CAMPUS PARKING SYSTEM
   Frontend Demo
================================ */

const TOTAL_SLOTS = 20;

const defaultSlots = [
    { id: "A1", status: "available", vehicle: "" },
    { id: "A2", status: "occupied", vehicle: "TN55AB1234" },
    { id: "A3", status: "available", vehicle: "" },
    { id: "A4", status: "reserved", vehicle: "TN55CD4567" },
    { id: "A5", status: "available", vehicle: "" },

    { id: "B1", status: "available", vehicle: "" },
    { id: "B2", status: "occupied", vehicle: "TN55EF7890" },
    { id: "B3", status: "available", vehicle: "" },
    { id: "B4", status: "occupied", vehicle: "TN55GH1111" },
    { id: "B5", status: "available", vehicle: "" },

    { id: "C1", status: "reserved", vehicle: "TN55IJ2222" },
    { id: "C2", status: "available", vehicle: "" },
    { id: "C3", status: "occupied", vehicle: "TN55KL3333" },
    { id: "C4", status: "available", vehicle: "" },
    { id: "C5", status: "available", vehicle: "" },

    { id: "D1", status: "available", vehicle: "" },
    { id: "D2", status: "occupied", vehicle: "TN55MN4444" },
    { id: "D3", status: "available", vehicle: "" },
    { id: "D4", status: "reserved", vehicle: "TN55OP5555" },
    { id: "D5", status: "available", vehicle: "" }
];

let slots =
    JSON.parse(localStorage.getItem("parkingSlots")) ||
    defaultSlots;

let selectedSlot = null;

/* SAVE */

function saveSlots() {
    localStorage.setItem(
        "parkingSlots",
        JSON.stringify(slots)
    );
}

/* LOGIN */

function login(event) {
    event.preventDefault();

    const username =
        document.getElementById("username").value;

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", username);

    window.location.href = "dashboard.html";
}

/* LOGOUT */

function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}

/* STATISTICS */

function getStats() {

    return {
        total: slots.length,

        available:
            slots.filter(s => s.status === "available").length,

        occupied:
            slots.filter(s => s.status === "occupied").length,

        reserved:
            slots.filter(s => s.status === "reserved").length
    };
}

/* UPDATE DASHBOARD */

function updateDashboard() {

    const stats = getStats();

    const total = document.getElementById("totalSlots");
    const available =
        document.getElementById("availableSlots");
    const occupied =
        document.getElementById("occupiedSlots");

    if (total) total.textContent = stats.total;
    if (available) available.textContent = stats.available;
    if (occupied) occupied.textContent = stats.occupied;
}

/* PARKING GRID */

function renderParking() {

    const grid =
        document.getElementById("parkingGrid");

    if (!grid) return;

    grid.innerHTML = "";

    slots.forEach(slot => {

        const div =
            document.createElement("div");

        div.className =
            `parking-slot ${slot.status}`;

        let icon = "";

        if (slot.status === "occupied") {
            icon = `<div class="slot-car">🚘</div>`;
        }

        if (slot.status === "reserved") {
            icon = `<div class="slot-car">📌</div>`;
        }

        if (slot.status === "available") {
            icon = `<div class="slot-car">🅿️</div>`;
        }

        div.innerHTML = `
            ${icon}
            <span>${slot.id}</span>
        `;

        if (slot.status === "available") {
            div.onclick = () =>
                openBookingModal(slot.id);
        }

        grid.appendChild(div);
    });

    const counter =
        document.getElementById("liveAvailable");

    if (counter) {
        counter.textContent = getStats().available;
    }
}

/* OPEN MODAL */

function openBookingModal(slotId) {

    selectedSlot = slotId;

    const selected =
        document.getElementById("selectedSlot");

    if (selected) {
        selected.textContent = slotId;
    }

    document
        .getElementById("bookingModal")
        .classList.add("show");
}

/* CLOSE MODAL */

function closeModal() {

    const modal =
        document.getElementById("bookingModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

/* CONFIRM SLOT */

function confirmSlot() {

    const slot =
        slots.find(s => s.id === selectedSlot);

    if (!slot) return;

    slot.status = "reserved";

    slot.vehicle = "DEMO-USER";

    saveSlots();

    closeModal();

    renderParking();

    updateDashboard();

    showToast(
        `Slot ${selectedSlot} reserved successfully!`
    );
}

/* BOOKING PAGE */

function loadBookingSlots() {

    const select =
        document.getElementById("slotSelect");

    if (!select) return;

    const available =
        slots.filter(
            s => s.status === "available"
        );

    select.innerHTML =
        `<option value="">Choose a slot</option>`;

    available.forEach(slot => {

        const option =
            document.createElement("option");

        option.value = slot.id;
        option.textContent = slot.id;

        select.appendChild(option);
    });
}

/* BOOK FROM BOOKING PAGE */

function bookFromPage() {

    const slotId =
        document.getElementById("slotSelect").value;

    const vehicle =
        document.getElementById("vehicleNumber").value;

    if (!slotId) {
        showToast("Please select a parking slot.");
        return;
    }

    if (!vehicle) {
        showToast("Please enter vehicle number.");
        return;
    }

    const slot =
        slots.find(s => s.id === slotId);

    if (!slot || slot.status !== "available") {
        showToast("Slot is no longer available.");
        loadBookingSlots();
        return;
    }

    slot.status = "reserved";
    slot.vehicle = vehicle.toUpperCase();

    saveSlots();

    document.getElementById(
        "confirmationText"
    ).innerHTML =
        `Slot <strong>${slotId}</strong> has been reserved
         for vehicle <strong>${vehicle.toUpperCase()}</strong>.`;

    document
        .getElementById("confirmationModal")
        .classList.add("show");

    loadBookingSlots();
}

/* CLOSE CONFIRMATION */

function closeConfirmation() {

    document
        .getElementById("confirmationModal")
        .classList.remove("show");
}

/* ADMIN DASHBOARD */

function loadAdmin() {

    const stats = getStats();

    const total =
        document.getElementById("adminTotal");

    if (!total) return;

    document.getElementById("adminTotal")
        .textContent = stats.total;

    document.getElementById("adminAvailable")
        .textContent = stats.available;

    document.getElementById("adminOccupied")
        .textContent = stats.occupied;

    document.getElementById("adminReserved")
        .textContent = stats.reserved;

    const used =
        stats.occupied + stats.reserved;

    const percentage =
        Math.round((used / stats.total) * 100);

    document.getElementById(
        "occupancyPercent"
    ).textContent = `${percentage}%`;

    document.getElementById(
        "occupancyProgress"
    ).style.width = `${percentage}%`;

    renderAdminTable();
}

/* ADMIN TABLE */

function renderAdminTable() {

    const table =
        document.getElementById("adminTable");

    if (!table) return;

    table.innerHTML = "";

    slots.forEach(slot => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td><strong>${slot.id}</strong></td>

            <td>
                <span class="status ${slot.status}">
                    ${slot.status.toUpperCase()}
                </span>
            </td>

            <td>${slot.vehicle || "—"}</td>
        `;

        table.appendChild(row);
    });
}

/* RESET */

function resetParking() {

    slots =
        JSON.parse(JSON.stringify(defaultSlots));

    saveSlots();

    loadAdmin();

    updateDashboard();

    renderParking();

    loadBookingSlots();

    showToast("Parking demo has been reset.");
}

/* QR ENTRY */

function simulateEntry() {

    const entries =
        Number(
            localStorage.getItem("entries") || 12
        );

    localStorage.setItem(
        "entries",
        entries + 1
    );

    showToast(
        "QR verified ✓ Vehicle entry recorded!"
    );

    const entryElement =
        document.getElementById("entries");

    if (entryElement) {
        entryElement.textContent =
            entries + 1;
    }
}

/* TOAST */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* PAGE INITIALIZATION */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateDashboard();

        renderParking();

        loadBookingSlots();

        loadAdmin();

        const entries =
            localStorage.getItem("entries");

        const entryElement =
            document.getElementById("entries");

        if (entries && entryElement) {
            entryElement.textContent = entries;
        }

        const bookings =
            slots.filter(
                s => s.status === "reserved"
            ).length;

        const bookingElement =
            document.getElementById("bookings");

        if (bookingElement) {
            bookingElement.textContent =
                bookings;
        }
    }
);
