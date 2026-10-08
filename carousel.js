/*
 * Squeeze carousel — vanilla port of the React `carousel-squeeze` component.
 * One panel gets the room; the rest squeeze into slats on the right. Opening a
 * slat widens it and slides the row along; the copy underneath cross-fades.
 */
(() => {
  /* ------------------------------------------------------------------ data */

  // Mockup listings — replace with real properties later.
  const slides = [
    {
      title: "Casa moderna en Yerba Buena.",
      description: "4 dormitorios, 3 baños, piscina y jardín de 600 m² a minutos del centro.",
      action: "Ver propiedad",
      name: "Yerba Buena",
      price: "USD 320.000",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Casa moderna de dos plantas con piscina",
    },
    {
      title: "Residencia en barrio privado.",
      description: "Seguridad 24 h, cancha de golf y espacios verdes. Lista para habitar.",
      action: "Ver propiedad",
      name: "Country Las Yungas",
      price: "USD 450.000",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Fachada de residencia contemporánea al atardecer",
    },
    {
      title: "Casa familiar con amplio parque.",
      description: "Galería con quincho, cochera doble y un parque arbolado ideal para chicos.",
      action: "Ver propiedad",
      name: "San Javier",
      price: "USD 210.000",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Casa familiar con jardín delantero",
    },
    {
      title: "Villa con vista a las sierras.",
      description: "Arquitectura de autor, ventanales de piso a techo y terraza panorámica.",
      action: "Ver propiedad",
      name: "Tafí Viejo",
      price: "USD 380.000",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Villa de lujo iluminada con piscina",
    },
    {
      title: "Casa de diseño contemporáneo.",
      description: "Planta abierta, cocina integrada y eficiencia energética de primer nivel.",
      action: "Ver propiedad",
      name: "Horco Molle",
      price: "USD 295.000",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Casa contemporánea blanca con césped",
    },
    {
      title: "Chalet clásico con jardín.",
      description: "3 dormitorios, estudio y un jardín consolidado en zona residencial tranquila.",
      action: "Ver propiedad",
      name: "Barrio Norte",
      price: "USD 175.000",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Chalet con techo a dos aguas y jardín",
    },
    {
      title: "Departamento luminoso en el centro.",
      description: "2 ambientes amplios, balcón al frente y amenities completos.",
      action: "Ver propiedad",
      name: "San Miguel de Tucumán",
      price: "USD 95.000",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
      imageAlt: "Living de departamento con grandes ventanas",
    },
  ];

  /* ---------------------------------------------------------------- config */

  const root = document.getElementById("propertiesCarousel");
  if (!root || !slides.length) return;

  const SLAT = "8px";
  const DURATION = 1000;
  const HOVER_GROW = true;

  // Four columns share what's left once the open card, slats and gaps are paid.
  const SHARES = [0.1, 0.45, 0.3, 0.15];
  const STRETCHED = [0.16, 0.55, 0.4, 0.25];
  const SQUEEZED = [0.04, 0.43, 0.28, 0.13];

  const count = slides.length;
  const wrap = (i) => ((i % count) + count) % count;
  const slats = Math.max(1, Math.min(3, count - 4));
  const visible = 4 + slats;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ms = reduced ? 0 : DURATION;

  root.style.setProperty("--sq-ms", `${ms}ms`);
  root.style.setProperty("--sq-slat", SLAT);
  root.style.setProperty(
    "--sq-room",
    `max(0px, calc(100cqi - var(--sq-hero) - ${slats} * var(--sq-slat-gap) - 3 * var(--sq-gap) - ${slats} * var(--sq-slat)))`
  );

  /* ------------------------------------------------------------------- DOM */

  const arrowPath = {
    back: "M9.6 2.6 5.1 7.1h9.1v1.8H5.1l4.5 4.5-1.2 1.2-6-6L1.8 8l.6-.6 6-6 1.2 1.2Z",
    next: "M6.4 2.6l4.5 4.5H1.8v1.8h9.1l-4.5 4.5 1.2 1.2 6-6 .6-.6-.6-.6-6-6-1.2 1.2Z",
  };

  const arrow = (dir, label) =>
    `<button type="button" class="sq-arrow" data-dir="${dir}" aria-label="${label}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="${arrowPath[dir]}"/></svg>
    </button>`;

  root.innerHTML = `
    <div class="sq-controls">${arrow("back", "Anterior")}${arrow("next", "Siguiente")}</div>
    <div class="sq-viewport">
      <div class="sq-strip" role="tablist" aria-label="Propiedades destacadas"></div>
    </div>
    <div class="sq-captions" role="tabpanel" aria-live="polite">
      ${slides
        .map(
          (s, i) => `
        <div class="sq-caption" data-index="${i}">
          <p><span class="sq-title">${s.title}</span> <span class="sq-desc">${s.description}</span></p>
          <a href="#" class="sq-action">${s.action}
            <svg width="6" height="9" viewBox="0 0 6 9" fill="none" aria-hidden="true"><path d="M1.2 1 4.7 4.5 1.2 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>`
        )
        .join("")}
    </div>`;

  const strip = root.querySelector(".sq-strip");
  const captions = [...root.querySelectorAll(".sq-caption")];

  function makeCard(slideIndex) {
    const s = slides[slideIndex];
    const el = document.createElement("button");
    el.type = "button";
    el.className = "sq-card";
    el.setAttribute("role", "tab");
    el.setAttribute("aria-label", s.title);
    el.innerHTML = `
      <img src="${s.image}" alt="${s.imageAlt || ""}" draggable="false">
      <span class="sq-overlay" aria-hidden="true">
        <span class="sq-overlay-name">${s.name}</span>
        <span class="sq-overlay-price">${s.price}</span>
      </span>`;
    const card = { el, slide: slideIndex };
    el.addEventListener("mousemove", () => {
      if (!HOVER_GROW || reduced) return;
      const col = cards.indexOf(card) + column;
      if (col !== hover) {
        hover = col;
        render();
      }
    });
    el.addEventListener("click", () => {
      const col = cards.indexOf(card) + column;
      if (col > 0) step(col);
    });
    return card;
  }

  /* ----------------------------------------------------------------- state */

  let cards = Array.from({ length: visible }, (_, p) => makeCard(wrap(p)));
  cards.forEach((c) => strip.appendChild(c.el));

  let column = 0; // column of the first card in the strip
  let slid = 0; // how far the strip is translated, in slats
  let hover = -1;
  let timer = null;

  const shareOf = (col) => {
    if (hover < 0 || hover > 3) return SHARES[col];
    return hover === col ? STRETCHED[col] : SQUEEZED[col];
  };

  const widthOf = (col) => {
    if (col < 0 || col > 3) return "var(--sq-slat)";
    if (col === 0) return `calc(var(--sq-hero) + var(--sq-room) * ${shareOf(0)})`;
    return `calc(var(--sq-room) * ${shareOf(col)})`;
  };

  function setStill(still) {
    root.classList.toggle("sq-still", still);
  }

  function render() {
    strip.style.transform = `translateX(calc(${slid} * (var(--sq-slat) + var(--sq-gap))))`;
    cards.forEach((card, place) => {
      const col = place + column;
      const w = widthOf(col);
      const front = col === 0;
      const s = card.el.style;
      s.width = w;
      s.marginLeft = place === 0 ? "0" : col < 4 ? "var(--sq-gap)" : "var(--sq-slat-gap)";
      s.borderRadius = `min(var(--sq-radius), calc(${w} / 2))`;
      card.el.classList.toggle("is-front", front);
      card.el.setAttribute("aria-selected", front);
      card.el.tabIndex = front ? 0 : -1;
    });
    const open = cards[-column]?.slide ?? 0;
    captions.forEach((c, i) => {
      const shown = i === open;
      c.classList.toggle("is-shown", shown);
      c.setAttribute("aria-hidden", !shown);
      c.querySelector(".sq-action").tabIndex = shown ? 0 : -1;
    });
  }

  // Once the movement ends, trim the strip back to the cards on show and reset
  // the counters — same picture, so nothing may animate.
  function settle(forward) {
    const keep = forward ? cards.slice(-visible) : cards.slice(0, visible);
    cards.filter((c) => !keep.includes(c)).forEach((c) => c.el.remove());
    cards = keep;
    column = 0;
    slid = 0;
    setStill(true);
    render();
    void strip.offsetWidth;
    requestAnimationFrame(() => setStill(false));
  }

  function step(by) {
    if (count < 2 || by === 0) return;
    clearTimeout(timer);

    if (by > 0) {
      // New slats join the tail before anything moves.
      for (let k = 0; k < by; k++) {
        const c = makeCard(wrap(cards[cards.length - 1].slide + 1));
        cards.push(c);
        strip.appendChild(c.el);
      }
      column -= by;
      slid -= by;
      render();
    } else {
      // Grow at the front as off-screen slats, without animating, then ease
      // everything back to column 0 — the forward move played in reverse.
      const n = -by;
      for (let k = 0; k < n; k++) {
        const c = makeCard(wrap(cards[0].slide - 1));
        cards.unshift(c);
        strip.prepend(c.el);
      }
      column -= n;
      slid -= n;
      setStill(true);
      render();
      void strip.offsetWidth;
      setStill(false);
      column = 0;
      slid = 0;
      render();
    }

    const forward = by > 0;
    timer = setTimeout(() => settle(forward), ms + 20);
  }

  /* ---------------------------------------------------------------- events */

  root.querySelector('[data-dir="back"]').addEventListener("click", () => step(-1));
  root.querySelector('[data-dir="next"]').addEventListener("click", () => step(1));

  strip.addEventListener("keydown", (e) => {
    const by = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (by === undefined) return;
    e.preventDefault();
    step(by);
  });

  root.addEventListener("mouseleave", () => {
    if (hover !== -1) {
      hover = -1;
      render();
    }
  });

  root.querySelectorAll(".sq-action").forEach((a) =>
    a.addEventListener("click", (e) => e.preventDefault())
  );

  setStill(true);
  render();
  requestAnimationFrame(() => setStill(false));
})();
