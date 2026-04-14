/* =====================================================================
   Tekmetric API Explorer v3 — Live Search, Full Endpoint Control
   ===================================================================== */
(function () {
  "use strict";

  var BASE = (window.API_BASE || "").replace(/\/+$/, "");
  var g = function (id) { return document.getElementById(id); };

  /* ---- endpoint definitions --------------------------------------------- */

  var EP = [
    { id:"customers", name:"Customers", path:"/api/customers",
      desc:"Returns a list of all customers filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Name, email, or phone",live:1},
        {k:"customerTypeId",l:"Customer Type",t:"sel",o:[["","All"],["1","Person"],["2","Business"]]},
        {k:"okForMarketing",l:"OK for Marketing",t:"sel",o:[["","Any"],["true","Yes"],["false","No"]]},
        {k:"eligibleForAccountsReceivable",l:"AR Eligible",t:"sel",o:[["","Any"],["true","Yes"],["false","No"]]},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"deletedDateStart",l:"Deleted From",t:"date"},{k:"deletedDateEnd",l:"Deleted To",t:"date"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["lastName","Last Name"],["firstName","First Name"],["email","Email"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0",hint:"0-indexed"}
      ]},
    { id:"customer-detail", name:"Customer", path:"/api/customers/{id}",
      desc:"Returns a customer by ID.",
      params:[{k:"id",l:"Customer ID",t:"num",req:1,pp:1}]},
    { id:"customer-search", name:"Cross-Shop Search", path:"/api/customer/search",
      desc:"Searches across all configured shop locations simultaneously by email or phone.",
      params:[
        {k:"email",l:"Email",t:"text",hint:"customer@email.com",live:1},
        {k:"phone",l:"Phone",t:"text",hint:"555-123-4567",live:1}
      ]},
    { id:"vehicles", name:"Vehicles", path:"/api/vehicles",
      desc:"Returns a list of all vehicles filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Year, make, model",live:1},
        {k:"customerId",l:"Customer ID",t:"num"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"deletedDateStart",l:"Deleted From",t:"date"},{k:"deletedDateEnd",l:"Deleted To",t:"date"},
        {k:"sort",l:"Sort By",t:"text",hint:"Field name"},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0"}
      ]},
    { id:"vehicle-detail", name:"Vehicle", path:"/api/vehicles/{id}",
      desc:"Returns a vehicle by ID.",
      params:[{k:"id",l:"Vehicle ID",t:"num",req:1,pp:1}]},
    { id:"repair-orders", name:"Repair Orders", path:"/api/repair-orders",
      desc:"Returns a list of all repair orders filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"RO #, customer name, vehicle info",live:1},
        {k:"customerId",l:"Customer ID",t:"num"},
        {k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"repairOrderNumber",l:"RO Number",t:"num"},
        {k:"repairOrderStatusId",l:"Status",t:"sel",o:[["","All"],["1","Estimate"],["2","Work-in-Progress"],["3","Complete"],["4","Saved for Later"],["5","Posted"],["6","Accounts Receivable"],["7","Deleted"]]},
        {k:"start",l:"Created From",t:"date"},{k:"end",l:"Created To",t:"date"},
        {k:"postedDateStart",l:"Posted From",t:"date"},{k:"postedDateEnd",l:"Posted To",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"deletedDateStart",l:"Deleted From",t:"date"},{k:"deletedDateEnd",l:"Deleted To",t:"date"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["createdDate","Created Date"],["repairOrderNumber","RO Number"],["customer.firstName","First Name"],["customer.lastName","Last Name"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0"}
      ]},
    { id:"ro-detail", name:"Repair Order", path:"/api/repair-orders/{id}",
      desc:"Returns a repair order by ID with full jobs, sublets, fees, discounts, and customer concerns.",
      params:[{k:"id",l:"Repair Order ID",t:"num",req:1,pp:1}]},
    { id:"jobs", name:"Jobs", path:"/api/jobs",
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
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0"}
      ]},
    { id:"job-detail", name:"Job", path:"/api/jobs/{id}",
      desc:"Returns a job by ID with labor, parts, fees, and discounts.",
      params:[{k:"id",l:"Job ID",t:"num",req:1,pp:1}]},
    { id:"canned-jobs", name:"Canned Jobs", path:"/api/canned-jobs",
      desc:"Returns a list of all canned (template) jobs filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Job name",live:1},
        {k:"categories",l:"Categories",t:"text",hint:"Category codes, comma-sep"},
        {k:"rates",l:"Labor Rates",t:"text",hint:"In cents, comma-sep"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["jobCategory","Category"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0"}
      ]},
    { id:"appointments", name:"Appointments", path:"/api/appointments",
      desc:"Returns a list of all appointments filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"customerId",l:"Customer ID",t:"num"},
        {k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"start",l:"Start Date",t:"date"},{k:"end",l:"End Date",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"includeDeleted",l:"Include Deleted",t:"sel",o:[["true","Yes"],["false","No"]],d:"true"},
        {k:"sort",l:"Sort By",t:"text",hint:"Field name"},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0"}
      ]},
    { id:"appt-detail", name:"Appointment", path:"/api/appointments/{id}",
      desc:"Returns an appointment by ID.",
      params:[{k:"id",l:"Appointment ID",t:"num",req:1,pp:1}]},
    { id:"employees", name:"Employees", path:"/api/employees",
      desc:"Returns a list of all employees filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Employee name",live:1},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"sort",l:"Sort By",t:"text",hint:"Field name"},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0"}
      ]},
    { id:"emp-detail", name:"Employee", path:"/api/employees/{id}",
      desc:"Returns an employee by ID.",
      params:[{k:"id",l:"Employee ID",t:"num",req:1,pp:1}]},
    { id:"inventory", name:"Inventory", path:"/api/inventory",
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
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"},
        {k:"page",l:"Page",t:"num",d:"0"}
      ]},
    { id:"shops-config", name:"Shops (Config)", path:"/api/shops",
      desc:"List all configured shop locations from server environment.",params:[]},
    { id:"shops-tek", name:"Shops (Tekmetric)", path:"/api/shops/tekmetric",
      desc:"Fetch raw shop data directly from the Tekmetric API.",params:[]},
    { id:"shop-detail", name:"Shop", path:"/api/shops/{id}",
      desc:"Returns a shop by ID from the Tekmetric API.",
      params:[{k:"id",l:"Shop ID",t:"num",req:1,pp:1}]}
  ];

  /* ---- state ------------------------------------------------------------ */

  var cur = null, lastResp = null, shops = [], debounceTimer = null;

  /* ---- sidebar click ---------------------------------------------------- */

  document.querySelector(".side-nav").addEventListener("click", function (e) {
    var a = e.target.closest("a[data-ep]");
    if (!a) return;
    e.preventDefault();
    goTo(a.getAttribute("data-ep"));
  });

  /* ---- navigation ------------------------------------------------------- */

  function goTo(id) {
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

    var ep = EP.find(function (e) { return e.id === id; });
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

      var ev = p.live ? ' oninput="EP.live()"' : ' onchange="EP.updUrl()"';

      if (p.t === "shop") {
        h += '<select id="p_' + p.k + '"' + ev + ">";
        shops.forEach(function (s) { h += '<option value="' + s.shop_id + '">' + s.name + " (" + s.shop_id + ")</option>"; });
        h += "</select>";
      } else if (p.t === "sel") {
        h += '<select id="p_' + p.k + '"' + ev + ">";
        (p.o || []).forEach(function (o) {
          h += '<option value="' + o[0] + '"' + (p.d === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
        });
        h += "</select>";
      } else if (p.t === "date") {
        h += '<input type="date" id="p_' + p.k + '"' + ev + ">";
      } else if (p.t === "num") {
        h += '<input type="number" id="p_' + p.k + '" value="' + (p.d || "") + '"' + ev + ">";
      } else {
        h += '<input type="text" id="p_' + p.k + '" placeholder="' + (p.hint || "") + '"' + ev + ">";
      }
      if (p.hint) h += '<span class="hint">' + p.hint + "</span>";
      h += "</div>";
    });
    grid.innerHTML = h;

    var sp = g("p_shop_id");
    if (sp) sp.value = g("shopSelect").value;
  }

  /* ---- URL builder ------------------------------------------------------ */

  function buildUrl() {
    if (!cur) return "";
    var path = cur.path, qp = [];
    cur.params.forEach(function (p) {
      var el = g("p_" + p.k);
      if (!el) return;
      var v = el.value;
      if (v === "" || v == null) return;
      if (p.pp) path = path.replace("{id}", v);
      else qp.push(encodeURIComponent(p.k) + "=" + encodeURIComponent(v));
    });
    return path + (qp.length ? "?" + qp.join("&") : "");
  }

  function updUrl() {
    var el = g("urlPreview");
    if (el) el.textContent = BASE + buildUrl();
  }

  /* ---- live search (debounced) ------------------------------------------ */

  function liveSearch() {
    updUrl();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () { doSend(); }, 400);
  }

  /* ---- send request ----------------------------------------------------- */

  async function doSend(page) {
    if (!cur) return;
    if (page !== undefined) {
      var pe = g("p_page");
      if (pe) pe.value = page;
      updUrl();
    }

    var url = buildUrl(), full = BASE + url;
    g("statusText").textContent = "Loading\u2026";
    g("btnSend").disabled = true;
    g("respPretty").innerHTML = '<div class="loading"><div class="spinner"></div> Fetching\u2026</div>';

    var t0 = performance.now();
    try {
      var r = await fetch(full);
      var ms = Math.round(performance.now() - t0);
      var txt = await r.text();
      var kb = (new Blob([txt]).size / 1024).toFixed(1);

      try { lastResp = JSON.parse(txt); } catch (_) { lastResp = txt; }

      var sc = String(r.status)[0];
      g("respStatus").textContent = r.status + " " + r.statusText;
      g("respStatus").className = "resp-badge s" + sc;
      g("respTime").textContent = ms + "ms";
      g("respSize").textContent = kb + " KB";
      g("statusText").textContent = "Ready";

      showTab("pretty");
      g("respPretty").innerHTML = hl(lastResp);
      g("respRaw").textContent = txt;
      buildTable(lastResp);
      buildPag(lastResp);
    } catch (err) {
      g("respStatus").textContent = "Error";
      g("respStatus").className = "resp-badge s5";
      g("respTime").textContent = Math.round(performance.now() - t0) + "ms";
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
        var v = data[k];
        if (typeof v === "object" && v !== null) v = JSON.stringify(v);
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
    Object.keys(m).forEach(function (k) {
      var e = g(m[k]); if (e) { if (k === t) e.classList.remove("hidden"); else e.classList.add("hidden"); }
    });
    document.querySelectorAll(".resp-tabs .tab").forEach(function (b) { b.classList.toggle("active", b.textContent.toLowerCase() === t); });
  }

  /* ---- pagination ------------------------------------------------------- */

  function buildPag(data) {
    var p = g("epPag");
    if (!data || data.totalPages === undefined) { p.innerHTML = ""; return; }
    var pg = data.number || 0, tp = data.totalPages || 1;
    p.innerHTML =
      '<button ' + (pg <= 0 ? "disabled" : "") + ' onclick="EP.send(' + (pg - 1) + ')">Prev</button>' +
      '<span class="pg">Page ' + (pg + 1) + " / " + tp + " \u00b7 " + (data.totalElements || 0) + " total</span>" +
      '<button ' + (pg >= tp - 1 ? "disabled" : "") + ' onclick="EP.send(' + (pg + 1) + ')">Next</button>';
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
    toast("CSV exported");
  }

  /* ---- dashboard -------------------------------------------------------- */

  async function loadDashboard() {
    var sid = g("shopSelect").value;
    if (!sid) return;
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

    dashTable("dashRO", res[2], function (r) {
      return "<td>" + (r.repairOrderNumber || r.id) + "</td><td>" + esc(r.repairOrderStatus ? r.repairOrderStatus.name : "") + "</td><td>" + fmtD(r.createdDate) + "</td><td>" + fmtC(r.totalSales) + "</td>";
    }, ["RO #","Status","Created","Total"]);

    dashTable("dashAppt", res[4], function (a) {
      return "<td>" + a.id + "</td><td>" + fmtDt(a.startTime) + "</td><td>" + esc(a.appointmentStatus) + "</td><td>" + esc((a.description||"").substring(0,40)) + "</td>";
    }, ["ID","Start","Status","Description"]);

    g("statusText").textContent = "Ready";
  }

  function dashTable(id, result, rowFn, headers) {
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
    g("respPretty").innerHTML = '<span class="placeholder">Send a request to see the response</span>';
    g("respRaw").textContent = ""; g("respTable").innerHTML = "";
    g("respStatus").textContent = ""; g("respStatus").className = "resp-badge";
    g("respTime").textContent = ""; g("respSize").textContent = "";
    g("epPag").innerHTML = ""; lastResp = null;
  }

  function toast(msg) { var t = g("toast"); t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 2000); }

  /* ---- mobile ----------------------------------------------------------- */

  var sidebar = document.querySelector(".sidebar"), overlay = document.querySelector(".sidebar-overlay"), burger = document.querySelector(".hamburger");
  function closeSidebar() { if (sidebar) sidebar.classList.remove("open"); if (overlay) overlay.classList.remove("show"); }
  if (burger) burger.addEventListener("click", function () { sidebar.classList.add("open"); overlay.classList.add("show"); });
  if (overlay) overlay.addEventListener("click", closeSidebar);

  /* ---- topbar shop change ----------------------------------------------- */

  g("shopSelect").addEventListener("change", function () {
    var sp = g("p_shop_id");
    if (sp) sp.value = this.value;
    updUrl();
    var active = document.querySelector(".page.active");
    if (active && active.id === "page-dashboard") loadDashboard();
  });

  /* ---- boot ------------------------------------------------------------- */

  (async function () {
    try {
      var r = await fetch(BASE + "/api/shops");
      var d = await r.json();
      shops = d.shops || [];
    } catch (e) { shops = []; }

    var sel = g("shopSelect"); sel.innerHTML = "";
    if (!shops.length) { sel.innerHTML = '<option value="">No shops</option>'; }
    else shops.forEach(function (s) { var o = document.createElement("option"); o.value = s.shop_id; o.textContent = s.name + " (" + s.shop_id + ")"; sel.appendChild(o); });

    goTo("dashboard");
  })();

  /* ---- public API ------------------------------------------------------- */

  window.EP = {
    go: goTo,
    send: doSend,
    live: liveSearch,
    updUrl: updUrl,
    copyUrl: function () { cp(BASE + buildUrl(), "URL copied"); },
    copyCurl: function () { cp("curl -X GET '" + BASE + buildUrl() + "'", "cURL copied"); },
    copyJson: function () { if (!lastResp) return toast("No data"); cp(JSON.stringify(lastResp, null, 2), "JSON copied"); },
    exportCsv: exportCsv,
    toggleWrap: function () { g("respPretty").classList.toggle("wrap"); g("respRaw").classList.toggle("wrap"); },
    tab: showTab
  };

})();
