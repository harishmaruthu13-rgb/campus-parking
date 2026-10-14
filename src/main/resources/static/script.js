/* ===============================
   CAMPUS PARKING SYSTEM
   Frontend connected with Spring Boot REST API & PostgreSQL / H2
================================ */

const API_BASE = '/api';

const defaultSlots = [
    { id: 1, slotNumber: "A1", status: "available", vehicleNumber: "" },
    { id: 2, slotNumber: "A2", status: "occupied", vehicleNumber: "TN55AB1234" },
    { id: 3, slotNumber: "A3", status: "available", vehicleNumber: "" },
    { id: 4, slotNumber: "A4", status: "reserved", vehicleNumber: "TN55CD4567" },
    { id: 5, slotNumber: "A5", status: "available", vehicleNumber: "" },

    { id: 6, slotNumber: "B1", status: "available", vehicleNumber: "" },
    { id: 7, slotNumber: "B2", status: "occupied", vehicleNumber: "TN55EF7890" },
    { id: 8, slotNumber: "B3", status: "available", vehicleNumber: "" },
    { id: 9, slotNumber: "B4", status: "occupied", vehicleNumber: "TN55GH1111" },
    { id: 10, slotNumber: "B5", status: "available", vehicleNumber: "" },

    { id: 11, slotNumber: "C1", status: "reserved", vehicleNumber: "TN55IJ2222" },
    { id: 12, slotNumber: "C2", status: "available", vehicleNumber: "" },
    { id: 13, slotNumber: "C3", status: "occupied", vehicleNumber: "TN55KL3333" },
    { id: 14, slotNumber: "C4", status: "available", vehicleNumber: "" },
    { id: 15, slotNumber: "C5", status: "available", vehicleNumber: "" },

    { id: 16, slotNumber: "D1", status: "available", vehicleNumber: "" },
    { id: 17, slotNumber: "D2", status: "occupied", vehicleNumber: "TN55MN4444" },
    { id: 18, slotNumber: "D3", status: "available", vehicleNumber: "" },
    { id: 19, slotNumber: "D4", status: "reserved", vehicleNumber: "TN55OP5555" },
    { id: 20, slotNumber: "D5", status: "available", vehicleNumber: "" }
];

let slots = JSON.parse(localStorage.getItem("parkingSlots")) || defaultSlots;
let registeredUsers = [];
let selectedSlot = null;
let html5QrCode = null;

/* FETCH SLOTS FROM BACKEND */
async function fetchSlots() {
    try {
        const res = await fetch(`${API_BASE}/slots`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                slots = data;
                localStorage.setItem("parkingSlots", JSON.stringify(slots));
            }
        }
    } catch (err) {
        console.warn("Backend not available, using local cache", err);
    }
    return slots;
}

/* FETCH USERS FROM BACKEND */
async function fetchUsers() {
    try {
        const res = await fetch(`${API_BASE}/users`);
        if (res.ok) {
            registeredUsers = await res.json();
        }
    } catch (e) {
        console.warn("Backend users endpoint offline, fallback default users");
        registeredUsers = [
            { username: "9925051005", role: "STUDENT", email: "student1005@campus.edu" },
            { username: "FAC001", role: "FACULTY", email: "faculty@campus.edu" },
            { username: "VIS001", role: "VISITOR", email: "visitor@campus.edu" },
            { username: "admin", role: "ADMIN", email: "admin@campus.edu" }
        ];
    }
    return registeredUsers;
}

/* SAVE LOCAL */
function saveSlots() {
    localStorage.setItem("parkingSlots", JSON.stringify(slots));
}

/* LOGIN WITH ROLE CHECK */
async function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password") ? document.getElementById("password").value.trim() : "";

    let role = "STUDENT";
    if (username.toLowerCase().includes("admin")) {
        role = "ADMIN";
    }

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.role) role = data.role;
        }
    } catch (e) {
        console.warn("Backend login offline, logging in locally");
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", username);
    localStorage.setItem("userRole", role);

    if (role === "ADMIN") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "dashboard.html";
    }
}

/* LOGOUT */
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

/* ROLE ACCESS CONTROL & NAVBAR PROFILE BADGE */
function checkAccess() {
    const path = window.location.pathname;
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const role = localStorage.getItem("userRole") || "STUDENT";
    const username = localStorage.getItem("user") || "";

    // On index.html: allow user to log in or switch accounts
    if (path.endsWith("index.html") || path === "/" || path.endsWith("/")) {
        return;
    }

    // Require login for other pages
    if (!isLoggedIn) {
        window.location.href = "index.html";
        return;
    }

    // Protect admin.html from non-ADMIN users
    if (path.includes("admin.html")) {
        if (role !== "ADMIN") {
            alert("⚠️ Access Denied! Only Admin users can access the Admin Dashboard.");
            window.location.href = "dashboard.html";
            return;
        }
    }

    // Render User Profile Badge in Navbar
    const navLinks = document.querySelector(".nav-links");
    if (navLinks && !document.getElementById("userBadge")) {
        const badge = document.createElement("div");
        badge.id = "userBadge";
        badge.className = `user-badge ${role === 'ADMIN' ? 'admin-badge' : 'student-badge'}`;
        badge.innerHTML = role === 'ADMIN' ? `👑 Admin (${username})` : `🧑‍🎓 Student (${username})`;
        navLinks.insertBefore(badge, navLinks.querySelector(".logout-btn"));
    }

    // Hide Admin navbar link for non-ADMIN users
    const links = document.querySelectorAll(".nav-links a");
    links.forEach(link => {
        if (link.getAttribute("href") === "admin.html" && role !== "ADMIN") {
            link.style.display = "none";
        }
    });

    // Hide Admin action card on dashboard for non-ADMIN users
    const adminCard = document.querySelector(".action-card[href='admin.html']");
    if (adminCard && role !== "ADMIN") {
        adminCard.style.display = "none";
    }
}

/* GET STATS */
function getStats() {
    return {
        total: slots.length,
        available: slots.filter(s => s.status === "available").length,
        occupied: slots.filter(s => s.status === "occupied").length,
        reserved: slots.filter(s => s.status === "reserved").length
    };
}

/* UPDATE DASHBOARD */
async function updateDashboard() {
    await fetchSlots();
    const stats = getStats();

    const total = document.getElementById("totalSlots");
    const available = document.getElementById("availableSlots");
    const occupied = document.getElementById("occupiedSlots");

    if (total) total.textContent = stats.total;
    if (available) available.textContent = stats.available;
    if (occupied) occupied.textContent = stats.occupied;
}

/* RENDER PARKING GRID */
async function renderParking() {
    await fetchSlots();
    const grid = document.getElementById("parkingGrid");
    const liveAvailable = document.getElementById("liveAvailable");

    if (!grid) return;

    grid.innerHTML = "";
    let availableCount = 0;

    slots.forEach(slot => {
        if (slot.status === "available") availableCount++;

        const card = document.createElement("div");
        card.className = `slot-card ${slot.status}`;

        let icon = "🅿️";
        if (slot.status === "occupied") icon = "🚘";
        if (slot.status === "reserved") icon = "🔒";

        const slotNum = slot.slotNumber || slot.id;

        let categoryTag = "";
        if (slot.status !== "available") {
            let cat = "STUDENT";
            if (slot.vehicleNumber && (slot.vehicleNumber.startsWith("FAC") || slot.vehicleNumber.includes("FACULTY"))) {
                cat = "FACULTY";
            } else if (slot.vehicleNumber && (slot.vehicleNumber.startsWith("VIS") || slot.vehicleNumber.includes("VISITOR"))) {
                cat = "VISITOR";
            }
            categoryTag = `<div style="font-size:10px; font-weight:800; text-transform:uppercase; margin-top:4px; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.25); display:inline-block; letter-spacing:0.5px;">${cat}</div>`;
        }

        card.innerHTML = `
            <div class="slot-name">${slotNum}</div>
            <div class="slot-icon">${icon}</div>
            <div class="slot-status">${slot.status.toUpperCase()}</div>
            ${slot.vehicleNumber ? `<div class="slot-vehicle">${slot.vehicleNumber}</div>` : ""}
            ${categoryTag}
        `;

        if (slot.status === "available") {
            card.onclick = () => openBookingModal(slotNum);
        }

        grid.appendChild(card);
    });

    if (liveAvailable) {
        liveAvailable.textContent = availableCount;
    }
}

/* MODAL CONTROL */
function openBookingModal(slotId) {
    selectedSlot = slotId;
    const modal = document.getElementById("bookingModal");
    const slotText = document.getElementById("selectedSlot");
    if (modal && slotText) {
        slotText.textContent = slotId;
        modal.style.display = "flex";
    }
}

function closeModal() {
    const modal = document.getElementById("bookingModal");
    if (modal) modal.style.display = "none";
}

/* CONFIRM SLOT FROM MODAL */
async function confirmSlot() {
    if (!selectedSlot) return;

    try {
        await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slotNumber: selectedSlot,
                username: localStorage.getItem("user") || "9925051005",
                userType: "Student",
                vehicleNumber: "TN 55 TEMP"
            })
        });
    } catch (e) {
        console.warn("Backend booking offline, saving locally");
    }

    const slotObj = slots.find(s => (s.slotNumber || s.id) === selectedSlot);
    if (slotObj) {
        slotObj.status = "reserved";
        saveSlots();
    }

    closeModal();
    showToast(`Slot ${selectedSlot} reserved successfully! 🚗`);
    renderParking();
}

/* POPULATE BOOKING SELECT (SLOTS & LOGGED-IN ACCOUNT) */
async function populateSlotDropdown() {
    await fetchSlots();

    const loggedUser = localStorage.getItem("user") || "9925051005";
    const loggedRole = localStorage.getItem("userRole") || "STUDENT";

    const nameElem = document.getElementById("bookingUserName");
    const roleElem = document.getElementById("bookingUserRole");
    if (nameElem) nameElem.textContent = loggedUser;
    if (roleElem) {
        roleElem.textContent = loggedRole;
        roleElem.className = `badge ${loggedRole === 'ADMIN' ? 'reserved' : loggedRole === 'FACULTY' ? 'occupied' : 'available'}`;
    }

    const userTypeSelect = document.getElementById("userType");
    if (userTypeSelect) {
        if (loggedRole === "FACULTY") userTypeSelect.value = "Faculty";
        else if (loggedRole === "VISITOR") userTypeSelect.value = "Visitor";
        else userTypeSelect.value = "Student";
    }

    const select = document.getElementById("slotSelect");
    if (select) {
        select.innerHTML = `<option value="">-- Choose Slot --</option>`;
        const availableSlots = slots.filter(s => s.status === "available");

        if (availableSlots.length === 0) {
            select.innerHTML = `<option value="">No slots available</option>`;
        } else {
            availableSlots.forEach(s => {
                const slotNum = s.slotNumber || s.id;
                const opt = document.createElement("option");
                opt.value = slotNum;
                opt.textContent = `Slot ${slotNum}`;
                select.appendChild(opt);
            });
        }
    }
}

/* BOOK FROM PAGE */
async function bookFromPage() {
    const selectedUser = document.getElementById("userSelect") ? document.getElementById("userSelect").value : localStorage.getItem("user");
    const userType = document.getElementById("userType").value;
    const vehicle = document.getElementById("vehicleNumber").value;
    const slotId = document.getElementById("slotSelect").value;

    if (!vehicle) {
        showToast("Please enter vehicle number ⚠️");
        return;
    }
    if (!slotId) {
        showToast("Please select a slot ⚠️");
        return;
    }

    const username = selectedUser || localStorage.getItem("user") || "9925051005";

    try {
        await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slotNumber: slotId,
                username: username,
                userType: userType,
                vehicleNumber: vehicle
            })
        });
    } catch (e) {
        console.warn("Backend booking offline, updating locally");
    }

    const slotObj = slots.find(s => (s.slotNumber || s.id) === slotId);
    if (slotObj) {
        slotObj.status = "reserved";
        slotObj.vehicleNumber = vehicle;
        saveSlots();
    }

    const modal = document.getElementById("confirmationModal");
    const text = document.getElementById("confirmationText");

    if (modal && text) {
        text.innerHTML = `Slot <strong>${slotId}</strong> booked for Student/Member <strong>${username}</strong> (${userType}) - Vehicle: <strong>${vehicle}</strong>.`;
        modal.style.display = "flex";
    }
}

function closeConfirmation() {
    const modal = document.getElementById("confirmationModal");
    if (modal) modal.style.display = "none";
    window.location.href = "parking.html";
}

/* PLAY SCANNER BEEP SOUND */
function playBeepSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
}

let isLoginScan = false;

/* REAL CAMERA BARCODE & QR SCANNER */
function startCameraScan() {
    isLoginScan = false;
    openCameraModal();
}

function startLoginBarcodeScan() {
    isLoginScan = true;
    openCameraModal();
}

function openCameraModal() {
    const modal = document.getElementById("cameraModal");
    if (modal) modal.style.display = "flex";

    if (typeof Html5Qrcode !== "undefined") {
        html5QrCode = new Html5Qrcode("qrReader");
        const config = { fps: 15, qrbox: { width: 280, height: 180 } };

        html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                playBeepSound();
                stopCameraScan();
                if (isLoginScan || document.getElementById("username")) {
                    handleLoginScannedRegNo(decodedText);
                } else {
                    handleScannedRegNo(decodedText);
                }
            },
            () => {}
        ).catch(err => {
            console.warn("Camera permission or stream failed, fallback to manual barcode scan", err);
            document.getElementById("qrReader").innerHTML = `
                <div style="padding: 40px 20px; color: #94a3b8;">
                    <p style="font-size: 35px;">📷</p>
                    <p style="font-size: 14px; margin-top: 10px;">Camera access denied or unavailable.</p>
                    <p style="font-size: 12px; color: #64748b;">Use manual Barcode Reg No entry below (e.g. 9925051005).</p>
                </div>
            `;
        });
    } else {
        document.getElementById("qrReader").innerHTML = `
            <div style="padding: 40px 20px; color: #94a3b8;">
                <p style="font-size: 35px;">📷</p>
                <p style="font-size: 14px;">Barcode scanner loading...</p>
            </div>
        `;
    }
}

function stopCameraScan() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.error(err));
    }
    const modal = document.getElementById("cameraModal");
    if (modal) modal.style.display = "none";
}

function processManualScan() {
    const input = document.getElementById("manualRegNo");
    if (!input || !input.value.trim()) {
        showToast("Please enter Student Barcode Reg No ⚠️");
        return;
    }
    const val = input.value.trim();
    stopCameraScan();
    if (isLoginScan || document.getElementById("username")) {
        handleLoginScannedRegNo(val);
    } else {
        handleScannedRegNo(val);
    }
}

/* HANDLE BARCODE SCAN LOGIN FOR STUDENTS */
async function handleLoginScannedRegNo(regNo) {
    playBeepSound();
    let role = "STUDENT";

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: regNo, password: regNo })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.role) role = data.role;
        }
    } catch (e) {
        console.warn("Backend login offline, auto-logging student locally");
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", regNo);
    localStorage.setItem("userRole", role);

    showToast(`✅ Barcode Scanned! Registered & Logged in as ${regNo} 🎓`);
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1000);
}

/* VISITOR QUICK LOGIN FUNCTION */
function loginAsVisitor() {
    const name = prompt("Enter Visitor / Guest Name (Optional):", "Visitor Guest");
    if (name === null) return;
    const visitorId = "VIS-" + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("user", `${visitorId} (${name || "Guest"})`);
    localStorage.setItem("userRole", "VISITOR");

    showToast(`🚗 Welcome Visitor! Logged in as ${visitorId}`);
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 800);
}

/* PROCESS SCANNED STUDENT BARCODE REG NO (GATE ALLOCATION) */
async function handleScannedRegNo(regNo) {
    playBeepSound();

    try {
        const res = await fetch(`${API_BASE}/admin/simulate-entry`, { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            const slotNum = data.slot ? (data.slot.slotNumber || data.slot.id) : "Slot";
            showToast(`✅ Student Barcode (${regNo}) Scanned! ${slotNum} Allocated 🚗`);
            updateDashboard();
            return;
        }
    } catch (e) {
        console.warn("Backend offline, updating local slot");
    }

    const avail = slots.filter(s => s.status === "available");
    if (avail.length === 0) {
        showToast(`❌ Student Barcode: ${regNo} - Parking Full! No slots free.`);
        return;
    }

    const randomSlot = avail[0];
    randomSlot.status = "occupied";
    randomSlot.vehicleNumber = regNo;
    saveSlots();

    showToast(`✅ Student Barcode: ${regNo} Scanned! Slot ${randomSlot.slotNumber || randomSlot.id} Allocated 🚗`);
    updateDashboard();
}

/* ADMIN ADD NEW USER FUNCTION */
async function addUserByAdmin(event) {
    event.preventDefault();

    const username = document.getElementById("newUsername").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const role = document.getElementById("newRole").value;
    const password = document.getElementById("newPassword").value.trim() || username;

    if (!username) {
        showToast("Username / Student Barcode Reg No is required ⚠️");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                role: role,
                password: password
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            showToast(errData.message || "Failed to register user ⚠️");
            return;
        }

        showToast(`🎉 User ${username} registered successfully as ${role}!`);
    } catch (e) {
        console.warn("Backend user registration offline, adding locally");
        registeredUsers.push({ username, email, role, password });
        showToast(`🎉 User ${username} registered locally as ${role}!`);
    }

    document.getElementById("newUsername").value = "";
    document.getElementById("newEmail").value = "";
    document.getElementById("newPassword").value = "";

    await renderUsersTable();
}

/* ADMIN DELETE USER FUNCTION */
async function deleteUserByAdmin(id, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            showToast(`User ${username} deleted successfully! 🗑️`);
        } else {
            showToast("Failed to delete user ⚠️");
        }
    } catch (e) {
        console.warn("Backend offline, deleting user locally");
        registeredUsers = registeredUsers.filter(u => u.id !== id && u.username !== username);
        showToast(`User ${username} deleted locally! 🗑️`);
    }

    await renderUsersTable();
}

/* RENDER USERS TABLE IN ADMIN */
async function renderUsersTable() {
    await fetchUsers();
    const table = document.getElementById("userListTable");
    if (!table) return;

    table.innerHTML = "";
    registeredUsers.forEach(u => {
        const tr = document.createElement("tr");
        let badgeClass = "available";
        if (u.role === "ADMIN") badgeClass = "reserved";
        if (u.role === "FACULTY") badgeClass = "occupied";

        const isSuperAdmin = u.username && u.username.toLowerCase() === "admin";
        const deleteAction = isSuperAdmin 
            ? `<span style="color:#94a3b8; font-size:12px; font-weight:700;">System Admin</span>`
            : `<button class="btn-danger-sm" onclick="deleteUserByAdmin(${u.id || 0}, '${u.username}')">🗑️ Delete</button>`;

        tr.innerHTML = `
            <td><strong>${u.username}</strong></td>
            <td><span class="badge ${badgeClass}">${u.role || 'STUDENT'}</span></td>
            <td>${u.email || "-"}</td>
            <td>${deleteAction}</td>
        `;
        table.appendChild(tr);
    });
}

/* ADMIN CHANGE SLOT STATUS DIRECTLY */
async function changeSlotStatusByAdmin(slotNumber, newStatus) {
    let vehicle = "";
    if (newStatus === "occupied") {
        vehicle = prompt(`Enter vehicle number for slot ${slotNumber}:`, "TN55ADMIN12");
        if (vehicle === null) return;
    }

    try {
        await fetch(`${API_BASE}/slots/${slotNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: newStatus,
                vehicleNumber: vehicle
            })
        });
    } catch (e) {
        console.warn("Backend offline, updating local state");
    }

    const target = slots.find(s => (s.slotNumber || s.id) === slotNumber);
    if (target) {
        target.status = newStatus;
        target.vehicleNumber = vehicle;
        saveSlots();
    }

    showToast(`Slot ${slotNumber} status updated to ${newStatus.toUpperCase()}! 🔧`);
    renderAdmin();
}

/* ADMIN DASHBOARD */
async function renderAdmin() {
    await fetchSlots();
    await renderUsersTable();
    const stats = getStats();

    const total = document.getElementById("adminTotal");
    const available = document.getElementById("adminAvailable");
    const occupied = document.getElementById("adminOccupied");
    const reserved = document.getElementById("adminReserved");

    if (total) total.textContent = stats.total;
    if (available) available.textContent = stats.available;
    if (occupied) occupied.textContent = stats.occupied;
    if (reserved) reserved.textContent = stats.reserved;

    const percent = Math.round(((stats.occupied + stats.reserved) / stats.total) * 100);
    const progress = document.getElementById("occupancyProgress");
    const percentText = document.getElementById("occupancyPercent");

    if (progress) progress.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;

    const table = document.getElementById("adminTable");
    if (!table) return;

    table.innerHTML = "";
    slots.forEach(s => {
        const tr = document.createElement("tr");
        const slotNum = s.slotNumber || s.id;
        tr.innerHTML = `
            <td><strong>${slotNum}</strong></td>
            <td><span class="badge ${s.status}">${s.status.toUpperCase()}</span></td>
            <td>${s.vehicleNumber || "-"}</td>
            <td>
                <select class="admin-select" onchange="changeSlotStatusByAdmin('${slotNum}', this.value)">
                    <option value="">-- Change Status --</option>
                    <option value="available" ${s.status === 'available' ? 'disabled' : ''}>Free Slot (Available)</option>
                    <option value="occupied" ${s.status === 'occupied' ? 'disabled' : ''}>Mark Occupied</option>
                    <option value="reserved" ${s.status === 'reserved' ? 'disabled' : ''}>Mark Reserved</option>
                </select>
            </td>
        `;
        table.appendChild(tr);
    });
}

/* RESET DEMO */
async function resetParking() {
    try {
        await fetch(`${API_BASE}/admin/reset`, { method: 'POST' });
    } catch (e) {
        console.warn("Backend reset offline, resetting locally");
    }

    localStorage.removeItem("parkingSlots");
    slots = defaultSlots;
    saveSlots();

    showToast("Parking slots reset to default! 🔄");
    if (document.getElementById("adminTable")) renderAdmin();
}

/* TOAST UTILITY */
function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.className = "toast show";
    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}

/* PAGE LOAD CONTROLLER & SECURITY CHECK */
document.addEventListener("DOMContentLoaded", () => {
    checkAccess();

    const path = window.location.pathname;

    if (path.includes("dashboard.html")) {
        updateDashboard();
    } else if (path.includes("parking.html")) {
        renderParking();
    } else if (path.includes("booking.html")) {
        populateSlotDropdown();
    } else if (path.includes("admin.html")) {
        renderAdmin();
    }
});
