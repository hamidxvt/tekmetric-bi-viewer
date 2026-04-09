/* =====================================================================
   Tekmetric BI Viewer — Client Application
   ===================================================================== */

(function () {
  "use strict";

  // -- helpers ---------------------------------------------------------------

  const $ = (id) => document.getElementById(id);
  const shopSel = () => $("shopSelect").value;
  const BASE = (window.API_BASE || "").replace(/\/+$/, "");

  function cents(v) {
    return v != null ? "$" + (v / 100).toFixed(2) : "\u2014";
  }
  function d(v) {
    if (!v) return "\u2014";
    return new Date(v).toLocaleDateString();
  }
  function dt(v) {
    if (!v) return "\u2014";
    const x = new Date(v);
    return (
      x.toLocaleDateString() +
      " " +
      x.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
  function esc(s) {
    return s ? String(s).replace(/</g, "&lt;") : "\u2014";
  }
  function errHtml(e) {
    return '<div class="error-msg">' + esc(e.message || e) + "</div>";
  }

  async function api(url) {
    $("statusText").textContent = "Loading\u2026";
    try {
      const r = await fetch(BASE + url);
      if (!r.ok) {
        let msg;
        try { msg = await r.text(); } catch (_) { msg = r.statusText; }
        throw new Error(msg);
      }
      const d = await r.json();
      $("statusText").textContent = "Ready";
      return d;
    } catch (e) {
      $("statusText").textContent = "Error";
      throw e;
    }
  }

  function paginate(containerId, page, totalPages, loaderName) {
    const c = $(containerId);
    if (!c) return;
    c.innerHTML =
      '<button ' + (page <= 0 ? "disabled" : "") + " onclick=\"" + loaderName + "(" + (page - 1) + ')\">Prev</button>' +
      '<span class="pg-info">Page ' + (page + 1) + " of " + (totalPages || 1) + "</span>" +
      '<button ' + (page >= totalPages - 1 ? "disabled" : "") + " onclick=\"" + loaderName + "(" + (page + 1) + ')\">Next</button>';
  }

  // -- modal -----------------------------------------------------------------

  function showDetail(title, obj) {
    $("modalTitle").textContent = title;
    $("modalBody").textContent = JSON.stringify(obj, null, 2);
    $("detailModal").classList.add("show");
  }
  function closeModal() {
    $("detailModal").classList.remove("show");
  }
  $("detailModal").addEventListener("click", function (e) {
    if (e.target === e.currentTarget) closeModal();
  });
  window.closeModal = closeModal;

  // -- mobile sidebar --------------------------------------------------------

  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".sidebar-overlay");
  const burger = document.querySelector(".hamburger");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
  if (burger) burger.addEventListener("click", openSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  // -- navigation ------------------------------------------------------------

  function showPage(id) {
    document.querySelectorAll(".page").forEach(function (p) {
      p.classList.remove("active");
    });
    var el = $("page-" + id);
    if (el) el.classList.add("active");

    document.querySelectorAll(".sidebar nav a").forEach(function (a) {
      a.classList.remove("active");
    });
    var link = document.querySelector('[data-page="' + id + '"]');
    if (link) link.classList.add("active");

    closeSidebar();

    var loaders = {
      dashboard: loadDashboard,
      customers: loadCustomers,
      vehicles: loadVehicles,
      "repair-orders": loadRepairOrders,
      jobs: loadJobs,
      "canned-jobs": loadCannedJobs,
      appointments: loadAppointments,
      calendar: initCalendar,
      employees: loadEmployees,
      inventory: loadInventory,
      shops: loadShopCards,
    };
    if (loaders[id]) loaders[id]();
  }
  window.showPage = showPage;

  window.onShopChange = function () {
    var active = document.querySelector(".page.active");
    if (active) showPage(active.id.replace("page-", ""));
  };

  // -- view helpers ----------------------------------------------------------

  async function viewRO(id) { try { showDetail("Repair Order #" + id, await api("/api/repair-orders/" + id)); } catch (e) { showDetail("Error", { error: e.message }); } }
  async function viewAppt(id) { try { showDetail("Appointment #" + id, await api("/api/appointments/" + id)); } catch (e) { showDetail("Error", { error: e.message }); } }
  async function viewCust(id) { try { showDetail("Customer #" + id, await api("/api/customers/" + id)); } catch (e) { showDetail("Error", { error: e.message }); } }
  async function viewVeh(id) { try { showDetail("Vehicle #" + id, await api("/api/vehicles/" + id)); } catch (e) { showDetail("Error", { error: e.message }); } }
  async function viewJob(id) { try { showDetail("Job #" + id, await api("/api/jobs/" + id)); } catch (e) { showDetail("Error", { error: e.message }); } }
  async function viewEmp(id) { try { showDetail("Employee #" + id, await api("/api/employees/" + id)); } catch (e) { showDetail("Error", { error: e.message }); } }
  async function viewShopDetail(id) { try { showDetail("Shop #" + id, await api("/api/shops/" + id)); } catch (e) { showDetail("Error", { error: e.message }); } }
  window.viewRO = viewRO; window.viewAppt = viewAppt; window.viewCust = viewCust;
  window.viewVeh = viewVeh; window.viewJob = viewJob; window.viewEmp = viewEmp;
  window.viewShopDetail = viewShopDetail;

  // -- dashboard -------------------------------------------------------------

  async function loadDashboard() {
    var sid = shopSel();
    try {
      var results = await Promise.allSettled([
        api("/api/customers?shop_id=" + sid + "&size=1"),
        api("/api/vehicles?shop_id=" + sid + "&size=1"),
        api("/api/repair-orders?shop_id=" + sid + "&size=5&sortDirection=DESC"),
        api("/api/jobs?shop_id=" + sid + "&size=1"),
        api("/api/appointments?shop_id=" + sid + "&size=5&sortDirection=DESC"),
        api("/api/employees?shop_id=" + sid + "&size=1"),
      ]);

      function val(i) {
        var r = results[i];
        return r.status === "fulfilled" ? r.value : null;
      }

      $("dCust").textContent = val(0)?.totalElements ?? "\u2014";
      $("dVeh").textContent = val(1)?.totalElements ?? "\u2014";
      $("dRO").textContent = val(2)?.totalElements ?? "\u2014";
      $("dJobs").textContent = val(3)?.totalElements ?? "\u2014";
      $("dAppt").textContent = val(4)?.totalElements ?? "\u2014";
      $("dEmp").textContent = val(5)?.totalElements ?? "\u2014";

      var ros = val(2)?.content || [];
      var roH = "<table><tr><th>RO #</th><th>Status</th><th>Customer</th><th>Created</th><th>Total</th><th></th></tr>";
      ros.forEach(function (r) {
        var st = r.repairOrderStatus?.name || "\u2014";
        var cls = st.includes("Progress") ? "badge-orange" : st.includes("Complete") || st.includes("Posted") ? "badge-green" : "badge-gray";
        roH += "<tr><td>" + r.repairOrderNumber + '</td><td><span class="badge ' + cls + '">' + st + "</span></td><td>" + (r.customerId || "\u2014") + "</td><td>" + d(r.createdDate) + "</td><td>" + cents(r.totalSales) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewRO(' + r.id + ')">View</button></td></tr>';
      });
      roH += "</table>";
      $("dashROTable").innerHTML = ros.length ? roH : '<p style="color:var(--muted)">No repair orders found.</p>';

      var appts = val(4)?.content || [];
      var aH = "<table><tr><th>ID</th><th>Start</th><th>End</th><th>Status</th><th>Description</th><th></th></tr>";
      appts.forEach(function (a) {
        var acls = a.appointmentStatus === "ARRIVED" ? "badge-green" : a.appointmentStatus === "CANCELED" ? "badge-red" : "badge-blue";
        aH += "<tr><td>" + a.id + "</td><td>" + dt(a.startTime) + "</td><td>" + dt(a.endTime) + '</td><td><span class="badge ' + acls + '">' + (a.appointmentStatus || "NONE") + "</span></td><td>" + esc(a.description?.substring(0, 50)) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewAppt(' + a.id + ')">View</button></td></tr>';
      });
      aH += "</table>";
      $("dashApptTable").innerHTML = appts.length ? aH : '<p style="color:var(--muted)">No appointments found.</p>';
    } catch (e) {
      $("dashROTable").innerHTML = errHtml(e);
    }
  }
  window.loadDashboard = loadDashboard;

  // -- customers -------------------------------------------------------------

  async function loadCustomers(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), search = $("custSearch").value, ctype = $("custType").value, size = $("custSize").value;
    var el = $("custTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/customers?shop_id=" + sid + "&size=" + size + "&page=" + pg;
      if (search) u += "&search=" + encodeURIComponent(search);
      if (ctype) u += "&customerTypeId=" + ctype;
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Created</th><th></th></tr>";
      rows.forEach(function (c) {
        var ph = Array.isArray(c.phone) ? c.phone.map(function (p) { return p.number; }).join(", ") : c.phone || "\u2014";
        h += "<tr><td>" + c.id + "</td><td>" + esc(c.firstName) + " " + esc(c.lastName) + "</td><td>" + esc(c.email) + "</td><td>" + esc(ph) + "</td><td>" + (c.customerType?.name || "\u2014") + "</td><td>" + d(c.createdDate) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewCust(' + c.id + ')">View</button></td></tr>';
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No customers found.</p>';
      paginate("custPag", pg, data.totalPages, "loadCustomers");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadCustomers = loadCustomers;

  // -- vehicles --------------------------------------------------------------

  async function loadVehicles(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), search = $("vehSearch").value, custId = $("vehCustId").value, size = $("vehSize").value;
    var el = $("vehTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/vehicles?shop_id=" + sid + "&size=" + size + "&page=" + pg;
      if (search) u += "&search=" + encodeURIComponent(search);
      if (custId) u += "&customerId=" + custId;
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>ID</th><th>Year</th><th>Make</th><th>Model</th><th>VIN</th><th>Plate</th><th>Customer</th><th></th></tr>";
      rows.forEach(function (v) {
        h += "<tr><td>" + v.id + "</td><td>" + (v.year || "\u2014") + "</td><td>" + esc(v.make) + "</td><td>" + esc(v.model) + "</td><td>" + esc(v.vin) + "</td><td>" + esc(v.licensePlate) + "</td><td>" + (v.customerId || "\u2014") + '</td><td><button class="btn btn-sm btn-outline" onclick="viewVeh(' + v.id + ')">View</button></td></tr>';
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No vehicles found.</p>';
      paginate("vehPag", pg, data.totalPages, "loadVehicles");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadVehicles = loadVehicles;

  // -- repair orders ---------------------------------------------------------

  async function loadRepairOrders(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), search = $("roSearch").value, status = $("roStatus").value, start = $("roStart").value, end = $("roEnd").value, size = $("roSize").value;
    var el = $("roTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/repair-orders?shop_id=" + sid + "&size=" + size + "&page=" + pg + "&sortDirection=DESC";
      if (search) u += "&search=" + encodeURIComponent(search);
      if (status) u += "&repairOrderStatusId=" + status;
      if (start) u += "&start=" + start;
      if (end) u += "&end=" + end;
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>RO #</th><th>Status</th><th>Customer</th><th>Vehicle</th><th>Labor</th><th>Parts</th><th>Total</th><th>Created</th><th></th></tr>";
      rows.forEach(function (r) {
        var st = r.repairOrderStatus?.name || "\u2014";
        var cls = st.includes("Progress") ? "badge-orange" : st.includes("Complete") || st.includes("Posted") ? "badge-green" : "badge-gray";
        h += "<tr><td>" + r.repairOrderNumber + '</td><td><span class="badge ' + cls + '">' + st + "</span></td><td>" + (r.customerId || "\u2014") + "</td><td>" + (r.vehicleId || "\u2014") + "</td><td>" + cents(r.laborSales) + "</td><td>" + cents(r.partsSales) + "</td><td>" + cents(r.totalSales) + "</td><td>" + d(r.createdDate) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewRO(' + r.id + ')">View</button></td></tr>';
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No repair orders found.</p>';
      paginate("roPag", pg, data.totalPages, "loadRepairOrders");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadRepairOrders = loadRepairOrders;

  // -- jobs ------------------------------------------------------------------

  async function loadJobs(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), roId = $("jobROId").value, auth = $("jobAuth").value, roSt = $("jobROStatus").value, size = $("jobSize").value;
    var el = $("jobTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/jobs?shop_id=" + sid + "&size=" + size + "&page=" + pg;
      if (roId) u += "&repairOrderId=" + roId;
      if (auth) u += "&authorized=" + auth;
      if (roSt) u += "&repairOrderStatusId=" + roSt;
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>ID</th><th>Name</th><th>RO ID</th><th>Auth</th><th>Parts</th><th>Labor</th><th>Subtotal</th><th>Created</th><th></th></tr>";
      rows.forEach(function (j) {
        var ab = j.authorized === true ? '<span class="badge badge-green">Yes</span>' : j.authorized === false ? '<span class="badge badge-red">No</span>' : '<span class="badge badge-gray">\u2014</span>';
        h += "<tr><td>" + j.id + "</td><td>" + esc(j.name) + "</td><td>" + (j.repairOrderId || "\u2014") + "</td><td>" + ab + "</td><td>" + cents(j.partsTotal) + "</td><td>" + cents(j.laborTotal) + "</td><td>" + cents(j.subtotal) + "</td><td>" + d(j.createdDate) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewJob(' + j.id + ')">View</button></td></tr>';
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No jobs found.</p>';
      paginate("jobPag", pg, data.totalPages, "loadJobs");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadJobs = loadJobs;

  // -- canned jobs -----------------------------------------------------------

  async function loadCannedJobs(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), search = $("cjSearch").value, size = $("cjSize").value;
    var el = $("cjTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/canned-jobs?shop_id=" + sid + "&size=" + size + "&page=" + pg;
      if (search) u += "&search=" + encodeURIComponent(search);
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>ID</th><th>Name</th><th>Category</th><th>Cost</th><th>Labor</th><th>Parts</th><th></th></tr>";
      rows.forEach(function (c) {
        h += "<tr><td>" + c.id + "</td><td>" + esc(c.name) + "</td><td>" + (esc(c.jobCategoryCode) || "\u2014") + "</td><td>" + cents(c.totalCost) + "</td><td>" + (c.labor || []).length + "</td><td>" + (c.parts || []).length + '</td><td><button class="btn btn-sm btn-outline" onclick="viewCannedJob(' + c.id + ')">View</button></td></tr>';
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No canned jobs found.</p>';
      paginate("cjPag", pg, data.totalPages, "loadCannedJobs");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadCannedJobs = loadCannedJobs;

  window.viewCannedJob = function (id) {
    api("/api/canned-jobs?shop_id=" + shopSel() + "&size=100").then(function (data) {
      var found = (data.content || []).find(function (c) { return c.id === id; });
      if (found) showDetail("Canned Job #" + id, found);
    }).catch(function () {});
  };

  // -- appointments ----------------------------------------------------------

  async function loadAppointments(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), start = $("apptStart").value, end = $("apptEnd").value, custId = $("apptCustId").value, size = $("apptSize").value;
    var el = $("apptTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/appointments?shop_id=" + sid + "&size=" + size + "&page=" + pg;
      if (start) u += "&start=" + start;
      if (end) u += "&end=" + end;
      if (custId) u += "&customerId=" + custId;
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>ID</th><th>Start</th><th>End</th><th>Status</th><th>Customer</th><th>Vehicle</th><th>Description</th><th></th></tr>";
      rows.forEach(function (a) {
        var cls = a.appointmentStatus === "ARRIVED" ? "badge-green" : a.appointmentStatus === "CANCELED" ? "badge-red" : a.appointmentStatus === "NO_SHOW" ? "badge-orange" : "badge-blue";
        h += "<tr><td>" + a.id + "</td><td>" + dt(a.startTime) + "</td><td>" + dt(a.endTime) + '</td><td><span class="badge ' + cls + '">' + (a.appointmentStatus || "NONE") + "</span></td><td>" + (a.customerId || "\u2014") + "</td><td>" + (a.vehicleId || "\u2014") + "</td><td>" + esc(a.description?.substring(0, 60)) + '</td><td><button class="btn btn-sm btn-outline" onclick="viewAppt(' + a.id + ')">View</button></td></tr>';
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No appointments found.</p>';
      paginate("apptPag", pg, data.totalPages, "loadAppointments");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadAppointments = loadAppointments;

  // -- calendar --------------------------------------------------------------

  var calYear, calMonth;

  function initCalendar() {
    var now = new Date();
    calYear = now.getFullYear();
    calMonth = now.getMonth();
    renderCalendar();
  }
  window.initCalendar = initCalendar;

  window.calNav = function (dir) {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  };
  window.calToday = function () {
    var n = new Date();
    calYear = n.getFullYear();
    calMonth = n.getMonth();
    renderCalendar();
  };

  async function renderCalendar() {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $("calTitle").textContent = months[calMonth] + " " + calYear;
    var sid = shopSel();
    var firstDay = new Date(calYear, calMonth, 1);
    var lastDay = new Date(calYear, calMonth + 1, 0);
    var startPad = firstDay.getDay();
    var totalDays = lastDay.getDate();
    var startStr = calYear + "-" + String(calMonth + 1).padStart(2, "0") + "-01";
    var endStr = calYear + "-" + String(calMonth + 1).padStart(2, "0") + "-" + String(totalDays).padStart(2, "0");

    var apptMap = {};
    try {
      var data = await api("/api/appointments?shop_id=" + sid + "&start=" + startStr + "&end=" + endStr + "&size=100");
      (data.content || []).forEach(function (a) {
        if (!a.startTime) return;
        var key = a.startTime.substring(0, 10);
        if (!apptMap[key]) apptMap[key] = [];
        apptMap[key].push(a);
      });
    } catch (e) { /* calendar degrades gracefully */ }

    var today = new Date();
    var todayStr = today.toISOString().substring(0, 10);
    var html = '<div class="cal-grid">';
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(function (d) {
      html += '<div class="cal-header">' + d + "</div>";
    });

    for (var i = 0; i < startPad; i++) {
      var prev = new Date(calYear, calMonth, 0 - startPad + i + 1);
      html += '<div class="cal-day other-month"><div class="day-num">' + prev.getDate() + "</div></div>";
    }

    for (var day = 1; day <= totalDays; day++) {
      var key = calYear + "-" + String(calMonth + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
      var isToday = key === todayStr ? " today" : "";
      var dayAppts = apptMap[key] || [];
      var dots = "";
      dayAppts.slice(0, 5).forEach(function (a) {
        var col = a.appointmentStatus === "ARRIVED" ? "var(--green)" : a.appointmentStatus === "CANCELED" ? "var(--red)" : "var(--sky)";
        dots += '<span class="appt-dot" style="background:' + col + '"></span>';
      });
      if (dayAppts.length > 5) dots += '<span style="font-size:10px;color:var(--muted)">+' + (dayAppts.length - 5) + "</span>";
      html += '<div class="cal-day' + isToday + '" onclick="calDayClick(\'' + key + "')\" title=\"" + dayAppts.length + ' appointment(s)"><div class="day-num">' + day + "</div>" + dots + "</div>";
    }

    var remaining = (startPad + totalDays) % 7;
    if (remaining > 0) {
      for (var j = 1; j <= 7 - remaining; j++) {
        html += '<div class="cal-day other-month"><div class="day-num">' + j + "</div></div>";
      }
    }
    html += "</div>";
    $("calBody").innerHTML = html;
  }

  window.calDayClick = function (dateStr) {
    $("apptStart").value = dateStr;
    $("apptEnd").value = dateStr;
    showPage("appointments");
    loadAppointments();
  };

  // -- employees -------------------------------------------------------------

  async function loadEmployees(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), search = $("empSearch").value, size = $("empSize").value;
    var el = $("empTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/employees?shop_id=" + sid + "&size=" + size + "&page=" + pg;
      if (search) u += "&search=" + encodeURIComponent(search);
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Can Work</th><th></th></tr>";
      rows.forEach(function (e) {
        h += "<tr><td>" + e.id + "</td><td>" + esc(e.firstName) + " " + esc(e.lastName) + "</td><td>" + esc(e.email) + "</td><td>" + (e.employeeRole?.name || "\u2014") + "</td><td>" + (e.canPerformWork ? '<span class="badge badge-green">Yes</span>' : '<span class="badge badge-gray">No</span>') + '</td><td><button class="btn btn-sm btn-outline" onclick="viewEmp(' + e.id + ')">View</button></td></tr>';
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No employees found.</p>';
      paginate("empPag", pg, data.totalPages, "loadEmployees");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadEmployees = loadEmployees;

  // -- inventory -------------------------------------------------------------

  async function loadInventory(pg) {
    if (pg === undefined) pg = 0;
    var sid = shopSel(), partType = $("invType").value, partNum = $("invPartNum").value, size = $("invSize").value;
    var el = $("invTable");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    try {
      var u = "/api/inventory?shop_id=" + sid + "&partTypeId=" + partType + "&size=" + size + "&page=" + pg;
      if (partNum) u += "&partNumbers=" + encodeURIComponent(partNum);
      var data = await api(u);
      var rows = data.content || [];
      var h = "<table><tr><th>ID</th><th>Name</th><th>Brand</th><th>Part #</th><th>Cost</th><th>Retail</th><th>In Stock</th><th>Available</th></tr>";
      rows.forEach(function (p) {
        h += "<tr><td>" + p.id + "</td><td>" + esc(p.name) + "</td><td>" + esc(p.brand) + "</td><td>" + esc(p.partNumber) + "</td><td>" + cents(p.cost) + "</td><td>" + cents(p.retail) + "</td><td>" + (p.inStock ?? "\u2014") + "</td><td>" + (p.available ?? "\u2014") + "</td></tr>";
      });
      h += "</table>";
      el.innerHTML = rows.length ? h : '<p style="color:var(--muted)">No inventory found.</p>';
      paginate("invPag", pg, data.totalPages, "loadInventory");
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.loadInventory = loadInventory;

  // -- cross-shop search -----------------------------------------------------

  async function crossSearch() {
    var email = $("csEmail").value, phone = $("csPhone").value;
    var el = $("csResult");
    if (!email && !phone) { el.innerHTML = '<div class="error-msg">Provide email or phone.</div>'; return; }
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div> Searching all shops\u2026</div>';
    try {
      var u = "/api/customer/search?";
      if (email) u += "email=" + encodeURIComponent(email);
      if (phone) u += (email ? "&" : "") + "phone=" + encodeURIComponent(phone);
      var data = await api(u);
      if (!data.customer_found) { el.innerHTML = '<div class="panel"><div class="panel-body"><p style="color:var(--muted)">No customer found across any shop.</p></div></div>'; return; }

      var h = '<div class="stat-row" style="margin-top:14px"><div class="stat-card"><div class="label">Name</div><div class="value" style="font-size:18px">' + esc(data.customer_name) + '</div></div><div class="stat-card"><div class="label">Found At</div><div class="value">' + (data.found_at_shops?.length || 0) + ' shops</div></div><div class="stat-card"><div class="label">Appointments</div><div class="value">' + (data.total_appointments || 0) + "</div></div></div>";

      if (data.found_at_shops?.length) {
        h += '<div class="panel"><div class="panel-header"><h3>Locations</h3></div><div class="panel-body"><table><tr><th>Shop</th><th>Shop ID</th><th>Customer ID</th></tr>';
        data.found_at_shops.forEach(function (s) { h += "<tr><td>" + esc(s.shop_name) + "</td><td>" + s.shop_id + "</td><td>" + s.customer_id + "</td></tr>"; });
        h += "</table></div></div>";
      }
      if (data.appointments?.length) {
        h += '<div class="panel"><div class="panel-header"><h3>Active Appointments (' + data.appointments.length + ')</h3></div><div class="panel-body"><table><tr><th>Date</th><th>Service</th><th>Location</th><th>Status</th></tr>';
        data.appointments.forEach(function (a) {
          var cls = a.status === "ARRIVED" ? "badge-green" : "badge-blue";
          h += "<tr><td>" + dt(a.date) + "</td><td>" + esc(a.service) + "</td><td>" + esc(a.location) + '</td><td><span class="badge ' + cls + '">' + a.status + "</span></td></tr>";
        });
        h += "</table></div></div>";
      }
      if (data.canceled_appointments?.length) {
        h += '<div class="panel"><div class="panel-header"><h3>Canceled (' + data.canceled_appointments.length + ')</h3></div><div class="panel-body"><table><tr><th>Date</th><th>Service</th><th>Location</th></tr>';
        data.canceled_appointments.forEach(function (a) { h += "<tr><td>" + dt(a.date) + "</td><td>" + esc(a.service) + "</td><td>" + esc(a.location) + "</td></tr>"; });
        h += "</table></div></div>";
      }
      el.innerHTML = h;
    } catch (e) { el.innerHTML = errHtml(e); }
  }
  window.crossSearch = crossSearch;

  // -- shops -----------------------------------------------------------------

  function loadShopCards() {
    api("/api/shops").then(function (data) {
      var el = $("shopCards");
      var h = "";
      (data.shops || []).forEach(function (s) {
        h += '<div class="stat-card" style="cursor:pointer" onclick="viewShopDetail(' + s.shop_id + ')"><div class="label">' + esc(s.name) + '</div><div class="value" style="font-size:16px">#' + s.shop_id + '</div><p style="font-size:11px;color:var(--muted);margin-top:4px">' + esc(s.address) + "</p></div>";
      });
      el.innerHTML = h;
    }).catch(function () {});
  }
  window.loadShopCards = loadShopCards;

  window.loadTekShops = function () {
    var el = $("tekShopData");
    el.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
    api("/api/shops/tekmetric").then(function (data) {
      el.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
    }).catch(function (e) { el.innerHTML = errHtml(e); });
  };

  // -- boot ------------------------------------------------------------------

  async function loadShopSelector() {
    try {
      var data = await api("/api/shops");
      var sel = $("shopSelect");
      sel.innerHTML = "";
      (data.shops || []).forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s.shop_id;
        opt.textContent = s.name + " (" + s.shop_id + ")";
        sel.appendChild(opt);
      });
    } catch (e) {
      $("shopSelect").innerHTML = '<option value="">Failed to load shops</option>';
    }
  }

  loadShopSelector().then(function () {
    showPage("dashboard");
  });
})();
