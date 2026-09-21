/* ═══════════════════ RENDER ═══════════════════
   Fills in the repeated list/grid markup from data.js. Every block is
   guarded so a page missing that container simply skips it. */

const ARR =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

/* ─── tank glyph (schematic construction icon) ─── */
function tankSVG(v) {
  const P = {
    za: [6, 12, 18, 24, 30, 36, 42]
      .map((x) => '<path d="M' + x + ' 10 v28" stroke-dasharray="2 2"/>')
      .join(""),

    gi: '<path d="M6 22H42"/><path d="M6 30H42"/>',

    fbe: [10, 18, 26, 34]
      .flatMap((x) => [14, 22, 30].map((y) => '<circle cx="' + x + '" cy="' + y + '" r="1"/>'))
      .join(""),

    gfs: '<path d="M6 10L42 38M6 38L42 10M6 24L42 24"/>'
  };

  const stroke =
    v === "fbe"
      ? 'fill="currentColor"'
      : 'stroke="currentColor" stroke-width="' + (v === "gfs" ? ".75" : "1") + '"';

  return (
    '<svg width="48" height="48" viewBox="0 0 48 48" fill="none">' +
    '<defs><clipPath id="c-' + v + '"><path d="M8 10L24 4L40 10V38L24 44L8 38Z"/></clipPath></defs>' +
    '<path d="M8 10L24 4L40 10V38L24 44L8 38Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<g clip-path="url(#c-' + v + ')" ' + stroke + '>' + P[v] + '</g>' +
    '</svg>'
  );
}

/* ─── product card (used on the Products page — full spec, with icon) ─── */
function prodCard(p, full, ctaLabel, ctaHref) {
  return (
    '<div class="prod-card">' +
    tankSVG(p.v) +
    "<h3>" + p.name + "</h3>" +
    '<p class="prod-tl">' + p.tl + "</p>" +
    (full ? '<p class="prod-body">' + p.body + "</p>" : "") +
    '<div class="prod-specs">' +
    (full
      ? "<div><div class=\"spec-l\">Material</div><div class=\"spec-v\">" + p.mat + "</div></div>" +
        "<div><div class=\"spec-l\">Coating</div><div class=\"spec-v\">" + p.coat + "</div></div>"
      : "") +
    "<div><div class=\"spec-l\">Capacity range</div><div class=\"spec-v\">" + p.cap + "</div></div>" +
    "<div><div class=\"spec-l\">Standard</div><div class=\"spec-v\">" + p.std + "</div></div>" +
    "</div>" +
    '<a href="' + ctaHref + '" class="prod-link">' + (ctaLabel || "Explore spec") + " " + ARR + "</a>" +
    "</div>"
  );
}

/* ─── signature product card (home page — sticky, real photo, short specs) ─── */
function signatureCard(p) {
  return (
    '<div class="product-card">' +
    '<div class="prod-card">' +
    "<h3>" + p.name + "</h3>" +
    '<p class="prod-tl">' + p.tl + "</p>" +
    '<div class="prod-specs">' +
    "<div><div class=\"spec-l\">Capacity range</div><div class=\"spec-v\">" + p.cap + "</div></div>" +
    "<div><div class=\"spec-l\">Standard</div><div class=\"spec-v\">" + p.std + "</div></div>" +
    "</div>" +
    '<a href="products.html" class="prod-link">Explore spec ' + ARR + "</a>" +
    "</div>" +
    '<div class="product-image"><img src="' + p.img + '" alt="' + p.imgAlt + '"/></div>' +
    "</div>"
  );
}

function strengthItem(s, i) {
  return (
    '<div class="str-item">' +
    '<div class="str-idx mono">' + String(i + 1).padStart(2, "0") + "</div>" +
    "<h4>" + s.n + "</h4>" +
    "<p>" + s.c + "</p>" +
    "</div>"
  );
}

(function render() {
  const $ = (id) => document.getElementById(id);

  if ($("ind-list")) {
    $("ind-list").innerHTML = INDS.map(
      (i) => '<div class="ind-row"><div class="ind-name">' + i.n + '</div><div class="ind-copy">' + i.c + "</div></div>"
    ).join("");
  }

  if ($("sig-products")) {
    $("sig-products").innerHTML = PRODS.map(signatureCard).join("");
  }

  if ($("prod-full")) {
    $("prod-full").innerHTML = PRODS.map((p) => prodCard(p, true, "Request a quote", "contact.html")).join("");
  }

  if ($("str-home")) {
    $("str-home").innerHTML = STRS.map(strengthItem).join("");
  }

  if ($("str-about")) {
    $("str-about").innerHTML = STRS.slice(0, 4).map(strengthItem).join("");
  }

  if ($("proc")) {
    $("proc").innerHTML = PROC.map(
      (s, i) =>
        '<div class="proc-item"><div class="proc-n">' + String(i + 1).padStart(2, "0") + " /04</div><h4>" +
        s.n + "</h4><p>" + s.c + "</p></div>"
    ).join("");
  }

  if ($("clients")) {
    const clientHTML = CLIENTS.map(
      (client) => '<div class="client-logo"><img src="' + client.logo + '" alt="' + client.name + '" loading="lazy"/></div>'
    ).join("");
    // Duplicated so the marquee can loop continuously.
    $("clients").innerHTML = clientHTML + clientHTML;
  }

  if ($("pipe-tb")) {
    $("pipe-tb").innerHTML = PIPES.map(
      (r) => "<tr><td>" + r.code + "</td><td>" + r.use + "</td></tr>"
    ).join("");
  }

  if ($("fit-tags")) {
    $("fit-tags").innerHTML = FITS.map((f) => '<span class="fit-tag">' + f + "</span>").join("");
  }

  if ($("foot-prod")) {
    $("foot-prod").innerHTML = PRODS.map((p) => '<a href="products.html">' + p.name + "</a>").join("");
  }
})();
