/* =====================================================================
   Tekmetric API Explorer v6
   - Lightweight payloads: default page size 20, summary-first
   - Lazy rendering: large JSON collapsed, tables capped with "Show More"
   - Uses backend _meta pagination block
   ===================================================================== */
(function () {
  "use strict";

  var BASE = (window.API_BASE || "").replace(/\/+$/, "");
  var g = function (id) { return document.getElementById(id); };

  var MAX_TABLE_ROWS = 50;
  var MAX_JSON_LENGTH = 50000;

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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
      ]},
    { id:"customer-detail", name:"Customer", path:"/api/customers/{id}",
      desc:"Returns a customer by ID.",
      params:[{k:"id",l:"Customer ID",t:"num",req:1,pp:1}]},
    { id:"customer-search", name:"Cross-Shop Search", path:"/api/customer/search",
      desc:"Searches across all shop locations by email or phone. Returns a lightweight summary with preview appointments. Click 'Load All Appointments' for full paginated data.",
      params:[
        {k:"email",l:"Email",t:"text",hint:"customer@email.com"},
        {k:"phone",l:"Phone",t:"text",hint:"555-123-4567"},
        {k:"include_appointments",l:"Load Appointments",t:"sel",o:[["false","Preview Only (fast)"],["true","Full (paginated)"]],d:"false"},
        {k:"appointment_page",l:"Appt Page",t:"num",d:"0",hint:"Page number"},
        {k:"appointment_size",l:"Appt Page Size",t:"sel",o:[["10","10"],["20","20"],["50","50"]],d:"20"}
      ]},
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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
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
        {k:"size",l:"Page Size",t:"sel",o:[["20","20"],["50","50"],["100","100"]],d:"20"}
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

  /* ---- fetch one page --------------------------------------------------- */

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

      var meta = lastResp && lastResp._meta;
      var total = meta ? meta.totalElements : lastResp.totalElements;
      var pageInfo = "";
      if (meta) {
        pageInfo = " \u00b7 Page " + (meta.page + 1) + "/" + meta.totalPages;
      } else if (lastResp.totalPages) {
        pageInfo = " \u00b7 Page " + ((lastResp.number || 0) + 1) + "/" + lastResp.totalPages;
      }
      g("statusText").textContent = (total != null ? total + " total" : "Ready") + pageInfo;

      renderPrettyJson(lastResp, txt.length);
      g("respRaw").textContent = typeof lastResp === "string" ? lastResp : JSON.stringify(lastResp, null, 2);
      buildTable(lastResp);
      buildPag(lastResp);

      var hasContent = lastResp && (lastResp.content || Array.isArray(lastResp));
      showTab(hasContent ? "table" : "pretty");
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

  /* ---- lazy JSON rendering ---------------------------------------------- */

  var _fullJsonCache = null;

  function renderPrettyJson(data, rawLen) {
    var el = g("respPretty");
    _fullJsonCache = data;

    if (data && typeof data === "object" && data.content && Array.isArray(data.content)) {
      var meta = data._meta || {};
      var summary = {
        _meta: meta,
        content: data.content.slice(0, 2),
      };
      if (data.content.length > 2) {
        summary["..."] = (data.content.length - 2) + " more items";
      }
      el.innerHTML = '<div class="json-collapsed-info">'
        + '<strong>' + (meta.totalElements || data.content.length) + ' records</strong>'
        + ' \u00b7 Page ' + ((meta.page || 0) + 1) + '/' + (meta.totalPages || 1)
        + ' \u00b7 ' + (rawLen / 1024).toFixed(1) + ' KB'
        + ' \u00b7 <button class="btn-expand-json" onclick="EP.expandJson()">Expand Full JSON</button>'
        + '</div>'
        + hl(summary);
      return;
    }

    if (rawLen > MAX_JSON_LENGTH) {
      el.innerHTML = '<div class="json-collapsed-info">'
        + 'Response is ' + (rawLen / 1024).toFixed(0) + ' KB'
        + ' \u00b7 <button class="btn-expand-json" onclick="EP.expandJson()">Expand Full JSON</button>'
        + '</div>'
        + hl(typeof data === "object" ? Object.keys(data).reduce(function(o, k) {
            var v = data[k];
            o[k] = Array.isArray(v) ? "[" + v.length + " items]" : (typeof v === "object" && v ? "{...}" : v);
            return o;
          }, {}) : data);
      return;
    }

    el.innerHTML = hl(data);
  }

  function expandJson() {
    if (!_fullJsonCache) return;
    g("respPretty").innerHTML = hl(_fullJsonCache);
  }

  /* ---- CSV export (streaming for large sets) ---------------------------- */

  async function fetchAllForExport() {
    if (!cur || !lastResp) return toast("Send a request first");

    var meta = lastResp._meta;
    var tp = meta ? meta.totalPages : (lastResp.totalPages || 1);
    var total = meta ? meta.totalElements : (lastResp.totalElements || 0);

    if (!cur.paged || tp <= 1) return doExport(lastResp.content || (Array.isArray(lastResp) ? lastResp : []));

    if (total > 500 && !confirm("This will fetch " + total + " records across " + tp + " pages.\nFor very large exports, consider using fewer pages.\nContinue?")) return;

    var maxPages = Math.min(tp, 50);
    toast("Fetching " + maxPages + " of " + tp + " pages\u2026");
    g("statusText").textContent = "Exporting\u2026 0/" + maxPages;

    var all = [];
    for (var p = 0; p < maxPages; p++) {
      g("statusText").textContent = "Exporting\u2026 " + (p + 1) + "/" + maxPages;
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
    if (v == null) return '<span class="val-null">\u2014</span>';
    if (v === true) return '<span class="val-bool val-true">Yes</span>';
    if (v === false) return '<span class="val-bool val-false">No</span>';
    if (isCents(k) && typeof v === "number") return "$" + (v / 100).toFixed(2);
    if (isDate(k) && typeof v === "string" && v.length > 8) {
      var d = new Date(v);
      if (!isNaN(d)) return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    }
    return esc(String(v));
  }

  function nestedBadge(k, v) {
    if (v === null || v === undefined) return '<span class="val-null">\u2014</span>';
    if (Array.isArray(v)) {
      if (v.length === 0) return '<span class="nest-badge empty">0</span>';
      if (typeof v[0] !== "object") return esc(v.join(", "));
      return '<span class="nest-badge">' + v.length + '</span>';
    }
    if (typeof v === "object") return '<span class="nest-badge">1</span>';
    return fmtVal(k, v);
  }

  function fmtNestedObj(obj) {
    if (obj === null || obj === undefined) return '<span class="val-null">\u2014</span>';
    if (Array.isArray(obj)) {
      if (!obj.length) return '<span class="val-null">\u2014</span>';
      return obj.map(function (item) {
        if (typeof item !== "object" || item === null) return fmtVal("", item);
        var bits = [];
        Object.keys(item).forEach(function (k) { bits.push('<span class="kv-key">' + esc(k) + ':</span> ' + fmtVal(k, item[k])); });
        return bits.join(", ");
      }).join("<br>");
    }
    if (typeof obj === "object") {
      var bits = [];
      Object.keys(obj).forEach(function (k) { bits.push('<span class="kv-key">' + esc(k) + ':</span> ' + fmtVal(k, obj[k])); });
      return bits.join(", ");
    }
    return fmtVal("", obj);
  }

  function renderDetailPanel(row, objKeys) {
    var sections = [];
    objKeys.forEach(function (k) {
      var v = row[k];
      if (v === null || v === undefined) return;
      var items = Array.isArray(v) ? v : [v];
      if (items.length === 0) return;
      if (typeof items[0] !== "object") { sections.push('<div class="detail-section"><h4>' + esc(k) + '</h4><p>' + esc(items.join(", ")) + '</p></div>'); return; }

      var flatSub = [], nestedSub = [];
      items.forEach(function (item) {
        Object.keys(item).forEach(function (sk) {
          var sv = item[sk];
          if (sv !== null && typeof sv === "object") { if (nestedSub.indexOf(sk) < 0) nestedSub.push(sk); }
          else { if (flatSub.indexOf(sk) < 0) flatSub.push(sk); }
        });
      });

      var h = '<div class="detail-section"><h4>' + esc(k) + ' <span class="detail-count">' + items.length + '</span></h4>';
      h += '<div class="sub-tbl-wrap"><table class="sub-tbl"><thead><tr>';
      flatSub.forEach(function (sk) { h += '<th>' + esc(sk) + '</th>'; });
      nestedSub.forEach(function (sk) { h += '<th>' + esc(sk) + '</th>'; });
      h += '</tr></thead><tbody>';
      items.forEach(function (item) {
        h += '<tr>';
        flatSub.forEach(function (sk) { h += '<td>' + fmtVal(sk, item[sk]) + '</td>'; });
        nestedSub.forEach(function (sk) { h += '<td class="sub-nested">' + fmtNestedObj(item[sk]) + '</td>'; });
        h += '</tr>';
      });
      h += '</tbody></table></div></div>';
      sections.push(h);
    });
    return sections.join("");
  }

  var _tblRowData = [];
  var _tblAllRows = [];
  var _tblShownCount = 0;

  function buildTable(data) {
    var c = g("respTable"), rows = [];
    if (data && data.content && Array.isArray(data.content)) rows = data.content;
    else if (Array.isArray(data)) rows = data;
    else if (data && typeof data === "object") {
      c.innerHTML = renderKvTable(data); return;
    }
    if (!rows.length) { c.innerHTML = '<p style="padding:14px;color:var(--muted)">No data</p>'; return; }

    _tblRowData = rows;
    _tblAllRows = rows;
    _tblShownCount = Math.min(rows.length, MAX_TABLE_ROWS);

    renderTableRows(c, rows, _tblShownCount);
  }

  function renderTableRows(container, rows, showCount) {
    var flatKeys = [], objKeys = [];
    rows.forEach(function (row) {
      Object.keys(row).forEach(function (k) {
        if (k === "_meta" || k === "_links") return;
        var v = row[k];
        if (v !== null && typeof v === "object") { if (objKeys.indexOf(k) < 0) objKeys.push(k); }
        else { if (flatKeys.indexOf(k) < 0) flatKeys.push(k); }
      });
    });

    var visible = rows.slice(0, showCount);

    var h = '<table class="main-tbl"><thead><tr>';
    if (objKeys.length) h += '<th class="th-expand"></th>';
    flatKeys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; });
    objKeys.forEach(function (k) { h += "<th>" + esc(k) + "</th>"; });
    h += "</tr></thead><tbody>";

    visible.forEach(function (row, idx) {
      var hasNested = false;
      objKeys.forEach(function (k) {
        var v = row[k];
        if (v !== null && typeof v === "object" && (!Array.isArray(v) || v.length > 0)) hasNested = true;
      });

      h += '<tr class="data-row' + (hasNested ? " expandable" : "") + '" data-idx="' + idx + '">';
      if (objKeys.length) {
        h += '<td class="td-expand">' + (hasNested ? '<span class="expand-icon">&#9654;</span>' : '') + '</td>';
      }
      flatKeys.forEach(function (k) { h += "<td>" + fmtVal(k, row[k]) + "</td>"; });
      objKeys.forEach(function (k) { h += "<td>" + nestedBadge(k, row[k]) + "</td>"; });
      h += "</tr>";

      if (hasNested) {
        var colSpan = flatKeys.length + objKeys.length + (objKeys.length ? 1 : 0);
        h += '<tr class="detail-row hidden" data-detail="' + idx + '"><td colspan="' + colSpan + '"><div class="detail-panel">';
        h += renderDetailPanel(row, objKeys);
        h += '</div></td></tr>';
      }
    });

    h += "</tbody></table>";

    if (rows.length > showCount) {
      h += '<div class="show-more-bar"><button class="btn btn-show-more" onclick="EP.showMoreRows()">Show More (' + showCount + ' of ' + rows.length + ' rows shown)</button></div>';
    }

    container.innerHTML = h;

    container.querySelectorAll(".data-row.expandable").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var idx = tr.getAttribute("data-idx");
        var detail = container.querySelector('[data-detail="' + idx + '"]');
        if (!detail) return;
        var open = !detail.classList.contains("hidden");
        detail.classList.toggle("hidden");
        tr.classList.toggle("expanded");
        var icon = tr.querySelector(".expand-icon");
        if (icon) icon.innerHTML = open ? "&#9654;" : "&#9660;";
      });
    });
  }

  function showMoreRows() {
    _tblShownCount = Math.min(_tblShownCount + MAX_TABLE_ROWS, _tblAllRows.length);
    renderTableRows(g("respTable"), _tblAllRows, _tblShownCount);
  }

  function renderKvTable(obj) {
    var flatH = '<table class="main-tbl kv-tbl"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>';
    var nestedSections = [];

    Object.keys(obj).forEach(function (k) {
      if (k === "_meta" || k === "_links") return;
      var v = obj[k];
      if (v !== null && typeof v === "object") {
        var items = Array.isArray(v) ? v : [v];
        if (items.length === 0 || (Array.isArray(v) && v.length === 0)) {
          flatH += '<tr><td class="kv-label">' + esc(k) + '</td><td><span class="val-null">\u2014</span></td></tr>';
        } else if (typeof items[0] !== "object") {
          flatH += '<tr><td class="kv-label">' + esc(k) + '</td><td>' + esc(items.join(", ")) + '</td></tr>';
        } else {
          flatH += '<tr><td class="kv-label">' + esc(k) + '</td><td><span class="nest-badge">' + items.length + ' item' + (items.length > 1 ? 's' : '') + '</span></td></tr>';
          nestedSections.push(renderDetailPanel({"_x_":v}, ["_x_"]).replace(/_x_/g, k));
        }
      } else {
        flatH += '<tr><td class="kv-label">' + esc(k) + '</td><td>' + fmtVal(k, v) + '</td></tr>';
      }
    });

    flatH += '</tbody></table>';

    if (obj._meta) {
      flatH += '<div class="meta-bar"><strong>Pagination:</strong> Page ' + (obj._meta.page + 1) + ' of ' + obj._meta.totalPages + ' \u00b7 ' + obj._meta.totalElements + ' total' + (obj._meta.hasMore ? ' \u00b7 More available' : '') + '</div>';
    }

    if (nestedSections.length) {
      flatH += '<div class="kv-nested-area">' + nestedSections.join("") + '</div>';
    }
    return flatH;
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
    if (!data) { p.innerHTML = ""; return; }

    var meta = data._meta;
    var pg, tp, te, sz;

    if (meta) {
      pg = meta.page || 0;
      tp = meta.totalPages || 0;
      te = meta.totalElements || 0;
      sz = (data.content || []).length;
    } else if (data.totalPages != null) {
      pg = data.number || 0;
      tp = data.totalPages;
      te = data.totalElements || 0;
      sz = (data.content || []).length;
    } else {
      p.innerHTML = ""; return;
    }

    if (tp <= 0) { p.innerHTML = ""; return; }

    var h = '<button ' + (pg <= 0 ? "disabled" : "") + ' onclick="EP.page(' + (pg - 1) + ')">Prev</button>';
    h += '<span class="pg">Page ' + (pg + 1) + " / " + tp + " \u00b7 " + te + " total (" + sz + " shown)</span>";
    h += '<button ' + (pg >= tp - 1 ? "disabled" : "") + ' onclick="EP.page(' + (pg + 1) + ')">Next</button>';

    if (tp > 2) {
      h += ' <select class="page-jump" onchange="EP.page(+this.value)" title="Jump to page">';
      for (var i = 0; i < Math.min(tp, 100); i++) {
        h += '<option value="' + i + '"' + (i === pg ? " selected" : "") + '>Page ' + (i + 1) + '</option>';
      }
      if (tp > 100) h += '<option disabled>(' + (tp - 100) + ' more...)</option>';
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
      var r = res[i], d = r.status === "fulfilled" ? r.value : null;
      var cnt = "\u2014";
      if (d) {
        if (d._meta && d._meta.totalElements != null) cnt = d._meta.totalElements;
        else if (d.totalElements != null) cnt = d.totalElements;
      }
      h += '<div class="stat-card" onclick="EP.go(\'' + item.key + '\')"><div class="label">' + item.label + '</div><div class="value">' + cnt + '</div><div class="sub">Click to explore</div></div>';
    });
    stats.innerHTML = h;

    dashTbl("dashRO", res[2], function (r) {
      var st = r.repairOrderStatus;
      var stName = st ? (typeof st === "object" ? (st.name || st.code || "") : st) : (r.status || "");
      return "<td>" + (r.repairOrderNumber || r.id) + "</td><td>" + esc(stName) + "</td><td>" + fmtD(r.createdDate) + "</td><td>" + fmtC(r.totalSales) + "</td>";
    }, ["RO #","Status","Created","Total"]);
    dashTbl("dashAppt", res[4], function (a) {
      return "<td>" + a.id + "</td><td>" + fmtDt(a.startTime) + "</td><td>" + esc(a.appointmentStatus) + "</td><td>" + esc((a.description||"").substring(0,40)) + "</td>";
    }, ["ID","Start","Status","Description"]);
    g("statusText").textContent = "Ready";
  }

  function dashTbl(id, result, rowFn, headers) {
    var c = g(id);
    if (!result || result.status !== "fulfilled" || !result.value) {
      c.innerHTML = '<p style="padding:14px;color:var(--muted)">No data</p>'; return;
    }
    var content = result.value.content;
    if (!content || !content.length) {
      c.innerHTML = '<p style="padding:14px;color:var(--muted)">No data</p>'; return;
    }
    var h = "<table><tr>"; headers.forEach(function (hd) { h += "<th>" + hd + "</th>"; }); h += "</tr>";
    content.forEach(function (row) { h += "<tr>" + rowFn(row) + "</tr>"; });
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
    showMoreRows: showMoreRows, expandJson: expandJson,
    copyUrl: function () { cp(BASE + buildUrl(), "URL copied"); },
    copyCurl: function () { cp("curl -X GET '" + BASE + buildUrl() + "'", "cURL copied"); },
    copyJson: function () { if (!lastResp) return toast("No data"); cp(JSON.stringify(lastResp, null, 2), "JSON copied"); },
    exportCsv: fetchAllForExport,
    toggleWrap: function () { g("respPretty").classList.toggle("wrap"); g("respRaw").classList.toggle("wrap"); },
    tab: showTab
  };
})();
