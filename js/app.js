/* =====================================================================
   Tekmetric API Explorer v5
   - Show first page instantly, paginate server-side
   - No live search: Enter or Send only
   ===================================================================== */
(function () {
  "use strict";

  var BASE = (window.API_BASE || "").replace(/\/+$/, "");
  var g = function (id) { return document.getElementById(id); };

  /* ---- endpoints -------------------------------------------------------- */

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
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"customer-detail", name:"Customer", path:"/api/customers/{id}",
      desc:"Returns a customer by ID.",
      params:[{k:"id",l:"Customer ID",t:"num",req:1,pp:1}]},
    { id:"customer-search", name:"Cross-Shop Search", path:"/api/customer/search",
      desc:"Searches across all shop locations by email or phone.",
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
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"vehicle-detail", name:"Vehicle", path:"/api/vehicles/{id}",
      desc:"Returns a vehicle by ID.",
      params:[{k:"id",l:"Vehicle ID",t:"num",req:1,pp:1}]},
    { id:"repair-orders", name:"Repair Orders", path:"/api/repair-orders", paged:1,
      desc:"Returns a list of all repair orders filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"RO #, customer name, vehicle info"},
        {k:"customerId",l:"Customer ID",t:"num"},{k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"repairOrderNumber",l:"RO Number",t:"num"},
        {k:"repairOrderStatusId",l:"Status",t:"sel",o:[["","All"],["1","Estimate"],["2","WIP"],["3","Complete"],["4","Saved"],["5","Posted"],["6","Accts Recv"],["7","Deleted"]]},
        {k:"start",l:"Created From",t:"date"},{k:"end",l:"Created To",t:"date"},
        {k:"postedDateStart",l:"Posted From",t:"date"},{k:"postedDateEnd",l:"Posted To",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"deletedDateStart",l:"Deleted From",t:"date"},{k:"deletedDateEnd",l:"Deleted To",t:"date"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["createdDate","Created Date"],["repairOrderNumber","RO #"],["customer.firstName","First Name"],["customer.lastName","Last Name"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"ro-detail", name:"Repair Order", path:"/api/repair-orders/{id}",
      desc:"Returns a repair order by ID with jobs, sublets, fees, discounts.",
      params:[{k:"id",l:"RO ID",t:"num",req:1,pp:1}]},
    { id:"jobs", name:"Jobs", path:"/api/jobs", paged:1,
      desc:"Returns a list of all jobs filtered by the provided search parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"repairOrderId",l:"Repair Order ID",t:"num"},{k:"customerId",l:"Customer ID",t:"num"},{k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"authorized",l:"Authorized",t:"sel",o:[["","All"],["true","Yes"],["false","No"]]},
        {k:"authorizedDateStart",l:"Auth From",t:"date"},{k:"authorizedDateEnd",l:"Auth To",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"repairOrderStatusId",l:"RO Status",t:"sel",o:[["","All"],["1","Estimate"],["2","WIP"],["3","Complete"],["4","Saved"],["5","Posted"],["6","Accts Recv"]]},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["authorizedDate","Auth Date"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"job-detail", name:"Job", path:"/api/jobs/{id}",
      desc:"Returns a job by ID with labor, parts, fees, discounts.",
      params:[{k:"id",l:"Job ID",t:"num",req:1,pp:1}]},
    { id:"canned-jobs", name:"Canned Jobs", path:"/api/canned-jobs", paged:1,
      desc:"Returns canned (template) jobs.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Job name"},
        {k:"categories",l:"Categories",t:"text",hint:"Codes, comma-sep"},
        {k:"rates",l:"Labor Rates",t:"text",hint:"Cents, comma-sep"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["jobCategory","Category"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"appointments", name:"Appointments", path:"/api/appointments", paged:1,
      desc:"Returns appointments filtered by parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"customerId",l:"Customer ID",t:"num"},{k:"vehicleId",l:"Vehicle ID",t:"num"},
        {k:"start",l:"Start Date",t:"date"},{k:"end",l:"End Date",t:"date"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"includeDeleted",l:"Incl. Deleted",t:"sel",o:[["true","Yes"],["false","No"]],d:"true"},
        {k:"sort",l:"Sort By",t:"text"},{k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"appt-detail", name:"Appointment", path:"/api/appointments/{id}",
      desc:"Returns an appointment by ID.",
      params:[{k:"id",l:"Appointment ID",t:"num",req:1,pp:1}]},
    { id:"employees", name:"Employees", path:"/api/employees", paged:1,
      desc:"Returns employees filtered by parameters.",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"search",l:"Search",t:"text",hint:"Name"},
        {k:"updatedDateStart",l:"Updated From",t:"date"},{k:"updatedDateEnd",l:"Updated To",t:"date"},
        {k:"sort",l:"Sort By",t:"text"},{k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"emp-detail", name:"Employee", path:"/api/employees/{id}",
      desc:"Returns an employee by ID.",
      params:[{k:"id",l:"Employee ID",t:"num",req:1,pp:1}]},
    { id:"inventory", name:"Inventory", path:"/api/inventory", paged:1,
      desc:"Returns inventory parts. (Beta)",
      params:[
        {k:"shop_id",l:"Shop",t:"shop",req:1},
        {k:"partTypeId",l:"Part Type",t:"sel",o:[["1","Parts"],["2","Tires"],["5","Batteries"]],d:"1"},
        {k:"partNumbers",l:"Part #",t:"text",hint:"Exact, comma-sep"},
        {k:"width",l:"Width",t:"text",hint:"Tires"},{k:"ratio",l:"Ratio",t:"text",hint:"Tires"},
        {k:"diameter",l:"Diameter",t:"text",hint:"Tires"},{k:"tireSize",l:"Tire Size",t:"text"},
        {k:"sort",l:"Sort By",t:"sel",o:[["","Default"],["id","ID"],["name","Name"],["brand","Brand"],["partNumber","Part #"]]},
        {k:"sortDirection",l:"Direction",t:"sel",o:[["","Default"],["ASC","Ascending"],["DESC","Descending"]]},
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"100"}
      ]},
    { id:"shops-config", name:"Shops (Config)", path:"/api/shops", desc:"Configured shop locations.", params:[]},
    { id:"shops-tek", name:"Shops (Tekmetric)", path:"/api/shops/tekmetric", desc:"Raw shop data from Tekmetric API.", params:[]},
    { id:"shop-detail", name:"Shop", path:"/api/shops/{id}", desc:"Shop by ID.", params:[{k:"id",l:"Shop ID",t:"num",req:1,pp:1}]}
  ];

  /* ---- state ------------------------------------------------------------ */

  var cur = null, lastResp = null, shops = [], curPage = 0;

  /* ---- sidebar ---------------------------------------------------------- */

  document.querySelector(".side-nav").addEventListener("click", function (e) {
    var a = e.target.closest("a[data-ep]"); if (!a) return;
    e.preventDefault(); goTo(a.getAttribute("data-ep"));
  });

  function goTo(id) {
    document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
    document.querySelectorAll(".side-nav a").forEach(function (a) { a.classList.remove("active"); });
    var link = document.querySelector('[data-ep="' + id + '"]');
    if (link) link.classList.add("active");
    closeSidebar();

    if (id === "dashboard") { g("page-dashboard").classList.add("active"); loadDashboard(); return; }
    var ep = ENDPOINTS.find(function (e) { return e.id === id; });
    if (!ep) return;
    cur = ep; curPage = 0;
    g("page-explorer").classList.add("active");
    g("epTitle").textContent = ep.name;
    g("epDesc").textContent = ep.desc;
    buildParams(ep); updUrl(); clearResp();
  }

  /* ---- params ----------------------------------------------------------- */

  function buildParams(ep) {
    var grid = g("paramGrid");
    if (!ep.params.length) {
      grid.innerHTML = '<div class="param-item" style="grid-column:1/-1;text-align:center;padding:18px;color:var(--muted)">No parameters \u2014 click Send</div>';
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
        (p.o || []).forEach(function (o) { h += '<option value="' + o[0] + '"' + (p.d === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; });
        h += "</select>";
      } else if (p.t === "date") {
        h += '<input type="date" id="p_' + p.k + '" onchange="EP.updUrl()">';
      } else if (p.t === "num") {
        h += '<input type="number" id="p_' + p.k + '" value="' + (p.d || "") + '" onkeydown="EP.key(event)">';
      } else {
        h += '<input type="text" id="p_' + p.k + '" placeholder="' + (p.hint || "") + '" onkeydown="EP.key(event)">';
      }
      if (p.hint) h += '<span class="hint">' + p.hint + "</span>";
      h += "</div>";
    });
    grid.innerHTML = h;
    var sp = g("p_shop_id"); if (sp) sp.value = g("shopSelect").value;
  }

  function onKey(e) { if (e.key === "Enter") { e.preventDefault(); doSend(0); } else { setTimeout(updUrl, 0); } }

  /* ---- url -------------------------------------------------------------- */

  function buildUrl(page) {
    if (!cur) return "";
    var path = cur.path, qp = [];
    cur.params.forEach(function (p) {
      var el = g("p_" + p.k); if (!el) return;
      var v = el.value; if (v === "" || v == null) return;
      if (p.pp) path = path.replace("{id}", v);
      else qp.push(encodeURIComponent(p.k) + "=" + encodeURIComponent(v));
    });
    if (cur.paged) qp.push("page=" + (page != null ? page : curPage));
    return path + (qp.length ? "?" + qp.join("&") : "");
  }

  function updUrl() { var el = g("urlPreview"); if (el) el.textContent = BASE + buildUrl(); }

  /* ---- fetch one page (instant) ----------------------------------------- */

  async function doSend(page) {
    if (!cur) return;
    if (page != null) curPage = page;
    updUrl();

    var full = BASE + buildUrl(curPage);
    g("btnSend").disabled = true;
    g("statusText").textContent = "Loading\u2026";
    g("respPretty").innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    var t0 = performance.now();
    try {
      var r = await fetch(full);
      var ms = Math.round(performance.now() - t0);
      var txt = await r.text();
      var kb = (new Blob([txt]).size / 1024).toFixed(1);

      if (!r.ok) throw new Error("HTTP " + r.status + ": " + txt.substring(0, 300));
      try { lastResp = JSON.parse(txt); } catch (_) { lastResp = txt; }

      g("respStatus").textContent = r.status + " " + r.statusText;
      g("respStatus").className = "resp-badge s" + String(r.status)[0];
      g("respTime").textContent = ms + "ms";
      g("respSize").textContent = kb + " KB";

      var total = lastResp.totalElements;
      var pageInfo = lastResp.totalPages ? " \u00b7 Page " + ((lastResp.number || 0) + 1) + "/" + lastResp.totalPages : "";
      g("statusText").textContent = (total != null ? total + " total" : "Ready") + pageInfo;

      showTab("pretty");
      g("respPretty").innerHTML = hl(lastResp);
      g("respRaw").textContent = typeof lastResp === "string" ? lastResp : JSON.stringify(lastResp, null, 2);
      buildTable(lastResp);
      buildPag(lastResp);
    } catch (err) {
      g("respStatus").textContent = "Error";
      g("respStatus").className = "resp-badge s5";
      g("respTime").textContent = Math.round(performance.now() - t0) + "ms";
      g("respPretty").innerHTML = '<div class="error">' + esc(err.message) + "</div>";
      g("statusText").textContent = "Error";
      lastResp = null;
    }
    g("btnSend").disabled = false;
  }

  /* ---- fetch ALL pages (for CSV export) --------------------------------- */

  async function fetchAllForExport() {
    if (!cur || !cur.paged || !lastResp) return toast("Send a request first");
    var tp = lastResp.totalPages || 1;
    var total = lastResp.totalElements || 0;
    if (tp <= 1) return doExport(lastResp.content || []);

    if (!confirm("This will fetch all " + total + " records across " + tp + " pages.\nContinue?")) return;

    toast("Fetching all " + tp + " pages\u2026");
    g("statusText").textContent = "Exporting\u2026 0/" + tp;

    var all = [];
    for (var p = 0; p < tp; p++) {
      g("statusText").textContent = "Exporting\u2026 " + (p + 1) + "/" + tp;
      try {
        var r = await fetch(BASE + buildUrl(p));
        var d = await r.json();
        all = all.concat(d.content || []);
      } catch (e) { toast("Error on page " + (p + 1)); break; }
    }
    g("statusText").textContent = "Exported " + all.length + " records";
    doExport(all);
  }

  function flattenRow(r) {
    var out = {};
    Object.keys(r).forEach(function (k) {
      var v = r[k];
      if (v === null || v === undefined) { out[k] = ""; return; }
      if (Array.isArray(v)) {
        if (v.length === 0) { out[k] = ""; return; }
        if (typeof v[0] !== "object") { out[k] = v.join("; "); return; }
        v.forEach(function (item, i) {
          Object.keys(item).forEach(function (ik) {
            var val = item[ik];
            if (val !== null && typeof val === "object") val = JSON.stringify(val);
            out[k + "_" + (i + 1) + "_" + ik] = val == null ? "" : val;
          });
        });
        out[k + "_count"] = v.length;
        return;
      }
      if (typeof v === "object") { out[k] = JSON.stringify(v); return; }
      out[k] = v;
    });
    return out;
  }

  function doExport(rows) {
    if (!rows.length) return toast("No data");
    var flat = rows.map(flattenRow);
    var ak = {};
    flat.forEach(function (r) { Object.keys(r).forEach(function (k) { ak[k] = true; }); });
    var keys = Object.keys(ak);
    var csv = keys.map(function (k) { return '"' + k.replace(/"/g, '""') + '"'; }).join(",") + "\n";
    flat.forEach(function (r) {
      csv += keys.map(function (k) { var v = r[k]; if (v == null) return ""; return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",") + "\n";
    });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
    a.download = (cur ? cur.id : "data") + ".csv"; a.click();
    toast("Exported " + rows.length + " rows");
  }

  /* ---- JSON highlight --------------------------------------------------- */

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

  /* ---- smart table ------------------------------------------------------ */

  var CENTS_FIELDS = ["cost","retail","rate","totalSales","laborSales","partsSales","subletSales",
    "discountTotal","feeTotal","taxes","amountPaid","partsTotal","laborTotal","subtotal",
    "totalCost","price","total","creditLimit"];
  var DATE_FIELDS = ["createdDate","updatedDate","deletedDate","completedDate","postedDate",
    "authorizedDate","startTime","endTime","dropoffTime","pickupTime","birthday",
    "appointmentStartTime","lastUsedDate","shareDate"];

  function isCents(k) { return CENTS_FIELDS.indexOf(k) >= 0; }
  function isDate(k) { return DATE_FIELDS.indexOf(k) >= 0 || k.indexOf("Date") >= 0 || k.indexOf("Time") >= 0; }

  function fmtVal(k, v) {
    if (v == null) return '<span style="color:var(--muted)">\u2014</span>';
    if (v === true) return '<span class="badge-green" style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;background:#dcfce7;color:#16a34a">Yes</span>';
    if (v === false) return '<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;background:#f1f5f9;color:#64748b">No</span>';
    if (isCents(k) && typeof v === "number") return "$" + (v / 100).toFixed(2);
    if (isDate(k) && typeof v === "string" && v.length > 8) {
      var d = new Date(v);
      if (!isNaN(d)) return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    }
    return esc(String(v));
  }

  function renderNestedObj(obj) {
    if (obj === null || obj === undefined) return '<span style="color:var(--muted)">\u2014</span>';
    if (typeof obj !== "object") return fmtVal("", obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '<span style="color:var(--muted)">None</span>';
      if (typeof obj[0] !== "object") return esc(obj.join(", "));
      return renderSubTable(obj);
    }
    var parts = [];
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (v !== null && typeof v === "object") return;
      parts.push('<span style="color:var(--muted);font-size:10px">' + esc(k) + ':</span> ' + fmtVal(k, v));
    });
    return parts.join(" &middot; ") || esc(JSON.stringify(obj));
  }

  function renderSubTable(arr) {
    if (!arr.length) return '<span style="color:var(--muted)">None</span>';
    var keys = [];
    arr.forEach(function (item) {
      Object.keys(item).forEach(function (k) {
        if (keys.indexOf(k) < 0 && (item[k] === null || typeof item[k] !== "object")) keys.push(k);
      });
    });
    var nested = [];
    arr.forEach(function (item) {
      Object.keys(item).forEach(function (k) {
        if (nested.indexOf(k) < 0 && item[k] !== null && typeof item[k] === "object") nested.push(k);
      });
    });

    var h = '<table class="sub-tbl"><tr>';
    keys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; });
    if (nested.length) h += "<th>Details</th>";
    h += "</tr>";
    arr.forEach(function (item) {
      h += "<tr>";
      keys.forEach(function (k) { h += "<td>" + fmtVal(k, item[k]) + "</td>"; });
      if (nested.length) {
        var details = [];
        nested.forEach(function (nk) {
          if (item[nk] && ((Array.isArray(item[nk]) && item[nk].length) || !Array.isArray(item[nk]))) {
            details.push('<span style="font-weight:600;font-size:10px;color:var(--accent)">' + esc(nk) + ':</span> ' + renderNestedObj(item[nk]));
          }
        });
        h += "<td>" + (details.join("<br>") || "\u2014") + "</td>";
      }
      h += "</tr>";
    });
    return h + "</table>";
  }

  function buildTable(data) {
    var c = g("respTable"), rows = [];
    if (data && data.content && Array.isArray(data.content)) rows = data.content;
    else if (Array.isArray(data)) rows = data;
    else if (data && typeof data === "object") {
      c.innerHTML = renderKvTable(data); return;
    }
    if (!rows.length) { c.innerHTML = '<p style="padding:14px;color:var(--muted)">No data</p>'; return; }

    var flatKeys = [], objKeys = [];
    rows.forEach(function (row) {
      Object.keys(row).forEach(function (k) {
        var v = row[k];
        if (v !== null && typeof v === "object") { if (objKeys.indexOf(k) < 0) objKeys.push(k); }
        else { if (flatKeys.indexOf(k) < 0) flatKeys.push(k); }
      });
    });

    var h = '<table><tr>';
    flatKeys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; });
    objKeys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; });
    h += "</tr>";

    rows.forEach(function (row) {
      h += "<tr>";
      flatKeys.forEach(function (k) { h += "<td>" + fmtVal(k, row[k]) + "</td>"; });
      objKeys.forEach(function (k) { h += '<td class="nested-cell">' + renderNestedObj(row[k]) + "</td>"; });
      h += "</tr>";
    });
    c.innerHTML = h + "</table>";
  }

  function renderKvTable(obj) {
    var h = '<table><tr><th style="width:180px">Field</th><th>Value</th></tr>';
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      h += "<tr><td><strong>" + esc(k) + "</strong></td><td>";
      if (v !== null && typeof v === "object") {
        h += renderNestedObj(v);
      } else {
        h += fmtVal(k, v);
      }
      h += "</td></tr>";
    });
    return h + "</table>";
  }

  /* ---- tabs ------------------------------------------------------------- */

  function showTab(t) {
    var m = {pretty:"respPretty", raw:"respRaw", table:"respTable"};
    Object.keys(m).forEach(function (k) { var e = g(m[k]); if (e) { if (k === t) e.classList.remove("hidden"); else e.classList.add("hidden"); } });
    document.querySelectorAll(".resp-tabs .tab").forEach(function (b) { b.classList.toggle("active", b.textContent.toLowerCase() === t); });
  }

  /* ---- server-side pagination ------------------------------------------- */

  function buildPag(data) {
    var p = g("epPag");
    if (!data || data.totalPages == null || data.totalPages <= 0) { p.innerHTML = ""; return; }
    var pg = data.number || 0, tp = data.totalPages, te = data.totalElements || 0;
    var sz = (data.content || []).length;

    var h = '<button ' + (pg <= 0 ? "disabled" : "") + ' onclick="EP.page(' + (pg - 1) + ')">Prev</button>';
    h += '<span class="pg">Page ' + (pg + 1) + " / " + tp + " \u00b7 " + te + " total (" + sz + " shown)</span>";
    h += '<button ' + (pg >= tp - 1 ? "disabled" : "") + ' onclick="EP.page(' + (pg + 1) + ')">Next</button>';

    if (tp > 2) {
      h += ' <select class="page-jump" onchange="EP.page(+this.value)" title="Jump to page">';
      for (var i = 0; i < tp; i++) {
        h += '<option value="' + i + '"' + (i === pg ? " selected" : "") + '>Page ' + (i + 1) + '</option>';
      }
      h += '</select>';
    }

    p.innerHTML = h;
  }

  function goPage(p) { curPage = p; doSend(p); }

  /* ---- copy ------------------------------------------------------------- */

  function cp(text, msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); document.body.removeChild(t); }
    toast(msg);
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

  /* ---- util ------------------------------------------------------------- */

  function esc(s) { return s != null ? String(s).replace(/</g, "&lt;") : "\u2014"; }
  function fmtD(v) { return v ? new Date(v).toLocaleDateString() : "\u2014"; }
  function fmtDt(v) { if (!v) return "\u2014"; var d = new Date(v); return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}); }
  function fmtC(v) { return v != null ? "$" + (v / 100).toFixed(2) : "\u2014"; }

  function clearResp() {
    g("respPretty").innerHTML = '<span class="placeholder">Press Enter or click Send</span>';
    g("respRaw").textContent = ""; g("respTable").innerHTML = "";
    g("respStatus").textContent = ""; g("respStatus").className = "resp-badge";
    g("respTime").textContent = ""; g("respSize").textContent = "";
    g("epPag").innerHTML = ""; lastResp = null;
  }
  function toast(msg) { var t = g("toast"); t.textContent = msg; t.classList.add("show"); setTimeout(function () { t.classList.remove("show"); }, 2200); }

  /* ---- mobile ----------------------------------------------------------- */

  var sidebar = document.querySelector(".sidebar"), overlay = document.querySelector(".sidebar-overlay"), burger = document.querySelector(".hamburger");
  function closeSidebar() { if (sidebar) sidebar.classList.remove("open"); if (overlay) overlay.classList.remove("show"); }
  if (burger) burger.addEventListener("click", function () { sidebar.classList.add("open"); overlay.classList.add("show"); });
  if (overlay) overlay.addEventListener("click", closeSidebar);

  g("shopSelect").addEventListener("change", function () {
    var sp = g("p_shop_id"); if (sp) sp.value = this.value; updUrl();
    if (document.querySelector(".page.active").id === "page-dashboard") loadDashboard();
  });

  /* ---- boot ------------------------------------------------------------- */

  (async function () {
    try { var r = await fetch(BASE + "/api/shops"); var d = await r.json(); shops = d.shops || []; } catch (e) { shops = []; }
    var sel = g("shopSelect"); sel.innerHTML = "";
    if (!shops.length) sel.innerHTML = '<option value="">No shops</option>';
    else shops.forEach(function (s) { var o = document.createElement("option"); o.value = s.shop_id; o.textContent = s.name + " (" + s.shop_id + ")"; sel.appendChild(o); });
    goTo("dashboard");
  })();

  /* ---- public ----------------------------------------------------------- */

  window.EP = {
    go: goTo, send: function () { doSend(0); }, page: goPage, key: onKey, updUrl: updUrl,
    copyUrl: function () { cp(BASE + buildUrl(), "URL copied"); },
    copyCurl: function () { cp("curl -X GET '" + BASE + buildUrl() + "'", "cURL copied"); },
    copyJson: function () { if (!lastResp) return toast("No data"); cp(JSON.stringify(lastResp, null, 2), "JSON copied"); },
    exportCsv: fetchAllForExport,
    toggleWrap: function () { g("respPretty").classList.toggle("wrap"); g("respRaw").classList.toggle("wrap"); },
    tab: showTab
  };
})();
