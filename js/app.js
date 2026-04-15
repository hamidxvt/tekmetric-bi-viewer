/* =====================================================================
   Tekmetric API Explorer v4
   - No live search: fetch only on Enter or Send
   - Auto-pagination: fetches ALL pages and combines results
   - Full hover effects
   ===================================================================== */
(function () {
  "use strict";

  var BASE = (window.API_BASE || "").replace(/\/+$/, "");
  var g = function (id) { return document.getElementById(id); };

  /* ---- endpoint definitions --------------------------------------------- */

  var ENDPOINTS = [
    { id:"customers", name:"Customers", path:"/api/customers", paged:1,
      desc:"Returns a list of all customers filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Name, email, or phone"},
        {k:"customerTypeId",l:"Customer Type",t:"sel",o:[["","All"],["1","Person"],["2","Business"]]},
        {k:"okForMarketing",l:"OK for Marketing",t:"sel",o:[["","Any"],["true","Yes"],["false","No"]]},
        {k:"eligibleForAccountsReceivable",l:"AR Eligible",t:"sel",o:[["","Any"],["true","Yes"],["false","No"]]},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"deletedDateStart",l:"Deleted From",t:"date"},{k:"deletedDateEnd",l:"Deleted To",t:"date"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["lastName","Last Name"],["firstName","First Name"],["email","Email"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"customer-detail", name:"Customer", path:"/api/customers/{id}",
      desc:"Returns a customer by ID.",
      params:[{k:"id",l:"Customer ID",t:"num",req:1,pp:1}]},
    { id:"customer-search", name:"Cross-Shop Search", path:"/api/customer/search",
      desc:"Searches across all configured shop locations simultaneously by email or phone.",
      params:[{k:"email",l:"Email",t:"text",hint:"customer@email.com"},{k:"phone",l:"Phone",t:"text",hint:"555-123-4567"}]},
    { id:"vehicles", name:"Vehicles", path:"/api/vehicles", paged:1,
      desc:"Returns a list of all vehicles filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Year, make, model"},
        {k:"customerId",l:"Customer ID",t:"num"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"deletedDateStart",l:"Deleted From",t:"date"},{k:"deletedDateEnd",l:"Deleted To",t:"date"},
        {k:"sort",l:"Sort By",t:"text",hint:"Field name"},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"vehicle-detail", name:"Vehicle", path:"/api/vehicles/{id}",
      desc:"Returns a vehicle by ID.",
      params:[{k:"id",l:"Vehicle ID",t:"num",req:1,pp:1}]},
    { id:"repair-orders", name:"Repair Orders", path:"/api/repair-orders", paged:1,
      desc:"Returns a list of all repair orders filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"RO #, customer name, vehicle info"},
        {k:"customerId",l:"Customer ID",t:"num"},
        {k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"repairOrderNumber",l:"RO Number",t:"num"},
        {k:"repairOrderStatusId",l:"Status",t:"sel",o:[["","All"],["1","Estimate"],["2","Work-in-Progress"],["3","Complete"],["4","Saved for Later"],["5","Posted"],["6","Accounts Receivable"],["7","Deleted"]]},
        {k:"start",l:"Created From",t:"date"},{k:"end",l:"Created To",t:"date"},
        {k:"postedDateStart",l:"Posted From",t:"date"},{k:"postedDateEnd",l:"Posted To",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"deletedDateStart",l:"Deleted From",t:"date"},{k:"deletedDateEnd",l:"Deleted To",t:"date"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["createdDate","Created Date"],["repairOrderNumber","RO Number"],["customer.firstName","First Name"],["customer.lastName","Last Name"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"ro-detail", name:"Repair Order", path:"/api/repair-orders/{id}",
      desc:"Returns a repair order by ID with full jobs, sublets, fees, discounts, and customer concerns.",
      params:[{k:"id",l:"Repair Order ID",t:"num",req:1,pp:1}]},
    { id:"jobs", name:"Jobs", path:"/api/jobs", paged:1,
      desc:"Returns a list of all jobs filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"repairOrderId",l:"Repair Order ID",t:"num"},
        {k:"customerId",l:"Customer ID",t:"num"},
        {k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"authorized",l:"Authorized",t:"sel",o:[["","All"],["true","Yes"],["false","No"]]},
        {k:"authorizedDateStart",l:"Auth Date From",t:"date"},{k:"authorizedDateEnd",l:"Auth Date To",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"repairOrderStatusId",l:"RO Status",t:"sel",o:[["","All"],["1","Estimate"],["2","WIP"],["3","Complete"],["4","Saved"],["5","Posted"],["6","Accts Recv"]]},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["authorizedDate","Auth Date"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"job-detail", name:"Job", path:"/api/jobs/{id}",
      desc:"Returns a job by ID with labor, parts, fees, and discounts.",
      params:[{k:"id",l:"Job ID",t:"num",req:1,pp:1}]},
    { id:"canned-jobs", name:"Canned Jobs", path:"/api/canned-jobs", paged:1,
      desc:"Returns a list of all canned (template) jobs filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Job name"},
        {k:"categories",l:"Categories",t:"text",hint:"Category codes, comma-sep"},
        {k:"rates",l:"Labor Rates",t:"text",hint:"In cents, comma-sep"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["jobCategory","Category"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"appointments", name:"Appointments", path:"/api/appointments", paged:1,
      desc:"Returns a list of all appointments filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"customerId",l:"Customer ID",t:"num"},
        {k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"start",l:"Start Date",t:"date"},{k:"end",l:"End Date",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"includeDeleted",l:"Include Deleted",t:"sel",o:[["true","Yes"],["false","No"]],d:"true"},
        {k:"sort",l:"Sort By",t:"text",hint:"Field name"},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"appt-detail", name:"Appointment", path:"/api/appointments/{id}",
      desc:"Returns an appointment by ID.",
      params:[{k:"id",l:"Appointment ID",t:"num",req:1,pp:1}]},
    { id:"employees", name:"Employees", path:"/api/employees", paged:1,
      desc:"Returns a list of all employees filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Employee name"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"sort",l:"Sort By",t:"text",hint:"Field name"},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"emp-detail", name:"Employee", path:"/api/employees/{id}",
      desc:"Returns an employee by ID.",
      params:[{k:"id",l:"Employee ID",t:"num",req:1,pp:1}]},
    { id:"inventory", name:"Inventory", path:"/api/inventory", paged:1,
      desc:"Returns a list of all inventory parts filtered by the provided search parameters. (Beta)",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"partTypeId",l:"Part Type",t:"sel",o:[["1","Parts"],["2","Tires"],["5","Batteries"]],d:"1"},
        {k:"partNumbers",l:"Part Numbers",t:"text",hint:"Exact match, comma-sep"},
        {k:"width",l:"Width",t:"text",hint:"Tires only"},
        {k:"ratio",l:"Ratio",t:"text",hint:"Tires only"},
        {k:"diameter",l:"Diameter",t:"text",hint:"Tires only"},
        {k:"tireSize",l:"Tire Size",t:"text",hint:"width/ratio/diameter"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["id","ID"],["name","Name"],["brand","Brand"],["partNumber","Part #"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]}
      ]},
    { id:"shops-config", name:"Shops (Config)", path:"/api/shops",
      desc:"List all configured shop locations from server environment.", params:[]},
    { id:"shops-tek", name:"Shops (Tekmetric)", path:"/api/shops/tekmetric",
      desc:"Fetch raw shop data directly from the Tekmetric API.", params:[]},
    { id:"shop-detail", name:"Shop", path:"/api/shops/{id}",
      desc:"Returns a shop by ID from the Tekmetric API.",
      params:[{k:"id",l:"Shop ID",t:"num",req:1,pp:1}]}
  ];

  /* ---- state ------------------------------------------------------------ */

  var cur = null, lastResp = null, allRows = [], shops = [], fetchAbort = null;

  /* ---- sidebar click ---------------------------------------------------- */

  document.querySelector(".side-nav").addEventListener("click", function (e) {
    var a = e.target.closest("a[data-ep]");
    if (!a) return;
    e.preventDefault();
    goTo(a.getAttribute("data-ep"));
  });

  /* ---- navigation ------------------------------------------------------- */

  function goTo(id) {
    if (fetchAbort) { fetchAbort.abort(); fetchAbort = null; }
    document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
    document.querySelectorAll(".side-nav a").forEach(function (a) { a.classList.remove("active"); });
    var link = document.querySelector('[data-ep="' + id + '"]');
    if (link) link.classList.add("active");
    closeSidebar();

    if (id === "dashboard") {
      g("page-dashboard").classList.add("active");
      loadDashboard();
      return;
    }
    var ep = ENDPOINTS.find(function (e) { return e.id === id; });
    if (!ep) return;
    cur = ep;
    g("page-explorer").classList.add("active");
    g("epTitle").textContent = ep.name;
    g("epDesc").textContent = ep.desc;
    buildParams(ep);
    updUrl();
    clearResp();
  }

  /* ---- build parameter form --------------------------------------------- */

  function buildParams(ep) {
    var grid = g("paramGrid");
    if (!ep.params.length) {
      grid.innerHTML = '<div class="param-item" style="grid-column:1/-1;text-align:center;padding:18px;color:var(--muted)">No parameters \u2014 click Send to execute</div>';
      return;
    }
    var h = "";
    ep.params.forEach(function (p) {
      h += '<div class="param-item"><label>' + p.l;
      if (p.req) h += ' <span class="req">*</span>';
      h += "</label>";

      if (p.t === "shop") {
        h += '<select id="p_' + p.k + '" onchange="EP.updUrl()">';
        shops.forEach(function (s) { h += '<option value="' + s.shop_id + '">' + s.name + " (" + s.shop_id + ")</option>"; });
        h += "</select>";
      } else if (p.t === "sel") {
        h += '<select id="p_' + p.k + '" onchange="EP.updUrl()">';
        (p.o || []).forEach(function (o) {
          h += '<option value="' + o[0] + '"' + (p.d === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
        });
        h += "</select>";
      } else if (p.t === "date") {
        h += '<input type="date" id="p_' + p.k + '" onchange="EP.updUrl()">';
      } else if (p.t === "num") {
        h += '<input type="number" id="p_' + p.k + '" value="' + (p.d || "") + '" onkeydown="EP.onKey(event)">';
      } else {
        h += '<input type="text" id="p_' + p.k + '" placeholder="' + (p.hint || "") + '" onkeydown="EP.onKey(event)">';
      }
      if (p.hint) h += '<span class="hint">' + p.hint + "</span>";
      h += "</div>";
    });
    grid.innerHTML = h;

    var sp = g("p_shop_id");
    if (sp) sp.value = g("shopSelect").value;
  }

  /* ---- Enter key handler (no live search) ------------------------------- */

  function onKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); doSend(); }
    else { updUrl(); }
  }

  /* ---- URL builder ------------------------------------------------------ */

  function buildUrl(pageOverride) {
    if (!cur) return "";
    var path = cur.path, qp = [];
    cur.params.forEach(function (p) {
      var el = g("p_" + p.k); if (!el) return;
      var v = el.value; if (v === "" || v == null) return;
      if (p.pp) path = path.replace("{id}", v);
      else qp.push(encodeURIComponent(p.k) + "=" + encodeURIComponent(v));
    });
    if (cur.paged) {
      qp.push("size=100");
      qp.push("page=" + (pageOverride != null ? pageOverride : 0));
    }
    return path + (qp.length ? "?" + qp.join("&") : "");
  }

  function updUrl() { var el = g("urlPreview"); if (el) el.textContent = BASE + buildUrl(); }

  /* ---- FETCH ALL PAGES -------------------------------------------------- */

  async function fetchAllPages() {
    if (!cur || !cur.paged) return null;

    var controller = new AbortController();
    fetchAbort = controller;
    allRows = [];
    var page = 0, totalPages = 1, totalElements = 0;

    g("respPretty").innerHTML = '<div class="loading"><div class="spinner"></div> Fetching all pages\u2026</div>';

    while (page < totalPages) {
      if (controller.signal.aborted) return null;

      var url = BASE + buildUrl(page);
      g("statusText").textContent = "Page " + (page + 1) + " / " + totalPages + "\u2026";

      var progress = g("fetchProgress");
      var statusEl = g("fetchStatus");
      if (progress) progress.style.width = (totalPages > 1 ? Math.round(((page) / totalPages) * 100) : 0) + "%";
      if (statusEl) statusEl.textContent = "Fetching page " + (page + 1) + " of " + totalPages + " (" + allRows.length + " records so far)";

      try {
        var r = await fetch(url, { signal: controller.signal });
        if (!r.ok) throw new Error("HTTP " + r.status + ": " + (await r.text()).substring(0, 200));
        var data = await r.json();

        if (page === 0) {
          totalPages = data.totalPages || 1;
          totalElements = data.totalElements || 0;
        }

        var content = data.content || [];
        allRows = allRows.concat(content);
        page++;

        if (content.length === 0) break;
      } catch (err) {
        if (err.name === "AbortError") return null;
        throw err;
      }
    }

    if (progress) progress.style.width = "100%";
    if (statusEl) statusEl.textContent = "Done \u2014 " + allRows.length + " total records loaded across " + totalPages + " pages";
    fetchAbort = null;

    return { content: allRows, totalElements: allRows.length, totalPages: 1, number: 0 };
  }

  /* ---- send request ----------------------------------------------------- */

  async function doSend() {
    if (!cur) return;
    updUrl();

    var isPaged = cur.paged;
    g("btnSend").disabled = true;
    g("statusText").textContent = "Loading\u2026";

    var progHtml = isPaged ? '<div class="fetch-status" id="fetchStatus">Starting\u2026</div><div class="progress-bar"><div class="progress-fill" id="fetchProgress"></div></div>' : '';
    g("respPretty").innerHTML = '<div class="loading"><div class="spinner"></div> Fetching\u2026</div>' + progHtml;

    var t0 = performance.now();
    try {
      var result;
      if (isPaged) {
        result = await fetchAllPages();
        if (!result) { g("btnSend").disabled = false; return; }
      } else {
        var url = BASE + buildUrl();
        var r = await fetch(url);
        var txt = await r.text();
        try { result = JSON.parse(txt); } catch (_) { result = txt; }
        if (!r.ok) throw new Error("HTTP " + r.status + ": " + (typeof result === "string" ? result : JSON.stringify(result)).substring(0, 300));
      }

      var ms = Math.round(performance.now() - t0);
      lastResp = result;
      var jsonStr = JSON.stringify(result, null, 2);
      var kb = (new Blob([jsonStr]).size / 1024).toFixed(1);

      g("respStatus").textContent = "200 OK";
      g("respStatus").className = "resp-badge s2";
      g("respTime").textContent = ms + "ms";
      g("respSize").textContent = kb + " KB";
      g("statusText").textContent = "Ready \u2014 " + (result.totalElements || (result.content ? result.content.length : "")) + " records";

      showTab("pretty");
      g("respPretty").innerHTML = hl(result);
      g("respRaw").textContent = jsonStr;
      buildTable(result);
      buildPag(result);
    } catch (err) {
      var ms2 = Math.round(performance.now() - t0);
      g("respStatus").textContent = "Error";
      g("respStatus").className = "resp-badge s5";
      g("respTime").textContent = ms2 + "ms";
      g("respSize").textContent = "";
      g("respPretty").innerHTML = '<div class="error">' + esc(err.message) + "</div>";
      g("statusText").textContent = "Error";
      lastResp = null;
    }
    g("btnSend").disabled = false;
  }

  /* ---- JSON syntax highlighting ----------------------------------------- */

  function hl(obj) {
    var s = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
    return s
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?/g, function (m) {
        if (/:\s*$/.test(m)) return '<span class="json-key">' + m.replace(/:\s*$/, "") + "</span>:";
        return '<span class="json-str">' + m + "</span>";
      })
      .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="json-num">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-bool">$1</span>')
      .replace(/\bnull\b/g, '<span class="json-null">null</span>');
  }

  /* ---- table view ------------------------------------------------------- */

  function buildTable(data) {
    var c = g("respTable"), rows = [];
    if (data && data.content && Array.isArray(data.content)) rows = data.content;
    else if (Array.isArray(data)) rows = data;
    else if (data && typeof data === "object") {
      var h = "<table><tr><th>Key</th><th>Value</th></tr>";
      Object.keys(data).forEach(function (k) {
        var v = data[k]; if (typeof v === "object" && v !== null) v = JSON.stringify(v);
        h += "<tr><td><strong>" + esc(k) + "</strong></td><td>" + esc(String(v)) + "</td></tr>";
      });
      c.innerHTML = h + "</table>"; return;
    }
    if (!rows.length) { c.innerHTML = '<p style="padding:14px;color:var(--muted)">No tabular data</p>'; return; }
    var keys = Object.keys(rows[0]).filter(function (k) { var v = rows[0][k]; return v === null || typeof v !== "object"; });
    var h = "<table><tr>"; keys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; }); h += "</tr>";
    rows.forEach(function (row) {
      h += "<tr>"; keys.forEach(function (k) { var v = row[k]; h += "<td>" + esc(v == null ? "" : String(v)) + "</td>"; }); h += "</tr>";
    });
    c.innerHTML = h + "</table>";
  }

  /* ---- tabs ------------------------------------------------------------- */

  function showTab(t) {
    var m = {pretty:"respPretty", raw:"respRaw", table:"respTable"};
    Object.keys(m).forEach(function (k) { var e = g(m[k]); if (e) { if (k === t) e.classList.remove("hidden"); else e.classList.add("hidden"); } });
    document.querySelectorAll(".resp-tabs .tab").forEach(function (b) { b.classList.toggle("active", b.textContent.toLowerCase() === t); });
  }

  /* ---- pagination (client-side for all-loaded data) --------------------- */

  var clientPage = 0, clientPageSize = 50;

  function buildPag(data) {
    var p = g("epPag");
    if (!data || !data.content || !data.content.length) { p.innerHTML = ""; return; }
    var total = data.content.length;
    var tp = Math.ceil(total / clientPageSize);
    if (tp <= 1) { p.innerHTML = '<span class="pg">' + total + " records</span>"; return; }
    clientPage = 0;
    renderClientPage(data.content, tp);
  }

  function renderClientPage(rows, tp) {
    var p = g("epPag");
    var start = clientPage * clientPageSize;
    var pageRows = rows.slice(start, start + clientPageSize);

    var keys = Object.keys(rows[0]).filter(function (k) { var v = rows[0][k]; return v === null || typeof v !== "object"; });
    var h = "<table><tr>"; keys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; }); h += "</tr>";
    pageRows.forEach(function (row) {
      h += "<tr>"; keys.forEach(function (k) { var v = row[k]; h += "<td>" + esc(v == null ? "" : String(v)) + "</td>"; }); h += "</tr>";
    });
    g("respTable").innerHTML = h + "</table>";

    p.innerHTML =
      '<button ' + (clientPage <= 0 ? "disabled" : "") + ' onclick="EP.prevPage()">Prev</button>' +
      '<span class="pg">Page ' + (clientPage + 1) + " / " + tp + " \u00b7 " + rows.length + " total</span>" +
      '<button ' + (clientPage >= tp - 1 ? "disabled" : "") + ' onclick="EP.nextPage()">Next</button>';
  }

  function prevPage() {
    if (!lastResp || !lastResp.content) return;
    clientPage = Math.max(0, clientPage - 1);
    renderClientPage(lastResp.content, Math.ceil(lastResp.content.length / clientPageSize));
  }
  function nextPage() {
    if (!lastResp || !lastResp.content) return;
    var tp = Math.ceil(lastResp.content.length / clientPageSize);
    clientPage = Math.min(tp - 1, clientPage + 1);
    renderClientPage(lastResp.content, tp);
  }

  /* ---- copy / export ---------------------------------------------------- */

  function cp(text, msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); }
    toast(msg);
  }

  function exportCsv() {
    if (!lastResp) return toast("No data");
    var rows = lastResp.content || (Array.isArray(lastResp) ? lastResp : [lastResp]);
    if (!rows.length) return toast("No rows");
    var ak = {};
    rows.forEach(function (r) { Object.keys(r).forEach(function (k) { if (typeof r[k] !== "object" || r[k] === null) ak[k] = true; }); });
    var keys = Object.keys(ak);
    var csv = keys.join(",") + "\n";
    rows.forEach(function (r) {
      csv += keys.map(function (k) { var v = r[k]; if (v == null) return ""; return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",") + "\n";
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
    a.download = (cur ? cur.id : "data") + ".csv"; a.click();
    toast("CSV exported \u2014 " + rows.length + " rows");
  }

  /* ---- dashboard -------------------------------------------------------- */

  async function loadDashboard() {
    var sid = g("shopSelect").value; if (!sid) return;
    var stats = g("dashStats");
    stats.innerHTML = '<div class="loading" style="grid-column:1/-1"><div class="spinner"></div></div>';

    var items = [
      {key:"customers",label:"Customers",url:"/api/customers?shop_id="+sid+"&size=1"},
      {key:"vehicles",label:"Vehicles",url:"/api/vehicles?shop_id="+sid+"&size=1"},
      {key:"repair-orders",label:"Repair Orders",url:"/api/repair-orders?shop_id="+sid+"&size=5&sortDirection=DESC"},
      {key:"jobs",label:"Jobs",url:"/api/jobs?shop_id="+sid+"&size=1"},
      {key:"appointments",label:"Appointments",url:"/api/appointments?shop_id="+sid+"&size=5&sortDirection=DESC"},
      {key:"employees",label:"Employees",url:"/api/employees?shop_id="+sid+"&size=1"},
      {key:"canned-jobs",label:"Canned Jobs",url:"/api/canned-jobs?shop_id="+sid+"&size=1"},
      {key:"inventory",label:"Inventory",url:"/api/inventory?shop_id="+sid+"&size=1&partTypeId=1"}
    ];

    var res = await Promise.allSettled(items.map(function (i) { return fetch(BASE + i.url).then(function (r) { return r.json(); }); }));

    var h = "";
    items.forEach(function (item, i) {
      var r = res[i], cnt = r.status === "fulfilled" && r.value ? (r.value.totalElements != null ? r.value.totalElements : "?") : "\u2014";
      h += '<div class="stat-card" onclick="EP.go(\'' + item.key + '\')"><div class="label">' + item.label + '</div><div class="value">' + cnt + '</div><div class="sub">Click to explore</div></div>';
    });
    stats.innerHTML = h;

    dashTbl("dashRO", res[2], function (r) {
      return "<td>" + (r.repairOrderNumber || r.id) + "</td><td>" + esc(r.repairOrderStatus ? r.repairOrderStatus.name : "") + "</td><td>" + fmtD(r.createdDate) + "</td><td>" + fmtC(r.totalSales) + "</td>";
    }, ["RO #","Status","Created","Total"]);

    dashTbl("dashAppt", res[4], function (a) {
      return "<td>" + a.id + "</td><td>" + fmtDt(a.startTime) + "</td><td>" + esc(a.appointmentStatus) + "</td><td>" + esc((a.description||"").substring(0,40)) + "</td>";
    }, ["ID","Start","Status","Description"]);

    g("statusText").textContent = "Ready";
  }

  function dashTbl(id, result, rowFn, headers) {
    var c = g(id);
    if (!result || result.status !== "fulfilled" || !result.value || !result.value.content || !result.value.content.length) {
      c.innerHTML = '<p style="padding:14px;color:var(--muted)">No data</p>'; return;
    }
    var h = "<table><tr>"; headers.forEach(function (hd) { h += "<th>" + hd + "</th>"; }); h += "</tr>";
    result.value.content.forEach(function (row) { h += "<tr>" + rowFn(row) + "</tr>"; });
    c.innerHTML = h + "</table>";
  }

  /* ---- helpers ---------------------------------------------------------- */

  function esc(s) { return s != null ? String(s).replace(/</g, "&lt;") : "\u2014"; }
  function fmtD(v) { return v ? new Date(v).toLocaleDateString() : "\u2014"; }
  function fmtDt(v) { if (!v) return "\u2014"; var d = new Date(v); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
  function fmtC(v) { return v != null ? "$" + (v / 100).toFixed(2) : "\u2014"; }

  function clearResp() {
    g("respPretty").innerHTML = '<span class="placeholder">Press Enter or click Send to fetch data</span>';
    g("respRaw").textContent = ""; g("respTable").innerHTML = "";
    g("respStatus").textContent = ""; g("respStatus").className = "resp-badge";
    g("respTime").textContent = ""; g("respSize").textContent = "";
    g("epPag").innerHTML = ""; lastResp = null; allRows = [];
  }

  function toast(msg) { var t = g("toast"); t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 2000); }

  /* ---- mobile ----------------------------------------------------------- */

  var sidebar = document.querySelector(".sidebar"), overlay = document.querySelector(".sidebar-overlay"), burger = document.querySelector(".hamburger");
  function closeSidebar() { if (sidebar) sidebar.classList.remove("open"); if (overlay) overlay.classList.remove("show"); }
  if (burger) burger.addEventListener("click", function () { sidebar.classList.add("open"); overlay.classList.add("show"); });
  if (overlay) overlay.addEventListener("click", closeSidebar);

  /* ---- topbar ---- */

  g("shopSelect").addEventListener("change", function () {
    var sp = g("p_shop_id"); if (sp) sp.value = this.value;
    updUrl();
    var active = document.querySelector(".page.active");
    if (active && active.id === "page-dashboard") loadDashboard();
  });

  /* ---- boot ------------------------------------------------------------- */

  (async function () {
    try { var r = await fetch(BASE + "/api/shops"); var d = await r.json(); shops = d.shops || []; } catch (e) { shops = []; }
    var sel = g("shopSelect"); sel.innerHTML = "";
    if (!shops.length) sel.innerHTML = '<option value="">No shops</option>';
    else shops.forEach(function (s) { var o = document.createElement("option"); o.value = s.shop_id; o.textContent = s.name + " (" + s.shop_id + ")"; sel.appendChild(o); });
    goTo("dashboard");
  })();

  /* ---- public API ------------------------------------------------------- */

  window.EP = {
    go: goTo,
    send: doSend,
    onKey: onKeyDown,
    updUrl: updUrl,
    copyUrl: function () { cp(BASE + buildUrl(), "URL copied"); },
    copyCurl: function () { cp("curl -X GET '" + BASE + buildUrl() + "'", "cURL copied"); },
    copyJson: function () { if (!lastResp) return toast("No data"); cp(JSON.stringify(lastResp, null, 2), "JSON copied"); },
    exportCsv: exportCsv,
    toggleWrap: function () { g("respPretty").classList.toggle("wrap"); g("respRaw").classList.toggle("wrap"); },
    tab: showTab,
    prevPage: prevPage,
    nextPage: nextPage
  };

})();
