/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis, ho = ye.ShadowRoot && (ye.ShadyCSS === void 0 || ye.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, uo = Symbol(), So = /* @__PURE__ */ new WeakMap();
let hs = class {
  constructor(e, o, s) {
    if (this._$cssResult$ = !0, s !== uo) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = o;
  }
  get styleSheet() {
    let e = this.o;
    const o = this.t;
    if (ho && e === void 0) {
      const s = o !== void 0 && o.length === 1;
      s && (e = So.get(o)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && So.set(o, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const rt = (t) => new hs(typeof t == "string" ? t : t + "", void 0, uo), k = (t, ...e) => {
  const o = t.length === 1 ? t[0] : e.reduce((s, r, l) => s + ((i) => {
    if (i._$cssResult$ === !0) return i.cssText;
    if (typeof i == "number") return i;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + i + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + t[l + 1], t[0]);
  return new hs(o, t, uo);
}, js = (t, e) => {
  if (ho) t.adoptedStyleSheets = e.map((o) => o instanceof CSSStyleSheet ? o : o.styleSheet);
  else for (const o of e) {
    const s = document.createElement("style"), r = ye.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = o.cssText, t.appendChild(s);
  }
}, Qo = ho ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let o = "";
  for (const s of e.cssRules) o += s.cssText;
  return rt(o);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ws, defineProperty: qs, getOwnPropertyDescriptor: Zs, getOwnPropertyNames: Ks, getOwnPropertySymbols: Xs, getPrototypeOf: Ys } = Object, ht = globalThis, Po = ht.trustedTypes, Gs = Po ? Po.emptyScript : "", Ie = ht.reactiveElementPolyfillSupport, te = (t, e) => t, Dt = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Gs : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let o = t;
  switch (e) {
    case Boolean:
      o = t !== null;
      break;
    case Number:
      o = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        o = JSON.parse(t);
      } catch {
        o = null;
      }
  }
  return o;
} }, po = (t, e) => !Ws(t, e), Oo = { attribute: !0, type: String, converter: Dt, reflect: !1, useDefault: !1, hasChanged: po };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ht.litPropertyMetadata ?? (ht.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Ot = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, o = Oo) {
    if (o.state && (o.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((o = Object.create(o)).wrapped = !0), this.elementProperties.set(e, o), !o.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(e, s, o);
      r !== void 0 && qs(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, o, s) {
    const { get: r, set: l } = Zs(this.prototype, e) ?? { get() {
      return this[o];
    }, set(i) {
      this[o] = i;
    } };
    return { get: r, set(i) {
      const n = r == null ? void 0 : r.call(this);
      l == null || l.call(this, i), this.requestUpdate(e, n, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Oo;
  }
  static _$Ei() {
    if (this.hasOwnProperty(te("elementProperties"))) return;
    const e = Ys(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(te("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(te("properties"))) {
      const o = this.properties, s = [...Ks(o), ...Xs(o)];
      for (const r of s) this.createProperty(r, o[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const o = litPropertyMetadata.get(e);
      if (o !== void 0) for (const [s, r] of o) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [o, s] of this.elementProperties) {
      const r = this._$Eu(o, s);
      r !== void 0 && this._$Eh.set(r, o);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const o = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const r of s) o.unshift(Qo(r));
    } else e !== void 0 && o.push(Qo(e));
    return o;
  }
  static _$Eu(e, o) {
    const s = o.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((o) => this.enableUpdating = o), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((o) => o(this));
  }
  addController(e) {
    var o;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((o = e.hostConnected) == null || o.call(e));
  }
  removeController(e) {
    var o;
    (o = this._$EO) == null || o.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), o = this.constructor.elementProperties;
    for (const s of o.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return js(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((o) => {
      var s;
      return (s = o.hostConnected) == null ? void 0 : s.call(o);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((o) => {
      var s;
      return (s = o.hostDisconnected) == null ? void 0 : s.call(o);
    });
  }
  attributeChangedCallback(e, o, s) {
    this._$AK(e, s);
  }
  _$ET(e, o) {
    var l;
    const s = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, s);
    if (r !== void 0 && s.reflect === !0) {
      const i = (((l = s.converter) == null ? void 0 : l.toAttribute) !== void 0 ? s.converter : Dt).toAttribute(o, s.type);
      this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
    }
  }
  _$AK(e, o) {
    var l, i;
    const s = this.constructor, r = s._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const n = s.getPropertyOptions(r), a = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((l = n.converter) == null ? void 0 : l.fromAttribute) !== void 0 ? n.converter : Dt;
      this._$Em = r;
      const c = a.fromAttribute(o, n.type);
      this[r] = c ?? ((i = this._$Ej) == null ? void 0 : i.get(r)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, o, s, r = !1, l) {
    var i;
    if (e !== void 0) {
      const n = this.constructor;
      if (r === !1 && (l = this[e]), s ?? (s = n.getPropertyOptions(e)), !((s.hasChanged ?? po)(l, o) || s.useDefault && s.reflect && l === ((i = this._$Ej) == null ? void 0 : i.get(e)) && !this.hasAttribute(n._$Eu(e, s)))) return;
      this.C(e, o, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, o, { useDefault: s, reflect: r, wrapped: l }, i) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, i ?? o ?? this[e]), l !== !0 || i !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (o = void 0), this._$AL.set(e, o)), r === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (o) {
      Promise.reject(o);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [l, i] of this._$Ep) this[l] = i;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [l, i] of r) {
        const { wrapped: n } = i, a = this[l];
        n !== !0 || this._$AL.has(l) || a === void 0 || this.C(l, void 0, i, a);
      }
    }
    let e = !1;
    const o = this._$AL;
    try {
      e = this.shouldUpdate(o), e ? (this.willUpdate(o), (s = this._$EO) == null || s.forEach((r) => {
        var l;
        return (l = r.hostUpdate) == null ? void 0 : l.call(r);
      }), this.update(o)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(o);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var o;
    (o = this._$EO) == null || o.forEach((s) => {
      var r;
      return (r = s.hostUpdated) == null ? void 0 : r.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((o) => this._$ET(o, this[o]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
Ot.elementStyles = [], Ot.shadowRootOptions = { mode: "open" }, Ot[te("elementProperties")] = /* @__PURE__ */ new Map(), Ot[te("finalized")] = /* @__PURE__ */ new Map(), Ie == null || Ie({ ReactiveElement: Ot }), (ht.reactiveElementVersions ?? (ht.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ee = globalThis, Ro = (t) => t, _e = ee.trustedTypes, To = _e ? _e.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, ds = "$lit$", ct = `lit$${Math.random().toFixed(9).slice(2)}$`, us = "?" + ct, Js = `<${us}>`, kt = document, oe = () => kt.createComment(""), se = (t) => t === null || typeof t != "object" && typeof t != "function", fo = Array.isArray, tr = (t) => fo(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", Ue = `[ 	
\f\r]`, Zt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Mo = /-->/g, Do = />/g, bt = RegExp(`>|${Ue}(?:([^\\s"'>=/]+)(${Ue}*=${Ue}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Vo = /'/g, Ho = /"/g, ps = /^(?:script|style|textarea|title)$/i, er = (t) => (e, ...o) => ({ _$litType$: t, strings: e, values: o }), _ = er(1), V = Symbol.for("lit-noChange"), w = Symbol.for("lit-nothing"), Bo = /* @__PURE__ */ new WeakMap(), _t = kt.createTreeWalker(kt, 129);
function fs(t, e) {
  if (!fo(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return To !== void 0 ? To.createHTML(e) : e;
}
const or = (t, e) => {
  const o = t.length - 1, s = [];
  let r, l = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", i = Zt;
  for (let n = 0; n < o; n++) {
    const a = t[n];
    let c, d, h = -1, m = 0;
    for (; m < a.length && (i.lastIndex = m, d = i.exec(a), d !== null); ) m = i.lastIndex, i === Zt ? d[1] === "!--" ? i = Mo : d[1] !== void 0 ? i = Do : d[2] !== void 0 ? (ps.test(d[2]) && (r = RegExp("</" + d[2], "g")), i = bt) : d[3] !== void 0 && (i = bt) : i === bt ? d[0] === ">" ? (i = r ?? Zt, h = -1) : d[1] === void 0 ? h = -2 : (h = i.lastIndex - d[2].length, c = d[1], i = d[3] === void 0 ? bt : d[3] === '"' ? Ho : Vo) : i === Ho || i === Vo ? i = bt : i === Mo || i === Do ? i = Zt : (i = bt, r = void 0);
    const p = i === bt && t[n + 1].startsWith("/>") ? " " : "";
    l += i === Zt ? a + Js : h >= 0 ? (s.push(c), a.slice(0, h) + ds + a.slice(h) + ct + p) : a + ct + (h === -2 ? n : p);
  }
  return [fs(t, l + (t[o] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class re {
  constructor({ strings: e, _$litType$: o }, s) {
    let r;
    this.parts = [];
    let l = 0, i = 0;
    const n = e.length - 1, a = this.parts, [c, d] = or(e, o);
    if (this.el = re.createElement(c, s), _t.currentNode = this.el.content, o === 2 || o === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (r = _t.nextNode()) !== null && a.length < n; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const h of r.getAttributeNames()) if (h.endsWith(ds)) {
          const m = d[i++], p = r.getAttribute(h).split(ct), g = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: l, name: g[2], strings: p, ctor: g[1] === "." ? rr : g[1] === "?" ? lr : g[1] === "@" ? ir : Pe }), r.removeAttribute(h);
        } else h.startsWith(ct) && (a.push({ type: 6, index: l }), r.removeAttribute(h));
        if (ps.test(r.tagName)) {
          const h = r.textContent.split(ct), m = h.length - 1;
          if (m > 0) {
            r.textContent = _e ? _e.emptyScript : "";
            for (let p = 0; p < m; p++) r.append(h[p], oe()), _t.nextNode(), a.push({ type: 2, index: ++l });
            r.append(h[m], oe());
          }
        }
      } else if (r.nodeType === 8) if (r.data === us) a.push({ type: 2, index: l });
      else {
        let h = -1;
        for (; (h = r.data.indexOf(ct, h + 1)) !== -1; ) a.push({ type: 7, index: l }), h += ct.length - 1;
      }
      l++;
    }
  }
  static createElement(e, o) {
    const s = kt.createElement("template");
    return s.innerHTML = e, s;
  }
}
function Vt(t, e, o = t, s) {
  var i, n;
  if (e === V) return e;
  let r = s !== void 0 ? (i = o._$Co) == null ? void 0 : i[s] : o._$Cl;
  const l = se(e) ? void 0 : e._$litDirective$;
  return (r == null ? void 0 : r.constructor) !== l && ((n = r == null ? void 0 : r._$AO) == null || n.call(r, !1), l === void 0 ? r = void 0 : (r = new l(t), r._$AT(t, o, s)), s !== void 0 ? (o._$Co ?? (o._$Co = []))[s] = r : o._$Cl = r), r !== void 0 && (e = Vt(t, r._$AS(t, e.values), r, s)), e;
}
class sr {
  constructor(e, o) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = o;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: o }, parts: s } = this._$AD, r = ((e == null ? void 0 : e.creationScope) ?? kt).importNode(o, !0);
    _t.currentNode = r;
    let l = _t.nextNode(), i = 0, n = 0, a = s[0];
    for (; a !== void 0; ) {
      if (i === a.index) {
        let c;
        a.type === 2 ? c = new he(l, l.nextSibling, this, e) : a.type === 1 ? c = new a.ctor(l, a.name, a.strings, this, e) : a.type === 6 && (c = new nr(l, this, e)), this._$AV.push(c), a = s[++n];
      }
      i !== (a == null ? void 0 : a.index) && (l = _t.nextNode(), i++);
    }
    return _t.currentNode = kt, r;
  }
  p(e) {
    let o = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, o), o += s.strings.length - 2) : s._$AI(e[o])), o++;
  }
}
class he {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, o, s, r) {
    this.type = 2, this._$AH = w, this._$AN = void 0, this._$AA = e, this._$AB = o, this._$AM = s, this.options = r, this._$Cv = (r == null ? void 0 : r.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const o = this._$AM;
    return o !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = o.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, o = this) {
    e = Vt(this, e, o), se(e) ? e === w || e == null || e === "" ? (this._$AH !== w && this._$AR(), this._$AH = w) : e !== this._$AH && e !== V && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : tr(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== w && se(this._$AH) ? this._$AA.nextSibling.data = e : this.T(kt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var l;
    const { values: o, _$litType$: s } = e, r = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = re.createElement(fs(s.h, s.h[0]), this.options)), s);
    if (((l = this._$AH) == null ? void 0 : l._$AD) === r) this._$AH.p(o);
    else {
      const i = new sr(r, this), n = i.u(this.options);
      i.p(o), this.T(n), this._$AH = i;
    }
  }
  _$AC(e) {
    let o = Bo.get(e.strings);
    return o === void 0 && Bo.set(e.strings, o = new re(e)), o;
  }
  k(e) {
    fo(this._$AH) || (this._$AH = [], this._$AR());
    const o = this._$AH;
    let s, r = 0;
    for (const l of e) r === o.length ? o.push(s = new he(this.O(oe()), this.O(oe()), this, this.options)) : s = o[r], s._$AI(l), r++;
    r < o.length && (this._$AR(s && s._$AB.nextSibling, r), o.length = r);
  }
  _$AR(e = this._$AA.nextSibling, o) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, o); e !== this._$AB; ) {
      const r = Ro(e).nextSibling;
      Ro(e).remove(), e = r;
    }
  }
  setConnected(e) {
    var o;
    this._$AM === void 0 && (this._$Cv = e, (o = this._$AP) == null || o.call(this, e));
  }
}
class Pe {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, o, s, r, l) {
    this.type = 1, this._$AH = w, this._$AN = void 0, this.element = e, this.name = o, this._$AM = r, this.options = l, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = w;
  }
  _$AI(e, o = this, s, r) {
    const l = this.strings;
    let i = !1;
    if (l === void 0) e = Vt(this, e, o, 0), i = !se(e) || e !== this._$AH && e !== V, i && (this._$AH = e);
    else {
      const n = e;
      let a, c;
      for (e = l[0], a = 0; a < l.length - 1; a++) c = Vt(this, n[s + a], o, a), c === V && (c = this._$AH[a]), i || (i = !se(c) || c !== this._$AH[a]), c === w ? e = w : e !== w && (e += (c ?? "") + l[a + 1]), this._$AH[a] = c;
    }
    i && !r && this.j(e);
  }
  j(e) {
    e === w ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class rr extends Pe {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === w ? void 0 : e;
  }
}
class lr extends Pe {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== w);
  }
}
class ir extends Pe {
  constructor(e, o, s, r, l) {
    super(e, o, s, r, l), this.type = 5;
  }
  _$AI(e, o = this) {
    if ((e = Vt(this, e, o, 0) ?? w) === V) return;
    const s = this._$AH, r = e === w && s !== w || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, l = e !== w && (s === w || r);
    r && this.element.removeEventListener(this.name, this, s), l && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var o;
    typeof this._$AH == "function" ? this._$AH.call(((o = this.options) == null ? void 0 : o.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class nr {
  constructor(e, o, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = o, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Vt(this, e);
  }
}
const je = ee.litHtmlPolyfillSupport;
je == null || je(re, he), (ee.litHtmlVersions ?? (ee.litHtmlVersions = [])).push("3.3.3");
const ar = (t, e, o) => {
  const s = (o == null ? void 0 : o.renderBefore) ?? e;
  let r = s._$litPart$;
  if (r === void 0) {
    const l = (o == null ? void 0 : o.renderBefore) ?? null;
    s._$litPart$ = r = new he(e.insertBefore(oe(), l), l, void 0, o ?? {});
  }
  return r._$AI(t), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $t = globalThis;
let z = class extends Ot {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var o;
    const e = super.createRenderRoot();
    return (o = this.renderOptions).renderBefore ?? (o.renderBefore = e.firstChild), e;
  }
  update(e) {
    const o = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ar(o, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return V;
  }
};
var cs;
z._$litElement$ = !0, z.finalized = !0, (cs = $t.litElementHydrateSupport) == null || cs.call($t, { LitElement: z });
const We = $t.litElementPolyfillSupport;
We == null || We({ LitElement: z });
($t.litElementVersions ?? ($t.litElementVersions = [])).push("4.2.2");
var cr = k`
  :host {
    display: inline-block;
  }

  :host([size='small']) {
    --height: var(--sl-toggle-size-small);
    --thumb-size: calc(var(--sl-toggle-size-small) + 4px);
    --width: calc(var(--height) * 2);

    font-size: var(--sl-input-font-size-small);
  }

  :host([size='medium']) {
    --height: var(--sl-toggle-size-medium);
    --thumb-size: calc(var(--sl-toggle-size-medium) + 4px);
    --width: calc(var(--height) * 2);

    font-size: var(--sl-input-font-size-medium);
  }

  :host([size='large']) {
    --height: var(--sl-toggle-size-large);
    --thumb-size: calc(var(--sl-toggle-size-large) + 4px);
    --width: calc(var(--height) * 2);

    font-size: var(--sl-input-font-size-large);
  }

  .switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: var(--sl-input-font-family);
    font-size: inherit;
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .switch__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--width);
    height: var(--height);
    background-color: var(--sl-color-neutral-400);
    border: solid var(--sl-input-border-width) var(--sl-color-neutral-400);
    border-radius: var(--height);
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color;
  }

  .switch__control .switch__thumb {
    width: var(--thumb-size);
    height: var(--thumb-size);
    background-color: var(--sl-color-neutral-0);
    border-radius: 50%;
    border: solid var(--sl-input-border-width) var(--sl-color-neutral-400);
    translate: calc((var(--width) - var(--height)) / -2);
    transition:
      var(--sl-transition-fast) translate ease,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) box-shadow;
  }

  .switch__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  /* Hover */
  .switch:not(.switch--checked):not(.switch--disabled) .switch__control:hover {
    background-color: var(--sl-color-neutral-400);
    border-color: var(--sl-color-neutral-400);
  }

  .switch:not(.switch--checked):not(.switch--disabled) .switch__control:hover .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-neutral-400);
  }

  /* Focus */
  .switch:not(.switch--checked):not(.switch--disabled) .switch__input:focus-visible ~ .switch__control {
    background-color: var(--sl-color-neutral-400);
    border-color: var(--sl-color-neutral-400);
  }

  .switch:not(.switch--checked):not(.switch--disabled) .switch__input:focus-visible ~ .switch__control .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Checked */
  .switch--checked .switch__control {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
  }

  .switch--checked .switch__control .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    translate: calc((var(--width) - var(--height)) / 2);
  }

  /* Checked + hover */
  .switch.switch--checked:not(.switch--disabled) .switch__control:hover {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
  }

  .switch.switch--checked:not(.switch--disabled) .switch__control:hover .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
  }

  /* Checked + focus */
  .switch.switch--checked:not(.switch--disabled) .switch__input:focus-visible ~ .switch__control {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
  }

  .switch.switch--checked:not(.switch--disabled) .switch__input:focus-visible ~ .switch__control .switch__thumb {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-color-primary-600);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .switch--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch__label {
    display: inline-block;
    line-height: var(--height);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  :host([required]) .switch__label::after {
    content: var(--sl-input-required-content);
    color: var(--sl-input-required-content-color);
    margin-inline-start: var(--sl-input-required-content-offset);
  }

  @media (forced-colors: active) {
    .switch.switch--checked:not(.switch--disabled) .switch__control:hover .switch__thumb,
    .switch--checked .switch__control .switch__thumb {
      background-color: ButtonText;
    }
  }
`, hr = (t = "value") => (e, o) => {
  const s = e.constructor, r = s.prototype.attributeChangedCallback;
  s.prototype.attributeChangedCallback = function(l, i, n) {
    var a;
    const c = s.getPropertyOptions(t), d = typeof c.attribute == "string" ? c.attribute : t;
    if (l === d) {
      const h = c.converter || Dt, p = (typeof h == "function" ? h : (a = h == null ? void 0 : h.fromAttribute) != null ? a : Dt.fromAttribute)(n, c.type);
      this[t] !== p && (this[o] = p);
    }
    r.call(this, l, i, n);
  };
}, dr = k`
  .form-control .form-control__label {
    display: none;
  }

  .form-control .form-control__help-text {
    display: none;
  }

  /* Label */
  .form-control--has-label .form-control__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    margin-bottom: var(--sl-spacing-3x-small);
  }

  .form-control--has-label.form-control--small .form-control__label {
    font-size: var(--sl-input-label-font-size-small);
  }

  .form-control--has-label.form-control--medium .form-control__label {
    font-size: var(--sl-input-label-font-size-medium);
  }

  .form-control--has-label.form-control--large .form-control__label {
    font-size: var(--sl-input-label-font-size-large);
  }

  :host([required]) .form-control--has-label .form-control__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
    color: var(--sl-input-required-content-color);
  }

  /* Help text */
  .form-control--has-help-text .form-control__help-text {
    display: block;
    color: var(--sl-input-help-text-color);
    margin-top: var(--sl-spacing-3x-small);
  }

  .form-control--has-help-text.form-control--small .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-small);
  }

  .form-control--has-help-text.form-control--medium .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-medium);
  }

  .form-control--has-help-text.form-control--large .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-large);
  }

  .form-control--has-help-text.form-control--radio-group .form-control__help-text {
    margin-top: var(--sl-spacing-2x-small);
  }
`, ms = Object.defineProperty, ur = Object.defineProperties, pr = Object.getOwnPropertyDescriptor, fr = Object.getOwnPropertyDescriptors, Fo = Object.getOwnPropertySymbols, mr = Object.prototype.hasOwnProperty, gr = Object.prototype.propertyIsEnumerable, qe = (t, e) => (e = Symbol[t]) ? e : Symbol.for("Symbol." + t), mo = (t) => {
  throw TypeError(t);
}, No = (t, e, o) => e in t ? ms(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o, St = (t, e) => {
  for (var o in e || (e = {}))
    mr.call(e, o) && No(t, o, e[o]);
  if (Fo)
    for (var o of Fo(e))
      gr.call(e, o) && No(t, o, e[o]);
  return t;
}, Oe = (t, e) => ur(t, fr(e)), f = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? pr(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && ms(e, o, r), r;
}, gs = (t, e, o) => e.has(t) || mo("Cannot " + o), vr = (t, e, o) => (gs(t, e, "read from private field"), e.get(t)), br = (t, e, o) => e.has(t) ? mo("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), yr = (t, e, o, s) => (gs(t, e, "write to private field"), e.set(t, o), o), wr = function(t, e) {
  this[0] = t, this[1] = e;
}, xr = (t) => {
  var e = t[qe("asyncIterator")], o = !1, s, r = {};
  return e == null ? (e = t[qe("iterator")](), s = (l) => r[l] = (i) => e[l](i)) : (e = e.call(t), s = (l) => r[l] = (i) => {
    if (o) {
      if (o = !1, l === "throw") throw i;
      return i;
    }
    return o = !0, {
      done: !1,
      value: new wr(new Promise((n) => {
        var a = e[l](i);
        a instanceof Object || mo("Object expected"), n(a);
      }), 1)
    };
  }), r[qe("iterator")] = () => r, s("next"), "throw" in e ? s("throw") : r.throw = (l) => {
    throw l;
  }, "return" in e && s("return"), r;
}, Kt = /* @__PURE__ */ new WeakMap(), Xt = /* @__PURE__ */ new WeakMap(), Yt = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ new WeakSet(), ge = /* @__PURE__ */ new WeakMap(), _r = class {
  constructor(t, e) {
    this.handleFormData = (o) => {
      const s = this.options.disabled(this.host), r = this.options.name(this.host), l = this.options.value(this.host), i = this.host.tagName.toLowerCase() === "sl-button";
      this.host.isConnected && !s && !i && typeof r == "string" && r.length > 0 && typeof l < "u" && (Array.isArray(l) ? l.forEach((n) => {
        o.formData.append(r, n.toString());
      }) : o.formData.append(r, l.toString()));
    }, this.handleFormSubmit = (o) => {
      var s;
      const r = this.options.disabled(this.host), l = this.options.reportValidity;
      this.form && !this.form.noValidate && ((s = Kt.get(this.form)) == null || s.forEach((i) => {
        this.setUserInteracted(i, !0);
      })), this.form && !this.form.noValidate && !r && !l(this.host) && (o.preventDefault(), o.stopImmediatePropagation());
    }, this.handleFormReset = () => {
      this.options.setValue(this.host, this.options.defaultValue(this.host)), this.setUserInteracted(this.host, !1), ge.set(this.host, []);
    }, this.handleInteraction = (o) => {
      const s = ge.get(this.host);
      s.includes(o.type) || s.push(o.type), s.length === this.options.assumeInteractionOn.length && this.setUserInteracted(this.host, !0);
    }, this.checkFormValidity = () => {
      if (this.form && !this.form.noValidate) {
        const o = this.form.querySelectorAll("*");
        for (const s of o)
          if (typeof s.checkValidity == "function" && !s.checkValidity())
            return !1;
      }
      return !0;
    }, this.reportFormValidity = () => {
      if (this.form && !this.form.noValidate) {
        const o = this.form.querySelectorAll("*");
        for (const s of o)
          if (typeof s.reportValidity == "function" && !s.reportValidity())
            return !1;
      }
      return !0;
    }, (this.host = t).addController(this), this.options = St({
      form: (o) => {
        const s = o.form;
        if (s) {
          const l = o.getRootNode().querySelector(`#${s}`);
          if (l)
            return l;
        }
        return o.closest("form");
      },
      name: (o) => o.name,
      value: (o) => o.value,
      defaultValue: (o) => o.defaultValue,
      disabled: (o) => {
        var s;
        return (s = o.disabled) != null ? s : !1;
      },
      reportValidity: (o) => typeof o.reportValidity == "function" ? o.reportValidity() : !0,
      checkValidity: (o) => typeof o.checkValidity == "function" ? o.checkValidity() : !0,
      setValue: (o, s) => o.value = s,
      assumeInteractionOn: ["sl-input"]
    }, e);
  }
  hostConnected() {
    const t = this.options.form(this.host);
    t && this.attachForm(t), ge.set(this.host, []), this.options.assumeInteractionOn.forEach((e) => {
      this.host.addEventListener(e, this.handleInteraction);
    });
  }
  hostDisconnected() {
    this.detachForm(), ge.delete(this.host), this.options.assumeInteractionOn.forEach((t) => {
      this.host.removeEventListener(t, this.handleInteraction);
    });
  }
  hostUpdated() {
    const t = this.options.form(this.host);
    t || this.detachForm(), t && this.form !== t && (this.detachForm(), this.attachForm(t)), this.host.hasUpdated && this.setValidity(this.host.validity.valid);
  }
  attachForm(t) {
    t ? (this.form = t, Kt.has(this.form) ? Kt.get(this.form).add(this.host) : Kt.set(this.form, /* @__PURE__ */ new Set([this.host])), this.form.addEventListener("formdata", this.handleFormData), this.form.addEventListener("submit", this.handleFormSubmit), this.form.addEventListener("reset", this.handleFormReset), Xt.has(this.form) || (Xt.set(this.form, this.form.reportValidity), this.form.reportValidity = () => this.reportFormValidity()), Yt.has(this.form) || (Yt.set(this.form, this.form.checkValidity), this.form.checkValidity = () => this.checkFormValidity())) : this.form = void 0;
  }
  detachForm() {
    if (!this.form) return;
    const t = Kt.get(this.form);
    t && (t.delete(this.host), t.size <= 0 && (this.form.removeEventListener("formdata", this.handleFormData), this.form.removeEventListener("submit", this.handleFormSubmit), this.form.removeEventListener("reset", this.handleFormReset), Xt.has(this.form) && (this.form.reportValidity = Xt.get(this.form), Xt.delete(this.form)), Yt.has(this.form) && (this.form.checkValidity = Yt.get(this.form), Yt.delete(this.form)), this.form = void 0));
  }
  setUserInteracted(t, e) {
    e ? Ze.add(t) : Ze.delete(t), t.requestUpdate();
  }
  doAction(t, e) {
    if (this.form) {
      const o = document.createElement("button");
      o.type = t, o.style.position = "absolute", o.style.width = "0", o.style.height = "0", o.style.clipPath = "inset(50%)", o.style.overflow = "hidden", o.style.whiteSpace = "nowrap", e && (o.name = e.name, o.value = e.value, ["formaction", "formenctype", "formmethod", "formnovalidate", "formtarget"].forEach((s) => {
        e.hasAttribute(s) && o.setAttribute(s, e.getAttribute(s));
      })), this.form.append(o), o.click(), o.remove();
    }
  }
  /** Returns the associated `<form>` element, if one exists. */
  getForm() {
    var t;
    return (t = this.form) != null ? t : null;
  }
  /** Resets the form, restoring all the control to their default value */
  reset(t) {
    this.doAction("reset", t);
  }
  /** Submits the form, triggering validation and form data injection. */
  submit(t) {
    this.doAction("submit", t);
  }
  /**
   * Synchronously sets the form control's validity. Call this when you know the future validity but need to update
   * the host element immediately, i.e. before Lit updates the component in the next update.
   */
  setValidity(t) {
    const e = this.host, o = !!Ze.has(e), s = !!e.required;
    e.toggleAttribute("data-required", s), e.toggleAttribute("data-optional", !s), e.toggleAttribute("data-invalid", !t), e.toggleAttribute("data-valid", t), e.toggleAttribute("data-user-invalid", !t && o), e.toggleAttribute("data-user-valid", t && o);
  }
  /**
   * Updates the form control's validity based on the current value of `host.validity.valid`. Call this when anything
   * that affects constraint validation changes so the component receives the correct validity states.
   */
  updateValidity() {
    const t = this.host;
    this.setValidity(t.validity.valid);
  }
  /**
   * Dispatches a non-bubbling, cancelable custom event of type `sl-invalid`.
   * If the `sl-invalid` event will be cancelled then the original `invalid`
   * event (which may have been passed as argument) will also be cancelled.
   * If no original `invalid` event has been passed then the `sl-invalid`
   * event will be cancelled before being dispatched.
   */
  emitInvalidEvent(t) {
    const e = new CustomEvent("sl-invalid", {
      bubbles: !1,
      composed: !1,
      cancelable: !0,
      detail: {}
    });
    t || e.preventDefault(), this.host.dispatchEvent(e) || t == null || t.preventDefault();
  }
}, vs = Object.freeze({
  badInput: !1,
  customError: !1,
  patternMismatch: !1,
  rangeOverflow: !1,
  rangeUnderflow: !1,
  stepMismatch: !1,
  tooLong: !1,
  tooShort: !1,
  typeMismatch: !1,
  valid: !0,
  valueMissing: !1
});
Object.freeze(Oe(St({}, vs), {
  valid: !1,
  valueMissing: !0
}));
Object.freeze(Oe(St({}, vs), {
  valid: !1,
  customError: !0
}));
var bs = class {
  constructor(t, ...e) {
    this.slotNames = [], this.handleSlotChange = (o) => {
      const s = o.target;
      (this.slotNames.includes("[default]") && !s.name || s.name && this.slotNames.includes(s.name)) && this.host.requestUpdate();
    }, (this.host = t).addController(this), this.slotNames = e;
  }
  hasDefaultSlot() {
    return [...this.host.childNodes].some((t) => {
      if (t.nodeType === t.TEXT_NODE && t.textContent.trim() !== "")
        return !0;
      if (t.nodeType === t.ELEMENT_NODE) {
        const e = t;
        if (e.tagName.toLowerCase() === "sl-visually-hidden")
          return !1;
        if (!e.hasAttribute("slot"))
          return !0;
      }
      return !1;
    });
  }
  hasNamedSlot(t) {
    return this.host.querySelector(`:scope > [slot="${t}"]`) !== null;
  }
  test(t) {
    return t === "[default]" ? this.hasDefaultSlot() : this.hasNamedSlot(t);
  }
  hostConnected() {
    this.host.shadowRoot.addEventListener("slotchange", this.handleSlotChange);
  }
  hostDisconnected() {
    this.host.shadowRoot.removeEventListener("slotchange", this.handleSlotChange);
  }
};
function pt(t, e) {
  const o = St({
    waitUntilFirstUpdate: !1
  }, e);
  return (s, r) => {
    const { update: l } = s, i = Array.isArray(t) ? t : [t];
    s.update = function(n) {
      i.forEach((a) => {
        const c = a;
        if (n.has(c)) {
          const d = n.get(c), h = this[c];
          d !== h && (!o.waitUntilFirstUpdate || this.hasUpdated) && this[r](d, h);
        }
      }), l.call(this, n);
    };
  };
}
var Ft = k`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden] {
    display: none !important;
  }
`;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const T = (t) => (e, o) => {
  o !== void 0 ? o.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $r = { attribute: !0, type: String, converter: Dt, reflect: !1, hasChanged: po }, kr = (t = $r, e, o) => {
  const { kind: s, metadata: r } = o;
  let l = globalThis.litPropertyMetadata.get(r);
  if (l === void 0 && globalThis.litPropertyMetadata.set(r, l = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), l.set(o.name, t), s === "accessor") {
    const { name: i } = o;
    return { set(n) {
      const a = e.get.call(this);
      e.set.call(this, n), this.requestUpdate(i, a, t, !0, n);
    }, init(n) {
      return n !== void 0 && this.C(i, void 0, t, n), n;
    } };
  }
  if (s === "setter") {
    const { name: i } = o;
    return function(n) {
      const a = this[i];
      e.call(this, n), this.requestUpdate(i, a, t, !0, n);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function u(t) {
  return (e, o) => typeof o == "object" ? kr(t, e, o) : ((s, r, l) => {
    const i = r.hasOwnProperty(l);
    return r.constructor.createProperty(l, s), i ? Object.getOwnPropertyDescriptor(r, l) : void 0;
  })(t, e, o);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function de(t) {
  return u({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lr = (t, e, o) => (o.configurable = !0, o.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, o), o);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function U(t, e) {
  return (o, s, r) => {
    const l = (i) => {
      var n;
      return ((n = i.renderRoot) == null ? void 0 : n.querySelector(t)) ?? null;
    };
    return Lr(o, s, { get() {
      return l(this);
    } });
  };
}
var we, X = class extends z {
  constructor() {
    super(), br(this, we, !1), this.initialReflectedProperties = /* @__PURE__ */ new Map(), Object.entries(this.constructor.dependencies).forEach(([t, e]) => {
      this.constructor.define(t, e);
    });
  }
  emit(t, e) {
    const o = new CustomEvent(t, St({
      bubbles: !0,
      cancelable: !1,
      composed: !0,
      detail: {}
    }, e));
    return this.dispatchEvent(o), o;
  }
  /* eslint-enable */
  static define(t, e = this, o = {}) {
    const s = customElements.get(t);
    if (!s) {
      try {
        customElements.define(t, e, o);
      } catch {
        customElements.define(t, class extends e {
        }, o);
      }
      return;
    }
    let r = " (unknown version)", l = r;
    "version" in e && e.version && (r = " v" + e.version), "version" in s && s.version && (l = " v" + s.version), !(r && l && r === l) && console.warn(
      `Attempted to register <${t}>${r}, but <${t}>${l} has already been registered.`
    );
  }
  attributeChangedCallback(t, e, o) {
    vr(this, we) || (this.constructor.elementProperties.forEach(
      (s, r) => {
        s.reflect && this[r] != null && this.initialReflectedProperties.set(r, this[r]);
      }
    ), yr(this, we, !0)), super.attributeChangedCallback(t, e, o);
  }
  willUpdate(t) {
    super.willUpdate(t), this.initialReflectedProperties.forEach((e, o) => {
      t.has(o) && this[o] == null && (this[o] = e);
    });
  }
};
we = /* @__PURE__ */ new WeakMap();
X.version = "2.20.1";
X.dependencies = {};
f([
  u()
], X.prototype, "dir", 2);
f([
  u()
], X.prototype, "lang", 2);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4 }, go = (t) => (...e) => ({ _$litDirective$: t, values: e });
let vo = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, o, s) {
    this._$Ct = e, this._$AM = o, this._$Ci = s;
  }
  _$AS(e, o) {
    return this.update(e, o);
  }
  update(e, o) {
    return this.render(...o);
  }
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lt = go(class extends vo {
  constructor(t) {
    var e;
    if (super(t), t.type !== at.ATTRIBUTE || t.name !== "class" || ((e = t.strings) == null ? void 0 : e.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t) {
    return " " + Object.keys(t).filter((e) => t[e]).join(" ") + " ";
  }
  update(t, [e]) {
    var s, r;
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), t.strings !== void 0 && (this.nt = new Set(t.strings.join(" ").split(/\s/).filter((l) => l !== "")));
      for (const l in e) e[l] && !((s = this.nt) != null && s.has(l)) && this.st.add(l);
      return this.render(e);
    }
    const o = t.element.classList;
    for (const l of this.st) l in e || (o.remove(l), this.st.delete(l));
    for (const l in e) {
      const i = !!e[l];
      i === this.st.has(l) || (r = this.nt) != null && r.has(l) || (i ? (o.add(l), this.st.add(l)) : (o.remove(l), this.st.delete(l)));
    }
    return V;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M = (t) => t ?? w;
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Cr = (t, e) => (t == null ? void 0 : t._$litType$) !== void 0, Ar = (t) => t.strings === void 0, zr = {}, Er = (t, e = zr) => t._$AH = e;
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Sr = go(class extends vo {
  constructor(t) {
    if (super(t), t.type !== at.PROPERTY && t.type !== at.ATTRIBUTE && t.type !== at.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!Ar(t)) throw Error("`live` bindings can only contain a single expression");
  }
  render(t) {
    return t;
  }
  update(t, [e]) {
    if (e === V || e === w) return e;
    const o = t.element, s = t.name;
    if (t.type === at.PROPERTY) {
      if (e === o[s]) return V;
    } else if (t.type === at.BOOLEAN_ATTRIBUTE) {
      if (!!e === o.hasAttribute(s)) return V;
    } else if (t.type === at.ATTRIBUTE && o.getAttribute(s) === e + "") return V;
    return Er(t), e;
  }
});
var Q = class extends X {
  constructor() {
    super(...arguments), this.formControlController = new _r(this, {
      value: (t) => t.checked ? t.value || "on" : void 0,
      defaultValue: (t) => t.defaultChecked,
      setValue: (t, e) => t.checked = e
    }), this.hasSlotController = new bs(this, "help-text"), this.hasFocus = !1, this.title = "", this.name = "", this.size = "medium", this.disabled = !1, this.checked = !1, this.defaultChecked = !1, this.form = "", this.required = !1, this.helpText = "";
  }
  /** Gets the validity state object */
  get validity() {
    return this.input.validity;
  }
  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }
  firstUpdated() {
    this.formControlController.updateValidity();
  }
  handleBlur() {
    this.hasFocus = !1, this.emit("sl-blur");
  }
  handleInput() {
    this.emit("sl-input");
  }
  handleInvalid(t) {
    this.formControlController.setValidity(!1), this.formControlController.emitInvalidEvent(t);
  }
  handleClick() {
    this.checked = !this.checked, this.emit("sl-change");
  }
  handleFocus() {
    this.hasFocus = !0, this.emit("sl-focus");
  }
  handleKeyDown(t) {
    t.key === "ArrowLeft" && (t.preventDefault(), this.checked = !1, this.emit("sl-change"), this.emit("sl-input")), t.key === "ArrowRight" && (t.preventDefault(), this.checked = !0, this.emit("sl-change"), this.emit("sl-input"));
  }
  handleCheckedChange() {
    this.input.checked = this.checked, this.formControlController.updateValidity();
  }
  handleDisabledChange() {
    this.formControlController.setValidity(!0);
  }
  /** Simulates a click on the switch. */
  click() {
    this.input.click();
  }
  /** Sets focus on the switch. */
  focus(t) {
    this.input.focus(t);
  }
  /** Removes focus from the switch. */
  blur() {
    this.input.blur();
  }
  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    return this.input.checkValidity();
  }
  /** Gets the associated form, if one exists. */
  getForm() {
    return this.formControlController.getForm();
  }
  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.input.reportValidity();
  }
  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(t) {
    this.input.setCustomValidity(t), this.formControlController.updateValidity();
  }
  render() {
    const t = this.hasSlotController.test("help-text"), e = this.helpText ? !0 : !!t;
    return _`
      <div
        class=${Lt({
      "form-control": !0,
      "form-control--small": this.size === "small",
      "form-control--medium": this.size === "medium",
      "form-control--large": this.size === "large",
      "form-control--has-help-text": e
    })}
      >
        <label
          part="base"
          class=${Lt({
      switch: !0,
      "switch--checked": this.checked,
      "switch--disabled": this.disabled,
      "switch--focused": this.hasFocus,
      "switch--small": this.size === "small",
      "switch--medium": this.size === "medium",
      "switch--large": this.size === "large"
    })}
        >
          <input
            class="switch__input"
            type="checkbox"
            title=${this.title}
            name=${this.name}
            value=${M(this.value)}
            .checked=${Sr(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            role="switch"
            aria-checked=${this.checked ? "true" : "false"}
            aria-describedby="help-text"
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
            @keydown=${this.handleKeyDown}
          />

          <span part="control" class="switch__control">
            <span part="thumb" class="switch__thumb"></span>
          </span>

          <div part="label" class="switch__label">
            <slot></slot>
          </div>
        </label>

        <div
          aria-hidden=${e ? "false" : "true"}
          class="form-control__help-text"
          id="help-text"
          part="form-control-help-text"
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `;
  }
};
Q.styles = [Ft, dr, cr];
f([
  U('input[type="checkbox"]')
], Q.prototype, "input", 2);
f([
  de()
], Q.prototype, "hasFocus", 2);
f([
  u()
], Q.prototype, "title", 2);
f([
  u()
], Q.prototype, "name", 2);
f([
  u()
], Q.prototype, "value", 2);
f([
  u({ reflect: !0 })
], Q.prototype, "size", 2);
f([
  u({ type: Boolean, reflect: !0 })
], Q.prototype, "disabled", 2);
f([
  u({ type: Boolean, reflect: !0 })
], Q.prototype, "checked", 2);
f([
  hr("checked")
], Q.prototype, "defaultChecked", 2);
f([
  u({ reflect: !0 })
], Q.prototype, "form", 2);
f([
  u({ type: Boolean, reflect: !0 })
], Q.prototype, "required", 2);
f([
  u({ attribute: "help-text" })
], Q.prototype, "helpText", 2);
f([
  pt("checked", { waitUntilFirstUpdate: !0 })
], Q.prototype, "handleCheckedChange", 1);
f([
  pt("disabled", { waitUntilFirstUpdate: !0 })
], Q.prototype, "handleDisabledChange", 1);
Q.define("sl-switch");
var to = "";
function Io(t) {
  to = t;
}
function Qr(t = "") {
  if (!to) {
    const e = [...document.getElementsByTagName("script")], o = e.find((s) => s.hasAttribute("data-shoelace"));
    if (o)
      Io(o.getAttribute("data-shoelace"));
    else {
      const s = e.find((l) => /shoelace(\.min)?\.js($|\?)/.test(l.src) || /shoelace-autoloader(\.min)?\.js($|\?)/.test(l.src));
      let r = "";
      s && (r = s.getAttribute("src")), Io(r.split("/").slice(0, -1).join("/"));
    }
  }
  return to.replace(/\/$/, "") + (t ? `/${t.replace(/^\//, "")}` : "");
}
var Pr = {
  name: "default",
  resolver: (t) => Qr(`assets/icons/${t}.svg`)
}, Or = Pr, Uo = {
  caret: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,
  check: `
    <svg part="checked-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor">
          <g transform="translate(3.428571, 3.428571)">
            <path d="M0,5.71428571 L3.42857143,9.14285714"></path>
            <path d="M9.14285714,0 L3.42857143,9.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,
  "chevron-down": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,
  "chevron-left": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
  `,
  "chevron-right": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,
  copy: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
    </svg>
  `,
  eye: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  `,
  "eye-slash": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  `,
  eyedropper: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
    </svg>
  `,
  "grip-vertical": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
      <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
    </svg>
  `,
  indeterminate: `
    <svg part="indeterminate-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor" stroke-width="2">
          <g transform="translate(2.285714, 6.857143)">
            <path d="M10.2857143,1.14285714 L1.14285714,1.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,
  "person-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  `,
  "play-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
    </svg>
  `,
  "pause-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
    </svg>
  `,
  radio: `
    <svg part="checked-icon" class="radio__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor">
          <circle cx="8" cy="8" r="3.42857143"></circle>
        </g>
      </g>
    </svg>
  `,
  "star-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  `,
  "x-lg": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  `,
  "x-circle-fill": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
    </svg>
  `
}, Rr = {
  name: "system",
  resolver: (t) => t in Uo ? `data:image/svg+xml,${encodeURIComponent(Uo[t])}` : ""
}, Tr = Rr, $e = [Or, Tr], ke = [];
function Mr(t) {
  ke.push(t);
}
function Dr(t) {
  ke = ke.filter((e) => e !== t);
}
function jo(t) {
  return $e.find((e) => e.name === t);
}
function ys(t, e) {
  Vr(t), $e.push({
    name: t,
    resolver: e.resolver,
    mutator: e.mutator,
    spriteSheet: e.spriteSheet
  }), ke.forEach((o) => {
    o.library === t && o.setIcon();
  });
}
function Vr(t) {
  $e = $e.filter((e) => e.name !== t);
}
const Hr = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
</svg>`, Br = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
</svg>`, Fr = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-power" viewBox="0 0 16 16">
  <path d="M7.5 1v7h1V1z"/>
  <path d="M3 8.812a5 5 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812"/>
</svg>`, Nr = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
</svg>`, Ir = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sign-stop-fill" viewBox="0 0 16 16">
  <path d="M10.371 8.277v-.553c0-.827-.422-1.234-.987-1.234-.572 0-.99.407-.99 1.234v.553c0 .83.418 1.237.99 1.237.565 0 .987-.408.987-1.237m2.586-.24c.463 0 .735-.272.735-.744s-.272-.741-.735-.741h-.774v1.485z"/>
  <path d="M4.893 0a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146A.5.5 0 0 0 11.107 0zM3.16 10.08c-.931 0-1.447-.493-1.494-1.132h.653c.065.346.396.583.891.583.524 0 .83-.246.83-.62 0-.303-.203-.467-.637-.572l-.656-.164c-.61-.147-.978-.51-.978-1.078 0-.706.597-1.184 1.444-1.184.853 0 1.386.475 1.436 1.087h-.645c-.064-.32-.352-.542-.797-.542-.472 0-.77.246-.77.6 0 .261.196.437.553.522l.654.161c.673.164 1.06.487 1.06 1.11 0 .736-.574 1.228-1.544 1.228Zm3.427-3.51V10h-.665V6.57H4.753V6h3.006v.568H6.587Zm4.458 1.16v.544c0 1.131-.636 1.805-1.661 1.805-1.026 0-1.664-.674-1.664-1.805V7.73c0-1.136.638-1.807 1.664-1.807s1.66.674 1.66 1.807ZM11.52 6h1.535c.82 0 1.316.55 1.316 1.292 0 .747-.501 1.289-1.321 1.289h-.865V10h-.665V6.001Z"/>
</svg>`, Ur = ':root,:host,.sl-theme-light{color-scheme:light;--sl-color-gray-50: hsl(0 0% 97.5%);--sl-color-gray-100: hsl(240 4.8% 95.9%);--sl-color-gray-200: hsl(240 5.9% 90%);--sl-color-gray-300: hsl(240 4.9% 83.9%);--sl-color-gray-400: hsl(240 5% 64.9%);--sl-color-gray-500: hsl(240 3.8% 46.1%);--sl-color-gray-600: hsl(240 5.2% 33.9%);--sl-color-gray-700: hsl(240 5.3% 26.1%);--sl-color-gray-800: hsl(240 3.7% 15.9%);--sl-color-gray-900: hsl(240 5.9% 10%);--sl-color-gray-950: hsl(240 7.3% 8%);--sl-color-red-50: hsl(0 85.7% 97.3%);--sl-color-red-100: hsl(0 93.3% 94.1%);--sl-color-red-200: hsl(0 96.3% 89.4%);--sl-color-red-300: hsl(0 93.5% 81.8%);--sl-color-red-400: hsl(0 90.6% 70.8%);--sl-color-red-500: hsl(0 84.2% 60.2%);--sl-color-red-600: hsl(0 72.2% 50.6%);--sl-color-red-700: hsl(0 73.7% 41.8%);--sl-color-red-800: hsl(0 70% 35.3%);--sl-color-red-900: hsl(0 62.8% 30.6%);--sl-color-red-950: hsl(0 60% 19.6%);--sl-color-orange-50: hsl(33.3 100% 96.5%);--sl-color-orange-100: hsl(34.3 100% 91.8%);--sl-color-orange-200: hsl(32.1 97.7% 83.1%);--sl-color-orange-300: hsl(30.7 97.2% 72.4%);--sl-color-orange-400: hsl(27 96% 61%);--sl-color-orange-500: hsl(24.6 95% 53.1%);--sl-color-orange-600: hsl(20.5 90.2% 48.2%);--sl-color-orange-700: hsl(17.5 88.3% 40.4%);--sl-color-orange-800: hsl(15 79.1% 33.7%);--sl-color-orange-900: hsl(15.3 74.6% 27.8%);--sl-color-orange-950: hsl(15.2 69.1% 19%);--sl-color-amber-50: hsl(48 100% 96.1%);--sl-color-amber-100: hsl(48 96.5% 88.8%);--sl-color-amber-200: hsl(48 96.6% 76.7%);--sl-color-amber-300: hsl(45.9 96.7% 64.5%);--sl-color-amber-400: hsl(43.3 96.4% 56.3%);--sl-color-amber-500: hsl(37.7 92.1% 50.2%);--sl-color-amber-600: hsl(32.1 94.6% 43.7%);--sl-color-amber-700: hsl(26 90.5% 37.1%);--sl-color-amber-800: hsl(22.7 82.5% 31.4%);--sl-color-amber-900: hsl(21.7 77.8% 26.5%);--sl-color-amber-950: hsl(22.9 74.1% 16.7%);--sl-color-yellow-50: hsl(54.5 91.7% 95.3%);--sl-color-yellow-100: hsl(54.9 96.7% 88%);--sl-color-yellow-200: hsl(52.8 98.3% 76.9%);--sl-color-yellow-300: hsl(50.4 97.8% 63.5%);--sl-color-yellow-400: hsl(47.9 95.8% 53.1%);--sl-color-yellow-500: hsl(45.4 93.4% 47.5%);--sl-color-yellow-600: hsl(40.6 96.1% 40.4%);--sl-color-yellow-700: hsl(35.5 91.7% 32.9%);--sl-color-yellow-800: hsl(31.8 81% 28.8%);--sl-color-yellow-900: hsl(28.4 72.5% 25.7%);--sl-color-yellow-950: hsl(33.1 69% 13.9%);--sl-color-lime-50: hsl(78.3 92% 95.1%);--sl-color-lime-100: hsl(79.6 89.1% 89.2%);--sl-color-lime-200: hsl(80.9 88.5% 79.6%);--sl-color-lime-300: hsl(82 84.5% 67.1%);--sl-color-lime-400: hsl(82.7 78% 55.5%);--sl-color-lime-500: hsl(83.7 80.5% 44.3%);--sl-color-lime-600: hsl(84.8 85.2% 34.5%);--sl-color-lime-700: hsl(85.9 78.4% 27.3%);--sl-color-lime-800: hsl(86.3 69% 22.7%);--sl-color-lime-900: hsl(87.6 61.2% 20.2%);--sl-color-lime-950: hsl(86.5 60.6% 13.9%);--sl-color-green-50: hsl(138.5 76.5% 96.7%);--sl-color-green-100: hsl(140.6 84.2% 92.5%);--sl-color-green-200: hsl(141 78.9% 85.1%);--sl-color-green-300: hsl(141.7 76.6% 73.1%);--sl-color-green-400: hsl(141.9 69.2% 58%);--sl-color-green-500: hsl(142.1 70.6% 45.3%);--sl-color-green-600: hsl(142.1 76.2% 36.3%);--sl-color-green-700: hsl(142.4 71.8% 29.2%);--sl-color-green-800: hsl(142.8 64.2% 24.1%);--sl-color-green-900: hsl(143.8 61.2% 20.2%);--sl-color-green-950: hsl(144.3 60.7% 12%);--sl-color-emerald-50: hsl(151.8 81% 95.9%);--sl-color-emerald-100: hsl(149.3 80.4% 90%);--sl-color-emerald-200: hsl(152.4 76% 80.4%);--sl-color-emerald-300: hsl(156.2 71.6% 66.9%);--sl-color-emerald-400: hsl(158.1 64.4% 51.6%);--sl-color-emerald-500: hsl(160.1 84.1% 39.4%);--sl-color-emerald-600: hsl(161.4 93.5% 30.4%);--sl-color-emerald-700: hsl(162.9 93.5% 24.3%);--sl-color-emerald-800: hsl(163.1 88.1% 19.8%);--sl-color-emerald-900: hsl(164.2 85.7% 16.5%);--sl-color-emerald-950: hsl(164.3 87.5% 9.4%);--sl-color-teal-50: hsl(166.2 76.5% 96.7%);--sl-color-teal-100: hsl(167.2 85.5% 89.2%);--sl-color-teal-200: hsl(168.4 83.8% 78.2%);--sl-color-teal-300: hsl(170.6 76.9% 64.3%);--sl-color-teal-400: hsl(172.5 66% 50.4%);--sl-color-teal-500: hsl(173.4 80.4% 40%);--sl-color-teal-600: hsl(174.7 83.9% 31.6%);--sl-color-teal-700: hsl(175.3 77.4% 26.1%);--sl-color-teal-800: hsl(176.1 69.4% 21.8%);--sl-color-teal-900: hsl(175.9 60.8% 19%);--sl-color-teal-950: hsl(176.5 58.6% 11.4%);--sl-color-cyan-50: hsl(183.2 100% 96.3%);--sl-color-cyan-100: hsl(185.1 95.9% 90.4%);--sl-color-cyan-200: hsl(186.2 93.5% 81.8%);--sl-color-cyan-300: hsl(187 92.4% 69%);--sl-color-cyan-400: hsl(187.9 85.7% 53.3%);--sl-color-cyan-500: hsl(188.7 94.5% 42.7%);--sl-color-cyan-600: hsl(191.6 91.4% 36.5%);--sl-color-cyan-700: hsl(192.9 82.3% 31%);--sl-color-cyan-800: hsl(194.4 69.6% 27.1%);--sl-color-cyan-900: hsl(196.4 63.6% 23.7%);--sl-color-cyan-950: hsl(196.8 61% 16.1%);--sl-color-sky-50: hsl(204 100% 97.1%);--sl-color-sky-100: hsl(204 93.8% 93.7%);--sl-color-sky-200: hsl(200.6 94.4% 86.1%);--sl-color-sky-300: hsl(199.4 95.5% 73.9%);--sl-color-sky-400: hsl(198.4 93.2% 59.6%);--sl-color-sky-500: hsl(198.6 88.7% 48.4%);--sl-color-sky-600: hsl(200.4 98% 39.4%);--sl-color-sky-700: hsl(201.3 96.3% 32.2%);--sl-color-sky-800: hsl(201 90% 27.5%);--sl-color-sky-900: hsl(202 80.3% 23.9%);--sl-color-sky-950: hsl(202.3 73.8% 16.5%);--sl-color-blue-50: hsl(213.8 100% 96.9%);--sl-color-blue-100: hsl(214.3 94.6% 92.7%);--sl-color-blue-200: hsl(213.3 96.9% 87.3%);--sl-color-blue-300: hsl(211.7 96.4% 78.4%);--sl-color-blue-400: hsl(213.1 93.9% 67.8%);--sl-color-blue-500: hsl(217.2 91.2% 59.8%);--sl-color-blue-600: hsl(221.2 83.2% 53.3%);--sl-color-blue-700: hsl(224.3 76.3% 48%);--sl-color-blue-800: hsl(225.9 70.7% 40.2%);--sl-color-blue-900: hsl(224.4 64.3% 32.9%);--sl-color-blue-950: hsl(226.2 55.3% 18.4%);--sl-color-indigo-50: hsl(225.9 100% 96.7%);--sl-color-indigo-100: hsl(226.5 100% 93.9%);--sl-color-indigo-200: hsl(228 96.5% 88.8%);--sl-color-indigo-300: hsl(229.7 93.5% 81.8%);--sl-color-indigo-400: hsl(234.5 89.5% 73.9%);--sl-color-indigo-500: hsl(238.7 83.5% 66.7%);--sl-color-indigo-600: hsl(243.4 75.4% 58.6%);--sl-color-indigo-700: hsl(244.5 57.9% 50.6%);--sl-color-indigo-800: hsl(243.7 54.5% 41.4%);--sl-color-indigo-900: hsl(242.2 47.4% 34.3%);--sl-color-indigo-950: hsl(243.5 43.6% 22.9%);--sl-color-violet-50: hsl(250 100% 97.6%);--sl-color-violet-100: hsl(251.4 91.3% 95.5%);--sl-color-violet-200: hsl(250.5 95.2% 91.8%);--sl-color-violet-300: hsl(252.5 94.7% 85.1%);--sl-color-violet-400: hsl(255.1 91.7% 76.3%);--sl-color-violet-500: hsl(258.3 89.5% 66.3%);--sl-color-violet-600: hsl(262.1 83.3% 57.8%);--sl-color-violet-700: hsl(263.4 70% 50.4%);--sl-color-violet-800: hsl(263.4 69.3% 42.2%);--sl-color-violet-900: hsl(263.5 67.4% 34.9%);--sl-color-violet-950: hsl(265.1 61.5% 21.4%);--sl-color-purple-50: hsl(270 100% 98%);--sl-color-purple-100: hsl(268.7 100% 95.5%);--sl-color-purple-200: hsl(268.6 100% 91.8%);--sl-color-purple-300: hsl(269.2 97.4% 85.1%);--sl-color-purple-400: hsl(270 95.2% 75.3%);--sl-color-purple-500: hsl(270.7 91% 65.1%);--sl-color-purple-600: hsl(271.5 81.3% 55.9%);--sl-color-purple-700: hsl(272.1 71.7% 47.1%);--sl-color-purple-800: hsl(272.9 67.2% 39.4%);--sl-color-purple-900: hsl(273.6 65.6% 32%);--sl-color-purple-950: hsl(276 59.5% 16.5%);--sl-color-fuchsia-50: hsl(289.1 100% 97.8%);--sl-color-fuchsia-100: hsl(287 100% 95.5%);--sl-color-fuchsia-200: hsl(288.3 95.8% 90.6%);--sl-color-fuchsia-300: hsl(291.1 93.1% 82.9%);--sl-color-fuchsia-400: hsl(292 91.4% 72.5%);--sl-color-fuchsia-500: hsl(292.2 84.1% 60.6%);--sl-color-fuchsia-600: hsl(293.4 69.5% 48.8%);--sl-color-fuchsia-700: hsl(294.7 72.4% 39.8%);--sl-color-fuchsia-800: hsl(295.4 70.2% 32.9%);--sl-color-fuchsia-900: hsl(296.7 63.6% 28%);--sl-color-fuchsia-950: hsl(297.1 56.8% 14.5%);--sl-color-pink-50: hsl(327.3 73.3% 97.1%);--sl-color-pink-100: hsl(325.7 77.8% 94.7%);--sl-color-pink-200: hsl(325.9 84.6% 89.8%);--sl-color-pink-300: hsl(327.4 87.1% 81.8%);--sl-color-pink-400: hsl(328.6 85.5% 70.2%);--sl-color-pink-500: hsl(330.4 81.2% 60.4%);--sl-color-pink-600: hsl(333.3 71.4% 50.6%);--sl-color-pink-700: hsl(335.1 77.6% 42%);--sl-color-pink-800: hsl(335.8 74.4% 35.3%);--sl-color-pink-900: hsl(335.9 69% 30.4%);--sl-color-pink-950: hsl(336.2 65.4% 15.9%);--sl-color-rose-50: hsl(355.7 100% 97.3%);--sl-color-rose-100: hsl(355.6 100% 94.7%);--sl-color-rose-200: hsl(352.7 96.1% 90%);--sl-color-rose-300: hsl(352.6 95.7% 81.8%);--sl-color-rose-400: hsl(351.3 94.5% 71.4%);--sl-color-rose-500: hsl(349.7 89.2% 60.2%);--sl-color-rose-600: hsl(346.8 77.2% 49.8%);--sl-color-rose-700: hsl(345.3 82.7% 40.8%);--sl-color-rose-800: hsl(343.4 79.7% 34.7%);--sl-color-rose-900: hsl(341.5 75.5% 30.4%);--sl-color-rose-950: hsl(341.3 70.1% 17.1%);--sl-color-primary-50: var(--sl-color-sky-50);--sl-color-primary-100: var(--sl-color-sky-100);--sl-color-primary-200: var(--sl-color-sky-200);--sl-color-primary-300: var(--sl-color-sky-300);--sl-color-primary-400: var(--sl-color-sky-400);--sl-color-primary-500: var(--sl-color-sky-500);--sl-color-primary-600: var(--sl-color-sky-600);--sl-color-primary-700: var(--sl-color-sky-700);--sl-color-primary-800: var(--sl-color-sky-800);--sl-color-primary-900: var(--sl-color-sky-900);--sl-color-primary-950: var(--sl-color-sky-950);--sl-color-success-50: var(--sl-color-green-50);--sl-color-success-100: var(--sl-color-green-100);--sl-color-success-200: var(--sl-color-green-200);--sl-color-success-300: var(--sl-color-green-300);--sl-color-success-400: var(--sl-color-green-400);--sl-color-success-500: var(--sl-color-green-500);--sl-color-success-600: var(--sl-color-green-600);--sl-color-success-700: var(--sl-color-green-700);--sl-color-success-800: var(--sl-color-green-800);--sl-color-success-900: var(--sl-color-green-900);--sl-color-success-950: var(--sl-color-green-950);--sl-color-warning-50: var(--sl-color-amber-50);--sl-color-warning-100: var(--sl-color-amber-100);--sl-color-warning-200: var(--sl-color-amber-200);--sl-color-warning-300: var(--sl-color-amber-300);--sl-color-warning-400: var(--sl-color-amber-400);--sl-color-warning-500: var(--sl-color-amber-500);--sl-color-warning-600: var(--sl-color-amber-600);--sl-color-warning-700: var(--sl-color-amber-700);--sl-color-warning-800: var(--sl-color-amber-800);--sl-color-warning-900: var(--sl-color-amber-900);--sl-color-warning-950: var(--sl-color-amber-950);--sl-color-danger-50: var(--sl-color-red-50);--sl-color-danger-100: var(--sl-color-red-100);--sl-color-danger-200: var(--sl-color-red-200);--sl-color-danger-300: var(--sl-color-red-300);--sl-color-danger-400: var(--sl-color-red-400);--sl-color-danger-500: var(--sl-color-red-500);--sl-color-danger-600: var(--sl-color-red-600);--sl-color-danger-700: var(--sl-color-red-700);--sl-color-danger-800: var(--sl-color-red-800);--sl-color-danger-900: var(--sl-color-red-900);--sl-color-danger-950: var(--sl-color-red-950);--sl-color-neutral-50: var(--sl-color-gray-50);--sl-color-neutral-100: var(--sl-color-gray-100);--sl-color-neutral-200: var(--sl-color-gray-200);--sl-color-neutral-300: var(--sl-color-gray-300);--sl-color-neutral-400: var(--sl-color-gray-400);--sl-color-neutral-500: var(--sl-color-gray-500);--sl-color-neutral-600: var(--sl-color-gray-600);--sl-color-neutral-700: var(--sl-color-gray-700);--sl-color-neutral-800: var(--sl-color-gray-800);--sl-color-neutral-900: var(--sl-color-gray-900);--sl-color-neutral-950: var(--sl-color-gray-950);--sl-color-neutral-0: hsl(0, 0%, 100%);--sl-color-neutral-1000: hsl(0, 0%, 0%);--sl-border-radius-small: .1875rem;--sl-border-radius-medium: .25rem;--sl-border-radius-large: .5rem;--sl-border-radius-x-large: 1rem;--sl-border-radius-circle: 50%;--sl-border-radius-pill: 9999px;--sl-shadow-x-small: 0 1px 2px hsl(240 3.8% 46.1% / 6%);--sl-shadow-small: 0 1px 2px hsl(240 3.8% 46.1% / 12%);--sl-shadow-medium: 0 2px 4px hsl(240 3.8% 46.1% / 12%);--sl-shadow-large: 0 2px 8px hsl(240 3.8% 46.1% / 12%);--sl-shadow-x-large: 0 4px 16px hsl(240 3.8% 46.1% / 12%);--sl-spacing-3x-small: .125rem;--sl-spacing-2x-small: .25rem;--sl-spacing-x-small: .5rem;--sl-spacing-small: .75rem;--sl-spacing-medium: 1rem;--sl-spacing-large: 1.25rem;--sl-spacing-x-large: 1.75rem;--sl-spacing-2x-large: 2.25rem;--sl-spacing-3x-large: 3rem;--sl-spacing-4x-large: 4.5rem;--sl-transition-x-slow: 1s;--sl-transition-slow: .5s;--sl-transition-medium: .25s;--sl-transition-fast: .15s;--sl-transition-x-fast: 50ms;--sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;--sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";--sl-font-serif: Georgia, "Times New Roman", serif;--sl-font-size-2x-small: .625rem;--sl-font-size-x-small: .75rem;--sl-font-size-small: .875rem;--sl-font-size-medium: 1rem;--sl-font-size-large: 1.25rem;--sl-font-size-x-large: 1.5rem;--sl-font-size-2x-large: 2.25rem;--sl-font-size-3x-large: 3rem;--sl-font-size-4x-large: 4.5rem;--sl-font-weight-light: 300;--sl-font-weight-normal: 400;--sl-font-weight-semibold: 500;--sl-font-weight-bold: 700;--sl-letter-spacing-denser: -.03em;--sl-letter-spacing-dense: -.015em;--sl-letter-spacing-normal: normal;--sl-letter-spacing-loose: .075em;--sl-letter-spacing-looser: .15em;--sl-line-height-denser: 1;--sl-line-height-dense: 1.4;--sl-line-height-normal: 1.8;--sl-line-height-loose: 2.2;--sl-line-height-looser: 2.6;--sl-focus-ring-color: var(--sl-color-primary-600);--sl-focus-ring-style: solid;--sl-focus-ring-width: 3px;--sl-focus-ring: var(--sl-focus-ring-style) var(--sl-focus-ring-width) var(--sl-focus-ring-color);--sl-focus-ring-offset: 1px;--sl-button-font-size-small: var(--sl-font-size-x-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-large: var(--sl-font-size-medium);--sl-input-height-small: 1.875rem;--sl-input-height-medium: 2.5rem;--sl-input-height-large: 3.125rem;--sl-input-background-color: var(--sl-color-neutral-0);--sl-input-background-color-hover: var(--sl-input-background-color);--sl-input-background-color-focus: var(--sl-input-background-color);--sl-input-background-color-disabled: var(--sl-color-neutral-100);--sl-input-border-color: var(--sl-color-neutral-300);--sl-input-border-color-hover: var(--sl-color-neutral-400);--sl-input-border-color-focus: var(--sl-color-primary-500);--sl-input-border-color-disabled: var(--sl-color-neutral-300);--sl-input-border-width: 1px;--sl-input-required-content: "*";--sl-input-required-content-offset: -2px;--sl-input-required-content-color: var(--sl-input-label-color);--sl-input-border-radius-small: var(--sl-border-radius-medium);--sl-input-border-radius-medium: var(--sl-border-radius-medium);--sl-input-border-radius-large: var(--sl-border-radius-medium);--sl-input-font-family: var(--sl-font-sans);--sl-input-font-weight: var(--sl-font-weight-normal);--sl-input-font-size-small: var(--sl-font-size-small);--sl-input-font-size-medium: var(--sl-font-size-medium);--sl-input-font-size-large: var(--sl-font-size-large);--sl-input-letter-spacing: var(--sl-letter-spacing-normal);--sl-input-color: var(--sl-color-neutral-700);--sl-input-color-hover: var(--sl-color-neutral-700);--sl-input-color-focus: var(--sl-color-neutral-700);--sl-input-color-disabled: var(--sl-color-neutral-900);--sl-input-icon-color: var(--sl-color-neutral-500);--sl-input-icon-color-hover: var(--sl-color-neutral-600);--sl-input-icon-color-focus: var(--sl-color-neutral-600);--sl-input-placeholder-color: var(--sl-color-neutral-500);--sl-input-placeholder-color-disabled: var(--sl-color-neutral-600);--sl-input-spacing-small: var(--sl-spacing-small);--sl-input-spacing-medium: var(--sl-spacing-medium);--sl-input-spacing-large: var(--sl-spacing-large);--sl-input-focus-ring-color: hsl(198.6 88.7% 48.4% / 40%);--sl-input-focus-ring-offset: 0;--sl-input-filled-background-color: var(--sl-color-neutral-100);--sl-input-filled-background-color-hover: var(--sl-color-neutral-100);--sl-input-filled-background-color-focus: var(--sl-color-neutral-100);--sl-input-filled-background-color-disabled: var(--sl-color-neutral-100);--sl-input-filled-color: var(--sl-color-neutral-800);--sl-input-filled-color-hover: var(--sl-color-neutral-800);--sl-input-filled-color-focus: var(--sl-color-neutral-700);--sl-input-filled-color-disabled: var(--sl-color-neutral-800);--sl-input-label-font-size-small: var(--sl-font-size-small);--sl-input-label-font-size-medium: var(--sl-font-size-medium);--sl-input-label-font-size-large: var(--sl-font-size-large);--sl-input-label-color: inherit;--sl-input-help-text-font-size-small: var(--sl-font-size-x-small);--sl-input-help-text-font-size-medium: var(--sl-font-size-small);--sl-input-help-text-font-size-large: var(--sl-font-size-medium);--sl-input-help-text-color: var(--sl-color-neutral-500);--sl-toggle-size-small: .875rem;--sl-toggle-size-medium: 1.125rem;--sl-toggle-size-large: 1.375rem;--sl-overlay-background-color: hsl(240 3.8% 46.1% / 33%);--sl-panel-background-color: var(--sl-color-neutral-0);--sl-panel-border-color: var(--sl-color-neutral-200);--sl-panel-border-width: 1px;--sl-tooltip-border-radius: var(--sl-border-radius-medium);--sl-tooltip-background-color: var(--sl-color-neutral-800);--sl-tooltip-color: var(--sl-color-neutral-0);--sl-tooltip-font-family: var(--sl-font-sans);--sl-tooltip-font-weight: var(--sl-font-weight-normal);--sl-tooltip-font-size: var(--sl-font-size-small);--sl-tooltip-line-height: var(--sl-line-height-dense);--sl-tooltip-padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);--sl-tooltip-arrow-size: 6px;--sl-z-index-drawer: 700;--sl-z-index-dialog: 800;--sl-z-index-dropdown: 900;--sl-z-index-toast: 950;--sl-z-index-tooltip: 1000}@supports (scrollbar-gutter: stable){.sl-scroll-lock{scrollbar-gutter:var(--sl-scroll-lock-gutter)!important}.sl-scroll-lock body{overflow:hidden!important}}@supports not (scrollbar-gutter: stable){.sl-scroll-lock body{padding-right:var(--sl-scroll-lock-size)!important;overflow:hidden!important}}.sl-toast-stack{position:fixed;top:0;inset-inline-end:0;z-index:var(--sl-z-index-toast);width:28rem;max-width:100%;max-height:100%;overflow:auto}.sl-toast-stack sl-alert{margin:var(--sl-spacing-medium)}.sl-toast-stack sl-alert::part(base){box-shadow:var(--sl-shadow-large)}@media(prefers-color-scheme:dark){:root{color-scheme:dark;--sl-color-gray-50: hsl(240 5.1% 15%);--sl-color-gray-100: hsl(240 5.7% 18.2%);--sl-color-gray-200: hsl(240 4.6% 22%);--sl-color-gray-300: hsl(240 5% 27.6%);--sl-color-gray-400: hsl(240 5% 35.5%);--sl-color-gray-500: hsl(240 3.7% 44%);--sl-color-gray-600: hsl(240 5.3% 58%);--sl-color-gray-700: hsl(240 5.6% 73%);--sl-color-gray-800: hsl(240 7.3% 84%);--sl-color-gray-900: hsl(240 9.1% 91.8%);--sl-color-gray-950: hsl(0 0% 95%);--sl-color-red-50: hsl(0 56% 23.9%);--sl-color-red-100: hsl(.6 60% 33.9%);--sl-color-red-200: hsl(.9 67.2% 37.1%);--sl-color-red-300: hsl(1.1 71.3% 43.7%);--sl-color-red-400: hsl(1 76% 52.5%);--sl-color-red-500: hsl(.7 89.6% 57.2%);--sl-color-red-600: hsl(0 98.6% 67.9%);--sl-color-red-700: hsl(0 100% 72.3%);--sl-color-red-800: hsl(0 100% 85.6%);--sl-color-red-900: hsl(0 100% 90.3%);--sl-color-red-950: hsl(0 100% 95.9%);--sl-color-orange-50: hsl(15 64.2% 23.3%);--sl-color-orange-100: hsl(15.1 70.9% 31.1%);--sl-color-orange-200: hsl(15.3 75.7% 35.5%);--sl-color-orange-300: hsl(17.1 83.5% 42.7%);--sl-color-orange-400: hsl(20.1 88% 50.8%);--sl-color-orange-500: hsl(24.3 100% 50.5%);--sl-color-orange-600: hsl(27.2 100% 57.7%);--sl-color-orange-700: hsl(31.3 100% 68.7%);--sl-color-orange-800: hsl(33.8 100% 79.3%);--sl-color-orange-900: hsl(38.9 100% 87.7%);--sl-color-orange-950: hsl(46.2 100% 95%);--sl-color-amber-50: hsl(21.9 66.3% 21.1%);--sl-color-amber-100: hsl(21.5 73.6% 29.7%);--sl-color-amber-200: hsl(22.3 77.6% 33.3%);--sl-color-amber-300: hsl(25.4 84.2% 39.6%);--sl-color-amber-400: hsl(31.4 87.4% 46.7%);--sl-color-amber-500: hsl(37 96.6% 48.3%);--sl-color-amber-600: hsl(43.3 100% 53.4%);--sl-color-amber-700: hsl(46.5 100% 61.1%);--sl-color-amber-800: hsl(49.3 100% 73%);--sl-color-amber-900: hsl(51.8 100% 85%);--sl-color-amber-950: hsl(60 100% 94.6%);--sl-color-yellow-50: hsl(32.5 60% 18.2%);--sl-color-yellow-100: hsl(28.1 68.6% 29%);--sl-color-yellow-200: hsl(31.3 75.8% 30.8%);--sl-color-yellow-300: hsl(34.7 84.4% 35.3%);--sl-color-yellow-400: hsl(40.1 87.3% 43.3%);--sl-color-yellow-500: hsl(44.7 88% 46%);--sl-color-yellow-600: hsl(47.7 100% 50.9%);--sl-color-yellow-700: hsl(51.3 100% 59.9%);--sl-color-yellow-800: hsl(54.6 100% 73%);--sl-color-yellow-900: hsl(58.9 100% 84.2%);--sl-color-yellow-950: hsl(60 100% 94%);--sl-color-lime-50: hsl(86.5 54.4% 18%);--sl-color-lime-100: hsl(87.6 56.8% 23.3%);--sl-color-lime-200: hsl(85.8 63.2% 24.5%);--sl-color-lime-300: hsl(86.1 72% 29.4%);--sl-color-lime-400: hsl(85.5 76.8% 37.3%);--sl-color-lime-500: hsl(84.3 74.2% 42.1%);--sl-color-lime-600: hsl(82.8 81.5% 52.6%);--sl-color-lime-700: hsl(82 89.9% 64%);--sl-color-lime-800: hsl(80.9 97.9% 76.6%);--sl-color-lime-900: hsl(77.9 100% 85.8%);--sl-color-lime-950: hsl(69.5 100% 93.8%);--sl-color-green-50: hsl(144.3 53.6% 16%);--sl-color-green-100: hsl(143.2 55.4% 23.5%);--sl-color-green-200: hsl(141.5 58.2% 26.3%);--sl-color-green-300: hsl(140.8 64.2% 31.8%);--sl-color-green-400: hsl(140.3 68% 39.2%);--sl-color-green-500: hsl(141.1 64.9% 43%);--sl-color-green-600: hsl(141.6 72.4% 55.2%);--sl-color-green-700: hsl(141.7 82.7% 70.1%);--sl-color-green-800: hsl(141 90.9% 82.1%);--sl-color-green-900: hsl(142 100% 89.1%);--sl-color-green-950: hsl(144 100% 95.5%);--sl-color-emerald-50: hsl(164.3 75% 13.5%);--sl-color-emerald-100: hsl(163.5 72.6% 20.1%);--sl-color-emerald-200: hsl(162.1 73.7% 22.4%);--sl-color-emerald-300: hsl(161.3 77.3% 27.6%);--sl-color-emerald-400: hsl(159.6 77.1% 34.3%);--sl-color-emerald-500: hsl(159.1 73.5% 37.9%);--sl-color-emerald-600: hsl(157.8 66.8% 48.9%);--sl-color-emerald-700: hsl(156.2 76.1% 63.8%);--sl-color-emerald-800: hsl(152.4 84.4% 77.4%);--sl-color-emerald-900: hsl(149.3 100% 87%);--sl-color-emerald-950: hsl(158.6 100% 94.8%);--sl-color-teal-50: hsl(176.5 51.5% 15.4%);--sl-color-teal-100: hsl(175.9 54.7% 22.3%);--sl-color-teal-200: hsl(175.9 60.7% 23.9%);--sl-color-teal-300: hsl(174.5 67.3% 28.8%);--sl-color-teal-400: hsl(174.4 71.9% 34.9%);--sl-color-teal-500: hsl(173.1 71% 38.3%);--sl-color-teal-600: hsl(172.3 68.2% 48.1%);--sl-color-teal-700: hsl(170.5 81.3% 61.5%);--sl-color-teal-800: hsl(168.4 92.1% 75.2%);--sl-color-teal-900: hsl(168.3 100% 86%);--sl-color-teal-950: hsl(180 100% 95.5%);--sl-color-cyan-50: hsl(197.1 53.8% 20.3%);--sl-color-cyan-100: hsl(196.8 57.3% 27.2%);--sl-color-cyan-200: hsl(195.3 62.7% 29.4%);--sl-color-cyan-300: hsl(193.5 71.3% 34.1%);--sl-color-cyan-400: hsl(192.5 76.8% 40.6%);--sl-color-cyan-500: hsl(189.4 78.6% 42.6%);--sl-color-cyan-600: hsl(188.2 89.1% 51.7%);--sl-color-cyan-700: hsl(187 98.6% 66.2%);--sl-color-cyan-800: hsl(184.9 100% 78.3%);--sl-color-cyan-900: hsl(180 100% 86.6%);--sl-color-cyan-950: hsl(180 100% 94.8%);--sl-color-sky-50: hsl(203 63.8% 20.9%);--sl-color-sky-100: hsl(203.4 70.4% 28%);--sl-color-sky-200: hsl(202.7 75.8% 30.8%);--sl-color-sky-300: hsl(203.1 80.4% 36.1%);--sl-color-sky-400: hsl(202.1 80.5% 44.3%);--sl-color-sky-500: hsl(199.7 85.9% 47.7%);--sl-color-sky-600: hsl(198.7 97.9% 57.2%);--sl-color-sky-700: hsl(198.7 100% 70.5%);--sl-color-sky-800: hsl(198.8 100% 82.5%);--sl-color-sky-900: hsl(198.5 100% 89.9%);--sl-color-sky-950: hsl(186 100% 95.5%);--sl-color-blue-50: hsl(227.1 49.5% 22.7%);--sl-color-blue-100: hsl(225.8 58.9% 36.8%);--sl-color-blue-200: hsl(227.7 64.4% 42.9%);--sl-color-blue-300: hsl(226.1 72.7% 51.2%);--sl-color-blue-400: hsl(222.6 86.5% 56.3%);--sl-color-blue-500: hsl(217.8 95.8% 57.4%);--sl-color-blue-600: hsl(213.3 100% 65%);--sl-color-blue-700: hsl(210.9 100% 74.8%);--sl-color-blue-800: hsl(211.5 100% 83.4%);--sl-color-blue-900: hsl(211 100% 88.9%);--sl-color-blue-950: hsl(201.8 100% 95.3%);--sl-color-indigo-50: hsl(243.5 40.8% 27%);--sl-color-indigo-100: hsl(242.9 45.7% 37.6%);--sl-color-indigo-200: hsl(244.7 52.7% 43.1%);--sl-color-indigo-300: hsl(245.3 60.5% 52.4%);--sl-color-indigo-400: hsl(244.1 79.2% 60.4%);--sl-color-indigo-500: hsl(239.6 88.7% 63.8%);--sl-color-indigo-600: hsl(234.5 96.7% 70.9%);--sl-color-indigo-700: hsl(229.4 100% 78.3%);--sl-color-indigo-800: hsl(227.1 100% 85%);--sl-color-indigo-900: hsl(223.8 100% 89.9%);--sl-color-indigo-950: hsl(220 100% 95.1%);--sl-color-violet-50: hsl(265.1 57.3% 25.4%);--sl-color-violet-100: hsl(263.5 63.8% 39.4%);--sl-color-violet-200: hsl(263.4 66.2% 44.1%);--sl-color-violet-300: hsl(263.7 72.8% 52.4%);--sl-color-violet-400: hsl(262.5 87.3% 59.8%);--sl-color-violet-500: hsl(258.3 95.1% 63.2%);--sl-color-violet-600: hsl(255.1 100% 67.2%);--sl-color-violet-700: hsl(253 100% 81.5%);--sl-color-violet-800: hsl(251.7 100% 87.9%);--sl-color-violet-900: hsl(254.1 100% 91.7%);--sl-color-violet-950: hsl(257.1 100% 96.1%);--sl-color-purple-50: hsl(276 54.3% 20.5%);--sl-color-purple-100: hsl(273.6 61.8% 35.4%);--sl-color-purple-200: hsl(272.9 64% 41.4%);--sl-color-purple-300: hsl(271.9 68.1% 49.2%);--sl-color-purple-400: hsl(271.5 85.1% 57.8%);--sl-color-purple-500: hsl(270.7 96.4% 62.1%);--sl-color-purple-600: hsl(270.5 100% 71.9%);--sl-color-purple-700: hsl(270.9 100% 81.3%);--sl-color-purple-800: hsl(272.4 100% 87.7%);--sl-color-purple-900: hsl(276.7 100% 91.5%);--sl-color-purple-950: hsl(300 100% 96.5%);--sl-color-fuchsia-50: hsl(297.1 51.2% 18.6%);--sl-color-fuchsia-100: hsl(296.7 59.5% 31.5%);--sl-color-fuchsia-200: hsl(295.4 65.4% 35.1%);--sl-color-fuchsia-300: hsl(294.6 67.4% 42.2%);--sl-color-fuchsia-400: hsl(293.3 68.7% 51.2%);--sl-color-fuchsia-500: hsl(292.1 88.4% 57.7%);--sl-color-fuchsia-600: hsl(292 98.5% 59.5%);--sl-color-fuchsia-700: hsl(292.4 100% 79.5%);--sl-color-fuchsia-800: hsl(292.9 100% 86.8%);--sl-color-fuchsia-900: hsl(300 100% 91.5%);--sl-color-fuchsia-950: hsl(300 100% 96.3%);--sl-color-pink-50: hsl(336.2 59.6% 20%);--sl-color-pink-100: hsl(336.8 63.9% 34%);--sl-color-pink-200: hsl(336.8 68.7% 37.6%);--sl-color-pink-300: hsl(336.1 71.8% 44.5%);--sl-color-pink-400: hsl(333.9 74.9% 53.1%);--sl-color-pink-500: hsl(330.7 86.3% 57.7%);--sl-color-pink-600: hsl(328.6 91.5% 67.2%);--sl-color-pink-700: hsl(327.4 97.6% 78.7%);--sl-color-pink-800: hsl(325.1 100% 86.6%);--sl-color-pink-900: hsl(322.1 100% 91.3%);--sl-color-pink-950: hsl(315 100% 95.9%);--sl-color-rose-50: hsl(342.3 62.9% 21.5%);--sl-color-rose-100: hsl(342.8 68.9% 34.2%);--sl-color-rose-200: hsl(344.8 72.6% 37.3%);--sl-color-rose-300: hsl(346.9 75.8% 43.7%);--sl-color-rose-400: hsl(348.2 80.1% 52.7%);--sl-color-rose-500: hsl(350.4 94.8% 57.5%);--sl-color-rose-600: hsl(351.2 100% 58.1%);--sl-color-rose-700: hsl(352.3 100% 78.1%);--sl-color-rose-800: hsl(352 100% 86.2%);--sl-color-rose-900: hsl(354.5 100% 90.7%);--sl-color-rose-950: hsl(353.3 100% 95.7%);--sl-color-primary-50: var(--sl-color-sky-50);--sl-color-primary-100: var(--sl-color-sky-100);--sl-color-primary-200: var(--sl-color-sky-200);--sl-color-primary-300: var(--sl-color-sky-300);--sl-color-primary-400: var(--sl-color-sky-400);--sl-color-primary-500: var(--sl-color-sky-500);--sl-color-primary-600: var(--sl-color-sky-600);--sl-color-primary-700: var(--sl-color-sky-700);--sl-color-primary-800: var(--sl-color-sky-800);--sl-color-primary-900: var(--sl-color-sky-900);--sl-color-primary-950: var(--sl-color-sky-950);--sl-color-success-50: var(--sl-color-green-50);--sl-color-success-100: var(--sl-color-green-100);--sl-color-success-200: var(--sl-color-green-200);--sl-color-success-300: var(--sl-color-green-300);--sl-color-success-400: var(--sl-color-green-400);--sl-color-success-500: var(--sl-color-green-500);--sl-color-success-600: var(--sl-color-green-600);--sl-color-success-700: var(--sl-color-green-700);--sl-color-success-800: var(--sl-color-green-800);--sl-color-success-900: var(--sl-color-green-900);--sl-color-success-950: var(--sl-color-green-950);--sl-color-warning-50: var(--sl-color-amber-50);--sl-color-warning-100: var(--sl-color-amber-100);--sl-color-warning-200: var(--sl-color-amber-200);--sl-color-warning-300: var(--sl-color-amber-300);--sl-color-warning-400: var(--sl-color-amber-400);--sl-color-warning-500: var(--sl-color-amber-500);--sl-color-warning-600: var(--sl-color-amber-600);--sl-color-warning-700: var(--sl-color-amber-700);--sl-color-warning-800: var(--sl-color-amber-800);--sl-color-warning-900: var(--sl-color-amber-900);--sl-color-warning-950: var(--sl-color-amber-950);--sl-color-danger-50: var(--sl-color-red-50);--sl-color-danger-100: var(--sl-color-red-100);--sl-color-danger-200: var(--sl-color-red-200);--sl-color-danger-300: var(--sl-color-red-300);--sl-color-danger-400: var(--sl-color-red-400);--sl-color-danger-500: var(--sl-color-red-500);--sl-color-danger-600: var(--sl-color-red-600);--sl-color-danger-700: var(--sl-color-red-700);--sl-color-danger-800: var(--sl-color-red-800);--sl-color-danger-900: var(--sl-color-red-900);--sl-color-danger-950: var(--sl-color-red-950);--sl-color-neutral-50: var(--sl-color-gray-50);--sl-color-neutral-100: var(--sl-color-gray-100);--sl-color-neutral-200: var(--sl-color-gray-200);--sl-color-neutral-300: var(--sl-color-gray-300);--sl-color-neutral-400: var(--sl-color-gray-400);--sl-color-neutral-500: var(--sl-color-gray-500);--sl-color-neutral-600: var(--sl-color-gray-600);--sl-color-neutral-700: var(--sl-color-gray-700);--sl-color-neutral-800: var(--sl-color-gray-800);--sl-color-neutral-900: var(--sl-color-gray-900);--sl-color-neutral-950: var(--sl-color-gray-950);--sl-color-neutral-0: hsl(240, 5.9%, 11%);--sl-color-neutral-1000: hsl(0, 0%, 100%);--sl-border-radius-small: .1875rem;--sl-border-radius-medium: .25rem;--sl-border-radius-large: .5rem;--sl-border-radius-x-large: 1rem;--sl-border-radius-circle: 50%;--sl-border-radius-pill: 9999px;--sl-shadow-x-small: 0 1px 2px rgb(0 0 0 / 18%);--sl-shadow-small: 0 1px 2px rgb(0 0 0 / 24%);--sl-shadow-medium: 0 2px 4px rgb(0 0 0 / 24%);--sl-shadow-large: 0 2px 8px rgb(0 0 0 / 24%);--sl-shadow-x-large: 0 4px 16px rgb(0 0 0 / 24%);--sl-spacing-3x-small: .125rem;--sl-spacing-2x-small: .25rem;--sl-spacing-x-small: .5rem;--sl-spacing-small: .75rem;--sl-spacing-medium: 1rem;--sl-spacing-large: 1.25rem;--sl-spacing-x-large: 1.75rem;--sl-spacing-2x-large: 2.25rem;--sl-spacing-3x-large: 3rem;--sl-spacing-4x-large: 4.5rem;--sl-transition-x-slow: 1s;--sl-transition-slow: .5s;--sl-transition-medium: .25s;--sl-transition-fast: .15s;--sl-transition-x-fast: 50ms;--sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;--sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";--sl-font-serif: Georgia, "Times New Roman", serif;--sl-font-size-2x-small: .625rem;--sl-font-size-x-small: .75rem;--sl-font-size-small: .875rem;--sl-font-size-medium: 1rem;--sl-font-size-large: 1.25rem;--sl-font-size-x-large: 1.5rem;--sl-font-size-2x-large: 2.25rem;--sl-font-size-3x-large: 3rem;--sl-font-size-4x-large: 4.5rem;--sl-font-weight-light: 300;--sl-font-weight-normal: 400;--sl-font-weight-semibold: 500;--sl-font-weight-bold: 700;--sl-letter-spacing-denser: -.03em;--sl-letter-spacing-dense: -.015em;--sl-letter-spacing-normal: normal;--sl-letter-spacing-loose: .075em;--sl-letter-spacing-looser: .15em;--sl-line-height-denser: 1;--sl-line-height-dense: 1.4;--sl-line-height-normal: 1.8;--sl-line-height-loose: 2.2;--sl-line-height-looser: 2.6;--sl-focus-ring-color: var(--sl-color-primary-700);--sl-focus-ring-style: solid;--sl-focus-ring-width: 3px;--sl-focus-ring: var(--sl-focus-ring-style) var(--sl-focus-ring-width) var(--sl-focus-ring-color);--sl-focus-ring-offset: 1px;--sl-button-font-size-small: var(--sl-font-size-x-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-large: var(--sl-font-size-medium);--sl-input-height-small: 1.875rem;--sl-input-height-medium: 2.5rem;--sl-input-height-large: 3.125rem;--sl-input-background-color: var(--sl-color-neutral-0);--sl-input-background-color-hover: var(--sl-input-background-color);--sl-input-background-color-focus: var(--sl-input-background-color);--sl-input-background-color-disabled: var(--sl-color-neutral-100);--sl-input-border-color: var(--sl-color-neutral-400);--sl-input-border-color-hover: var(--sl-color-neutral-500);--sl-input-border-color-focus: var(--sl-color-primary-600);--sl-input-border-color-disabled: var(--sl-color-neutral-400);--sl-input-border-width: 1px;--sl-input-required-content: "*";--sl-input-required-content-offset: -2px;--sl-input-required-content-color: var(--sl-input-label-color);--sl-input-border-radius-small: var(--sl-border-radius-medium);--sl-input-border-radius-medium: var(--sl-border-radius-medium);--sl-input-border-radius-large: var(--sl-border-radius-medium);--sl-input-font-family: var(--sl-font-sans);--sl-input-font-weight: var(--sl-font-weight-normal);--sl-input-font-size-small: var(--sl-font-size-small);--sl-input-font-size-medium: var(--sl-font-size-medium);--sl-input-font-size-large: var(--sl-font-size-large);--sl-input-letter-spacing: var(--sl-letter-spacing-normal);--sl-input-color: var(--sl-color-neutral-700);--sl-input-color-hover: var(--sl-color-neutral-700);--sl-input-color-focus: var(--sl-color-neutral-700);--sl-input-color-disabled: var(--sl-color-neutral-900);--sl-input-icon-color: var(--sl-color-neutral-500);--sl-input-icon-color-hover: var(--sl-color-neutral-600);--sl-input-icon-color-focus: var(--sl-color-neutral-600);--sl-input-placeholder-color: var(--sl-color-neutral-500);--sl-input-placeholder-color-disabled: var(--sl-color-neutral-600);--sl-input-spacing-small: var(--sl-spacing-small);--sl-input-spacing-medium: var(--sl-spacing-medium);--sl-input-spacing-large: var(--sl-spacing-large);--sl-input-focus-ring-color: hsl(198.6 88.7% 48.4% / 40%);--sl-input-focus-ring-offset: 0;--sl-input-filled-background-color: var(--sl-color-neutral-100);--sl-input-filled-background-color-hover: var(--sl-color-neutral-100);--sl-input-filled-background-color-focus: var(--sl-color-neutral-100);--sl-input-filled-background-color-disabled: var(--sl-color-neutral-100);--sl-input-filled-color: var(--sl-color-neutral-800);--sl-input-filled-color-hover: var(--sl-color-neutral-800);--sl-input-filled-color-focus: var(--sl-color-neutral-700);--sl-input-filled-color-disabled: var(--sl-color-neutral-800);--sl-input-label-font-size-small: var(--sl-font-size-small);--sl-input-label-font-size-medium: var(--sl-font-size-medium);--sl-input-label-font-size-large: var(--sl-font-size-large);--sl-input-label-color: inherit;--sl-input-help-text-font-size-small: var(--sl-font-size-x-small);--sl-input-help-text-font-size-medium: var(--sl-font-size-small);--sl-input-help-text-font-size-large: var(--sl-font-size-medium);--sl-input-help-text-color: var(--sl-color-neutral-600);--sl-toggle-size-small: .875rem;--sl-toggle-size-medium: 1.125rem;--sl-toggle-size-large: 1.375rem;--sl-overlay-background-color: hsl(0 0% 0% / 43%);--sl-panel-background-color: var(--sl-color-neutral-50);--sl-panel-border-color: var(--sl-color-neutral-200);--sl-panel-border-width: 1px;--sl-tooltip-border-radius: var(--sl-border-radius-medium);--sl-tooltip-background-color: var(--sl-color-neutral-800);--sl-tooltip-color: var(--sl-color-neutral-0);--sl-tooltip-font-family: var(--sl-font-sans);--sl-tooltip-font-weight: var(--sl-font-weight-normal);--sl-tooltip-font-size: var(--sl-font-size-small);--sl-tooltip-line-height: var(--sl-line-height-dense);--sl-tooltip-padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);--sl-tooltip-arrow-size: 6px;--sl-z-index-drawer: 700;--sl-z-index-dialog: 800;--sl-z-index-dropdown: 900;--sl-z-index-toast: 950;--sl-z-index-tooltip: 1000}}:root{--band: #1d4ed8;--band-ink: #ffffff;--rail: #064e3b;--rail-group: #059669;--rail-button: 44px;--power-on: #4ade80;--stop: #ef4444;--sl-color-primary-50: var(--sl-color-blue-100);--sl-color-primary-100: var(--sl-color-blue-200);--sl-color-primary-200: var(--sl-color-blue-300);--sl-color-primary-300: var(--sl-color-blue-400);--sl-color-primary-400: var(--sl-color-blue-500);--sl-color-primary-500: var(--sl-color-blue-600);--sl-color-primary-600: var(--sl-color-blue-700);--sl-color-primary-700: var(--sl-color-blue-800);--sl-color-primary-800: var(--sl-color-blue-900);--sl-color-primary-900: var(--sl-color-blue-950);--sl-color-primary-950: var(--sl-color-blue-950);--sl-input-height-small: 1.75rem;--sl-input-height-medium: 2.25rem;--sl-input-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-border-radius-medium: 3px;--sl-focus-ring-width: 2px;--sl-focus-ring-color: color-mix(in srgb, var(--band) 60%, transparent);--sl-tooltip-background-color: var(--band);--sl-tooltip-color: var(--band-ink);--sl-tooltip-font-size: var(--sl-font-size-x-small)}look-band:not(:defined){display:block;height:60px;background:var(--band)}', eo = {
  /** An arrow most of the way round the selection: a quarter turn. */
  rotate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M3.76 12.24A6 6 0 1 1 14 8h-1A5 5 0 1 0 4.46 11.54Z"/><path d="M11.5 8h4l-2 2.6Z"/><path d="M6 6h4v4H6Z"/></svg>',
  /** A lever on its quadrant. */
  throttle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M1.89 9.78A6.5 6.5 0 0 1 14.11 9.78l-.94.34A5.5 5.5 0 0 0 2.83 10.12Z"/><path d="M8.63 12.3 12.01 5.05l-1.26-.6L7.37 11.7Z"/><circle cx="11.38" cy="4.75" r="1.6"/><path d="M1.5 12h13v1.5h-13Z"/></svg>'
}, jr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -150 618.3 200" fill="currentColor"><path d="M-45.4 58L-39.4 41.2L-33 25.1L-26.3 9.8L-19.2 -4.9L-11.7 -18.8L-3.9 -32L4.3 -44.5L12.9 -56.2L21.9 -67.1L31.2 -77.1L40.9 -86.3L50.9 -94.6L61.2 -102L71.7 -108.5L82.5 -113.9L93.3 -118.4L104.3 -121.9L115.3 -124.4L126.3 -126L137.2 -126.7L148 -126.5L158.8 -125.5L169.4 -123.8L180.1 -121.3L180 -120.7L169.5 -122.6L159 -123.9L148.4 -124.4L137.9 -124.1L127.4 -123L116.8 -121L106.3 -118.2L95.9 -114.4L85.7 -109.7L75.6 -104.1L65.7 -97.6L56.1 -90.2L46.8 -81.9L37.8 -72.8L29.1 -62.8L20.8 -52.1L12.9 -40.6L5.3 -28.3L-1.9 -15.3L-8.8 -1.6L-15.3 12.8L-21.4 28L-27.2 43.8L-32.6 60.3Z"/><path d="M72.6 79.7L73.3 65.2L74.3 51.4L75.6 38.2L77.1 25.6L78.9 13.6L80.9 2.3L83.2 -8.4L85.8 -18.6L88.7 -28.2L91.8 -37.2L95.2 -45.7L98.9 -53.8L102.9 -61.4L107.3 -68.5L112.1 -75.3L117.4 -81.6L123.1 -87.5L129.4 -93L136.3 -98L143.8 -102.6L151.9 -106.6L160.6 -110.1L170 -113L180 -115.3L179.9 -114.7L170 -111.9L160.8 -108.5L152.3 -104.5L144.5 -100L137.4 -95L131 -89.6L125.2 -83.7L120 -77.6L115.3 -71.1L111.2 -64.2L107.4 -57L104.1 -49.4L101.1 -41.4L98.3 -32.9L95.9 -23.9L93.7 -14.5L91.8 -4.5L90.1 6L88.7 17.2L87.5 28.9L86.6 41.2L85.9 54.2L85.5 67.8L85.4 82Z"/><path transform="translate(190 0)" d="M50.9 -72Q52 -71.4 51.7 -69.9L49.3 -57Q49.1 -55.3 47.3 -56Q45.1 -56.7 42.3 -56.7Q40.4 -56.7 39.4 -56.6Q33.4 -56.3 29.4 -52.4Q25.4 -48.4 25.4 -42.1V-1.7Q25.4 -1 24.9 -0.5Q24.4 0 23.7 0H10.6Q9.9 0 9.4 -0.5Q8.9 -1 8.9 -1.7V-71.3Q8.9 -72 9.4 -72.5Q9.9 -73 10.6 -73H23.7Q24.4 -73 24.9 -72.5Q25.4 -72 25.4 -71.3V-64.9Q25.4 -64.3 25.6 -64.2Q25.9 -64.1 26.1 -64.6Q32.1 -73.9 42.9 -73.9Q47.4 -73.9 50.9 -72ZM119.9 -49.9V-1.7Q119.9 -1 119.4 -0.5Q118.9 0 118.1 0H105Q104.3 0 103.8 -0.5Q103.3 -1 103.3 -1.7V-6.3Q103.3 -6.7 103 -6.8Q102.7 -6.9 102.4 -6.6Q95.4 1.1 82.1 1.1Q71.4 1.1 64.5 -4.3Q57.6 -9.7 57.6 -20.4Q57.6 -31.6 65.4 -37.8Q73.1 -44 87.3 -44H102.6Q103.3 -44 103.3 -44.7V-48.1Q103.3 -53.7 100 -56.8Q96.7 -59.9 90.1 -59.9Q84.7 -59.9 81.4 -57.9Q78 -56 77.1 -52.6Q76.7 -50.9 75.1 -51.1L61.3 -52.9Q60.6 -53 60.1 -53.4Q59.6 -53.7 59.7 -54.3Q60.9 -63 69.1 -68.6Q77.3 -74.1 89.7 -74.1Q98.7 -74.1 105.6 -71Q112.4 -67.9 116.1 -62.4Q119.9 -56.9 119.9 -49.9ZM103.3 -25.1V-31.9Q103.3 -32.6 102.6 -32.6H90.6Q83 -32.6 78.6 -29.7Q74.3 -26.9 74.3 -21.6Q74.3 -17 77.6 -14.5Q81 -12 86.3 -12Q93.3 -12 98.3 -15.7Q103.3 -19.4 103.3 -25.1ZM135.7 -93.1Q135.7 -97.6 138.6 -100.4Q141.4 -103.3 145.9 -103.3Q150.3 -103.3 153.1 -100.4Q156 -97.6 156 -93.1Q156 -88.7 153.1 -85.9Q150.3 -83 145.9 -83Q141.4 -83 138.6 -85.9Q135.7 -88.7 135.7 -93.1ZM137.3 -1.7V-71.4Q137.3 -72.1 137.8 -72.6Q138.3 -73.1 139 -73.1H152.1Q152.9 -73.1 153.4 -72.6Q153.9 -72.1 153.9 -71.4V-1.7Q153.9 -1 153.4 -0.5Q152.9 0 152.1 0H139Q138.3 0 137.8 -0.5Q137.3 -1 137.3 -1.7ZM172.9 -1.7V-98.3Q172.9 -99 173.4 -99.5Q173.9 -100 174.6 -100H187.7Q188.4 -100 188.9 -99.5Q189.4 -99 189.4 -98.3V-1.7Q189.4 -1 188.9 -0.5Q188.4 0 187.7 0H174.6Q173.9 0 173.4 -0.5Q172.9 -1 172.9 -1.7ZM204.1 -19.4V-20.7Q204.1 -21.4 204.6 -21.9Q205.1 -22.4 205.9 -22.4H218.4Q219.1 -22.4 219.6 -21.9Q220.1 -21.4 220.1 -20.7V-20.4Q220.1 -16.9 224.1 -14.2Q228 -11.6 234 -11.6Q239.7 -11.6 243.3 -13.9Q246.9 -16.3 246.9 -19.9Q246.9 -23.1 243.9 -24.8Q241 -26.4 234.4 -28.3L229 -30Q221.7 -32.1 216.7 -34.6Q211.7 -37 208.3 -41.2Q204.9 -45.4 204.9 -52Q204.9 -62 212.7 -67.9Q220.6 -73.9 233.4 -73.9Q242.1 -73.9 248.7 -71.1Q255.3 -68.3 258.9 -63.4Q262.4 -58.4 262.4 -52.1Q262.4 -51.4 261.9 -50.9Q261.4 -50.4 260.7 -50.4H248.6Q247.9 -50.4 247.4 -50.9Q246.9 -51.4 246.9 -52.1Q246.9 -55.9 243.2 -58.4Q239.6 -60.9 233.3 -60.9Q227.7 -60.9 224.2 -58.8Q220.7 -56.7 220.7 -53Q220.7 -49.6 224.1 -47.8Q227.4 -46 235.3 -43.9L238.4 -43Q246 -40.7 251.1 -38.4Q256.3 -36 259.9 -31.8Q263.4 -27.6 263.4 -20.9Q263.4 -10.7 255.4 -4.9Q247.4 0.9 234.1 0.9Q225.1 0.9 218.4 -1.8Q211.6 -4.4 207.9 -9.1Q204.1 -13.7 204.1 -19.4ZM344.9 -39.4V-28Q344.9 -27.3 344.4 -26.8Q343.9 -26.3 343.1 -26.3H337.1Q336.4 -26.3 336.4 -25.6V-1.7Q336.4 -1 335.9 -0.5Q335.4 0 334.7 0H321.6Q320.9 0 320.4 -0.5Q319.9 -1 319.9 -1.7V-25.6Q319.9 -26.3 319.1 -26.3H275.7Q275 -26.3 274.5 -26.8Q274 -27.3 274 -28V-37.1Q274 -38 274.4 -39.3L301.4 -98.7Q302 -100 303.4 -100H317.4Q318.4 -100 318.8 -99.5Q319.1 -99 318.7 -98L293.3 -42Q293.1 -41.7 293.3 -41.4Q293.4 -41.1 293.7 -41.1H319.1Q319.9 -41.1 319.9 -41.9V-61.3Q319.9 -62 320.4 -62.5Q320.9 -63 321.6 -63H334.7Q335.4 -63 335.9 -62.5Q336.4 -62 336.4 -61.3V-41.9Q336.4 -41.1 337.1 -41.1H343.1Q343.9 -41.1 344.4 -40.6Q344.9 -40.1 344.9 -39.4ZM420.3 -68.3V-24.7Q420.3 -17 416.4 -11.1Q412.6 -5.3 405.6 -2.1Q398.7 1.1 389.7 1.1Q381 1.1 374.2 -2Q367.4 -5.1 363.6 -10.9Q359.9 -16.6 359.9 -24V-27.1Q359.9 -27.9 360.4 -28.4Q360.9 -28.9 361.6 -28.9H374.7Q375.4 -28.9 375.9 -28.4Q376.4 -27.9 376.4 -27.1V-26.1Q376.4 -20.4 380.1 -16.8Q383.9 -13.1 389.7 -13.1Q395.9 -13.1 399.8 -16.9Q403.7 -20.7 403.7 -26.7V-42.4Q403.7 -42.9 403.4 -43Q403.1 -43.1 402.9 -42.9Q396.7 -36.9 386.1 -36.9Q377.7 -36.9 371.4 -40.4Q365 -44 361.4 -50.7Q357.4 -57.9 357.4 -68.4Q357.4 -77.1 360.3 -83.7Q363.7 -91.9 371.1 -96.4Q378.6 -101 388.7 -101Q399.4 -101 407.1 -96.1Q414.7 -91.1 418 -82.3Q420.3 -76.3 420.3 -68.3ZM403.7 -69.1Q403.7 -74.6 401.9 -78.7Q398.4 -86.6 389 -86.6Q379.9 -86.6 376.1 -78.9Q374 -74.1 374 -68.7Q374 -62.3 376.6 -57.7Q380.6 -50.9 388.9 -50.9Q397.7 -50.9 401.4 -58Q403.7 -62.6 403.7 -69.1Z"/></svg>', Wr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -150 200 200" fill="currentColor"><mask id="mark-knock"><rect x="0" y="-150" width="200" height="200" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="22"><path transform="translate(27.9 2) scale(0.95)" d="M76.3 -39.4V-28Q76.3 -27.3 75.8 -26.8Q75.3 -26.3 74.6 -26.3H68.6Q67.9 -26.3 67.9 -25.6V-1.7Q67.9 -1 67.4 -0.5Q66.9 0 66.1 0H53Q52.3 0 51.8 -0.5Q51.3 -1 51.3 -1.7V-25.6Q51.3 -26.3 50.6 -26.3H7.1Q6.4 -26.3 5.9 -26.8Q5.4 -27.3 5.4 -28V-37.1Q5.4 -38 5.9 -39.3L32.9 -98.7Q33.4 -100 34.9 -100H48.9Q49.9 -100 50.2 -99.5Q50.6 -99 50.1 -98L24.7 -42Q24.6 -41.7 24.7 -41.4Q24.9 -41.1 25.1 -41.1H50.6Q51.3 -41.1 51.3 -41.9V-61.3Q51.3 -62 51.8 -62.5Q52.3 -63 53 -63H66.1Q66.9 -63 67.4 -62.5Q67.9 -62 67.9 -61.3V-41.9Q67.9 -41.1 68.6 -41.1H74.6Q75.3 -41.1 75.8 -40.6Q76.3 -40.1 76.3 -39.4ZM151.7 -68.3V-24.7Q151.7 -17 147.9 -11.1Q144 -5.3 137.1 -2.1Q130.1 1.1 121.1 1.1Q112.4 1.1 105.6 -2Q98.9 -5.1 95.1 -10.9Q91.3 -16.6 91.3 -24V-27.1Q91.3 -27.9 91.8 -28.4Q92.3 -28.9 93 -28.9H106.1Q106.9 -28.9 107.4 -28.4Q107.9 -27.9 107.9 -27.1V-26.1Q107.9 -20.4 111.6 -16.8Q115.3 -13.1 121.1 -13.1Q127.3 -13.1 131.2 -16.9Q135.1 -20.7 135.1 -26.7V-42.4Q135.1 -42.9 134.9 -43Q134.6 -43.1 134.3 -42.9Q128.1 -36.9 117.6 -36.9Q109.1 -36.9 102.8 -40.4Q96.4 -44 92.9 -50.7Q88.9 -57.9 88.9 -68.4Q88.9 -77.1 91.7 -83.7Q95.1 -91.9 102.6 -96.4Q110 -101 120.1 -101Q130.9 -101 138.5 -96.1Q146.1 -91.1 149.4 -82.3Q151.7 -76.3 151.7 -68.3ZM135.1 -69.1Q135.1 -74.6 133.3 -78.7Q129.9 -86.6 120.4 -86.6Q111.3 -86.6 107.6 -78.9Q105.4 -74.1 105.4 -68.7Q105.4 -62.3 108 -57.7Q112 -50.9 120.3 -50.9Q129.1 -50.9 132.9 -58Q135.1 -62.6 135.1 -69.1Z"/></g></mask><g mask="url(#mark-knock)"><path d="M-38.1 59L-32.4 42.3L-26.3 26.3L-19.7 10.9L-12.7 -3.7L-5.3 -17.7L2.6 -30.9L10.9 -43.4L19.6 -55.2L28.8 -66.2L38.4 -76.3L48.3 -85.6L58.6 -94L69.3 -101.5L80.2 -108L91.3 -113.6L102.6 -118.3L114.1 -122L125.6 -124.7L137.1 -126.6L148.6 -127.7L160.2 -127.9L171.7 -127.3L183.3 -126.1L194.8 -124.1L194.9 -123.1L183.5 -124.3L172.1 -124.9L160.9 -124.8L149.8 -123.9L138.7 -122.3L127.8 -119.9L117 -116.7L106.3 -112.6L95.8 -107.7L85.5 -101.9L75.5 -95.2L65.8 -87.7L56.5 -79.4L47.5 -70.2L38.8 -60.2L30.6 -49.5L22.8 -38L15.4 -25.8L8.4 -12.9L1.8 0.7L-4.4 15L-10.1 30L-15.4 45.6L-20.3 61.8Z"/><path d="M80.3 78.2L80.8 64.2L81.6 50.9L82.6 38.1L84 25.9L85.7 14.3L87.8 3.3L90.1 -7.2L92.7 -17.2L95.7 -26.6L99 -35.6L102.6 -44.2L106.7 -52.3L111.1 -60L115.9 -67.3L121.2 -74.2L127 -80.7L133.4 -86.8L140.3 -92.6L147.9 -97.9L156.1 -102.7L164.9 -107.1L174.3 -110.9L184.4 -114.2L195.1 -116.9L195.2 -115.9L184.6 -112.5L174.7 -108.5L165.6 -104L157.2 -99L149.5 -93.6L142.6 -87.8L136.3 -81.6L130.7 -75.1L125.7 -68.3L121.3 -61.1L117.3 -53.7L113.9 -46L110.8 -38L108.1 -29.5L105.7 -20.7L103.7 -11.5L102 -1.8L100.5 8.4L99.4 19.1L98.6 30.4L98 42.2L97.7 54.6L97.8 67.5L98.1 81Z"/></g><path transform="translate(27.9 2) scale(0.95)" d="M76.3 -39.4V-28Q76.3 -27.3 75.8 -26.8Q75.3 -26.3 74.6 -26.3H68.6Q67.9 -26.3 67.9 -25.6V-1.7Q67.9 -1 67.4 -0.5Q66.9 0 66.1 0H53Q52.3 0 51.8 -0.5Q51.3 -1 51.3 -1.7V-25.6Q51.3 -26.3 50.6 -26.3H7.1Q6.4 -26.3 5.9 -26.8Q5.4 -27.3 5.4 -28V-37.1Q5.4 -38 5.9 -39.3L32.9 -98.7Q33.4 -100 34.9 -100H48.9Q49.9 -100 50.2 -99.5Q50.6 -99 50.1 -98L24.7 -42Q24.6 -41.7 24.7 -41.4Q24.9 -41.1 25.1 -41.1H50.6Q51.3 -41.1 51.3 -41.9V-61.3Q51.3 -62 51.8 -62.5Q52.3 -63 53 -63H66.1Q66.9 -63 67.4 -62.5Q67.9 -62 67.9 -61.3V-41.9Q67.9 -41.1 68.6 -41.1H74.6Q75.3 -41.1 75.8 -40.6Q76.3 -40.1 76.3 -39.4ZM151.7 -68.3V-24.7Q151.7 -17 147.9 -11.1Q144 -5.3 137.1 -2.1Q130.1 1.1 121.1 1.1Q112.4 1.1 105.6 -2Q98.9 -5.1 95.1 -10.9Q91.3 -16.6 91.3 -24V-27.1Q91.3 -27.9 91.8 -28.4Q92.3 -28.9 93 -28.9H106.1Q106.9 -28.9 107.4 -28.4Q107.9 -27.9 107.9 -27.1V-26.1Q107.9 -20.4 111.6 -16.8Q115.3 -13.1 121.1 -13.1Q127.3 -13.1 131.2 -16.9Q135.1 -20.7 135.1 -26.7V-42.4Q135.1 -42.9 134.9 -43Q134.6 -43.1 134.3 -42.9Q128.1 -36.9 117.6 -36.9Q109.1 -36.9 102.8 -40.4Q96.4 -44 92.9 -50.7Q88.9 -57.9 88.9 -68.4Q88.9 -77.1 91.7 -83.7Q95.1 -91.9 102.6 -96.4Q110 -101 120.1 -101Q130.9 -101 138.5 -96.1Q146.1 -91.1 149.4 -82.3Q151.7 -76.3 151.7 -68.3ZM135.1 -69.1Q135.1 -74.6 133.3 -78.7Q129.9 -86.6 120.4 -86.6Q111.3 -86.6 107.6 -78.9Q105.4 -74.1 105.4 -68.7Q105.4 -62.3 108 -57.7Q112 -50.9 120.3 -50.9Q129.1 -50.9 132.9 -58Q135.1 -62.6 135.1 -69.1Z"/></svg>', ws = (t) => `data:image/svg+xml,${encodeURIComponent(t)}`;
ys("rails49", {
  resolver: (t) => t in eo ? ws(eo[t]) : ""
});
const xs = (t) => t in eo ? "rails49" : "default", qr = {
  "--band": "#1d4ed8",
  "--band-ink": "#ffffff",
  "--rail": "#064e3b",
  "--rail-group": "#059669",
  "--rail-button": "44px",
  "--power-on": "#4ade80",
  "--stop": "#ef4444"
}, Zr = 60, Kr = 640, _s = 600, ue = `not all and (height > ${Kr}px) and (width > ${_s}px)`, Xr = Object.entries(qr).map(([t, e]) => `${t}: ${e};`).join(`
`), H = k`
  :host {
    ${rt(Xr)}
  }
`;
var Yr = Object.getOwnPropertyDescriptor, Gr = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? Yr(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = i(r) || r);
  return r;
};
let oo = class extends z {
  render() {
    return _`
      <slot name="band"></slot>
      <div class="body">
        <slot name="rail"></slot>
        <div class="work"><slot></slot></div>
      </div>
    `;
  }
};
oo.styles = [
  H,
  k`
      :host {
        display: flex;
        flex-direction: column;
        height: 100dvh;
      }

      .body {
        flex: 1;
        display: flex;
        min-height: 0;
      }

      .work {
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: auto;
        position: relative;
      }

      @media ${rt(ue)} {
        .body {
          flex-direction: column;
        }
      }
    `
];
oo = Gr([
  T("look-shell")
], oo);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let so = class extends vo {
  constructor(e) {
    if (super(e), this.it = w, e.type !== at.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(e) {
    if (e === w || e == null) return this._t = void 0, this.it = e;
    if (e === V) return e;
    if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (e === this.it) return this._t;
    this.it = e;
    const o = [e];
    return o.raw = o, this._t = { _$litType$: this.constructor.resultType, strings: o, values: [] };
  }
};
so.directiveName = "unsafeHTML", so.resultType = 1;
const Wo = go(so);
var Jr = k`
  :host {
    display: inline-block;
    width: 1em;
    height: 1em;
    box-sizing: content-box !important;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`, Gt = Symbol(), ve = Symbol(), Ke, Xe = /* @__PURE__ */ new Map(), Y = class extends X {
  constructor() {
    super(...arguments), this.initialRender = !1, this.svg = null, this.label = "", this.library = "default";
  }
  /** Given a URL, this function returns the resulting SVG element or an appropriate error symbol. */
  async resolveIcon(t, e) {
    var o;
    let s;
    if (e != null && e.spriteSheet)
      return this.svg = _`<svg part="svg">
        <use part="use" href="${t}"></use>
      </svg>`, this.svg;
    try {
      if (s = await fetch(t, { mode: "cors" }), !s.ok) return s.status === 410 ? Gt : ve;
    } catch {
      return ve;
    }
    try {
      const r = document.createElement("div");
      r.innerHTML = await s.text();
      const l = r.firstElementChild;
      if (((o = l == null ? void 0 : l.tagName) == null ? void 0 : o.toLowerCase()) !== "svg") return Gt;
      Ke || (Ke = new DOMParser());
      const n = Ke.parseFromString(l.outerHTML, "text/html").body.querySelector("svg");
      return n ? (n.part.add("svg"), document.adoptNode(n)) : Gt;
    } catch {
      return Gt;
    }
  }
  connectedCallback() {
    super.connectedCallback(), Mr(this);
  }
  firstUpdated() {
    this.initialRender = !0, this.setIcon();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), Dr(this);
  }
  getIconSource() {
    const t = jo(this.library);
    return this.name && t ? {
      url: t.resolver(this.name),
      fromLibrary: !0
    } : {
      url: this.src,
      fromLibrary: !1
    };
  }
  handleLabelChange() {
    typeof this.label == "string" && this.label.length > 0 ? (this.setAttribute("role", "img"), this.setAttribute("aria-label", this.label), this.removeAttribute("aria-hidden")) : (this.removeAttribute("role"), this.removeAttribute("aria-label"), this.setAttribute("aria-hidden", "true"));
  }
  async setIcon() {
    var t;
    const { url: e, fromLibrary: o } = this.getIconSource(), s = o ? jo(this.library) : void 0;
    if (!e) {
      this.svg = null;
      return;
    }
    let r = Xe.get(e);
    if (r || (r = this.resolveIcon(e, s), Xe.set(e, r)), !this.initialRender)
      return;
    const l = await r;
    if (l === ve && Xe.delete(e), e === this.getIconSource().url) {
      if (Cr(l)) {
        if (this.svg = l, s) {
          await this.updateComplete;
          const i = this.shadowRoot.querySelector("[part='svg']");
          typeof s.mutator == "function" && i && s.mutator(i);
        }
        return;
      }
      switch (l) {
        case ve:
        case Gt:
          this.svg = null, this.emit("sl-error");
          break;
        default:
          this.svg = l.cloneNode(!0), (t = s == null ? void 0 : s.mutator) == null || t.call(s, this.svg), this.emit("sl-load");
      }
    }
  }
  render() {
    return this.svg;
  }
};
Y.styles = [Ft, Jr];
f([
  de()
], Y.prototype, "svg", 2);
f([
  u({ reflect: !0 })
], Y.prototype, "name", 2);
f([
  u()
], Y.prototype, "src", 2);
f([
  u()
], Y.prototype, "label", 2);
f([
  u({ reflect: !0 })
], Y.prototype, "library", 2);
f([
  pt("label")
], Y.prototype, "handleLabelChange", 1);
f([
  pt(["name", "src", "library"])
], Y.prototype, "setIcon", 1);
Y.define("sl-icon");
var tl = k`
  :host {
    --max-width: 20rem;
    --hide-delay: 0ms;
    --show-delay: 150ms;

    display: contents;
  }

  .tooltip {
    --arrow-size: var(--sl-tooltip-arrow-size);
    --arrow-color: var(--sl-tooltip-background-color);
  }

  .tooltip::part(popup) {
    z-index: var(--sl-z-index-tooltip);
  }

  .tooltip[placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .tooltip[placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  .tooltip[placement^='left']::part(popup) {
    transform-origin: right;
  }

  .tooltip[placement^='right']::part(popup) {
    transform-origin: left;
  }

  .tooltip__body {
    display: block;
    width: max-content;
    max-width: var(--max-width);
    border-radius: var(--sl-tooltip-border-radius);
    background-color: var(--sl-tooltip-background-color);
    font-family: var(--sl-tooltip-font-family);
    font-size: var(--sl-tooltip-font-size);
    font-weight: var(--sl-tooltip-font-weight);
    line-height: var(--sl-tooltip-line-height);
    text-align: start;
    white-space: normal;
    color: var(--sl-tooltip-color);
    padding: var(--sl-tooltip-padding);
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }
`, el = k`
  :host {
    --arrow-color: var(--sl-color-neutral-1000);
    --arrow-size: 6px;

    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant
     * 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --arrow-size-diagonal: calc(var(--arrow-size) * 0.7071);
    --arrow-padding-offset: calc(var(--arrow-size-diagonal) - var(--arrow-size));

    display: contents;
  }

  .popup {
    position: absolute;
    isolation: isolate;
    max-width: var(--auto-size-available-width, none);
    max-height: var(--auto-size-available-height, none);
  }

  .popup--fixed {
    position: fixed;
  }

  .popup:not(.popup--active) {
    display: none;
  }

  .popup__arrow {
    position: absolute;
    width: calc(var(--arrow-size-diagonal) * 2);
    height: calc(var(--arrow-size-diagonal) * 2);
    rotate: 45deg;
    background: var(--arrow-color);
    z-index: -1;
  }

  /* Hover bridge */
  .popup-hover-bridge:not(.popup-hover-bridge--visible) {
    display: none;
  }

  .popup-hover-bridge {
    position: fixed;
    z-index: calc(var(--sl-z-index-dropdown) - 1);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;
const ro = /* @__PURE__ */ new Set(), Rt = /* @__PURE__ */ new Map();
let tt, bo = "ltr", yo = "en";
const $s = typeof MutationObserver < "u" && typeof document < "u" && typeof document.documentElement < "u";
if ($s) {
  const t = new MutationObserver(Ls);
  bo = document.documentElement.dir || "ltr", yo = document.documentElement.lang || navigator.language, t.observe(document.documentElement, {
    attributes: !0,
    attributeFilter: ["dir", "lang"]
  });
}
function ks(...t) {
  t.map((e) => {
    const o = e.$code.toLowerCase();
    Rt.has(o) ? Rt.set(o, Object.assign(Object.assign({}, Rt.get(o)), e)) : Rt.set(o, e), tt || (tt = e);
  }), Ls();
}
function Ls() {
  $s && (bo = document.documentElement.dir || "ltr", yo = document.documentElement.lang || navigator.language), [...ro.keys()].map((t) => {
    typeof t.requestUpdate == "function" && t.requestUpdate();
  });
}
let ol = class {
  constructor(e) {
    this.host = e, this.host.addController(this);
  }
  hostConnected() {
    ro.add(this.host);
  }
  hostDisconnected() {
    ro.delete(this.host);
  }
  dir() {
    return `${this.host.dir || bo}`.toLowerCase();
  }
  lang() {
    const e = `${this.host.lang || yo}`.toLowerCase().replace(/_/g, "-");
    try {
      return new Intl.Locale(e), e;
    } catch {
      return tt ? tt.$code.toLowerCase() : "en";
    }
  }
  getTranslationData(e) {
    var o, s;
    let r;
    try {
      r = new Intl.Locale(e.replace(/_/g, "-"));
    } catch {
      return { locale: void 0, language: "", region: "", primary: void 0, secondary: void 0 };
    }
    const l = r.language.toLowerCase(), i = (s = (o = r.region) === null || o === void 0 ? void 0 : o.toLowerCase()) !== null && s !== void 0 ? s : "", n = Rt.get(`${l}-${i}`), a = Rt.get(l);
    return { locale: r, language: l, region: i, primary: n, secondary: a };
  }
  exists(e, o) {
    var s;
    const { primary: r, secondary: l } = this.getTranslationData((s = o.lang) !== null && s !== void 0 ? s : this.lang());
    return o = Object.assign({ includeFallback: !1 }, o), !!(r && r[e] || l && l[e] || o.includeFallback && tt && tt[e]);
  }
  term(e, ...o) {
    const { primary: s, secondary: r } = this.getTranslationData(this.lang());
    let l;
    if (s && s[e])
      l = s[e];
    else if (r && r[e])
      l = r[e];
    else if (tt && tt[e])
      l = tt[e];
    else
      return console.error(`No translation found for: ${String(e)}`), String(e);
    return typeof l == "function" ? l(...o) : l;
  }
  date(e, o) {
    return e = new Date(e), new Intl.DateTimeFormat(this.lang(), o).format(e);
  }
  number(e, o) {
    return e = Number(e), isNaN(e) ? "" : new Intl.NumberFormat(this.lang(), o).format(e);
  }
  relativeTime(e, o, s) {
    return new Intl.RelativeTimeFormat(this.lang(), s).format(e, o);
  }
};
var Cs = {
  $code: "en",
  $name: "English",
  $dir: "ltr",
  carousel: "Carousel",
  clearEntry: "Clear entry",
  close: "Close",
  copied: "Copied",
  copy: "Copy",
  currentValue: "Current value",
  error: "Error",
  goToSlide: (t, e) => `Go to slide ${t} of ${e}`,
  hidePassword: "Hide password",
  loading: "Loading",
  nextSlide: "Next slide",
  numOptionsSelected: (t) => t === 0 ? "No options selected" : t === 1 ? "1 option selected" : `${t} options selected`,
  previousSlide: "Previous slide",
  progress: "Progress",
  remove: "Remove",
  resize: "Resize",
  scrollToEnd: "Scroll to end",
  scrollToStart: "Scroll to start",
  selectAColorFromTheScreen: "Select a color from the screen",
  showPassword: "Show password",
  slideNum: (t) => `Slide ${t}`,
  toggleColorFormat: "Toggle color format"
};
ks(Cs);
var sl = Cs, wo = class extends ol {
};
ks(sl);
const dt = Math.min, ot = Math.max, Le = Math.round, be = Math.floor, st = (t) => ({
  x: t,
  y: t
}), rl = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function As(t, e, o) {
  return ot(t, dt(e, o));
}
function Nt(t, e) {
  return typeof t == "function" ? t(e) : t;
}
function Ct(t) {
  return t.split("-")[0];
}
function It(t) {
  return t.split("-")[1];
}
function zs(t) {
  return t === "x" ? "y" : "x";
}
function xo(t) {
  return t === "y" ? "height" : "width";
}
function et(t) {
  const e = t[0];
  return e === "t" || e === "b" ? "y" : "x";
}
function _o(t) {
  return zs(et(t));
}
function ll(t, e, o) {
  o === void 0 && (o = !1);
  const s = It(t), r = _o(t), l = xo(r);
  let i = r === "x" ? s === (o ? "end" : "start") ? "right" : "left" : s === "start" ? "bottom" : "top";
  return e.reference[l] > e.floating[l] && (i = Ce(i)), [i, Ce(i)];
}
function il(t) {
  const e = Ce(t);
  return [lo(t), e, lo(e)];
}
function lo(t) {
  return t.includes("start") ? t.replace("start", "end") : t.replace("end", "start");
}
const qo = ["left", "right"], Zo = ["right", "left"], nl = ["top", "bottom"], al = ["bottom", "top"];
function cl(t, e, o) {
  switch (t) {
    case "top":
    case "bottom":
      return o ? e ? Zo : qo : e ? qo : Zo;
    case "left":
    case "right":
      return e ? nl : al;
    default:
      return [];
  }
}
function hl(t, e, o, s) {
  const r = It(t);
  let l = cl(Ct(t), o === "start", s);
  return r && (l = l.map((i) => i + "-" + r), e && (l = l.concat(l.map(lo)))), l;
}
function Ce(t) {
  const e = Ct(t);
  return rl[e] + t.slice(e.length);
}
function dl(t) {
  var e, o, s, r;
  return {
    top: (e = t.top) != null ? e : 0,
    right: (o = t.right) != null ? o : 0,
    bottom: (s = t.bottom) != null ? s : 0,
    left: (r = t.left) != null ? r : 0
  };
}
function Es(t) {
  return typeof t != "number" ? dl(t) : {
    top: t,
    right: t,
    bottom: t,
    left: t
  };
}
function Ae(t) {
  const {
    x: e,
    y: o,
    width: s,
    height: r
  } = t;
  return {
    width: s,
    height: r,
    top: o,
    left: e,
    right: e + s,
    bottom: o + r,
    x: e,
    y: o
  };
}
function Ko(t, e, o) {
  let {
    reference: s,
    floating: r
  } = t;
  const l = et(e), i = _o(e), n = xo(i), a = Ct(e), c = l === "y", d = s.x + s.width / 2 - r.width / 2, h = s.y + s.height / 2 - r.height / 2, m = s[n] / 2 - r[n] / 2;
  let p;
  switch (a) {
    case "top":
      p = {
        x: d,
        y: s.y - r.height
      };
      break;
    case "bottom":
      p = {
        x: d,
        y: s.y + s.height
      };
      break;
    case "right":
      p = {
        x: s.x + s.width,
        y: h
      };
      break;
    case "left":
      p = {
        x: s.x - r.width,
        y: h
      };
      break;
    default:
      p = {
        x: s.x,
        y: s.y
      };
  }
  const g = It(e);
  return g && (p[i] += m * (g === "end" ? 1 : -1) * (o && c ? -1 : 1)), p;
}
async function ul(t, e) {
  var o;
  e === void 0 && (e = {});
  const {
    x: s,
    y: r,
    platform: l,
    rects: i,
    elements: n,
    strategy: a
  } = t, {
    boundary: c = "clippingAncestors",
    rootBoundary: d = "viewport",
    elementContext: h = "floating",
    altBoundary: m = !1,
    padding: p = 0
  } = Nt(e, t), g = Es(p), y = n[m ? h === "floating" ? "reference" : "floating" : h], b = Ae(await l.getClippingRect({
    element: (o = await (l.isElement == null ? void 0 : l.isElement(y))) == null || o ? y : y.contextElement || await (l.getDocumentElement == null ? void 0 : l.getDocumentElement(n.floating)),
    boundary: c,
    rootBoundary: d,
    strategy: a
  })), x = h === "floating" ? {
    x: s,
    y: r,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, $ = await (l.getOffsetParent == null ? void 0 : l.getOffsetParent(n.floating)), C = await (l.isElement == null ? void 0 : l.isElement($)) && await (l.getScale == null ? void 0 : l.getScale($)) || {
    x: 1,
    y: 1
  }, P = Ae(l.convertOffsetParentRelativeRectToViewportRelativeRect ? await l.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: n,
    rect: x,
    offsetParent: $,
    strategy: a
  }) : x);
  return {
    top: (b.top - P.top + g.top) / C.y,
    bottom: (P.bottom - b.bottom + g.bottom) / C.y,
    left: (b.left - P.left + g.left) / C.x,
    right: (P.right - b.right + g.right) / C.x
  };
}
const pl = 50, fl = async (t, e, o) => {
  const {
    placement: s = "bottom",
    strategy: r = "absolute",
    middleware: l = [],
    platform: i
  } = o, n = i.detectOverflow ? i : {
    ...i,
    detectOverflow: ul
  }, a = await (i.isRTL == null ? void 0 : i.isRTL(e));
  let c = await i.getElementRects({
    reference: t,
    floating: e,
    strategy: r
  }), {
    x: d,
    y: h
  } = Ko(c, s, a), m = s, p = 0;
  const g = {};
  for (let v = 0; v < l.length; v++) {
    const y = l[v];
    if (!y)
      continue;
    const {
      name: b,
      fn: x
    } = y, {
      x: $,
      y: C,
      data: P,
      reset: A
    } = await x({
      x: d,
      y: h,
      initialPlacement: s,
      placement: m,
      strategy: r,
      middlewareData: g,
      rects: c,
      platform: n,
      elements: {
        reference: t,
        floating: e
      }
    });
    d = $ ?? d, h = C ?? h, g[b] = {
      ...g[b],
      ...P
    }, A && p < pl && (p++, typeof A == "object" && (A.placement && (m = A.placement), A.rects && (c = A.rects === !0 ? await i.getElementRects({
      reference: t,
      floating: e,
      strategy: r
    }) : A.rects), {
      x: d,
      y: h
    } = Ko(c, m, a)), v = -1);
  }
  return {
    x: d,
    y: h,
    placement: m,
    strategy: r,
    middlewareData: g
  };
}, ml = (t) => ({
  name: "arrow",
  options: t,
  async fn(e) {
    const {
      x: o,
      y: s,
      placement: r,
      rects: l,
      platform: i,
      elements: n,
      middlewareData: a
    } = e, {
      element: c,
      padding: d = 0
    } = Nt(t, e) || {};
    if (c == null)
      return {};
    const h = Es(d), m = {
      x: o,
      y: s
    }, p = _o(r), g = xo(p), v = await i.getDimensions(c), y = p === "y", b = y ? "top" : "left", x = y ? "bottom" : "right", $ = y ? "clientHeight" : "clientWidth", C = l.reference[g] + l.reference[p] - m[p] - l.floating[g], P = m[p] - l.reference[p], A = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
    let O = A ? A[$] : 0;
    (!O || !await (i.isElement == null ? void 0 : i.isElement(A))) && (O = n.floating[$] || l.floating[g]);
    const B = C / 2 - P / 2, j = O / 2 - v[g] / 2 - 1, S = dt(h[b], j), Wt = dt(h[x], j), qt = O - v[g] - Wt, W = O / 2 - v[g] / 2 + B, F = As(S, W, qt), gt = !a.arrow && It(r) != null && W !== F && l.reference[g] / 2 - (W < S ? S : Wt) - v[g] / 2 < 0, J = gt ? W < S ? W - S : W - qt : 0;
    return {
      [p]: m[p] + J,
      data: {
        [p]: F,
        centerOffset: W - F - J,
        ...gt && {
          alignmentOffset: J
        }
      },
      reset: gt
    };
  }
}), gl = function(t) {
  return t === void 0 && (t = {}), {
    name: "flip",
    options: t,
    async fn(e) {
      var o, s;
      const {
        placement: r,
        middlewareData: l,
        rects: i,
        initialPlacement: n,
        platform: a,
        elements: c
      } = e, {
        mainAxis: d = !0,
        crossAxis: h = !0,
        fallbackPlacements: m,
        fallbackStrategy: p = "bestFit",
        fallbackAxisSideDirection: g = "none",
        flipAlignment: v = !0,
        ...y
      } = Nt(t, e);
      if ((o = l.arrow) != null && o.alignmentOffset)
        return {};
      const b = Ct(r), x = et(n), $ = Ct(n) === n, C = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)), P = m || ($ || !v ? [Ce(n)] : il(n)), A = g !== "none";
      !m && A && P.push(...hl(n, v, g, C));
      const O = [n, ...P], B = await a.detectOverflow(e, y), j = [];
      let S = ((s = l.flip) == null ? void 0 : s.overflows) || [];
      if (d && j.push(B[b]), h) {
        const F = ll(r, i, C);
        j.push(B[F[0]], B[F[1]]);
      }
      if (S = [...S, {
        placement: r,
        overflows: j
      }], !j.every((F) => F <= 0)) {
        var Wt, qt;
        const F = (((Wt = l.flip) == null ? void 0 : Wt.index) || 0) + 1, gt = O[F];
        if (gt && (!(h === "alignment" ? x !== et(gt) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        S.every((N) => et(N.placement) === x ? N.overflows[0] > 0 : !0)))
          return {
            data: {
              index: F,
              overflows: S
            },
            reset: {
              placement: gt
            }
          };
        let J = (qt = S.filter((vt) => vt.overflows[0] <= 0).sort((vt, N) => vt.overflows[1] - N.overflows[1])[0]) == null ? void 0 : qt.placement;
        if (!J)
          switch (p) {
            case "bestFit": {
              var W;
              const vt = (W = S.filter((N) => {
                if (A) {
                  const nt = et(N.placement);
                  return nt === x || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  nt === "y";
                }
                return !0;
              }).map((N) => [N.placement, N.overflows.filter((nt) => nt > 0).reduce((nt, Us) => nt + Us, 0)]).sort((N, nt) => N[1] - nt[1])[0]) == null ? void 0 : W[0];
              vt && (J = vt);
              break;
            }
            case "initialPlacement":
              J = n;
              break;
          }
        if (r !== J)
          return {
            reset: {
              placement: J
            }
          };
      }
      return {};
    }
  };
}, vl = /* @__PURE__ */ new Set(["left", "top"]);
async function bl(t, e) {
  const {
    placement: o,
    platform: s,
    elements: r
  } = t, l = await (s.isRTL == null ? void 0 : s.isRTL(r.floating)), i = Ct(o), n = It(o), a = et(o) === "y", c = vl.has(i) ? -1 : 1, d = l && a ? -1 : 1, h = Nt(e, t);
  let {
    mainAxis: m,
    crossAxis: p,
    alignmentAxis: g
  } = typeof h == "number" ? {
    mainAxis: h,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: h.mainAxis || 0,
    crossAxis: h.crossAxis || 0,
    alignmentAxis: h.alignmentAxis
  };
  return n && typeof g == "number" && (p = n === "end" ? g * -1 : g), a ? {
    x: p * d,
    y: m * c
  } : {
    x: m * c,
    y: p * d
  };
}
const yl = function(t) {
  return t === void 0 && (t = 0), {
    name: "offset",
    options: t,
    async fn(e) {
      var o, s;
      const {
        x: r,
        y: l,
        placement: i,
        middlewareData: n
      } = e, a = await bl(e, t);
      return i === ((o = n.offset) == null ? void 0 : o.placement) && (s = n.arrow) != null && s.alignmentOffset ? {} : {
        x: r + a.x,
        y: l + a.y,
        data: {
          ...a,
          placement: i
        }
      };
    }
  };
}, wl = function(t) {
  return t === void 0 && (t = {}), {
    name: "shift",
    options: t,
    async fn(e) {
      const {
        x: o,
        y: s,
        placement: r,
        platform: l
      } = e, {
        mainAxis: i = !0,
        crossAxis: n = !1,
        limiter: a = {
          fn: (x) => {
            let {
              x: $,
              y: C
            } = x;
            return {
              x: $,
              y: C
            };
          }
        },
        ...c
      } = Nt(t, e), d = {
        x: o,
        y: s
      }, h = await l.detectOverflow(e, c), m = et(r), p = zs(m);
      let g = d[p], v = d[m];
      const y = (x, $) => As($ + h[x === "y" ? "top" : "left"], $, $ - h[x === "y" ? "bottom" : "right"]);
      i && (g = y(p, g)), n && (v = y(m, v));
      const b = a.fn({
        ...e,
        [p]: g,
        [m]: v
      });
      return {
        ...b,
        data: {
          x: b.x - o,
          y: b.y - s,
          enabled: {
            [p]: i,
            [m]: n
          }
        }
      };
    }
  };
}, xl = function(t) {
  return t === void 0 && (t = {}), {
    name: "size",
    options: t,
    async fn(e) {
      const {
        placement: o,
        rects: s,
        platform: r,
        elements: l
      } = e, {
        apply: i = () => {
        },
        ...n
      } = Nt(t, e), a = await r.detectOverflow(e, n), c = Ct(o), d = It(o), h = et(o) === "y", {
        width: m,
        height: p
      } = s.floating;
      let g, v;
      c === "top" || c === "bottom" ? (g = c, v = d === (await (r.isRTL == null ? void 0 : r.isRTL(l.floating)) ? "start" : "end") ? "left" : "right") : (v = c, g = d === "end" ? "top" : "bottom");
      const y = p - a.top - a.bottom, b = m - a.left - a.right, x = dt(p - a[g], y), $ = dt(m - a[v], b), C = e.middlewareData.shift, P = !C;
      let A = x, O = $;
      C != null && C.enabled.x && (O = b), C != null && C.enabled.y && (A = y), P && !d && (h ? O = m - 2 * ot(a.left, a.right) : A = p - 2 * ot(a.top, a.bottom)), await i({
        ...e,
        availableWidth: O,
        availableHeight: A
      });
      const B = await r.getDimensions(l.floating);
      return m !== B.width || p !== B.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Re() {
  return typeof window < "u";
}
function Ut(t) {
  return Ss(t) ? (t.nodeName || "").toLowerCase() : "#document";
}
function R(t) {
  var e;
  return (t == null || (e = t.ownerDocument) == null ? void 0 : e.defaultView) || window;
}
function it(t) {
  var e;
  return (e = (Ss(t) ? t.ownerDocument : t.document) || window.document) == null ? void 0 : e.documentElement;
}
function Ss(t) {
  return Re() ? t instanceof Node || t instanceof R(t).Node : !1;
}
function q(t) {
  return Re() ? t instanceof Element || t instanceof R(t).Element : !1;
}
function ft(t) {
  return Re() ? t instanceof HTMLElement || t instanceof R(t).HTMLElement : !1;
}
function Xo(t) {
  return !Re() || typeof ShadowRoot > "u" ? !1 : t instanceof ShadowRoot || t instanceof R(t).ShadowRoot;
}
function Te(t) {
  const {
    overflow: e,
    overflowX: o,
    overflowY: s,
    display: r
  } = Z(t);
  return /auto|scroll|overlay|hidden|clip/.test(e + s + o) && r !== "inline" && r !== "contents";
}
function _l(t) {
  return /^(table|td|th)$/.test(Ut(t));
}
function Me(t) {
  try {
    if (t.matches(":popover-open"))
      return !0;
  } catch {
  }
  try {
    return t.matches(":modal");
  } catch {
    return !1;
  }
}
const $l = /transform|translate|scale|rotate|perspective|filter/, kl = /paint|layout|strict|content/, yt = (t) => !!t && t !== "none";
let Ye;
function De(t) {
  const e = q(t) ? Z(t) : t;
  return yt(e.transform) || yt(e.translate) || yt(e.scale) || yt(e.rotate) || yt(e.perspective) || !$o() && (yt(e.backdropFilter) || yt(e.filter)) || $l.test(e.willChange || "") || kl.test(e.contain || "");
}
function Ll(t) {
  let e = At(t);
  for (; ft(e) && !le(e); ) {
    if (De(e))
      return e;
    if (Me(e))
      return null;
    e = At(e);
  }
  return null;
}
function $o() {
  return Ye == null && (Ye = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Ye;
}
function le(t) {
  return /^(html|body|#document)$/.test(Ut(t));
}
function Z(t) {
  return R(t).getComputedStyle(t);
}
function Ve(t) {
  return q(t) ? {
    scrollLeft: t.scrollLeft,
    scrollTop: t.scrollTop
  } : {
    scrollLeft: t.scrollX,
    scrollTop: t.scrollY
  };
}
function At(t) {
  if (Ut(t) === "html")
    return t;
  const e = (
    // Step into the shadow DOM of the parent of a slotted node.
    t.assignedSlot || // DOM Element detected.
    t.parentNode || // ShadowRoot detected.
    Xo(t) && t.host || // Fallback.
    it(t)
  );
  return Xo(e) ? e.host : e;
}
function Qs(t) {
  const e = At(t);
  return le(e) ? (t.ownerDocument || t).body : ft(e) && Te(e) ? e : Qs(e);
}
function ie(t, e, o) {
  var s;
  e === void 0 && (e = []), o === void 0 && (o = !0);
  const r = Qs(t), l = r === ((s = t.ownerDocument) == null ? void 0 : s.body), i = R(r);
  if (l) {
    const n = io(i);
    return e.concat(i, i.visualViewport || [], Te(r) ? r : [], n && o ? ie(n) : []);
  } else
    return e.concat(r, ie(r, [], o));
}
function io(t) {
  return t.parent && Object.getPrototypeOf(t.parent) ? t.frameElement : null;
}
function Ps(t) {
  const e = Z(t);
  let o = parseFloat(e.width) || 0, s = parseFloat(e.height) || 0;
  const r = ft(t), l = r ? t.offsetWidth : o, i = r ? t.offsetHeight : s, n = Le(o) !== l || Le(s) !== i;
  return n && (o = l, s = i), {
    width: o,
    height: s,
    $: n
  };
}
function ko(t) {
  return q(t) ? t : t.contextElement;
}
function Mt(t) {
  const e = ko(t);
  if (!ft(e))
    return st(1);
  const o = e.getBoundingClientRect(), {
    width: s,
    height: r,
    $: l
  } = Ps(e);
  let i = (l ? Le(o.width) : o.width) / s, n = (l ? Le(o.height) : o.height) / r;
  return (!i || !Number.isFinite(i)) && (i = 1), (!n || !Number.isFinite(n)) && (n = 1), {
    x: i,
    y: n
  };
}
const Cl = /* @__PURE__ */ st(0);
function Os(t) {
  const e = R(t);
  return !$o() || !e.visualViewport ? Cl : {
    x: e.visualViewport.offsetLeft,
    y: e.visualViewport.offsetTop
  };
}
function Al(t, e, o) {
  return e === void 0 && (e = !1), !!o && e && o === R(t);
}
function zt(t, e, o, s) {
  e === void 0 && (e = !1), o === void 0 && (o = !1);
  const r = t.getBoundingClientRect(), l = ko(t);
  let i = st(1);
  e && (s ? q(s) && (i = Mt(s)) : i = Mt(t));
  const n = Al(l, o, s) ? Os(l) : st(0);
  let a = (r.left + n.x) / i.x, c = (r.top + n.y) / i.y, d = r.width / i.x, h = r.height / i.y;
  if (l && s) {
    const m = R(l), p = q(s) ? R(s) : s;
    let g = m, v = io(g);
    for (; v && p !== g; ) {
      const y = Mt(v), b = v.getBoundingClientRect(), x = Z(v), $ = b.left + (v.clientLeft + parseFloat(x.paddingLeft)) * y.x, C = b.top + (v.clientTop + parseFloat(x.paddingTop)) * y.y;
      a *= y.x, c *= y.y, d *= y.x, h *= y.y, a += $, c += C, g = R(v), v = io(g);
    }
  }
  return Ae({
    width: d,
    height: h,
    x: a,
    y: c
  });
}
function He(t, e) {
  const o = Ve(t).scrollLeft;
  return e ? e.left + o : zt(it(t)).left + o;
}
function Rs(t, e) {
  const o = t.getBoundingClientRect(), s = o.left + e.scrollLeft - He(t, o), r = o.top + e.scrollTop;
  return {
    x: s,
    y: r
  };
}
function zl(t) {
  let {
    elements: e,
    rect: o,
    offsetParent: s,
    strategy: r
  } = t;
  const l = r === "fixed", i = it(s), n = e ? Me(e.floating) : !1;
  if (s === i || n && l)
    return o;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = st(1);
  const d = st(0), h = ft(s);
  if ((h || !l) && ((Ut(s) !== "body" || Te(i)) && (a = Ve(s)), h)) {
    const p = zt(s);
    c = Mt(s), d.x = p.x + s.clientLeft, d.y = p.y + s.clientTop;
  }
  const m = i && !h && !l ? Rs(i, a) : st(0);
  return {
    width: o.width * c.x,
    height: o.height * c.y,
    x: o.x * c.x - a.scrollLeft * c.x + d.x + m.x,
    y: o.y * c.y - a.scrollTop * c.y + d.y + m.y
  };
}
function El(t) {
  return t.getClientRects ? Array.from(t.getClientRects()) : [];
}
function Sl(t) {
  const e = Ve(t), o = t.ownerDocument.body, s = ot(t.scrollWidth, t.clientWidth, o.scrollWidth, o.clientWidth), r = ot(t.scrollHeight, t.clientHeight, o.scrollHeight, o.clientHeight);
  let l = -e.scrollLeft + He(t);
  const i = -e.scrollTop;
  return Z(o).direction === "rtl" && (l += ot(t.clientWidth, o.clientWidth) - s), {
    width: s,
    height: r,
    x: l,
    y: i
  };
}
const Ql = 25;
function Pl(t, e, o) {
  o === void 0 && (o = "viewport");
  const s = o === "layoutViewport", r = R(t), l = it(t), i = r.visualViewport;
  let n = l.clientWidth, a = l.clientHeight, c = 0, d = 0;
  if (i) {
    const m = !$o() || e === "fixed";
    s ? m || (c = -i.offsetLeft, d = -i.offsetTop) : (n = i.width, a = i.height, m && (c = i.offsetLeft, d = i.offsetTop));
  }
  if (He(l) <= 0) {
    const m = l.ownerDocument, p = m.body, g = getComputedStyle(p), v = m.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, y = Math.abs(l.clientWidth - p.clientWidth - v), b = getComputedStyle(l).scrollbarGutter === "stable both-edges" ? y / 2 : y;
    b <= Ql && (n -= b);
  }
  return {
    width: n,
    height: a,
    x: c,
    y: d
  };
}
function Ol(t, e) {
  const o = zt(t, !0, e === "fixed"), s = o.top + t.clientTop, r = o.left + t.clientLeft, l = Mt(t), i = t.clientWidth * l.x, n = t.clientHeight * l.y, a = r * l.x, c = s * l.y;
  return {
    width: i,
    height: n,
    x: a,
    y: c
  };
}
function Yo(t, e, o) {
  let s;
  if (e === "viewport" || e === "layoutViewport")
    s = Pl(t, o, e);
  else if (e === "document")
    s = Sl(it(t));
  else if (q(e))
    s = Ol(e, o);
  else {
    const r = Os(t);
    s = {
      x: e.x - r.x,
      y: e.y - r.y,
      width: e.width,
      height: e.height
    };
  }
  return Ae(s);
}
function Rl(t, e) {
  const o = e.get(t);
  if (o)
    return o;
  let s = ie(t, [], !1).filter((n) => q(n) && Ut(n) !== "body"), r = null;
  const l = Z(t).position === "fixed";
  let i = l ? At(t) : t;
  for (; q(i) && !le(i); ) {
    const n = Z(i), a = De(i), c = r ? r.position : l ? "fixed" : "";
    !a && (c === "fixed" || c === "absolute" && n.position === "static") ? s = s.filter((h) => h !== i) : r = n, i = At(i);
  }
  return e.set(t, s), s;
}
function Tl(t) {
  let {
    element: e,
    boundary: o,
    rootBoundary: s,
    strategy: r
  } = t;
  const i = [...o === "clippingAncestors" ? Me(e) ? [] : Rl(e, this._c) : [].concat(o), s], n = Yo(e, i[0], r);
  let a = n.top, c = n.right, d = n.bottom, h = n.left;
  for (let m = 1; m < i.length; m++) {
    const p = Yo(e, i[m], r);
    a = ot(p.top, a), c = dt(p.right, c), d = dt(p.bottom, d), h = ot(p.left, h);
  }
  return {
    width: c - h,
    height: d - a,
    x: h,
    y: a
  };
}
function Ml(t) {
  const {
    width: e,
    height: o
  } = Ps(t);
  return {
    width: e,
    height: o
  };
}
function Dl(t, e, o) {
  const s = ft(e), r = it(e), l = o === "fixed", i = zt(t, !0, l, e);
  let n = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = st(0);
  if ((s || !l) && ((Ut(e) !== "body" || Te(r)) && (n = Ve(e)), s)) {
    const m = zt(e, !0, l, e);
    a.x = m.x + e.clientLeft, a.y = m.y + e.clientTop;
  }
  !s && r && (a.x = He(r));
  const c = r && !s && !l ? Rs(r, n) : st(0), d = i.left + n.scrollLeft - a.x - c.x, h = i.top + n.scrollTop - a.y - c.y;
  return {
    x: d,
    y: h,
    width: i.width,
    height: i.height
  };
}
function Ge(t) {
  return Z(t).position === "static";
}
function Go(t, e) {
  if (!ft(t) || Z(t).position === "fixed")
    return null;
  if (e)
    return e(t);
  let o = t.offsetParent;
  return it(t) === o && (o = o.ownerDocument.body), o;
}
function Ts(t, e) {
  const o = R(t);
  if (Me(t))
    return o;
  if (!ft(t)) {
    let r = At(t);
    for (; r && !le(r); ) {
      if (q(r) && !Ge(r))
        return r;
      r = At(r);
    }
    return o;
  }
  let s = Go(t, e);
  for (; s && _l(s) && Ge(s); )
    s = Go(s, e);
  return s && le(s) && Ge(s) && !De(s) ? o : s || Ll(t) || o;
}
const Vl = async function(t) {
  const e = this.getOffsetParent || Ts, o = this.getDimensions, s = await o(t.floating);
  return {
    reference: Dl(t.reference, await e(t.floating), t.strategy),
    floating: {
      x: 0,
      y: 0,
      width: s.width,
      height: s.height
    }
  };
};
function Hl(t) {
  return Z(t).direction === "rtl";
}
const xe = {
  convertOffsetParentRelativeRectToViewportRelativeRect: zl,
  getDocumentElement: it,
  getClippingRect: Tl,
  getOffsetParent: Ts,
  getElementRects: Vl,
  getClientRects: El,
  getDimensions: Ml,
  getScale: Mt,
  isElement: q,
  isRTL: Hl
};
function Ms(t, e) {
  return t.x === e.x && t.y === e.y && t.width === e.width && t.height === e.height;
}
function Bl(t, e, o) {
  let s = null, r;
  const l = it(t);
  function i() {
    var d;
    clearTimeout(r), (d = s) == null || d.disconnect(), s = null;
  }
  function n(d, h) {
    d === void 0 && (d = !1), h === void 0 && (h = 1), i();
    const m = t.getBoundingClientRect(), {
      left: p,
      top: g,
      width: v,
      height: y
    } = m;
    if (d || e(), !v || !y)
      return;
    const b = be(g), x = be(l.clientWidth - (p + v)), $ = be(l.clientHeight - (g + y)), C = be(p), A = {
      rootMargin: -b + "px " + -x + "px " + -$ + "px " + -C + "px",
      threshold: ot(0, dt(1, h)) || 1
    };
    let O = !0;
    function B(j) {
      const S = j[0].intersectionRatio;
      if (!Ms(m, t.getBoundingClientRect()))
        return n();
      if (S !== h) {
        if (!O)
          return n();
        S ? n(!1, S) : r = setTimeout(() => {
          n(!1, 1e-7);
        }, 1e3);
      }
      O = !1;
    }
    try {
      s = new IntersectionObserver(B, {
        ...A,
        // Handle <iframe>s
        root: l.ownerDocument
      });
    } catch {
      s = new IntersectionObserver(B, A);
    }
    s.observe(t);
  }
  const a = R(t), c = () => n(o);
  return a.addEventListener("resize", c), n(!0), () => {
    a.removeEventListener("resize", c), i();
  };
}
function Fl(t, e, o, s) {
  s === void 0 && (s = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: l = !0,
    elementResize: i = typeof ResizeObserver == "function",
    layoutShift: n = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = s, c = ko(t), d = r || l ? [...c ? ie(c) : [], ...e ? ie(e) : []] : [];
  d.forEach((b) => {
    r && b.addEventListener("scroll", o), l && b.addEventListener("resize", o);
  });
  const h = c && n ? Bl(c, o, l) : null;
  let m = -1, p = null;
  i && (p = new ResizeObserver((b) => {
    let [x] = b;
    x && x.target === c && p && e && (p.unobserve(e), cancelAnimationFrame(m), m = requestAnimationFrame(() => {
      var $;
      ($ = p) == null || $.observe(e);
    })), o();
  }), c && !a && p.observe(c), e && p.observe(e));
  let g, v = a ? zt(t) : null;
  a && y();
  function y() {
    const b = zt(t);
    v && !Ms(v, b) && o(), v = b, g = requestAnimationFrame(y);
  }
  return o(), () => {
    var b;
    d.forEach((x) => {
      r && x.removeEventListener("scroll", o), l && x.removeEventListener("resize", o);
    }), h == null || h(), (b = p) == null || b.disconnect(), p = null, a && cancelAnimationFrame(g);
  };
}
const Nl = yl, Il = wl, Ul = gl, Jo = xl, jl = ml, Wl = (t, e, o) => {
  const s = /* @__PURE__ */ new Map(), r = o ?? {}, l = {
    ...xe,
    ...r.platform,
    _c: s
  };
  return fl(t, e, {
    ...r,
    platform: l
  });
};
function ql(t) {
  return Zl(t);
}
function Je(t) {
  return t.assignedSlot ? t.assignedSlot : t.parentNode instanceof ShadowRoot ? t.parentNode.host : t.parentNode;
}
function Zl(t) {
  for (let e = t; e; e = Je(e)) if (e instanceof Element && getComputedStyle(e).display === "none") return null;
  for (let e = Je(t); e; e = Je(e)) {
    if (!(e instanceof Element)) continue;
    const o = getComputedStyle(e);
    if (o.display !== "contents" && (o.position !== "static" || De(o) || e.tagName === "BODY"))
      return e;
  }
  return null;
}
function Kl(t) {
  return t !== null && typeof t == "object" && "getBoundingClientRect" in t && ("contextElement" in t ? t.contextElement instanceof Element : !0);
}
var L = class extends X {
  constructor() {
    super(...arguments), this.localize = new wo(this), this.active = !1, this.placement = "top", this.strategy = "absolute", this.distance = 0, this.skidding = 0, this.arrow = !1, this.arrowPlacement = "anchor", this.arrowPadding = 10, this.flip = !1, this.flipFallbackPlacements = "", this.flipFallbackStrategy = "best-fit", this.flipPadding = 0, this.shift = !1, this.shiftPadding = 0, this.autoSizePadding = 0, this.hoverBridge = !1, this.updateHoverBridge = () => {
      if (this.hoverBridge && this.anchorEl) {
        const t = this.anchorEl.getBoundingClientRect(), e = this.popup.getBoundingClientRect(), o = this.placement.includes("top") || this.placement.includes("bottom");
        let s = 0, r = 0, l = 0, i = 0, n = 0, a = 0, c = 0, d = 0;
        o ? t.top < e.top ? (s = t.left, r = t.bottom, l = t.right, i = t.bottom, n = e.left, a = e.top, c = e.right, d = e.top) : (s = e.left, r = e.bottom, l = e.right, i = e.bottom, n = t.left, a = t.top, c = t.right, d = t.top) : t.left < e.left ? (s = t.right, r = t.top, l = e.left, i = e.top, n = t.right, a = t.bottom, c = e.left, d = e.bottom) : (s = e.right, r = e.top, l = t.left, i = t.top, n = e.right, a = e.bottom, c = t.left, d = t.bottom), this.style.setProperty("--hover-bridge-top-left-x", `${s}px`), this.style.setProperty("--hover-bridge-top-left-y", `${r}px`), this.style.setProperty("--hover-bridge-top-right-x", `${l}px`), this.style.setProperty("--hover-bridge-top-right-y", `${i}px`), this.style.setProperty("--hover-bridge-bottom-left-x", `${n}px`), this.style.setProperty("--hover-bridge-bottom-left-y", `${a}px`), this.style.setProperty("--hover-bridge-bottom-right-x", `${c}px`), this.style.setProperty("--hover-bridge-bottom-right-y", `${d}px`);
      }
    };
  }
  async connectedCallback() {
    super.connectedCallback(), await this.updateComplete, this.start();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.stop();
  }
  async updated(t) {
    super.updated(t), t.has("active") && (this.active ? this.start() : this.stop()), t.has("anchor") && this.handleAnchorChange(), this.active && (await this.updateComplete, this.reposition());
  }
  async handleAnchorChange() {
    if (await this.stop(), this.anchor && typeof this.anchor == "string") {
      const t = this.getRootNode();
      this.anchorEl = t.getElementById(this.anchor);
    } else this.anchor instanceof Element || Kl(this.anchor) ? this.anchorEl = this.anchor : this.anchorEl = this.querySelector('[slot="anchor"]');
    this.anchorEl instanceof HTMLSlotElement && (this.anchorEl = this.anchorEl.assignedElements({ flatten: !0 })[0]), this.anchorEl && this.active && this.start();
  }
  start() {
    !this.anchorEl || !this.active || (this.cleanup = Fl(this.anchorEl, this.popup, () => {
      this.reposition();
    }));
  }
  async stop() {
    return new Promise((t) => {
      this.cleanup ? (this.cleanup(), this.cleanup = void 0, this.removeAttribute("data-current-placement"), this.style.removeProperty("--auto-size-available-width"), this.style.removeProperty("--auto-size-available-height"), requestAnimationFrame(() => t())) : t();
    });
  }
  /** Forces the popup to recalculate and reposition itself. */
  reposition() {
    if (!this.active || !this.anchorEl)
      return;
    const t = [
      // The offset middleware goes first
      Nl({ mainAxis: this.distance, crossAxis: this.skidding })
    ];
    this.sync ? t.push(
      Jo({
        apply: ({ rects: o }) => {
          const s = this.sync === "width" || this.sync === "both", r = this.sync === "height" || this.sync === "both";
          this.popup.style.width = s ? `${o.reference.width}px` : "", this.popup.style.height = r ? `${o.reference.height}px` : "";
        }
      })
    ) : (this.popup.style.width = "", this.popup.style.height = ""), this.flip && t.push(
      Ul({
        boundary: this.flipBoundary,
        // @ts-expect-error - We're converting a string attribute to an array here
        fallbackPlacements: this.flipFallbackPlacements,
        fallbackStrategy: this.flipFallbackStrategy === "best-fit" ? "bestFit" : "initialPlacement",
        padding: this.flipPadding
      })
    ), this.shift && t.push(
      Il({
        boundary: this.shiftBoundary,
        padding: this.shiftPadding
      })
    ), this.autoSize ? t.push(
      Jo({
        boundary: this.autoSizeBoundary,
        padding: this.autoSizePadding,
        apply: ({ availableWidth: o, availableHeight: s }) => {
          this.autoSize === "vertical" || this.autoSize === "both" ? this.style.setProperty("--auto-size-available-height", `${s}px`) : this.style.removeProperty("--auto-size-available-height"), this.autoSize === "horizontal" || this.autoSize === "both" ? this.style.setProperty("--auto-size-available-width", `${o}px`) : this.style.removeProperty("--auto-size-available-width");
        }
      })
    ) : (this.style.removeProperty("--auto-size-available-width"), this.style.removeProperty("--auto-size-available-height")), this.arrow && t.push(
      jl({
        element: this.arrowEl,
        padding: this.arrowPadding
      })
    );
    const e = this.strategy === "absolute" ? (o) => xe.getOffsetParent(o, ql) : xe.getOffsetParent;
    Wl(this.anchorEl, this.popup, {
      placement: this.placement,
      middleware: t,
      strategy: this.strategy,
      platform: Oe(St({}, xe), {
        getOffsetParent: e
      })
    }).then(({ x: o, y: s, middlewareData: r, placement: l }) => {
      const i = this.localize.dir() === "rtl", n = { top: "bottom", right: "left", bottom: "top", left: "right" }[l.split("-")[0]];
      if (this.setAttribute("data-current-placement", l), Object.assign(this.popup.style, {
        left: `${o}px`,
        top: `${s}px`
      }), this.arrow) {
        const a = r.arrow.x, c = r.arrow.y;
        let d = "", h = "", m = "", p = "";
        if (this.arrowPlacement === "start") {
          const g = typeof a == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          d = typeof c == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "", h = i ? g : "", p = i ? "" : g;
        } else if (this.arrowPlacement === "end") {
          const g = typeof a == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          h = i ? "" : g, p = i ? g : "", m = typeof c == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
        } else this.arrowPlacement === "center" ? (p = typeof a == "number" ? "calc(50% - var(--arrow-size-diagonal))" : "", d = typeof c == "number" ? "calc(50% - var(--arrow-size-diagonal))" : "") : (p = typeof a == "number" ? `${a}px` : "", d = typeof c == "number" ? `${c}px` : "");
        Object.assign(this.arrowEl.style, {
          top: d,
          right: h,
          bottom: m,
          left: p,
          [n]: "calc(var(--arrow-size-diagonal) * -1)"
        });
      }
    }), requestAnimationFrame(() => this.updateHoverBridge()), this.emit("sl-reposition");
  }
  render() {
    return _`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${Lt({
      "popup-hover-bridge": !0,
      "popup-hover-bridge--visible": this.hoverBridge && this.active
    })}
      ></span>

      <div
        part="popup"
        class=${Lt({
      popup: !0,
      "popup--active": this.active,
      "popup--fixed": this.strategy === "fixed",
      "popup--has-arrow": this.arrow
    })}
      >
        <slot></slot>
        ${this.arrow ? _`<div part="arrow" class="popup__arrow" role="presentation"></div>` : ""}
      </div>
    `;
  }
};
L.styles = [Ft, el];
f([
  U(".popup")
], L.prototype, "popup", 2);
f([
  U(".popup__arrow")
], L.prototype, "arrowEl", 2);
f([
  u()
], L.prototype, "anchor", 2);
f([
  u({ type: Boolean, reflect: !0 })
], L.prototype, "active", 2);
f([
  u({ reflect: !0 })
], L.prototype, "placement", 2);
f([
  u({ reflect: !0 })
], L.prototype, "strategy", 2);
f([
  u({ type: Number })
], L.prototype, "distance", 2);
f([
  u({ type: Number })
], L.prototype, "skidding", 2);
f([
  u({ type: Boolean })
], L.prototype, "arrow", 2);
f([
  u({ attribute: "arrow-placement" })
], L.prototype, "arrowPlacement", 2);
f([
  u({ attribute: "arrow-padding", type: Number })
], L.prototype, "arrowPadding", 2);
f([
  u({ type: Boolean })
], L.prototype, "flip", 2);
f([
  u({
    attribute: "flip-fallback-placements",
    converter: {
      fromAttribute: (t) => t.split(" ").map((e) => e.trim()).filter((e) => e !== ""),
      toAttribute: (t) => t.join(" ")
    }
  })
], L.prototype, "flipFallbackPlacements", 2);
f([
  u({ attribute: "flip-fallback-strategy" })
], L.prototype, "flipFallbackStrategy", 2);
f([
  u({ type: Object })
], L.prototype, "flipBoundary", 2);
f([
  u({ attribute: "flip-padding", type: Number })
], L.prototype, "flipPadding", 2);
f([
  u({ type: Boolean })
], L.prototype, "shift", 2);
f([
  u({ type: Object })
], L.prototype, "shiftBoundary", 2);
f([
  u({ attribute: "shift-padding", type: Number })
], L.prototype, "shiftPadding", 2);
f([
  u({ attribute: "auto-size" })
], L.prototype, "autoSize", 2);
f([
  u()
], L.prototype, "sync", 2);
f([
  u({ type: Object })
], L.prototype, "autoSizeBoundary", 2);
f([
  u({ attribute: "auto-size-padding", type: Number })
], L.prototype, "autoSizePadding", 2);
f([
  u({ attribute: "hover-bridge", type: Boolean })
], L.prototype, "hoverBridge", 2);
var Ds = /* @__PURE__ */ new Map(), Xl = /* @__PURE__ */ new WeakMap();
function Yl(t) {
  return t ?? { keyframes: [], options: { duration: 0 } };
}
function ts(t, e) {
  return e.toLowerCase() === "rtl" ? {
    keyframes: t.rtlKeyframes || t.keyframes,
    options: t.options
  } : t;
}
function Qt(t, e) {
  Ds.set(t, Yl(e));
}
function wt(t, e, o) {
  const s = Xl.get(t);
  if (s != null && s[e])
    return ts(s[e], o.dir);
  const r = Ds.get(e);
  return r ? ts(r, o.dir) : {
    keyframes: [],
    options: { duration: 0 }
  };
}
function ze(t, e) {
  return new Promise((o) => {
    function s(r) {
      r.target === t && (t.removeEventListener(e, s), o());
    }
    t.addEventListener(e, s);
  });
}
function xt(t, e, o) {
  return new Promise((s) => {
    if ((o == null ? void 0 : o.duration) === 1 / 0)
      throw new Error("Promise-based animations must be finite.");
    const r = t.animate(e, Oe(St({}, o), {
      duration: Gl() ? 0 : o.duration
    }));
    r.addEventListener("cancel", s, { once: !0 }), r.addEventListener("finish", s, { once: !0 });
  });
}
function es(t) {
  return t = t.toString().toLowerCase(), t.indexOf("ms") > -1 ? parseFloat(t) : t.indexOf("s") > -1 ? parseFloat(t) * 1e3 : parseFloat(t);
}
function Gl() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function Tt(t) {
  return Promise.all(
    t.getAnimations().map((e) => new Promise((o) => {
      e.cancel(), requestAnimationFrame(o);
    }))
  );
}
var E = class extends X {
  constructor() {
    super(), this.localize = new wo(this), this.content = "", this.placement = "top", this.disabled = !1, this.distance = 8, this.open = !1, this.skidding = 0, this.trigger = "hover focus", this.hoist = !1, this.handleBlur = () => {
      this.hasTrigger("focus") && this.hide();
    }, this.handleClick = () => {
      this.hasTrigger("click") && (this.open ? this.hide() : this.show());
    }, this.handleFocus = () => {
      this.hasTrigger("focus") && this.show();
    }, this.handleDocumentKeyDown = (t) => {
      t.key === "Escape" && (t.stopPropagation(), this.hide());
    }, this.handleMouseOver = () => {
      if (this.hasTrigger("hover")) {
        const t = es(getComputedStyle(this).getPropertyValue("--show-delay"));
        clearTimeout(this.hoverTimeout), this.hoverTimeout = window.setTimeout(() => this.show(), t);
      }
    }, this.handleMouseOut = () => {
      if (this.hasTrigger("hover")) {
        const t = es(getComputedStyle(this).getPropertyValue("--hide-delay"));
        clearTimeout(this.hoverTimeout), this.hoverTimeout = window.setTimeout(() => this.hide(), t);
      }
    }, this.addEventListener("blur", this.handleBlur, !0), this.addEventListener("focus", this.handleFocus, !0), this.addEventListener("click", this.handleClick), this.addEventListener("mouseover", this.handleMouseOver), this.addEventListener("mouseout", this.handleMouseOut);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this.closeWatcher) == null || t.destroy(), document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }
  firstUpdated() {
    this.body.hidden = !this.open, this.open && (this.popup.active = !0, this.popup.reposition());
  }
  hasTrigger(t) {
    return this.trigger.split(" ").includes(t);
  }
  async handleOpenChange() {
    var t, e;
    if (this.open) {
      if (this.disabled)
        return;
      this.emit("sl-show"), "CloseWatcher" in window ? ((t = this.closeWatcher) == null || t.destroy(), this.closeWatcher = new CloseWatcher(), this.closeWatcher.onclose = () => {
        this.hide();
      }) : document.addEventListener("keydown", this.handleDocumentKeyDown), await Tt(this.body), this.body.hidden = !1, this.popup.active = !0;
      const { keyframes: o, options: s } = wt(this, "tooltip.show", { dir: this.localize.dir() });
      await xt(this.popup.popup, o, s), this.popup.reposition(), this.emit("sl-after-show");
    } else {
      this.emit("sl-hide"), (e = this.closeWatcher) == null || e.destroy(), document.removeEventListener("keydown", this.handleDocumentKeyDown), await Tt(this.body);
      const { keyframes: o, options: s } = wt(this, "tooltip.hide", { dir: this.localize.dir() });
      await xt(this.popup.popup, o, s), this.popup.active = !1, this.body.hidden = !0, this.emit("sl-after-hide");
    }
  }
  async handleOptionsChange() {
    this.hasUpdated && (await this.updateComplete, this.popup.reposition());
  }
  handleDisabledChange() {
    this.disabled && this.open && this.hide();
  }
  /** Shows the tooltip. */
  async show() {
    if (!this.open)
      return this.open = !0, ze(this, "sl-after-show");
  }
  /** Hides the tooltip */
  async hide() {
    if (this.open)
      return this.open = !1, ze(this, "sl-after-hide");
  }
  //
  // NOTE: Tooltip is a bit unique in that we're using aria-live instead of aria-labelledby to trick screen readers into
  // announcing the content. It works really well, but it violates an accessibility rule. We're also adding the
  // aria-describedby attribute to a slot, which is required by <sl-popup> to correctly locate the first assigned
  // element, otherwise positioning is incorrect.
  //
  render() {
    return _`
      <sl-popup
        part="base"
        exportparts="
          popup:base__popup,
          arrow:base__arrow
        "
        class=${Lt({
      tooltip: !0,
      "tooltip--open": this.open
    })}
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist ? "fixed" : "absolute"}
        flip
        shift
        arrow
        hover-bridge
      >
        ${""}
        <slot slot="anchor" aria-describedby="tooltip"></slot>

        ${""}
        <div part="body" id="tooltip" class="tooltip__body" role="tooltip" aria-live=${this.open ? "polite" : "off"}>
          <slot name="content">${this.content}</slot>
        </div>
      </sl-popup>
    `;
  }
};
E.styles = [Ft, tl];
E.dependencies = { "sl-popup": L };
f([
  U("slot:not([name])")
], E.prototype, "defaultSlot", 2);
f([
  U(".tooltip__body")
], E.prototype, "body", 2);
f([
  U("sl-popup")
], E.prototype, "popup", 2);
f([
  u()
], E.prototype, "content", 2);
f([
  u()
], E.prototype, "placement", 2);
f([
  u({ type: Boolean, reflect: !0 })
], E.prototype, "disabled", 2);
f([
  u({ type: Number })
], E.prototype, "distance", 2);
f([
  u({ type: Boolean, reflect: !0 })
], E.prototype, "open", 2);
f([
  u({ type: Number })
], E.prototype, "skidding", 2);
f([
  u()
], E.prototype, "trigger", 2);
f([
  u({ type: Boolean })
], E.prototype, "hoist", 2);
f([
  pt("open", { waitUntilFirstUpdate: !0 })
], E.prototype, "handleOpenChange", 1);
f([
  pt(["content", "distance", "hoist", "placement", "skidding"])
], E.prototype, "handleOptionsChange", 1);
f([
  pt("disabled")
], E.prototype, "handleDisabledChange", 1);
Qt("tooltip.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 150, easing: "ease" }
});
Qt("tooltip.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 150, easing: "ease" }
});
E.define("sl-tooltip");
function jt(t, e) {
  t.slot || (t.slot = e);
}
var Jl = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, Lo = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? ti(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && Jl(e, o, r), r;
};
function ei(t, e) {
  if (!t) return { href: "https://rails49.org", host: "rails49.org" };
  if (e.protocol === "https:") {
    const o = `${t}.`, s = e.host.startsWith(o) ? e.host.slice(o.length) : e.host;
    return { href: `https://${s}/`, host: s };
  }
  return { href: `http://${e.hostname}/`, host: e.hostname };
}
let ne = class extends z {
  constructor() {
    super(...arguments), this.ui = "", this.help = "", this.resize = new ResizeObserver(() => this.fit());
  }
  connectedCallback() {
    super.connectedCallback(), jt(this, "band"), this.resize.observe(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.resize.disconnect();
  }
  updated() {
    this.fit();
  }
  /**
   * Shows everything, then drops the UI name with the rule, Help and the gear
   * in turn until the band fits. Where it still does not fit, what the UI is
   * about is cut.
   */
  fit() {
    const t = this.renderRoot.querySelector("nav"), e = () => t.scrollWidth <= t.clientWidth, o = [".ui, .rule", ".help", 'slot[name="gear"]'].map((s) => [
      ...this.renderRoot.querySelectorAll(s)
    ]);
    for (const s of o) for (const r of s) r.hidden = !1;
    t.classList.remove("cut");
    for (const s of o) {
      if (e()) return;
      for (const r of s) r.hidden = !0;
    }
    e() || t.classList.add("cut");
  }
  render() {
    const t = ei(this.ui, location), e = this.help || (this.ui ? `https://github.com/rails49/${this.ui}` : "https://github.com/rails49");
    return _`
      <nav @slotchange=${() => this.requestUpdate()}>
        <div class="lead">
          <sl-tooltip content=${t.host} placement="bottom" hoist>
            <a class="mark" href=${t.href} target="_blank" rel="noopener" aria-label=${t.host}>
              <span class="wide" aria-hidden="true">${Wo(jr)}</span>
              <span class="square" aria-hidden="true">${Wo(Wr)}</span>
            </a>
          </sl-tooltip>
          ${this.ui ? _`<span class="ui">${this.ui}</span>` : w}
        </div>
        ${this.ui && this.querySelector(':scope > [slot="about"]') ? _`<span class="rule" aria-hidden="true"></span>` : w}
        <slot name="about"></slot>
        <span class="space"></span>
        <slot></slot>
        <div class="tail">
          <slot name="power"></slot>
          <slot name="gear"></slot>
          <sl-tooltip class="help" content="Help" placement="bottom" hoist>
            <a href=${e} target="_blank" rel="noopener" aria-label="Help">
              <sl-icon name="question-circle"></sl-icon>
            </a>
          </sl-tooltip>
        </div>
      </nav>
    `;
  }
};
ne.styles = [
  H,
  k`
      :host {
        display: block;
        height: ${rt(Zr)}px;
        flex-shrink: 0;
        position: relative;
        z-index: 100;
        background: var(--band);
        color: var(--band-ink);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        font-family: var(--sl-font-sans);
      }

      nav {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        height: 100%;
        padding: 0 1rem;
        box-sizing: border-box;
      }

      /* About the height of the UI name's capitals. */
      .rule {
        flex-shrink: 0;
        width: 1px;
        height: 0.875rem;
        margin-left: 0.35rem;
        background: var(--band-ink);
        opacity: 0.5;
      }

      slot[name='about']::slotted(*) {
        margin-left: 0.35rem;
        flex-shrink: 0;
      }

      .cut slot[name='about']::slotted(*) {
        flex-shrink: 1;
      }

      /* Pushes the status items to the far right; with the gaps either side, at least 1rem. */
      .space {
        flex: 1 0 0;
        margin-left: -0.5rem;
      }

      .lead {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex-shrink: 0;
      }

      .mark {
        display: flex;
        color: inherit;
        border-radius: 4px;
        padding: 0.2rem 0.3rem;
        margin-left: -0.3rem;
      }

      .mark:hover,
      .mark:focus-visible {
        background: rgba(255, 255, 255, 0.15);
        outline: none;
      }

      .mark svg {
        display: block;
        height: 32px;
        width: auto;
      }

      .square {
        display: none;
      }

      @media (max-width: ${rt(_s)}px) {
        .wide {
          display: none;
        }

        .square {
          display: block;
        }
      }

      .ui {
        font-size: 1.25rem;
        font-weight: 600;
        white-space: nowrap;
      }

      .tail {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .help a {
        display: flex;
        padding: 0.5rem;
        border-radius: 8px;
        font-size: 1.5rem;
        color: inherit;
        transition: transform 0.1s;
      }

      .help a:hover,
      .help a:focus-visible {
        color: rgba(255, 255, 255, 0.7);
      }

      .help a:hover {
        transform: scale(1.1);
      }

      .help a:focus-visible {
        outline: var(--sl-focus-ring-width, 2px) solid rgba(255, 255, 255, 0.7);
        outline-offset: 1px;
      }

      [hidden] {
        display: none;
      }
    `
];
Lo([
  u()
], ne.prototype, "ui", 2);
Lo([
  u()
], ne.prototype, "help", 2);
ne = Lo([
  T("look-band")
], ne);
function Co(t, e, o) {
  t.dispatchEvent(new CustomEvent(e, { detail: o, bubbles: !0, composed: !0 }));
}
const Be = (t, e) => Co(t, "look-press", { shiftKey: e.shiftKey ?? !1 });
var oi = Object.defineProperty, si = Object.getOwnPropertyDescriptor, Fe = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? si(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && oi(e, o, r), r;
};
let Ht = class extends z {
  constructor() {
    super(...arguments), this.name = "", this.detail = "", this.pressable = !1;
  }
  connectedCallback() {
    super.connectedCallback(), jt(this, "about");
  }
  render() {
    const t = _`<span class="text"
      >${this.name}${this.detail ? _`<small>${this.detail}</small>` : w}</span
    >`;
    return this.pressable ? _`<button class="about" @click=${(e) => Be(this, e)}>
      ${t}<sl-icon name="chevron-down"></sl-icon>
    </button>` : _`<div class="about">${t}</div>`;
  }
};
Ht.styles = [
  H,
  k`
      :host {
        display: block;
        min-width: 0;
      }

      .about {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        font: inherit;
        font-size: 1.25rem;
        font-weight: 600;
        color: inherit;
        background: none;
        border: none;
        border-radius: 4px;
        padding: 0.2rem 0.4rem;
      }

      button.about {
        cursor: pointer;
      }

      button.about:hover,
      button.about:focus-visible {
        background: rgba(255, 255, 255, 0.15);
        outline: none;
      }

      .text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      small {
        font-weight: 400;
        opacity: 0.75;
        font-size: 0.8em;
        margin-left: 0.5rem;
      }

      sl-icon {
        flex-shrink: 0;
        font-size: 0.8em;
      }
    `
];
Fe([
  u()
], Ht.prototype, "name", 2);
Fe([
  u()
], Ht.prototype, "detail", 2);
Fe([
  u({ type: Boolean, reflect: !0 })
], Ht.prototype, "pressable", 2);
Ht = Fe([
  T("look-about")
], Ht);
const ri = () => {
  var t;
  return /Mac|iPhone|iPad/.test(((t = globalThis.navigator) == null ? void 0 : t.platform) ?? "");
}, li = { Mod: "⌘", Shift: "⇧", Alt: "⌥", Ctrl: "⌃" };
function ii(t, e = ri()) {
  const o = t.endsWith("+") ? "+" : t.slice(t.lastIndexOf("+") + 1), s = [...t.slice(0, t.length - o.length).split("+").filter(Boolean), o];
  if (e) return s.map((n) => li[n] ?? n).join("");
  const r = ["Mod", "Ctrl", "Alt", "Shift"], l = s.filter((n) => r.includes(n)).sort((n, a) => r.indexOf(n) - r.indexOf(a)), i = s.filter((n) => !r.includes(n));
  return [...new Set(l.map((n) => n === "Mod" ? "Ctrl" : n)), ...i].join("+");
}
const ni = (t, e) => e ? `${t}  ${ii(e)}` : t;
function ae(t) {
  const e = t.disabled ? t.reason : "";
  return _`<sl-tooltip content=${e || ni(t.label, t.key ?? "")} placement=${t.placement} hoist>
    <button
      class="${t.word ? "word" : "icon"} ${t.part ?? ""}"
      aria-label=${t.word ? w : t.label}
      aria-disabled=${t.disabled ? "true" : w}
      aria-description=${e || w}
      aria-pressed=${t.pressed ? "true" : w}
      @click=${(o) => {
    t.disabled || t.onPress(o);
  }}
    >
      ${t.word || _`<sl-icon name=${t.icon} library=${xs(t.icon)}></sl-icon>`}
    </button>
  </sl-tooltip>`;
}
const pe = k`
  :where(button) {
    font: inherit;
    color: var(--band-ink);
    background: none;
    border: none;
    cursor: pointer;
  }

  :where(button:focus-visible) {
    outline: var(--sl-focus-ring-width, 2px) solid rgba(255, 255, 255, 0.7);
    outline-offset: 1px;
  }

  :where(.icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 8px;
    transition: transform 0.1s;
  }

  :where(.icon:hover, .icon:focus-visible) {
    color: rgba(255, 255, 255, 0.7);
  }

  :where(.icon:not([aria-disabled]):hover) {
    transform: scale(1.1);
  }

  :where(.word) {
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 6px;
  }

  :where(.word:hover, .word:focus-visible) {
    background: rgba(255, 255, 255, 0.18);
  }

  :where([aria-pressed='true']) {
    background: rgba(255, 255, 255, 0.22);
  }

  :where([aria-disabled]) {
    opacity: 0.35;
    cursor: default;
  }

  :where(.word[aria-disabled]) {
    background: none;
  }
`;
var ai = Object.defineProperty, Vs = (t, e, o, s) => {
  for (var r = void 0, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = i(e, o, r) || r);
  return r && ai(e, o, r), r;
};
const Eo = class Eo extends z {
  constructor() {
    super(...arguments), this.label = "", this.text = "", this.textChanges = new MutationObserver(() => this.read());
  }
  connectedCallback() {
    super.connectedCallback(), this.read(), this.textChanges.observe(this, { childList: !0, characterData: !0, subtree: !0 });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.textChanges.disconnect();
  }
  read() {
    this.text = this.textContent.trim();
  }
  /** The button inside its tooltip, around `content`, which holds the slot. */
  inTooltip(e) {
    const o = this.label || this.text;
    return _`<sl-tooltip content=${o} ?disabled=${!o} placement="bottom" hoist>
      <button>${e}</button>
    </sl-tooltip>`;
  }
};
Eo.baseStyles = [
  H,
  pe,
  k`
      button {
        max-width: 100%;
        box-sizing: border-box;
        padding: 0;
        white-space: nowrap;
        cursor: default;
      }
    `
];
let K = Eo;
Vs([
  u()
], K.prototype, "label");
Vs([
  de()
], K.prototype, "text");
var ci = Object.getOwnPropertyDescriptor, hi = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? ci(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = i(r) || r);
  return r;
};
let no = class extends K {
  render() {
    return this.inTooltip(_`<slot></slot>`);
  }
};
no.styles = [
  K.baseStyles,
  k`
      :host {
        display: inline-block;
        min-width: 0;
        vertical-align: middle;
        font-size: 0.95rem;
      }

      button {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `
];
no = hi([
  T("look-reading")
], no);
var di = Object.getOwnPropertyDescriptor, ui = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? di(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = i(r) || r);
  return r;
};
let ao = class extends K {
  render() {
    return this.inTooltip(_`<slot></slot>`);
  }
};
ao.styles = [
  K.baseStyles,
  k`
      :host {
        display: inline-block;
        /* The padding, then up to 20rem of text. */
        min-width: 1rem;
        max-width: 21rem;
        vertical-align: middle;
        font-size: 0.85rem;
      }

      button {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        background: var(--stop);
        padding: 0.1rem 0.5rem;
        border-radius: 4px;
      }
    `
];
ao = ui([
  T("look-chip")
], ao);
var pi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, Hs = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? fi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && pi(e, o, r), r;
};
let Ee = class extends K {
  constructor() {
    super(...arguments), this.state = "down";
  }
  render() {
    return this.inTooltip(
      _`<span class="dot" role="img" aria-label=${this.state}></span><span class="text"><slot></slot></span>`
    );
  }
};
Ee.styles = [
  K.baseStyles,
  k`
      :host {
        display: inline-flex;
        min-width: 0.8rem;
        font-size: 0.85rem;
      }

      button {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 0;
      }

      .dot {
        flex-shrink: 0;
        width: 0.8rem;
        height: 0.8rem;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2px solid var(--band-ink);
        background: var(--stop);
      }

      :host([state='up']) .dot {
        background: var(--power-on);
      }

      :host(:empty) .text {
        display: none;
      }

      .text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `
];
Hs([
  u({ reflect: !0 })
], Ee.prototype, "state", 2);
Ee = Hs([
  T("look-dot")
], Ee);
var mi = Object.defineProperty, gi = Object.getOwnPropertyDescriptor, fe = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? gi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && mi(e, o, r), r;
};
let ut = class extends z {
  constructor() {
    super(...arguments), this.icon = "", this.word = "", this.label = "", this.disabled = !1;
  }
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  render() {
    return ae({
      icon: this.icon,
      word: this.word,
      label: this.label,
      disabled: this.disabled,
      placement: "bottom",
      onPress: (t) => Be(this, t)
    });
  }
};
ut.shadowRootOptions = { ...z.shadowRootOptions, delegatesFocus: !0 };
ut.styles = [
  H,
  pe,
  k`
      :host {
        flex-shrink: 0;
      }

      .icon {
        font-size: 1.5rem;
      }

      .word {
        font-size: 0.85rem;
        letter-spacing: 0.04em;
        border-color: rgba(255, 255, 255, 0.55);
        border-radius: 4px;
        padding: 0.3rem 0.6rem;
      }
    `
];
fe([
  u()
], ut.prototype, "icon", 2);
fe([
  u()
], ut.prototype, "word", 2);
fe([
  u()
], ut.prototype, "label", 2);
fe([
  u({ type: Boolean, reflect: !0 })
], ut.prototype, "disabled", 2);
ut = fe([
  T("look-band-press")
], ut);
var vi = Object.getOwnPropertyDescriptor, bi = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? vi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = i(r) || r);
  return r;
};
let Se = class extends z {
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  connectedCallback() {
    super.connectedCallback(), jt(this, "gear");
  }
  render() {
    return ae({
      icon: "gear",
      label: "Settings",
      placement: "bottom",
      onPress: (t) => Be(this, t)
    });
  }
};
Se.shadowRootOptions = { ...z.shadowRootOptions, delegatesFocus: !0 };
Se.styles = [
  H,
  pe,
  k`
      .icon {
        font-size: 1.5rem;
      }
    `
];
Se = bi([
  T("look-gear")
], Se);
var yi = Object.defineProperty, wi = Object.getOwnPropertyDescriptor, Ne = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? wi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && yi(e, o, r), r;
};
const xi = {
  on: "Track power is on; turn it off",
  off: "Track power is off; turn it on",
  stopped: "Stopped; turn track power on",
  draining: "Draining: power goes off when every train is at rest; keep it on"
};
let Bt = class extends z {
  constructor() {
    super(...arguments), this.state = "off", this.reason = "", this.toggleReason = "";
  }
  connectedCallback() {
    super.connectedCallback(), jt(this, "power");
  }
  ask(t) {
    Co(this, "look-power", { state: t });
  }
  render() {
    const t = this.reason || this.toggleReason;
    return _`
      ${ae({
      icon: "power",
      label: xi[this.state],
      disabled: !!t,
      reason: t,
      placement: "bottom",
      part: "power",
      onPress: () => this.ask(this.state === "on" ? "off" : "on")
    })}
      ${ae({
      icon: "sign-stop-fill",
      label: "Stop every train",
      disabled: !!this.reason,
      reason: this.reason,
      placement: "bottom",
      part: "stop",
      onPress: () => this.ask("stopped")
    })}
    `;
  }
};
Bt.styles = [
  H,
  pe,
  k`
      :host {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .power {
        font-size: 1.5rem;
        color: rgba(255, 255, 255, 0.55);
      }

      :host([state='on']) .power {
        color: var(--power-on);
      }

      :host([state='draining']) .power {
        color: var(--power-on);
        animation: pulse 1.2s ease-in-out infinite;
      }

      @keyframes pulse {
        50% {
          opacity: 0.4;
        }
      }

      :host([state='stopped']) .power {
        color: var(--stop);
      }

      .stop {
        font-size: 1.9rem;
        color: var(--stop);
      }
    `
];
Ne([
  u({ reflect: !0 })
], Bt.prototype, "state", 2);
Ne([
  u()
], Bt.prototype, "reason", 2);
Ne([
  u({ attribute: "toggle-reason" })
], Bt.prototype, "toggleReason", 2);
Bt = Ne([
  T("look-power")
], Bt);
var _i = Object.defineProperty, $i = Object.getOwnPropertyDescriptor, Bs = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? $i(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && _i(e, o, r), r;
};
let Qe = class extends z {
  constructor() {
    super(...arguments), this.hasViews = !1;
  }
  connectedCallback() {
    super.connectedCallback(), jt(this, "rail");
  }
  onViews(t) {
    this.hasViews = t.target.assignedElements().length > 0;
  }
  render() {
    return _`
      <div class="views" role="group" aria-label="View" ?hidden=${!this.hasViews}>
        <slot name="views" @slotchange=${this.onViews}></slot>
      </div>
      <slot></slot>
    `;
  }
};
Qe.styles = [
  H,
  k`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5em;
        padding: 0.6em 0.3em;
        width: 78px;
        box-sizing: border-box;
        flex-shrink: 0;
        background: var(--rail);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
        overflow-y: auto;
        user-select: none;
        position: relative;
        z-index: 50;
        font-family: var(--sl-font-sans);
      }

      .views {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2em;
        padding: 0.3em 0;
        width: calc(100% - 8px);
        background: rgba(0, 0, 0, 0.25);
        border-radius: 8px;
      }

      .views[hidden] {
        display: none;
      }

      @media ${rt(ue)} {
        :host {
          flex-direction: row;
          width: auto;
          gap: 0.75em;
          padding: 0.4em 0.5em;
          overflow-x: auto;
          overflow-y: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .views {
          flex-direction: row;
          width: auto;
          padding: 0 0.35em;
        }
      }
    `
];
Bs([
  de()
], Qe.prototype, "hasViews", 2);
Qe = Bs([
  T("look-rail")
], Qe);
var ki = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, Pt = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? Li(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && ki(e, o, r), r;
};
let lt = class extends z {
  constructor() {
    super(...arguments), this.name = "", this.icon = "", this.label = "", this.current = !1, this.disabled = !1, this.reason = "";
  }
  connectedCallback() {
    super.connectedCallback(), jt(this, "views");
  }
  choose() {
    !this.current && !this.disabled && Co(this, "look-view", { name: this.name });
  }
  render() {
    const t = this.disabled ? this.reason : "";
    return _`<sl-tooltip content=${t} ?disabled=${!t} placement="right" hoist>
      <button
        aria-current=${this.current ? "page" : w}
        aria-disabled=${this.disabled ? "true" : w}
        aria-description=${t || w}
        @click=${this.choose}
      >
        <sl-icon name=${this.icon} library=${xs(this.icon)}></sl-icon>${this.label}
      </button>
    </sl-tooltip>`;
  }
};
lt.styles = [
  H,
  k`
      :host {
        display: block;
        width: 100%;
      }

      button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.1em;
        width: 100%;
        min-height: var(--rail-button);
        padding: 0.25em 0;
        box-sizing: border-box;
        font: inherit;
        font-size: 0.7rem;
        color: white;
        background: none;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      sl-icon {
        font-size: 1.75rem;
        transition: transform 0.1s;
      }

      button:hover,
      button:focus-visible {
        color: rgba(255, 255, 255, 0.7);
        outline: none;
      }

      button:hover sl-icon {
        transform: scale(1.1);
      }

      :host([current]) button {
        background: rgba(255, 255, 255, 0.22);
        color: white;
        cursor: default;
      }

      :host([current]) button:hover sl-icon {
        transform: none;
      }

      :host([disabled]) button {
        opacity: 0.35;
        cursor: default;
      }

      :host([disabled]) button:hover sl-icon {
        transform: none;
      }

      @media ${rt(ue)} {
        :host {
          width: auto;
        }

        button {
          min-width: var(--rail-button);
          padding: 0.2em 0.5em;
        }
      }
    `
];
Pt([
  u()
], lt.prototype, "name", 2);
Pt([
  u()
], lt.prototype, "icon", 2);
Pt([
  u()
], lt.prototype, "label", 2);
Pt([
  u({ type: Boolean, reflect: !0 })
], lt.prototype, "current", 2);
Pt([
  u({ type: Boolean, reflect: !0 })
], lt.prototype, "disabled", 2);
Pt([
  u()
], lt.prototype, "reason", 2);
lt = Pt([
  T("look-view")
], lt);
var Ci = Object.defineProperty, Ai = Object.getOwnPropertyDescriptor, Ao = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? Ai(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && Ci(e, o, r), r;
};
let ce = class extends z {
  constructor() {
    super(...arguments), this.label = "", this.end = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this.setAttribute("role", "group");
  }
  updated() {
    this.label ? this.setAttribute("aria-label", this.label) : this.removeAttribute("aria-label");
  }
  render() {
    return _`<slot></slot>`;
  }
};
ce.styles = [
  H,
  k`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.45em;
        padding: 0.35em 0;
        width: calc(100% - 8px);
        background: var(--rail-group);
        border-radius: 8px;
      }

      :host([end]) {
        margin-top: auto;
      }

      @media ${rt(ue)} {
        :host {
          flex-direction: row;
          width: auto;
          gap: 0.75em;
          padding: 0 0.5em;
        }

        :host([end]) {
          margin-top: 0;
          margin-left: auto;
        }
      }
    `
];
Ao([
  u()
], ce.prototype, "label", 2);
Ao([
  u({ type: Boolean, reflect: !0 })
], ce.prototype, "end", 2);
ce = Ao([
  T("look-group")
], ce);
var zi = Object.defineProperty, Ei = Object.getOwnPropertyDescriptor, mt = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? Ei(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && zi(e, o, r), r;
};
let I = class extends z {
  constructor() {
    super(...arguments), this.icon = "", this.word = "", this.label = "", this.key = "", this.pressed = !1, this.disabled = !1, this.reason = "";
  }
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  render() {
    return ae({
      icon: this.icon,
      word: this.word,
      label: this.label,
      key: this.key,
      disabled: this.disabled,
      reason: this.reason,
      pressed: this.pressed,
      placement: "right",
      onPress: (t) => Be(this, t)
    });
  }
};
I.shadowRootOptions = { ...z.shadowRootOptions, delegatesFocus: !0 };
I.styles = [
  H,
  pe,
  k`
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
      }

      .icon {
        font-size: 2.1em;
        min-width: var(--rail-button);
        min-height: var(--rail-button);
      }

      .word {
        width: calc(100% - 8px);
        min-height: var(--rail-button);
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.06em;
      }

      @media ${rt(ue)} {
        :host {
          width: auto;
        }

        .icon {
          font-size: 1.6em;
        }

        .word {
          width: auto;
          padding: 0 0.8rem;
        }
      }
    `
];
mt([
  u()
], I.prototype, "icon", 2);
mt([
  u()
], I.prototype, "word", 2);
mt([
  u()
], I.prototype, "label", 2);
mt([
  u()
], I.prototype, "key", 2);
mt([
  u({ type: Boolean, reflect: !0 })
], I.prototype, "pressed", 2);
mt([
  u({ type: Boolean, reflect: !0 })
], I.prototype, "disabled", 2);
mt([
  u()
], I.prototype, "reason", 2);
I = mt([
  T("look-command")
], I);
function* zo(t = document.activeElement) {
  t != null && (yield t, "shadowRoot" in t && t.shadowRoot && t.shadowRoot.mode !== "closed" && (yield* xr(zo(t.shadowRoot.activeElement))));
}
function Si() {
  return [...zo()].pop();
}
var os = /* @__PURE__ */ new WeakMap();
function Fs(t) {
  let e = os.get(t);
  return e || (e = window.getComputedStyle(t, null), os.set(t, e)), e;
}
function Qi(t) {
  if (typeof t.checkVisibility == "function")
    return t.checkVisibility({ checkOpacity: !1, checkVisibilityCSS: !0 });
  const e = Fs(t);
  return e.visibility !== "hidden" && e.display !== "none";
}
function Pi(t) {
  const e = Fs(t), { overflowY: o, overflowX: s } = e;
  return o === "scroll" || s === "scroll" ? !0 : o !== "auto" || s !== "auto" ? !1 : t.scrollHeight > t.clientHeight && o === "auto" || t.scrollWidth > t.clientWidth && s === "auto";
}
function Oi(t) {
  const e = t.tagName.toLowerCase(), o = Number(t.getAttribute("tabindex"));
  if (t.hasAttribute("tabindex") && (isNaN(o) || o <= -1) || t.hasAttribute("disabled") || t.closest("[inert]"))
    return !1;
  if (e === "input" && t.getAttribute("type") === "radio") {
    const l = t.getRootNode(), i = `input[type='radio'][name="${t.getAttribute("name")}"]`, n = l.querySelector(`${i}:checked`);
    return n ? n === t : l.querySelector(i) === t;
  }
  return Qi(t) ? (e === "audio" || e === "video") && t.hasAttribute("controls") || t.hasAttribute("tabindex") || t.hasAttribute("contenteditable") && t.getAttribute("contenteditable") !== "false" || [
    "button",
    "input",
    "select",
    "textarea",
    "a",
    "audio",
    "video",
    "summary",
    "iframe"
  ].includes(e) ? !0 : Pi(t) : !1;
}
function Ri(t, e) {
  var o;
  return ((o = t.getRootNode({ composed: !0 })) == null ? void 0 : o.host) !== e;
}
function ss(t) {
  const e = /* @__PURE__ */ new WeakMap(), o = [];
  function s(r) {
    if (r instanceof Element) {
      if (r.hasAttribute("inert") || r.closest("[inert]") || e.has(r))
        return;
      e.set(r, !0), !o.includes(r) && Oi(r) && o.push(r), r instanceof HTMLSlotElement && Ri(r, t) && r.assignedElements({ flatten: !0 }).forEach((l) => {
        s(l);
      }), r.shadowRoot !== null && r.shadowRoot.mode === "open" && s(r.shadowRoot);
    }
    for (const l of r.children)
      s(l);
  }
  return s(t), o.sort((r, l) => {
    const i = Number(r.getAttribute("tabindex")) || 0;
    return (Number(l.getAttribute("tabindex")) || 0) - i;
  });
}
var Jt = [], Ti = class {
  constructor(t) {
    this.tabDirection = "forward", this.handleFocusIn = () => {
      this.isActive() && this.checkFocus();
    }, this.handleKeyDown = (e) => {
      var o;
      if (e.key !== "Tab" || this.isExternalActivated || !this.isActive()) return;
      const s = Si();
      if (this.previousFocus = s, this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus))
        return;
      e.shiftKey ? this.tabDirection = "backward" : this.tabDirection = "forward";
      const r = ss(this.element);
      let l = r.findIndex((n) => n === s);
      this.previousFocus = this.currentFocus;
      const i = this.tabDirection === "forward" ? 1 : -1;
      for (; ; ) {
        l + i >= r.length ? l = 0 : l + i < 0 ? l = r.length - 1 : l += i, this.previousFocus = this.currentFocus;
        const n = (
          /** @type {HTMLElement} */
          r[l]
        );
        if (this.tabDirection === "backward" && this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus) || n && this.possiblyHasTabbableChildren(n))
          return;
        e.preventDefault(), this.currentFocus = n, (o = this.currentFocus) == null || o.focus({ preventScroll: !1 });
        const a = [...zo()];
        if (a.includes(this.currentFocus) || !a.includes(this.previousFocus))
          break;
      }
      setTimeout(() => this.checkFocus());
    }, this.handleKeyUp = () => {
      this.tabDirection = "forward";
    }, this.element = t, this.elementsWithTabbableControls = ["iframe"];
  }
  /** Activates focus trapping. */
  activate() {
    Jt.push(this.element), document.addEventListener("focusin", this.handleFocusIn), document.addEventListener("keydown", this.handleKeyDown), document.addEventListener("keyup", this.handleKeyUp);
  }
  /** Deactivates focus trapping. */
  deactivate() {
    Jt = Jt.filter((t) => t !== this.element), this.currentFocus = null, document.removeEventListener("focusin", this.handleFocusIn), document.removeEventListener("keydown", this.handleKeyDown), document.removeEventListener("keyup", this.handleKeyUp);
  }
  /** Determines if this modal element is currently active or not. */
  isActive() {
    return Jt[Jt.length - 1] === this.element;
  }
  /** Activates external modal behavior and temporarily disables focus trapping. */
  activateExternal() {
    this.isExternalActivated = !0;
  }
  /** Deactivates external modal behavior and re-enables focus trapping. */
  deactivateExternal() {
    this.isExternalActivated = !1;
  }
  checkFocus() {
    if (this.isActive() && !this.isExternalActivated) {
      const t = ss(this.element);
      if (!this.element.matches(":focus-within")) {
        const e = t[0], o = t[t.length - 1], s = this.tabDirection === "forward" ? e : o;
        typeof (s == null ? void 0 : s.focus) == "function" && (this.currentFocus = s, s.focus({ preventScroll: !1 }));
      }
    }
  }
  possiblyHasTabbableChildren(t) {
    return this.elementsWithTabbableControls.includes(t.tagName.toLowerCase()) || t.hasAttribute("controls");
  }
}, co = /* @__PURE__ */ new Set();
function Mi() {
  const t = document.documentElement.clientWidth;
  return Math.abs(window.innerWidth - t);
}
function Di() {
  const t = Number(getComputedStyle(document.body).paddingRight.replace(/px/, ""));
  return isNaN(t) || !t ? 0 : t;
}
function rs(t) {
  if (co.add(t), !document.documentElement.classList.contains("sl-scroll-lock")) {
    const e = Mi() + Di();
    let o = getComputedStyle(document.documentElement).scrollbarGutter;
    (!o || o === "auto") && (o = "stable"), e < 2 && (o = ""), document.documentElement.style.setProperty("--sl-scroll-lock-gutter", o), document.documentElement.classList.add("sl-scroll-lock"), document.documentElement.style.setProperty("--sl-scroll-lock-size", `${e}px`);
  }
}
function ls(t) {
  co.delete(t), co.size === 0 && (document.documentElement.classList.remove("sl-scroll-lock"), document.documentElement.style.removeProperty("--sl-scroll-lock-size"));
}
var Vi = k`
  :host {
    --width: 31rem;
    --header-spacing: var(--sl-spacing-large);
    --body-spacing: var(--sl-spacing-large);
    --footer-spacing: var(--sl-spacing-large);

    display: contents;
  }

  .dialog {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--sl-z-index-dialog);
  }

  .dialog__panel {
    display: flex;
    flex-direction: column;
    z-index: 2;
    width: var(--width);
    max-width: calc(100% - var(--sl-spacing-2x-large));
    max-height: calc(100% - var(--sl-spacing-2x-large));
    background-color: var(--sl-panel-background-color);
    border-radius: var(--sl-border-radius-medium);
    box-shadow: var(--sl-shadow-x-large);
  }

  .dialog__panel:focus {
    outline: none;
  }

  /* Ensure there's enough vertical padding for phones that don't update vh when chrome appears (e.g. iPhone) */
  @media screen and (max-width: 420px) {
    .dialog__panel {
      max-height: 80vh;
    }
  }

  .dialog--open .dialog__panel {
    display: flex;
    opacity: 1;
  }

  .dialog__header {
    flex: 0 0 auto;
    display: flex;
  }

  .dialog__title {
    flex: 1 1 auto;
    font: inherit;
    font-size: var(--sl-font-size-large);
    line-height: var(--sl-line-height-dense);
    padding: var(--header-spacing);
    margin: 0;
  }

  .dialog__header-actions {
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    gap: var(--sl-spacing-2x-small);
    padding: 0 var(--header-spacing);
  }

  .dialog__header-actions sl-icon-button,
  .dialog__header-actions ::slotted(sl-icon-button) {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-size: var(--sl-font-size-medium);
  }

  .dialog__body {
    flex: 1 1 auto;
    display: block;
    padding: var(--body-spacing);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dialog__footer {
    flex: 0 0 auto;
    text-align: right;
    padding: var(--footer-spacing);
  }

  .dialog__footer ::slotted(sl-button:not(:first-of-type)) {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  .dialog:not(.dialog--has-footer) .dialog__footer {
    display: none;
  }

  .dialog__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: var(--sl-overlay-background-color);
  }

  @media (forced-colors: active) {
    .dialog__panel {
      border: solid 1px var(--sl-color-neutral-0);
    }
  }
`, Hi = (t) => {
  var e;
  const { activeElement: o } = document;
  o && t.contains(o) && ((e = document.activeElement) == null || e.blur());
}, Bi = k`
  :host {
    display: inline-block;
    color: var(--sl-color-neutral-600);
  }

  .icon-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: inherit;
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-x-fast) color;
    -webkit-appearance: none;
  }

  .icon-button:hover:not(.icon-button--disabled),
  .icon-button:focus-visible:not(.icon-button--disabled) {
    color: var(--sl-color-primary-600);
  }

  .icon-button:active:not(.icon-button--disabled) {
    color: var(--sl-color-primary-700);
  }

  .icon-button:focus {
    outline: none;
  }

  .icon-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .icon-button__icon {
    pointer-events: none;
  }
`;
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ns = Symbol.for(""), Fi = (t) => {
  if ((t == null ? void 0 : t.r) === Ns) return t == null ? void 0 : t._$litStatic$;
}, is = (t, ...e) => ({ _$litStatic$: e.reduce((o, s, r) => o + ((l) => {
  if (l._$litStatic$ !== void 0) return l._$litStatic$;
  throw Error(`Value passed to 'literal' function must be a 'literal' result: ${l}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
})(s) + t[r + 1], t[0]), r: Ns }), ns = /* @__PURE__ */ new Map(), Ni = (t) => (e, ...o) => {
  const s = o.length;
  let r, l;
  const i = [], n = [];
  let a, c = 0, d = !1;
  for (; c < s; ) {
    for (a = e[c]; c < s && (l = o[c], (r = Fi(l)) !== void 0); ) a += r + e[++c], d = !0;
    c !== s && n.push(l), i.push(a), c++;
  }
  if (c === s && i.push(e[s]), d) {
    const h = i.join("$$lit$$");
    (e = ns.get(h)) === void 0 && (i.raw = i, ns.set(h, e = i)), o = n;
  }
  return t(e, ...o);
}, Ii = Ni(_);
var D = class extends X {
  constructor() {
    super(...arguments), this.hasFocus = !1, this.label = "", this.disabled = !1;
  }
  handleBlur() {
    this.hasFocus = !1, this.emit("sl-blur");
  }
  handleFocus() {
    this.hasFocus = !0, this.emit("sl-focus");
  }
  handleClick(t) {
    this.disabled && (t.preventDefault(), t.stopPropagation());
  }
  /** Simulates a click on the icon button. */
  click() {
    this.button.click();
  }
  /** Sets focus on the icon button. */
  focus(t) {
    this.button.focus(t);
  }
  /** Removes focus from the icon button. */
  blur() {
    this.button.blur();
  }
  render() {
    const t = !!this.href, e = t ? is`a` : is`button`;
    return Ii`
      <${e}
        part="base"
        class=${Lt({
      "icon-button": !0,
      "icon-button--disabled": !t && this.disabled,
      "icon-button--focused": this.hasFocus
    })}
        ?disabled=${M(t ? void 0 : this.disabled)}
        type=${M(t ? void 0 : "button")}
        href=${M(t ? this.href : void 0)}
        target=${M(t ? this.target : void 0)}
        download=${M(t ? this.download : void 0)}
        rel=${M(t && this.target ? "noreferrer noopener" : void 0)}
        role=${M(t ? void 0 : "button")}
        aria-disabled=${this.disabled ? "true" : "false"}
        aria-label="${this.label}"
        tabindex=${this.disabled ? "-1" : "0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${M(this.name)}
          library=${M(this.library)}
          src=${M(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${e}>
    `;
  }
};
D.styles = [Ft, Bi];
D.dependencies = { "sl-icon": Y };
f([
  U(".icon-button")
], D.prototype, "button", 2);
f([
  de()
], D.prototype, "hasFocus", 2);
f([
  u()
], D.prototype, "name", 2);
f([
  u()
], D.prototype, "library", 2);
f([
  u()
], D.prototype, "src", 2);
f([
  u()
], D.prototype, "href", 2);
f([
  u()
], D.prototype, "target", 2);
f([
  u()
], D.prototype, "download", 2);
f([
  u()
], D.prototype, "label", 2);
f([
  u({ type: Boolean, reflect: !0 })
], D.prototype, "disabled", 2);
var G = class extends X {
  constructor() {
    super(...arguments), this.hasSlotController = new bs(this, "footer"), this.localize = new wo(this), this.modal = new Ti(this), this.open = !1, this.label = "", this.noHeader = !1, this.handleDocumentKeyDown = (t) => {
      t.key === "Escape" && this.modal.isActive() && this.open && (t.stopPropagation(), this.requestClose("keyboard"));
    };
  }
  firstUpdated() {
    this.dialog.hidden = !this.open, this.open && (this.addOpenListeners(), this.modal.activate(), rs(this));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.modal.deactivate(), ls(this), this.removeOpenListeners();
  }
  requestClose(t) {
    if (this.emit("sl-request-close", {
      cancelable: !0,
      detail: { source: t }
    }).defaultPrevented) {
      const o = wt(this, "dialog.denyClose", { dir: this.localize.dir() });
      xt(this.panel, o.keyframes, o.options);
      return;
    }
    this.hide();
  }
  addOpenListeners() {
    var t;
    "CloseWatcher" in window ? ((t = this.closeWatcher) == null || t.destroy(), this.closeWatcher = new CloseWatcher(), this.closeWatcher.onclose = () => this.requestClose("keyboard")) : document.addEventListener("keydown", this.handleDocumentKeyDown);
  }
  removeOpenListeners() {
    var t;
    (t = this.closeWatcher) == null || t.destroy(), document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }
  async handleOpenChange() {
    if (this.open) {
      this.emit("sl-show"), this.addOpenListeners(), this.originalTrigger = document.activeElement, this.modal.activate(), rs(this);
      const t = this.querySelector("[autofocus]");
      t && t.removeAttribute("autofocus"), await Promise.all([Tt(this.dialog), Tt(this.overlay)]), this.dialog.hidden = !1, requestAnimationFrame(() => {
        this.emit("sl-initial-focus", { cancelable: !0 }).defaultPrevented || (t ? t.focus({ preventScroll: !0 }) : this.panel.focus({ preventScroll: !0 })), t && t.setAttribute("autofocus", "");
      });
      const e = wt(this, "dialog.show", { dir: this.localize.dir() }), o = wt(this, "dialog.overlay.show", { dir: this.localize.dir() });
      await Promise.all([
        xt(this.panel, e.keyframes, e.options),
        xt(this.overlay, o.keyframes, o.options)
      ]), this.emit("sl-after-show");
    } else {
      Hi(this), this.emit("sl-hide"), this.removeOpenListeners(), this.modal.deactivate(), await Promise.all([Tt(this.dialog), Tt(this.overlay)]);
      const t = wt(this, "dialog.hide", { dir: this.localize.dir() }), e = wt(this, "dialog.overlay.hide", { dir: this.localize.dir() });
      await Promise.all([
        xt(this.overlay, e.keyframes, e.options).then(() => {
          this.overlay.hidden = !0;
        }),
        xt(this.panel, t.keyframes, t.options).then(() => {
          this.panel.hidden = !0;
        })
      ]), this.dialog.hidden = !0, this.overlay.hidden = !1, this.panel.hidden = !1, ls(this);
      const o = this.originalTrigger;
      typeof (o == null ? void 0 : o.focus) == "function" && setTimeout(() => o.focus()), this.emit("sl-after-hide");
    }
  }
  /** Shows the dialog. */
  async show() {
    if (!this.open)
      return this.open = !0, ze(this, "sl-after-show");
  }
  /** Hides the dialog */
  async hide() {
    if (this.open)
      return this.open = !1, ze(this, "sl-after-hide");
  }
  render() {
    return _`
      <div
        part="base"
        class=${Lt({
      dialog: !0,
      "dialog--open": this.open,
      "dialog--has-footer": this.hasSlotController.test("footer")
    })}
      >
        <div part="overlay" class="dialog__overlay" @click=${() => this.requestClose("overlay")} tabindex="-1"></div>

        <div
          part="panel"
          class="dialog__panel"
          role="dialog"
          aria-modal="true"
          aria-hidden=${this.open ? "false" : "true"}
          aria-label=${M(this.noHeader ? this.label : void 0)}
          aria-labelledby=${M(this.noHeader ? void 0 : "title")}
          tabindex="-1"
        >
          ${this.noHeader ? "" : _`
                <header part="header" class="dialog__header">
                  <h2 part="title" class="dialog__title" id="title">
                    <slot name="label"> ${this.label.length > 0 ? this.label : "\uFEFF"} </slot>
                  </h2>
                  <div part="header-actions" class="dialog__header-actions">
                    <slot name="header-actions"></slot>
                    <sl-icon-button
                      part="close-button"
                      exportparts="base:close-button__base"
                      class="dialog__close"
                      name="x-lg"
                      label=${this.localize.term("close")}
                      library="system"
                      @click="${() => this.requestClose("close-button")}"
                    ></sl-icon-button>
                  </div>
                </header>
              `}
          ${""}
          <div part="body" class="dialog__body" tabindex="-1"><slot></slot></div>

          <footer part="footer" class="dialog__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    `;
  }
};
G.styles = [Ft, Vi];
G.dependencies = {
  "sl-icon-button": D
};
f([
  U(".dialog")
], G.prototype, "dialog", 2);
f([
  U(".dialog__panel")
], G.prototype, "panel", 2);
f([
  U(".dialog__overlay")
], G.prototype, "overlay", 2);
f([
  u({ type: Boolean, reflect: !0 })
], G.prototype, "open", 2);
f([
  u({ reflect: !0 })
], G.prototype, "label", 2);
f([
  u({ attribute: "no-header", type: Boolean, reflect: !0 })
], G.prototype, "noHeader", 2);
f([
  pt("open", { waitUntilFirstUpdate: !0 })
], G.prototype, "handleOpenChange", 1);
Qt("dialog.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 250, easing: "ease" }
});
Qt("dialog.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 250, easing: "ease" }
});
Qt("dialog.denyClose", {
  keyframes: [{ scale: 1 }, { scale: 1.02 }, { scale: 1 }],
  options: { duration: 250 }
});
Qt("dialog.overlay.show", {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  options: { duration: 250 }
});
Qt("dialog.overlay.hide", {
  keyframes: [{ opacity: 1 }, { opacity: 0 }],
  options: { duration: 250 }
});
G.define("sl-dialog");
const Ui = k`
  sl-button::part(base):hover {
    filter: brightness(1.06);
  }

  sl-dialog::part(panel) {
    border-radius: 6px;
    overflow: hidden;
  }

  sl-dialog::part(header) {
    background: var(--band);
    color: var(--band-ink);
  }

  sl-dialog::part(title) {
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-semibold);
    padding: 0.75rem 1rem;
  }

  sl-dialog::part(header-actions) {
    padding: 0 0.5rem;
  }

  sl-dialog::part(close-button) {
    color: var(--band-ink);
  }

  sl-dialog::part(close-button__base):hover {
    color: rgba(255, 255, 255, 0.7);
  }

  sl-dialog::part(body) {
    padding: 1rem;
    font-size: var(--sl-font-size-small);
  }

  sl-dialog::part(footer) {
    padding: 0.6rem 1rem;
    background: var(--sl-color-neutral-50);
    border-top: 1px solid var(--sl-color-neutral-200);
  }
`;
var ji = Object.defineProperty, Wi = Object.getOwnPropertyDescriptor, me = (t, e, o, s) => {
  for (var r = s > 1 ? void 0 : s ? Wi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (r = (s ? i(e, o, r) : i(r)) || r);
  return s && r && ji(e, o, r), r;
};
let Et = class extends z {
  constructor() {
    super(...arguments), this.label = "", this.size = "medium", this.open = !1;
  }
  async show() {
    return await this.updateComplete, this.dialog.show();
  }
  async hide() {
    return await this.updateComplete, this.dialog.hide();
  }
  // Only the dialog's own sl-show and sl-hide: a slotted widget's pass through it too.
  follow(t) {
    t.target === t.currentTarget && (this.open = t.type === "sl-show");
  }
  render() {
    return _`<sl-dialog label=${this.label} ?open=${this.open} @sl-show=${this.follow} @sl-hide=${this.follow}>
      <slot></slot>
      <div slot="footer" class="footer"><slot name="footer"></slot></div>
    </sl-dialog>`;
  }
};
Et.styles = [
  H,
  Ui,
  k`
      sl-dialog {
        --width: 560px;
      }

      :host([size='small']) sl-dialog {
        --width: 420px;
      }

      :host([size='large']) sl-dialog {
        --width: clamp(560px, 70vw, 960px);
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--sl-spacing-x-small);
      }
    `
];
me([
  u()
], Et.prototype, "label", 2);
me([
  u({ reflect: !0 })
], Et.prototype, "size", 2);
me([
  u({ type: Boolean, reflect: !0 })
], Et.prototype, "open", 2);
me([
  U("sl-dialog")
], Et.prototype, "dialog", 2);
Et = me([
  T("look-dialog")
], Et);
const as = {
  "chevron-down": Hr,
  gear: Br,
  power: Fr,
  "question-circle": Nr,
  "sign-stop-fill": Ir
};
ys("default", {
  resolver: (t) => t in as ? ws(as[t]) : ""
});
const Is = new CSSStyleSheet();
Is.replaceSync(Ur);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, Is];
export {
  Ht as LookAbout,
  ne as LookBand,
  ut as LookBandPress,
  ao as LookChip,
  I as LookCommand,
  Et as LookDialog,
  Ee as LookDot,
  Se as LookGear,
  ce as LookGroup,
  Bt as LookPower,
  Qe as LookRail,
  no as LookReading,
  oo as LookShell,
  lt as LookView,
  _s as NARROW_WIDTH_PX,
  qr as TOKENS,
  Kr as TURN_HEIGHT_PX,
  Ui as lookTheme
};
