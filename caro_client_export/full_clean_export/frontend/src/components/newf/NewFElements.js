function defineOnce(name, ctor) {
  if (!customElements.get(name)) customElements.define(name, ctor);
}

class NewFormaToolbar extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: inline-block;
        z-index: 40;
      }
      .toolbar {
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
        border: 1px solid rgba(60, 60, 60, 0.08);
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
      }
      :host([direction="vertical"]) .toolbar {
        flex-direction: column;
        padding: 10px 8px;
      }
    `;
    const wrap = document.createElement("div");
    wrap.className = "toolbar";
    wrap.innerHTML = `<slot></slot>`;
    root.append(style, wrap);
  }
}

class NewFormaToolbarButton extends HTMLElement {
  static get observedAttributes() {
    return ["active", "disabled"];
  }

  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    const label = this.getAttribute("label") || "";
    const icon = this.getAttribute("icon") || "";

    const style = document.createElement("style");
    style.textContent = `
      :host { display: inline-block; }
      button {
        all: unset;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 28px;
        height: 28px;
        border-radius: 6px;
        padding: 0 8px;
        cursor: pointer;
        color: #3c3c3c;
        border: 1px solid transparent;
        font: 500 11px/1.1 Inter, system-ui, sans-serif;
        user-select: none;
      }
      button:hover {
        background: rgba(122, 69, 235, 0.08);
      }
      :host([active]) button {
        background: rgba(122, 69, 235, 0.12);
        border-color: rgba(122, 69, 235, 0.45);
        color: #5e35b1;
      }
      :host([disabled]) button {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .icn { font-size: 13px; line-height: 1; }
    `;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `
      ${icon ? `<span class="icn">${icon}</span>` : ""}
      ${label ? `<span>${label}</span>` : "<slot></slot>"}
    `;
    btn.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.dispatchEvent(
        new CustomEvent("newforma-click", {
          bubbles: true,
          composed: true,
          detail: { action: this.getAttribute("action") || "" },
        })
      );
    });
    this._btn = btn;
    root.append(style, btn);
    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  _sync() {
    if (!this._btn) return;
    if (this.hasAttribute("disabled")) this._btn.setAttribute("disabled", "");
    else this._btn.removeAttribute("disabled");
  }
}

class NewFormaFloatingMenu extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: "open" });
    const label = this.getAttribute("label") || "Menu";
    const style = document.createElement("style");
    style.textContent = `
      :host { position: relative; display: inline-block; }
      .trigger {
        all: unset;
        box-sizing: border-box;
        height: 28px;
        border-radius: 6px;
        padding: 0 10px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        border: 1px solid rgba(60,60,60,.14);
        background: #fff;
        color: #3c3c3c;
        font: 500 11px/1 Inter, system-ui, sans-serif;
      }
      .menu {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        min-width: 170px;
        background: #fff;
        border: 1px solid rgba(60,60,60,.12);
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0,0,0,.16);
        padding: 6px 0;
        display: none;
        z-index: 55;
      }
      :host([open]) .menu { display: block; }
      .item {
        padding: 6px 12px;
        font: 500 11px/1.2 Inter, system-ui, sans-serif;
        color: #3c3c3c;
        cursor: pointer;
      }
      .item:hover { background: rgba(122,69,235,.08); }
    `;

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <button class="trigger" type="button">${label} ▾</button>
      <div class="menu"><slot></slot></div>
    `;
    const trigger = wrap.querySelector(".trigger");
    trigger.addEventListener("click", () => {
      if (this.hasAttribute("open")) this.removeAttribute("open");
      else this.setAttribute("open", "");
    });
    root.append(style, wrap);
  }
}

export function registerNewFormaElements() {
  if (typeof window === "undefined" || !window.customElements) return;
  defineOnce("newforma-toolbar", NewFormaToolbar);
  defineOnce("newforma-toolbar-button", NewFormaToolbarButton);
  defineOnce("newforma-floating-menu", NewFormaFloatingMenu);
}

