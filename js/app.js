/* =====================================================================
   Tekmetric API Explorer — Client
   ===================================================================== */
(function () {
  "use strict";

  var BASE = (window.API_BASE || "").replace(/\/+$/, "");
  var el = function (id) { return document.getElementById(id); };

  console.log("[API Explorer] boot, BASE =", BASE);

  /* ---- endpoint registry ------------------------------------------------ */

  var ENDPOINTS = [
    {
      id: "customers", name: "Customers", path: "/api/customers", icon: "users",
      desc: "Search customers by name, email, phone. Filter by type, marketing opt-in, date ranges.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "search", label: "Search", type: "text", hint: "Name, email, phone" },
        { key: "customerTypeId", label: "Type", type: "select", opts: [["", "All"], ["1", "Person"], ["2", "Business"]] },
        { key: "okForMarketing", label: "OK Marketing", type: "select", opts: [["", "Any"], ["true", "Yes"], ["false", "No"]] },
        { key: "eligibleForAccountsReceivable", label: "AR Eligible", type: "select", opts: [["", "Any"], ["true", "Yes"], ["false", "No"]] },
        { key: "updatedDateStart", label: "Updated From", type: "date" },
        { key: "updatedDateEnd", label: "Updated To", type: "date" },
        { key: "deletedDateStart", label: "Deleted From", type: "date" },
        { key: "deletedDateEnd", label: "Deleted To", type: "date" },
        { key: "sort", label: "Sort", type: "select", opts: [["", "Default"], ["lastName", "Last Name"], ["firstName", "First Name"], ["email", "Email"]] },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0", hint: "0-indexed" }
      ]
    },
    {
      id: "customer-detail", name: "Customer by ID", path: "/api/customers/{id}", icon: "user",
      desc: "Get a single customer record by Tekmetric ID.",
      params: [{ key: "id", label: "Customer ID", type: "number", required: true, pathParam: true }]
    },
    {
      id: "customer-search", name: "Cross-Shop Search", path: "/api/customer/search", icon: "search",
      desc: "Search for a customer across ALL shop locations by email or phone.",
      params: [
        { key: "email", label: "Email", type: "text", hint: "customer@email.com" },
        { key: "phone", label: "Phone", type: "text", hint: "555-123-4567" }
      ]
    },
    {
      id: "vehicles", name: "Vehicles", path: "/api/vehicles", icon: "truck",
      desc: "List vehicles. Filter by customer, search year/make/model, date ranges.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "search", label: "Search", type: "text", hint: "Year, make, model" },
        { key: "customerId", label: "Customer ID", type: "number" },
        { key: "updatedDateStart", label: "Updated From", type: "date" },
        { key: "updatedDateEnd", label: "Updated To", type: "date" },
        { key: "deletedDateStart", label: "Deleted From", type: "date" },
        { key: "deletedDateEnd", label: "Deleted To", type: "date" },
        { key: "sort", label: "Sort", type: "text", hint: "Field name" },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0" }
      ]
    },
    {
      id: "vehicle-detail", name: "Vehicle by ID", path: "/api/vehicles/{id}", icon: "truck",
      desc: "Get a single vehicle by Tekmetric ID.",
      params: [{ key: "id", label: "Vehicle ID", type: "number", required: true, pathParam: true }]
    },
    {
      id: "repair-orders", name: "Repair Orders", path: "/api/repair-orders", icon: "tool",
      desc: "List ROs. Filter by status, customer, vehicle, RO#, created/posted/updated/deleted dates.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "search", label: "Search", type: "text", hint: "RO #, name, vehicle" },
        { key: "customerId", label: "Customer ID", type: "number" },
        { key: "vehicleId", label: "Vehicle ID", type: "number" },
        { key: "repairOrderNumber", label: "RO Number", type: "number" },
        { key: "repairOrderStatusId", label: "Status", type: "select", opts: [["", "All"], ["1", "Estimate"], ["2", "WIP"], ["3", "Complete"], ["4", "Saved for Later"], ["5", "Posted"], ["6", "Accts Receivable"], ["7", "Deleted"]] },
        { key: "start", label: "Created From", type: "date" },
        { key: "end", label: "Created To", type: "date" },
        { key: "postedDateStart", label: "Posted From", type: "date" },
        { key: "postedDateEnd", label: "Posted To", type: "date" },
        { key: "updatedDateStart", label: "Updated From", type: "date" },
        { key: "updatedDateEnd", label: "Updated To", type: "date" },
        { key: "deletedDateStart", label: "Deleted From", type: "date" },
        { key: "deletedDateEnd", label: "Deleted To", type: "date" },
        { key: "sort", label: "Sort", type: "select", opts: [["", "Default"], ["createdDate", "Created Date"], ["repairOrderNumber", "RO Number"], ["customer.firstName", "First Name"], ["customer.lastName", "Last Name"]] },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0" }
      ]
    },
    {
      id: "ro-detail", name: "RO by ID", path: "/api/repair-orders/{id}", icon: "tool",
      desc: "Get a single repair order with jobs, sublets, fees, discounts, and concerns.",
      params: [{ key: "id", label: "RO ID", type: "number", required: true, pathParam: true }]
    },
    {
      id: "jobs", name: "Jobs", path: "/api/jobs", icon: "clipboard",
      desc: "List jobs. Filter by RO, customer, vehicle, authorization status and dates.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "repairOrderId", label: "RO ID", type: "number" },
        { key: "customerId", label: "Customer ID", type: "number" },
        { key: "vehicleId", label: "Vehicle ID", type: "number" },
        { key: "authorized", label: "Authorized", type: "select", opts: [["", "All"], ["true", "Yes"], ["false", "No"]] },
        { key: "authorizedDateStart", label: "Auth From", type: "date" },
        { key: "authorizedDateEnd", label: "Auth To", type: "date" },
        { key: "updatedDateStart", label: "Updated From", type: "date" },
        { key: "updatedDateEnd", label: "Updated To", type: "date" },
        { key: "repairOrderStatusId", label: "RO Status", type: "select", opts: [["", "All"], ["1", "Estimate"], ["2", "WIP"], ["3", "Complete"], ["4", "Saved"], ["5", "Posted"], ["6", "Accts Recv"]] },
        { key: "sort", label: "Sort", type: "select", opts: [["", "Default"], ["authorizedDate", "Auth Date"]] },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0" }
      ]
    },
    {
      id: "job-detail", name: "Job by ID", path: "/api/jobs/{id}", icon: "clipboard",
      desc: "Get a single job with labor, parts, fees, discounts detail.",
      params: [{ key: "id", label: "Job ID", type: "number", required: true, pathParam: true }]
    },
    {
      id: "canned-jobs", name: "Canned Jobs", path: "/api/canned-jobs", icon: "star",
      desc: "List canned (template) jobs. Filter by name, categories, labor rates.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "search", label: "Search", type: "text", hint: "Job name" },
        { key: "categories", label: "Categories", type: "text", hint: "Comma-separated codes" },
        { key: "rates", label: "Labor Rates", type: "text", hint: "In cents, comma-separated" },
        { key: "sort", label: "Sort", type: "select", opts: [["", "Default"], ["jobCategory", "Category"]] },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0" }
      ]
    },
    {
      id: "appointments", name: "Appointments", path: "/api/appointments", icon: "calendar",
      desc: "List appointments. Filter by date range, customer, vehicle, include/exclude deleted.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "customerId", label: "Customer ID", type: "number" },
        { key: "vehicleId", label: "Vehicle ID", type: "number" },
        { key: "start", label: "From", type: "date" },
        { key: "end", label: "To", type: "date" },
        { key: "updatedDateStart", label: "Updated From", type: "date" },
        { key: "updatedDateEnd", label: "Updated To", type: "date" },
        { key: "includeDeleted", label: "Incl. Deleted", type: "select", opts: [["true", "Yes"], ["false", "No"]], def: "true" },
        { key: "sort", label: "Sort", type: "text", hint: "Field name" },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0" }
      ]
    },
    {
      id: "appt-detail", name: "Appointment by ID", path: "/api/appointments/{id}", icon: "calendar",
      desc: "Get a single appointment by Tekmetric ID.",
      params: [{ key: "id", label: "Appointment ID", type: "number", required: true, pathParam: true }]
    },
    {
      id: "employees", name: "Employees", path: "/api/employees", icon: "user-check",
      desc: "List employees. Filter by name, updated dates.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "search", label: "Search", type: "text", hint: "Name" },
        { key: "updatedDateStart", label: "Updated From", type: "date" },
        { key: "updatedDateEnd", label: "Updated To", type: "date" },
        { key: "sort", label: "Sort", type: "text", hint: "Field name" },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0" }
      ]
    },
    {
      id: "emp-detail", name: "Employee by ID", path: "/api/employees/{id}", icon: "user-check",
      desc: "Get a single employee by Tekmetric ID.",
      params: [{ key: "id", label: "Employee ID", type: "number", required: true, pathParam: true }]
    },
    {
      id: "inventory", name: "Inventory", path: "/api/inventory", icon: "box",
      desc: "List inventory. Filter by part type (Parts/Tires/Batteries), part numbers, tire dimensions.",
      params: [
        { key: "shop_id", label: "Shop ID", type: "shop", required: true },
        { key: "partTypeId", label: "Part Type", type: "select", opts: [["1", "Parts"], ["2", "Tires"], ["5", "Batteries"]], def: "1" },
        { key: "partNumbers", label: "Part #", type: "text", hint: "Exact match, comma-sep" },
        { key: "width", label: "Width", type: "text", hint: "Tires only" },
        { key: "ratio", label: "Ratio", type: "text", hint: "Tires only" },
        { key: "diameter", label: "Diameter", type: "text", hint: "Tires only" },
        { key: "tireSize", label: "Tire Size", type: "text", hint: "width/ratio/diameter" },
        { key: "sort", label: "Sort", type: "select", opts: [["", "Default"], ["id", "ID"], ["name", "Name"], ["brand", "Brand"], ["partNumber", "Part #"]] },
        { key: "sortDirection", label: "Direction", type: "select", opts: [["", "Default"], ["ASC", "ASC"], ["DESC", "DESC"]] },
        { key: "size", label: "Size", type: "select", opts: [["20", "20"], ["50", "50"], ["100", "100"]], def: "20" },
        { key: "page", label: "Page", type: "number", def: "0" }
      ]
    },
    {
      id: "shops-config", name: "Shops (Config)", path: "/api/shops", icon: "home",
      desc: "List all configured shop locations from server environment.", params: []
    },
    {
      id: "shops-tek", name: "Shops (Tekmetric)", path: "/api/shops/tekmetric", icon: "home",
      desc: "Fetch raw shop data directly from Tekmetric API.", params: []
    },
    {
      id: "shop-detail", name: "Shop by ID", path: "/api/shops/{id}", icon: "home",
      desc: "Get a single shop by Tekmetric ID.",
      params: [{ key: "id", label: "Shop ID", type: "number", required: true, pathParam: true }]
    }
  ];

  /* ---- SVG icons -------------------------------------------------------- */

  var ICONS = {
    users:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    user:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    "user-check": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>',
    truck:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14M5 17a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2"/><circle cx="7.5" cy="15.5" r="1.5"/><circle cx="16.5" cy="15.5" r="1.5"/></svg>',
    tool:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z"/></svg>',
    clipboard:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>',
    star:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    calendar:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    box:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    home:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    search:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
  };

  /* ---- state ------------------------------------------------------------ */

  var currentEp = null;
  var lastResponse = null;
  var lastStatus = 0;
  var reqHistory = [];
  var shops = [];

  /* ---- sidebar nav ------------------------------------------------------ */

  function buildNav() {
    var navEl = el("endpointNav");
    if (!navEl) { console.error("endpointNav not found"); return; }
    var html = "";
    ENDPOINTS.forEach(function (ep) {
      html += '<a href="#" data-ep="' + ep.id + '" onclick="EP.go(\'' + ep.id + '\');return false">' +
        (ICONS[ep.icon] || "") +
        '<span>' + ep.name + '</span>' +
        '<span class="ep-method">GET</span></a>';
    });
    navEl.innerHTML = html;
    console.log("[API Explorer] nav built, " + ENDPOINTS.length + " endpoints");
  }

  /* ---- navigation ------------------------------------------------------- */

  function goTo(id) {
    document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
    document.querySelectorAll(".sidebar nav a").forEach(function (a) { a.classList.remove("active"); });

    if (id === "dashboard") {
      el("page-dashboard").classList.add("active");
      var dl = document.querySelector('[data-ep="dashboard"]');
      if (dl) dl.classList.add("active");
      closeSidebar();
      loadDashboard();
      return;
    }

    var ep = ENDPOINTS.find(function (e) { return e.id === id; });
    if (!ep) { console.warn("Unknown endpoint:", id); return; }

    currentEp = ep;
    el("page-explorer").classList.add("active");
    var link = document.querySelector('[data-ep="' + id + '"]');
    if (link) link.classList.add("active");

    el("epTitle").textContent = ep.name;
    el("epDesc").textContent = ep.desc;
    renderParams(ep);
    updateUrlPreview();
    clearResponse();
    closeSidebar();
  }

  /* ---- render param controls -------------------------------------------- */

  function renderParams(ep) {
    var grid = el("paramGrid");
    if (!ep.params.length) {
      grid.innerHTML = '<div class="param-item" style="grid-column:1/-1;text-align:center;color:var(--muted);padding:20px">No parameters \u2014 click Send to execute</div>';
      return;
    }
    var html = "";
    ep.params.forEach(function (p) {
      html += '<div class="param-item"><label>' + p.label;
      if (p.required) html += ' <span class="req">*</span>';
      html += '</label>';

      if (p.type === "shop") {
        html += '<select id="p_' + p.key + '" onchange="EP.updUrl()">';
        shops.forEach(function (s) {
          html += '<option value="' + s.shop_id + '">' + s.name + ' (' + s.shop_id + ')</option>';
        });
        html += '</select>';
      } else if (p.type === "select") {
        html += '<select id="p_' + p.key + '" onchange="EP.updUrl()">';
        (p.opts || []).forEach(function (o) {
          var sel = p.def === o[0] ? " selected" : "";
          html += '<option value="' + o[0] + '"' + sel + '>' + o[1] + '</option>';
        });
        html += '</select>';
      } else if (p.type === "date") {
        html += '<input type="date" id="p_' + p.key + '" onchange="EP.updUrl()">';
      } else if (p.type === "number") {
        html += '<input type="number" id="p_' + p.key + '" value="' + (p.def || "") + '" oninput="EP.updUrl()">';
      } else {
        html += '<input type="text" id="p_' + p.key + '" placeholder="' + (p.hint || "") + '" oninput="EP.updUrl()">';
      }
      if (p.hint) html += '<span class="param-hint">' + p.hint + '</span>';
      html += '</div>';
    });
    grid.innerHTML = html;

    var shopParam = el("p_shop_id");
    if (shopParam) shopParam.value = el("shopSelect").value;
  }

  /* ---- URL builder ------------------------------------------------------ */

  function buildUrl() {
    if (!currentEp) return "";
    var path = currentEp.path;
    var qp = [];
    currentEp.params.forEach(function (p) {
      var input = el("p_" + p.key);
      if (!input) return;
      var v = input.value;
      if (v === "" || v === undefined || v === null) return;
      if (p.pathParam) {
        path = path.replace("{id}", v);
      } else {
        qp.push(encodeURIComponent(p.key) + "=" + encodeURIComponent(v));
      }
    });
    return path + (qp.length ? "?" + qp.join("&") : "");
  }

  function updateUrlPreview() {
    var preview = el("urlPreview");
    if (preview) preview.textContent = BASE + buildUrl();
  }

  /* ---- send request ----------------------------------------------------- */

  async function sendRequest(overridePage) {
    if (!currentEp) return;
    if (overridePage !== undefined) {
      var pgEl = el("p_page");
      if (pgEl) pgEl.value = overridePage;
      updateUrlPreview();
    }

    var url = buildUrl();
    var fullUrl = BASE + url;

    el("statusText").textContent = "Loading\u2026";
    el("btnSend").disabled = true;
    el("respPretty").innerHTML = '<div class="loading-row"><div class="spinner"></div> Fetching\u2026</div>';

    var t0 = performance.now();
    try {
      var resp = await fetch(fullUrl);
      var elapsed = Math.round(performance.now() - t0);
      var text = await resp.text();
      var sizeKb = (new Blob([text]).size / 1024).toFixed(1);

      lastStatus = resp.status;
      try { lastResponse = JSON.parse(text); } catch (_) { lastResponse = text; }

      var sc = String(resp.status)[0];
      el("respStatus").textContent = resp.status + " " + resp.statusText;
      el("respStatus").className = "resp-status s" + sc;
      el("respTime").textContent = elapsed + "ms";
      el("respSize").textContent = sizeKb + " KB";
      el("statusText").textContent = "Ready";

      switchTab("pretty");
      renderPrettyJson(lastResponse);
      renderRawView(text);
      renderTableView(lastResponse);
      renderPagination(lastResponse);
      addToHistory(currentEp, url, resp.status, elapsed);
    } catch (err) {
      var elapsed2 = Math.round(performance.now() - t0);
      lastResponse = null; lastStatus = 0;
      el("respStatus").textContent = "Error";
      el("respStatus").className = "resp-status s5";
      el("respTime").textContent = elapsed2 + "ms";
      el("respSize").textContent = "";
      el("respPretty").innerHTML = '<div class="error-msg">' + esc(err.message) + '</div>';
      el("statusText").textContent = "Error";
      addToHistory(currentEp, url, 0, elapsed2);
    }
    el("btnSend").disabled = false;
  }

  /* ---- JSON syntax highlighting ----------------------------------------- */

  function highlight(json) {
    if (typeof json !== "string") json = JSON.stringify(json, null, 2);
    return json
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?/g, function (m) {
        if (/:\s*$/.test(m)) return '<span class="json-key">' + m.replace(/:\s*$/, "") + '</span>:';
        return '<span class="json-str">' + m + '</span>';
      })
      .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="json-num">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-bool">$1</span>')
      .replace(/\bnull\b/g, '<span class="json-null">null</span>');
  }

  function renderPrettyJson(data) { el("respPretty").innerHTML = highlight(data); }
  function renderRawView(text) { el("respRaw").textContent = text; }

  /* ---- table view ------------------------------------------------------- */

  function renderTableView(data) {
    var c = el("respTable");
    var rows = [];
    if (data && data.content && Array.isArray(data.content)) rows = data.content;
    else if (Array.isArray(data)) rows = data;
    else if (data && typeof data === "object") {
      var h = "<table><tr><th>Key</th><th>Value</th></tr>";
      Object.keys(data).forEach(function (k) {
        var v = data[k];
        if (typeof v === "object" && v !== null) v = JSON.stringify(v);
        h += "<tr><td><strong>" + esc(k) + "</strong></td><td>" + esc(String(v)) + "</td></tr>";
      });
      c.innerHTML = h + "</table>"; return;
    }
    if (!rows.length) { c.innerHTML = '<p style="padding:16px;color:var(--muted)">No tabular data</p>'; return; }

    var keys = Object.keys(rows[0]).filter(function (k) {
      var v = rows[0][k]; return v === null || typeof v !== "object";
    });
    var h = "<table><tr>";
    keys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; });
    h += "</tr>";
    rows.forEach(function (row) {
      h += "<tr>";
      keys.forEach(function (k) {
        var v = row[k];
        h += "<td>" + esc(v === null || v === undefined ? "" : String(v)) + "</td>";
      });
      h += "</tr>";
    });
    c.innerHTML = h + "</table>";
  }

  /* ---- tabs ------------------------------------------------------------- */

  function switchTab(tab) {
    var map = { pretty: "respPretty", raw: "respRaw", table: "respTable" };
    Object.keys(map).forEach(function (t) {
      var e = el(map[t]);
      if (e) e.style.display = t === tab ? "" : "none";
    });
    document.querySelectorAll(".resp-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.textContent.toLowerCase() === tab);
    });
  }

  /* ---- pagination ------------------------------------------------------- */

  function renderPagination(data) {
    var pag = el("epPag");
    if (!data || data.totalPages === undefined) { pag.innerHTML = ""; return; }
    var pg = data.number || 0;
    var tp = data.totalPages || 1;
    pag.innerHTML =
      '<button ' + (pg <= 0 ? "disabled" : "") + ' onclick="EP.send(' + (pg - 1) + ')">Prev</button>' +
      '<span class="pg-info">Page ' + (pg + 1) + " / " + tp + " \u00b7 " + (data.totalElements || 0) + " total</span>" +
      '<button ' + (pg >= tp - 1 ? "disabled" : "") + ' onclick="EP.send(' + (pg + 1) + ')">Next</button>';
  }

  /* ---- copy / export ---------------------------------------------------- */

  function copyText(text, msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); }
    toast(msg || "Copied");
  }

  function copyUrl()  { copyText(BASE + buildUrl(), "URL copied"); }
  function copyCurl() { copyText("curl -X GET '" + BASE + buildUrl() + "'", "cURL copied"); }
  function copyJson() { if (!lastResponse) return toast("No response"); copyText(JSON.stringify(lastResponse, null, 2), "JSON copied"); }

  function exportCsv() {
    if (!lastResponse) return toast("No response");
    var rows = lastResponse.content || (Array.isArray(lastResponse) ? lastResponse : [lastResponse]);
    if (!rows.length) return toast("No data");
    var allK = {};
    rows.forEach(function (r) { Object.keys(r).forEach(function (k) { if (typeof r[k] !== "object" || r[k] === null) allK[k] = true; }); });
    var keys = Object.keys(allK);
    var csv = keys.join(",") + "\n";
    rows.forEach(function (r) {
      csv += keys.map(function (k) { var v = r[k]; if (v == null) return ""; return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",") + "\n";
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = (currentEp ? currentEp.id : "data") + ".csv";
    a.click();
    toast("CSV exported");
  }

  function toggleWrap() {
    el("respPretty").classList.toggle("wrap");
    el("respRaw").classList.toggle("wrap");
  }

  /* ---- request history -------------------------------------------------- */

  function addToHistory(ep, url, status, ms) {
    reqHistory.unshift({ ep: ep.id, name: ep.name, url: url, status: status, ms: ms });
    if (reqHistory.length > 30) reqHistory.pop();
    renderHistory();
  }

  function renderHistory() {
    var nav = el("historyNav");
    if (!reqHistory.length) { nav.innerHTML = '<span class="sidebar-empty">No requests yet</span>'; return; }
    var h = "";
    reqHistory.slice(0, 15).forEach(function (item, i) {
      var sc = String(item.status)[0] || "5";
      h += '<a href="#" onclick="EP.replay(' + i + ');return false"><span style="flex:1;overflow:hidden;text-overflow:ellipsis">' +
        item.name + '</span><span class="hist-status s' + sc + '">' + (item.status || "ERR") + '</span></a>';
    });
    nav.innerHTML = h;
  }

  function replayHistory(idx) {
    var h = reqHistory[idx];
    if (h) goTo(h.ep);
  }

  /* ---- dashboard -------------------------------------------------------- */

  async function loadDashboard() {
    var sid = el("shopSelect").value;
    if (!sid) { console.warn("No shop selected"); return; }
    var stats = el("dashStats");
    stats.innerHTML = '<div class="loading-row" style="grid-column:1/-1"><div class="spinner"></div></div>';

    var items = [
      { key: "customers",    label: "Customers",     url: "/api/customers?shop_id=" + sid + "&size=1" },
      { key: "vehicles",     label: "Vehicles",      url: "/api/vehicles?shop_id=" + sid + "&size=1" },
      { key: "repair-orders",label: "Repair Orders",  url: "/api/repair-orders?shop_id=" + sid + "&size=5&sortDirection=DESC" },
      { key: "jobs",         label: "Jobs",           url: "/api/jobs?shop_id=" + sid + "&size=1" },
      { key: "appointments", label: "Appointments",   url: "/api/appointments?shop_id=" + sid + "&size=5&sortDirection=DESC" },
      { key: "employees",    label: "Employees",      url: "/api/employees?shop_id=" + sid + "&size=1" },
      { key: "canned-jobs",  label: "Canned Jobs",    url: "/api/canned-jobs?shop_id=" + sid + "&size=1" },
      { key: "inventory",    label: "Inventory",      url: "/api/inventory?shop_id=" + sid + "&size=1&partTypeId=1" }
    ];

    var results = await Promise.allSettled(items.map(function (ep) {
      return fetch(BASE + ep.url).then(function (r) { return r.json(); });
    }));

    var sh = "";
    items.forEach(function (item, i) {
      var r = results[i];
      var count = r.status === "fulfilled" && r.value ? (r.value.totalElements != null ? r.value.totalElements : "?") : "\u2014";
      sh += '<div class="stat-card" onclick="EP.go(\'' + item.key + '\')">' +
        '<div class="label">' + item.label + '</div><div class="value">' + count + '</div>' +
        '<div class="sub">Click to explore</div></div>';
    });
    stats.innerHTML = sh;

    renderDashTable("dashRO", results[2], ["repairOrderNumber", "repairOrderStatus.name", "customerId", "createdDate", "totalSales"]);
    renderDashTable("dashAppt", results[4], ["id", "startTime", "appointmentStatus", "description"]);
    el("statusText").textContent = "Ready";
  }

  function renderDashTable(containerId, result, fields) {
    var c = el(containerId);
    if (!result || result.status !== "fulfilled" || !result.value || !result.value.content || !result.value.content.length) {
      c.innerHTML = '<p style="padding:16px;color:var(--muted)">No data</p>'; return;
    }
    var rows = result.value.content;
    var h = "<table><tr>";
    fields.forEach(function (f) { h += "<th>" + f.split(".").pop() + "</th>"; });
    h += "</tr>";
    rows.forEach(function (row) {
      h += "<tr>";
      fields.forEach(function (f) {
        var v = f.split(".").reduce(function (o, k) { return o && o[k]; }, row);
        if (f.indexOf("Date") >= 0 || f.indexOf("Time") >= 0) v = fmtDt(v);
        else if (f === "totalSales") v = fmtCents(v);
        h += "<td>" + esc(v) + "</td>";
      });
      h += "</tr>";
    });
    c.innerHTML = h + "</table>";
  }

  /* ---- util ------------------------------------------------------------- */

  function esc(s) { return s != null ? String(s).replace(/</g, "&lt;") : "\u2014"; }
  function fmtDt(v) { if (!v) return "\u2014"; var d = new Date(v); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  function fmtCents(v) { return v != null ? "$" + (v / 100).toFixed(2) : "\u2014"; }

  function clearResponse() {
    el("respPretty").innerHTML = '<span class="resp-placeholder">Click "Send Request" to execute</span>';
    el("respRaw").textContent = "";
    el("respTable").innerHTML = "";
    el("respStatus").textContent = ""; el("respStatus").className = "resp-status";
    el("respTime").textContent = ""; el("respSize").textContent = "";
    el("epPag").innerHTML = "";
    lastResponse = null; lastStatus = 0;
  }

  function toast(msg) {
    var t = el("toast");
    t.textContent = msg; t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 2000);
  }

  /* ---- mobile sidebar --------------------------------------------------- */

  var sidebar = document.querySelector(".sidebar");
  var overlay = document.querySelector(".sidebar-overlay");
  var burger = document.querySelector(".hamburger");

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
  }
  if (burger) burger.addEventListener("click", function () {
    sidebar.classList.add("open"); overlay.classList.add("show");
  });
  if (overlay) overlay.addEventListener("click", closeSidebar);

  /* ---- topbar shop sync ------------------------------------------------- */

  el("shopSelect").addEventListener("change", function () {
    var sp = el("p_shop_id");
    if (sp) sp.value = this.value;
    updateUrlPreview();
    var active = document.querySelector(".page.active");
    if (active && active.id === "page-dashboard") loadDashboard();
  });

  /* ---- boot ------------------------------------------------------------- */

  async function boot() {
    console.log("[API Explorer] booting...");
    buildNav();

    try {
      var resp = await fetch(BASE + "/api/shops");
      var data = await resp.json();
      shops = data.shops || [];
      console.log("[API Explorer] loaded", shops.length, "shops");
    } catch (e) {
      console.error("[API Explorer] failed to load shops:", e);
      shops = [];
    }

    var sel = el("shopSelect");
    sel.innerHTML = "";
    if (!shops.length) {
      sel.innerHTML = '<option value="">No shops found</option>';
    } else {
      shops.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = s.shop_id;
        opt.textContent = s.name + " (" + s.shop_id + ")";
        sel.appendChild(opt);
      });
    }

    goTo("dashboard");
    console.log("[API Explorer] ready");
  }

  boot();

  /* ---- public API ------------------------------------------------------- */

  window.EP = {
    go: goTo,
    send: sendRequest,
    updUrl: updateUrlPreview,
    copyUrl: copyUrl,
    copyCurl: copyCurl,
    copyJson: copyJson,
    exportCsv: exportCsv,
    toggleWrap: toggleWrap,
    showTab: switchTab,
    replay: replayHistory
  };

})();
