/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis, yo = ke.ShadowRoot && (ke.ShadyCSS === void 0 || ke.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, wo = Symbol(), Vo = /* @__PURE__ */ new WeakMap();
let vr = class {
  constructor(e, o, r) {
    if (this._$cssResult$ = !0, r !== wo) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = o;
  }
  get styleSheet() {
    let e = this.o;
    const o = this.t;
    if (yo && e === void 0) {
      const r = o !== void 0 && o.length === 1;
      r && (e = Vo.get(o)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && Vo.set(o, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const W = (t) => new vr(typeof t == "string" ? t : t + "", void 0, wo), _ = (t, ...e) => {
  const o = t.length === 1 ? t[0] : e.reduce((r, s, l) => r + ((i) => {
    if (i._$cssResult$ === !0) return i.cssText;
    if (typeof i == "number") return i;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + i + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + t[l + 1], t[0]);
  return new vr(o, t, wo);
}, es = (t, e) => {
  if (yo) t.adoptedStyleSheets = e.map((o) => o instanceof CSSStyleSheet ? o : o.styleSheet);
  else for (const o of e) {
    const r = document.createElement("style"), s = ke.litNonce;
    s !== void 0 && r.setAttribute("nonce", s), r.textContent = o.cssText, t.appendChild(r);
  }
}, Bo = yo ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let o = "";
  for (const r of e.cssRules) o += r.cssText;
  return W(o);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: os, defineProperty: rs, getOwnPropertyDescriptor: ss, getOwnPropertyNames: ls, getOwnPropertySymbols: is, getPrototypeOf: ns } = Object, ut = globalThis, Fo = ut.trustedTypes, as = Fo ? Fo.emptyScript : "", Ye = ut.reactiveElementPolyfillSupport, se = (t, e) => t, Ht = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? as : null;
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
} }, xo = (t, e) => !os(t, e), Ho = { attribute: !0, type: String, converter: Ht, reflect: !1, useDefault: !1, hasChanged: xo };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ut.litPropertyMetadata ?? (ut.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Dt = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, o = Ho) {
    if (o.state && (o.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((o = Object.create(o)).wrapped = !0), this.elementProperties.set(e, o), !o.noAccessor) {
      const r = Symbol(), s = this.getPropertyDescriptor(e, r, o);
      s !== void 0 && rs(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, o, r) {
    const { get: s, set: l } = ss(this.prototype, e) ?? { get() {
      return this[o];
    }, set(i) {
      this[o] = i;
    } };
    return { get: s, set(i) {
      const n = s == null ? void 0 : s.call(this);
      l == null || l.call(this, i), this.requestUpdate(e, n, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Ho;
  }
  static _$Ei() {
    if (this.hasOwnProperty(se("elementProperties"))) return;
    const e = ns(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(se("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(se("properties"))) {
      const o = this.properties, r = [...ls(o), ...is(o)];
      for (const s of r) this.createProperty(s, o[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const o = litPropertyMetadata.get(e);
      if (o !== void 0) for (const [r, s] of o) this.elementProperties.set(r, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [o, r] of this.elementProperties) {
      const s = this._$Eu(o, r);
      s !== void 0 && this._$Eh.set(s, o);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const o = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const s of r) o.unshift(Bo(s));
    } else e !== void 0 && o.push(Bo(e));
    return o;
  }
  static _$Eu(e, o) {
    const r = o.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const r of o.keys()) this.hasOwnProperty(r) && (e.set(r, this[r]), delete this[r]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return es(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((o) => {
      var r;
      return (r = o.hostConnected) == null ? void 0 : r.call(o);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((o) => {
      var r;
      return (r = o.hostDisconnected) == null ? void 0 : r.call(o);
    });
  }
  attributeChangedCallback(e, o, r) {
    this._$AK(e, r);
  }
  _$ET(e, o) {
    var l;
    const r = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, r);
    if (s !== void 0 && r.reflect === !0) {
      const i = (((l = r.converter) == null ? void 0 : l.toAttribute) !== void 0 ? r.converter : Ht).toAttribute(o, r.type);
      this._$Em = e, i == null ? this.removeAttribute(s) : this.setAttribute(s, i), this._$Em = null;
    }
  }
  _$AK(e, o) {
    var l, i;
    const r = this.constructor, s = r._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const n = r.getPropertyOptions(s), a = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((l = n.converter) == null ? void 0 : l.fromAttribute) !== void 0 ? n.converter : Ht;
      this._$Em = s;
      const c = a.fromAttribute(o, n.type);
      this[s] = c ?? ((i = this._$Ej) == null ? void 0 : i.get(s)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(e, o, r, s = !1, l) {
    var i;
    if (e !== void 0) {
      const n = this.constructor;
      if (s === !1 && (l = this[e]), r ?? (r = n.getPropertyOptions(e)), !((r.hasChanged ?? xo)(l, o) || r.useDefault && r.reflect && l === ((i = this._$Ej) == null ? void 0 : i.get(e)) && !this.hasAttribute(n._$Eu(e, r)))) return;
      this.C(e, o, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, o, { useDefault: r, reflect: s, wrapped: l }, i) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, i ?? o ?? this[e]), l !== !0 || i !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (o = void 0), this._$AL.set(e, o)), s === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
    var r;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [l, i] of this._$Ep) this[l] = i;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [l, i] of s) {
        const { wrapped: n } = i, a = this[l];
        n !== !0 || this._$AL.has(l) || a === void 0 || this.C(l, void 0, i, a);
      }
    }
    let e = !1;
    const o = this._$AL;
    try {
      e = this.shouldUpdate(o), e ? (this.willUpdate(o), (r = this._$EO) == null || r.forEach((s) => {
        var l;
        return (l = s.hostUpdate) == null ? void 0 : l.call(s);
      }), this.update(o)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(o);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var o;
    (o = this._$EO) == null || o.forEach((r) => {
      var s;
      return (s = r.hostUpdated) == null ? void 0 : s.call(r);
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
Dt.elementStyles = [], Dt.shadowRootOptions = { mode: "open" }, Dt[se("elementProperties")] = /* @__PURE__ */ new Map(), Dt[se("finalized")] = /* @__PURE__ */ new Map(), Ye == null || Ye({ ReactiveElement: Dt }), (ut.reactiveElementVersions ?? (ut.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const le = globalThis, No = (t) => t, Ae = le.trustedTypes, Io = Ae ? Ae.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, yr = "$lit$", dt = `lit$${Math.random().toFixed(9).slice(2)}$`, wr = "?" + dt, cs = `<${wr}>`, zt = document, ie = () => zt.createComment(""), ne = (t) => t === null || typeof t != "object" && typeof t != "function", _o = Array.isArray, hs = (t) => _o(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", Ge = `[ 	
\f\r]`, Gt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Uo = /-->/g, jo = />/g, _t = RegExp(`>|${Ge}(?:([^\\s"'>=/]+)(${Ge}*=${Ge}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Wo = /'/g, qo = /"/g, xr = /^(?:script|style|textarea|title)$/i, ds = (t) => (e, ...o) => ({ _$litType$: t, strings: e, values: o }), x = ds(1), F = Symbol.for("lit-noChange"), w = Symbol.for("lit-nothing"), Zo = /* @__PURE__ */ new WeakMap(), Ct = zt.createTreeWalker(zt, 129);
function _r(t, e) {
  if (!_o(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Io !== void 0 ? Io.createHTML(e) : e;
}
const us = (t, e) => {
  const o = t.length - 1, r = [];
  let s, l = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", i = Gt;
  for (let n = 0; n < o; n++) {
    const a = t[n];
    let c, p, u = -1, g = 0;
    for (; g < a.length && (i.lastIndex = g, p = i.exec(a), p !== null); ) g = i.lastIndex, i === Gt ? p[1] === "!--" ? i = Uo : p[1] !== void 0 ? i = jo : p[2] !== void 0 ? (xr.test(p[2]) && (s = RegExp("</" + p[2], "g")), i = _t) : p[3] !== void 0 && (i = _t) : i === _t ? p[0] === ">" ? (i = s ?? Gt, u = -1) : p[1] === void 0 ? u = -2 : (u = i.lastIndex - p[2].length, c = p[1], i = p[3] === void 0 ? _t : p[3] === '"' ? qo : Wo) : i === qo || i === Wo ? i = _t : i === Uo || i === jo ? i = Gt : (i = _t, s = void 0);
    const f = i === _t && t[n + 1].startsWith("/>") ? " " : "";
    l += i === Gt ? a + cs : u >= 0 ? (r.push(c), a.slice(0, u) + yr + a.slice(u) + dt + f) : a + dt + (u === -2 ? n : f);
  }
  return [_r(t, l + (t[o] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class ae {
  constructor({ strings: e, _$litType$: o }, r) {
    let s;
    this.parts = [];
    let l = 0, i = 0;
    const n = e.length - 1, a = this.parts, [c, p] = us(e, o);
    if (this.el = ae.createElement(c, r), Ct.currentNode = this.el.content, o === 2 || o === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = Ct.nextNode()) !== null && a.length < n; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(yr)) {
          const g = p[i++], f = s.getAttribute(u).split(dt), m = /([.?@])?(.*)/.exec(g);
          a.push({ type: 1, index: l, name: m[2], strings: f, ctor: m[1] === "." ? fs : m[1] === "?" ? gs : m[1] === "@" ? ms : Be }), s.removeAttribute(u);
        } else u.startsWith(dt) && (a.push({ type: 6, index: l }), s.removeAttribute(u));
        if (xr.test(s.tagName)) {
          const u = s.textContent.split(dt), g = u.length - 1;
          if (g > 0) {
            s.textContent = Ae ? Ae.emptyScript : "";
            for (let f = 0; f < g; f++) s.append(u[f], ie()), Ct.nextNode(), a.push({ type: 2, index: ++l });
            s.append(u[g], ie());
          }
        }
      } else if (s.nodeType === 8) if (s.data === wr) a.push({ type: 2, index: l });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(dt, u + 1)) !== -1; ) a.push({ type: 7, index: l }), u += dt.length - 1;
      }
      l++;
    }
  }
  static createElement(e, o) {
    const r = zt.createElement("template");
    return r.innerHTML = e, r;
  }
}
function Nt(t, e, o = t, r) {
  var i, n;
  if (e === F) return e;
  let s = r !== void 0 ? (i = o._$Co) == null ? void 0 : i[r] : o._$Cl;
  const l = ne(e) ? void 0 : e._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== l && ((n = s == null ? void 0 : s._$AO) == null || n.call(s, !1), l === void 0 ? s = void 0 : (s = new l(t), s._$AT(t, o, r)), r !== void 0 ? (o._$Co ?? (o._$Co = []))[r] = s : o._$Cl = s), s !== void 0 && (e = Nt(t, s._$AS(t, e.values), s, r)), e;
}
class ps {
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
    const { el: { content: o }, parts: r } = this._$AD, s = ((e == null ? void 0 : e.creationScope) ?? zt).importNode(o, !0);
    Ct.currentNode = s;
    let l = Ct.nextNode(), i = 0, n = 0, a = r[0];
    for (; a !== void 0; ) {
      if (i === a.index) {
        let c;
        a.type === 2 ? c = new fe(l, l.nextSibling, this, e) : a.type === 1 ? c = new a.ctor(l, a.name, a.strings, this, e) : a.type === 6 && (c = new bs(l, this, e)), this._$AV.push(c), a = r[++n];
      }
      i !== (a == null ? void 0 : a.index) && (l = Ct.nextNode(), i++);
    }
    return Ct.currentNode = zt, s;
  }
  p(e) {
    let o = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, o), o += r.strings.length - 2) : r._$AI(e[o])), o++;
  }
}
class fe {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, o, r, s) {
    this.type = 2, this._$AH = w, this._$AN = void 0, this._$AA = e, this._$AB = o, this._$AM = r, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
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
    e = Nt(this, e, o), ne(e) ? e === w || e == null || e === "" ? (this._$AH !== w && this._$AR(), this._$AH = w) : e !== this._$AH && e !== F && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : hs(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== w && ne(this._$AH) ? this._$AA.nextSibling.data = e : this.T(zt.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var l;
    const { values: o, _$litType$: r } = e, s = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = ae.createElement(_r(r.h, r.h[0]), this.options)), r);
    if (((l = this._$AH) == null ? void 0 : l._$AD) === s) this._$AH.p(o);
    else {
      const i = new ps(s, this), n = i.u(this.options);
      i.p(o), this.T(n), this._$AH = i;
    }
  }
  _$AC(e) {
    let o = Zo.get(e.strings);
    return o === void 0 && Zo.set(e.strings, o = new ae(e)), o;
  }
  k(e) {
    _o(this._$AH) || (this._$AH = [], this._$AR());
    const o = this._$AH;
    let r, s = 0;
    for (const l of e) s === o.length ? o.push(r = new fe(this.O(ie()), this.O(ie()), this, this.options)) : r = o[s], r._$AI(l), s++;
    s < o.length && (this._$AR(r && r._$AB.nextSibling, s), o.length = s);
  }
  _$AR(e = this._$AA.nextSibling, o) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, o); e !== this._$AB; ) {
      const s = No(e).nextSibling;
      No(e).remove(), e = s;
    }
  }
  setConnected(e) {
    var o;
    this._$AM === void 0 && (this._$Cv = e, (o = this._$AP) == null || o.call(this, e));
  }
}
class Be {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, o, r, s, l) {
    this.type = 1, this._$AH = w, this._$AN = void 0, this.element = e, this.name = o, this._$AM = s, this.options = l, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = w;
  }
  _$AI(e, o = this, r, s) {
    const l = this.strings;
    let i = !1;
    if (l === void 0) e = Nt(this, e, o, 0), i = !ne(e) || e !== this._$AH && e !== F, i && (this._$AH = e);
    else {
      const n = e;
      let a, c;
      for (e = l[0], a = 0; a < l.length - 1; a++) c = Nt(this, n[r + a], o, a), c === F && (c = this._$AH[a]), i || (i = !ne(c) || c !== this._$AH[a]), c === w ? e = w : e !== w && (e += (c ?? "") + l[a + 1]), this._$AH[a] = c;
    }
    i && !s && this.j(e);
  }
  j(e) {
    e === w ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class fs extends Be {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === w ? void 0 : e;
  }
}
class gs extends Be {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== w);
  }
}
class ms extends Be {
  constructor(e, o, r, s, l) {
    super(e, o, r, s, l), this.type = 5;
  }
  _$AI(e, o = this) {
    if ((e = Nt(this, e, o, 0) ?? w) === F) return;
    const r = this._$AH, s = e === w && r !== w || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, l = e !== w && (r === w || s);
    s && this.element.removeEventListener(this.name, this, r), l && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var o;
    typeof this._$AH == "function" ? this._$AH.call(((o = this.options) == null ? void 0 : o.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class bs {
  constructor(e, o, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = o, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Nt(this, e);
  }
}
const Je = le.litHtmlPolyfillSupport;
Je == null || Je(ae, fe), (le.litHtmlVersions ?? (le.litHtmlVersions = [])).push("3.3.3");
const vs = (t, e, o) => {
  const r = (o == null ? void 0 : o.renderBefore) ?? e;
  let s = r._$litPart$;
  if (s === void 0) {
    const l = (o == null ? void 0 : o.renderBefore) ?? null;
    r._$litPart$ = s = new fe(e.insertBefore(ie(), l), l, void 0, o ?? {});
  }
  return s._$AI(t), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const At = globalThis;
let E = class extends Dt {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = vs(o, this.renderRoot, this.renderOptions);
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
    return F;
  }
};
var br;
E._$litElement$ = !0, E.finalized = !0, (br = At.litElementHydrateSupport) == null || br.call(At, { LitElement: E });
const to = At.litElementPolyfillSupport;
to == null || to({ LitElement: E });
(At.litElementVersions ?? (At.litElementVersions = [])).push("4.2.2");
var ys = _`
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
`, ws = (t = "value") => (e, o) => {
  const r = e.constructor, s = r.prototype.attributeChangedCallback;
  r.prototype.attributeChangedCallback = function(l, i, n) {
    var a;
    const c = r.getPropertyOptions(t), p = typeof c.attribute == "string" ? c.attribute : t;
    if (l === p) {
      const u = c.converter || Ht, f = (typeof u == "function" ? u : (a = u == null ? void 0 : u.fromAttribute) != null ? a : Ht.fromAttribute)(n, c.type);
      this[t] !== f && (this[o] = f);
    }
    s.call(this, l, i, n);
  };
}, xs = _`
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
`, kr = Object.defineProperty, _s = Object.defineProperties, ks = Object.getOwnPropertyDescriptor, $s = Object.getOwnPropertyDescriptors, Ko = Object.getOwnPropertySymbols, Ls = Object.prototype.hasOwnProperty, Cs = Object.prototype.propertyIsEnumerable, eo = (t, e) => (e = Symbol[t]) ? e : Symbol.for("Symbol." + t), ko = (t) => {
  throw TypeError(t);
}, Xo = (t, e, o) => e in t ? kr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o, Ot = (t, e) => {
  for (var o in e || (e = {}))
    Ls.call(e, o) && Xo(t, o, e[o]);
  if (Ko)
    for (var o of Ko(e))
      Cs.call(e, o) && Xo(t, o, e[o]);
  return t;
}, Fe = (t, e) => _s(t, $s(e)), d = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? ks(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && kr(e, o, s), s;
}, $r = (t, e, o) => e.has(t) || ko("Cannot " + o), As = (t, e, o) => ($r(t, e, "read from private field"), e.get(t)), zs = (t, e, o) => e.has(t) ? ko("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, o), Es = (t, e, o, r) => ($r(t, e, "write to private field"), e.set(t, o), o), Ss = function(t, e) {
  this[0] = t, this[1] = e;
}, Ps = (t) => {
  var e = t[eo("asyncIterator")], o = !1, r, s = {};
  return e == null ? (e = t[eo("iterator")](), r = (l) => s[l] = (i) => e[l](i)) : (e = e.call(t), r = (l) => s[l] = (i) => {
    if (o) {
      if (o = !1, l === "throw") throw i;
      return i;
    }
    return o = !0, {
      done: !1,
      value: new Ss(new Promise((n) => {
        var a = e[l](i);
        a instanceof Object || ko("Object expected"), n(a);
      }), 1)
    };
  }), s[eo("iterator")] = () => s, r("next"), "throw" in e ? r("throw") : s.throw = (l) => {
    throw l;
  }, "return" in e && r("return"), s;
}, Jt = /* @__PURE__ */ new WeakMap(), te = /* @__PURE__ */ new WeakMap(), ee = /* @__PURE__ */ new WeakMap(), oo = /* @__PURE__ */ new WeakSet(), we = /* @__PURE__ */ new WeakMap(), Lr = class {
  constructor(t, e) {
    this.handleFormData = (o) => {
      const r = this.options.disabled(this.host), s = this.options.name(this.host), l = this.options.value(this.host), i = this.host.tagName.toLowerCase() === "sl-button";
      this.host.isConnected && !r && !i && typeof s == "string" && s.length > 0 && typeof l < "u" && (Array.isArray(l) ? l.forEach((n) => {
        o.formData.append(s, n.toString());
      }) : o.formData.append(s, l.toString()));
    }, this.handleFormSubmit = (o) => {
      var r;
      const s = this.options.disabled(this.host), l = this.options.reportValidity;
      this.form && !this.form.noValidate && ((r = Jt.get(this.form)) == null || r.forEach((i) => {
        this.setUserInteracted(i, !0);
      })), this.form && !this.form.noValidate && !s && !l(this.host) && (o.preventDefault(), o.stopImmediatePropagation());
    }, this.handleFormReset = () => {
      this.options.setValue(this.host, this.options.defaultValue(this.host)), this.setUserInteracted(this.host, !1), we.set(this.host, []);
    }, this.handleInteraction = (o) => {
      const r = we.get(this.host);
      r.includes(o.type) || r.push(o.type), r.length === this.options.assumeInteractionOn.length && this.setUserInteracted(this.host, !0);
    }, this.checkFormValidity = () => {
      if (this.form && !this.form.noValidate) {
        const o = this.form.querySelectorAll("*");
        for (const r of o)
          if (typeof r.checkValidity == "function" && !r.checkValidity())
            return !1;
      }
      return !0;
    }, this.reportFormValidity = () => {
      if (this.form && !this.form.noValidate) {
        const o = this.form.querySelectorAll("*");
        for (const r of o)
          if (typeof r.reportValidity == "function" && !r.reportValidity())
            return !1;
      }
      return !0;
    }, (this.host = t).addController(this), this.options = Ot({
      form: (o) => {
        const r = o.form;
        if (r) {
          const l = o.getRootNode().querySelector(`#${r}`);
          if (l)
            return l;
        }
        return o.closest("form");
      },
      name: (o) => o.name,
      value: (o) => o.value,
      defaultValue: (o) => o.defaultValue,
      disabled: (o) => {
        var r;
        return (r = o.disabled) != null ? r : !1;
      },
      reportValidity: (o) => typeof o.reportValidity == "function" ? o.reportValidity() : !0,
      checkValidity: (o) => typeof o.checkValidity == "function" ? o.checkValidity() : !0,
      setValue: (o, r) => o.value = r,
      assumeInteractionOn: ["sl-input"]
    }, e);
  }
  hostConnected() {
    const t = this.options.form(this.host);
    t && this.attachForm(t), we.set(this.host, []), this.options.assumeInteractionOn.forEach((e) => {
      this.host.addEventListener(e, this.handleInteraction);
    });
  }
  hostDisconnected() {
    this.detachForm(), we.delete(this.host), this.options.assumeInteractionOn.forEach((t) => {
      this.host.removeEventListener(t, this.handleInteraction);
    });
  }
  hostUpdated() {
    const t = this.options.form(this.host);
    t || this.detachForm(), t && this.form !== t && (this.detachForm(), this.attachForm(t)), this.host.hasUpdated && this.setValidity(this.host.validity.valid);
  }
  attachForm(t) {
    t ? (this.form = t, Jt.has(this.form) ? Jt.get(this.form).add(this.host) : Jt.set(this.form, /* @__PURE__ */ new Set([this.host])), this.form.addEventListener("formdata", this.handleFormData), this.form.addEventListener("submit", this.handleFormSubmit), this.form.addEventListener("reset", this.handleFormReset), te.has(this.form) || (te.set(this.form, this.form.reportValidity), this.form.reportValidity = () => this.reportFormValidity()), ee.has(this.form) || (ee.set(this.form, this.form.checkValidity), this.form.checkValidity = () => this.checkFormValidity())) : this.form = void 0;
  }
  detachForm() {
    if (!this.form) return;
    const t = Jt.get(this.form);
    t && (t.delete(this.host), t.size <= 0 && (this.form.removeEventListener("formdata", this.handleFormData), this.form.removeEventListener("submit", this.handleFormSubmit), this.form.removeEventListener("reset", this.handleFormReset), te.has(this.form) && (this.form.reportValidity = te.get(this.form), te.delete(this.form)), ee.has(this.form) && (this.form.checkValidity = ee.get(this.form), ee.delete(this.form)), this.form = void 0));
  }
  setUserInteracted(t, e) {
    e ? oo.add(t) : oo.delete(t), t.requestUpdate();
  }
  doAction(t, e) {
    if (this.form) {
      const o = document.createElement("button");
      o.type = t, o.style.position = "absolute", o.style.width = "0", o.style.height = "0", o.style.clipPath = "inset(50%)", o.style.overflow = "hidden", o.style.whiteSpace = "nowrap", e && (o.name = e.name, o.value = e.value, ["formaction", "formenctype", "formmethod", "formnovalidate", "formtarget"].forEach((r) => {
        e.hasAttribute(r) && o.setAttribute(r, e.getAttribute(r));
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
    const e = this.host, o = !!oo.has(e), r = !!e.required;
    e.toggleAttribute("data-required", r), e.toggleAttribute("data-optional", !r), e.toggleAttribute("data-invalid", !t), e.toggleAttribute("data-valid", t), e.toggleAttribute("data-user-invalid", !t && o), e.toggleAttribute("data-user-valid", t && o);
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
}, $o = Object.freeze({
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
Object.freeze(Fe(Ot({}, $o), {
  valid: !1,
  valueMissing: !0
}));
Object.freeze(Fe(Ot({}, $o), {
  valid: !1,
  customError: !0
}));
var Lo = class {
  constructor(t, ...e) {
    this.slotNames = [], this.handleSlotChange = (o) => {
      const r = o.target;
      (this.slotNames.includes("[default]") && !r.name || r.name && this.slotNames.includes(r.name)) && this.host.requestUpdate();
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
function nt(t, e) {
  const o = Ot({
    waitUntilFirstUpdate: !1
  }, e);
  return (r, s) => {
    const { update: l } = r, i = Array.isArray(t) ? t : [t];
    r.update = function(n) {
      i.forEach((a) => {
        const c = a;
        if (n.has(c)) {
          const p = n.get(c), u = this[c];
          p !== u && (!o.waitUntilFirstUpdate || this.hasUpdated) && this[s](p, u);
        }
      }), l.call(this, n);
    };
  };
}
var bt = _`
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
const O = (t) => (e, o) => {
  o !== void 0 ? o.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qs = { attribute: !0, type: String, converter: Ht, reflect: !1, hasChanged: xo }, Os = (t = Qs, e, o) => {
  const { kind: r, metadata: s } = o;
  let l = globalThis.litPropertyMetadata.get(s);
  if (l === void 0 && globalThis.litPropertyMetadata.set(s, l = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), l.set(o.name, t), r === "accessor") {
    const { name: i } = o;
    return { set(n) {
      const a = e.get.call(this);
      e.set.call(this, n), this.requestUpdate(i, a, t, !0, n);
    }, init(n) {
      return n !== void 0 && this.C(i, void 0, t, n), n;
    } };
  }
  if (r === "setter") {
    const { name: i } = o;
    return function(n) {
      const a = this[i];
      e.call(this, n), this.requestUpdate(i, a, t, !0, n);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function h(t) {
  return (e, o) => typeof o == "object" ? Os(t, e, o) : ((r, s, l) => {
    const i = s.hasOwnProperty(l);
    return s.constructor.createProperty(l, r), i ? Object.getOwnPropertyDescriptor(s, l) : void 0;
  })(t, e, o);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Rt(t) {
  return h({ ...t, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Rs = (t, e, o) => (o.configurable = !0, o.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(t, e, o), o);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function V(t, e) {
  return (o, r, s) => {
    const l = (i) => {
      var n;
      return ((n = i.renderRoot) == null ? void 0 : n.querySelector(t)) ?? null;
    };
    return Rs(o, r, { get() {
      return l(this);
    } });
  };
}
var $e, H = class extends E {
  constructor() {
    super(), zs(this, $e, !1), this.initialReflectedProperties = /* @__PURE__ */ new Map(), Object.entries(this.constructor.dependencies).forEach(([t, e]) => {
      this.constructor.define(t, e);
    });
  }
  emit(t, e) {
    const o = new CustomEvent(t, Ot({
      bubbles: !0,
      cancelable: !1,
      composed: !0,
      detail: {}
    }, e));
    return this.dispatchEvent(o), o;
  }
  /* eslint-enable */
  static define(t, e = this, o = {}) {
    const r = customElements.get(t);
    if (!r) {
      try {
        customElements.define(t, e, o);
      } catch {
        customElements.define(t, class extends e {
        }, o);
      }
      return;
    }
    let s = " (unknown version)", l = s;
    "version" in e && e.version && (s = " v" + e.version), "version" in r && r.version && (l = " v" + r.version), !(s && l && s === l) && console.warn(
      `Attempted to register <${t}>${s}, but <${t}>${l} has already been registered.`
    );
  }
  attributeChangedCallback(t, e, o) {
    As(this, $e) || (this.constructor.elementProperties.forEach(
      (r, s) => {
        r.reflect && this[s] != null && this.initialReflectedProperties.set(s, this[s]);
      }
    ), Es(this, $e, !0)), super.attributeChangedCallback(t, e, o);
  }
  willUpdate(t) {
    super.willUpdate(t), this.initialReflectedProperties.forEach((e, o) => {
      t.has(o) && this[o] == null && (this[o] = e);
    });
  }
};
$e = /* @__PURE__ */ new WeakMap();
H.version = "2.20.1";
H.dependencies = {};
d([
  h()
], H.prototype, "dir", 2);
d([
  h()
], H.prototype, "lang", 2);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ht = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4 }, Co = (t) => (...e) => ({ _$litDirective$: t, values: e });
let Ao = class {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, o, r) {
    this._$Ct = e, this._$AM = o, this._$Ci = r;
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
const pt = Co(class extends Ao {
  constructor(t) {
    var e;
    if (super(t), t.type !== ht.ATTRIBUTE || t.name !== "class" || ((e = t.strings) == null ? void 0 : e.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t) {
    return " " + Object.keys(t).filter((e) => t[e]).join(" ") + " ";
  }
  update(t, [e]) {
    var r, s;
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), t.strings !== void 0 && (this.nt = new Set(t.strings.join(" ").split(/\s/).filter((l) => l !== "")));
      for (const l in e) e[l] && !((r = this.nt) != null && r.has(l)) && this.st.add(l);
      return this.render(e);
    }
    const o = t.element.classList;
    for (const l of this.st) l in e || (o.remove(l), this.st.delete(l));
    for (const l in e) {
      const i = !!e[l];
      i === this.st.has(l) || (s = this.nt) != null && s.has(l) || (i ? (o.add(l), this.st.add(l)) : (o.remove(l), this.st.delete(l)));
    }
    return F;
  }
});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = (t) => t ?? w;
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ts = (t, e) => (t == null ? void 0 : t._$litType$) !== void 0, Ms = (t) => t.strings === void 0, Ds = {}, Vs = (t, e = Ds) => t._$AH = e;
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bs = Co(class extends Ao {
  constructor(t) {
    if (super(t), t.type !== ht.PROPERTY && t.type !== ht.ATTRIBUTE && t.type !== ht.BOOLEAN_ATTRIBUTE) throw Error("The `live` directive is not allowed on child or event bindings");
    if (!Ms(t)) throw Error("`live` bindings can only contain a single expression");
  }
  render(t) {
    return t;
  }
  update(t, [e]) {
    if (e === F || e === w) return e;
    const o = t.element, r = t.name;
    if (t.type === ht.PROPERTY) {
      if (e === o[r]) return F;
    } else if (t.type === ht.BOOLEAN_ATTRIBUTE) {
      if (!!e === o.hasAttribute(r)) return F;
    } else if (t.type === ht.ATTRIBUTE && o.getAttribute(r) === e + "") return F;
    return Vs(t), e;
  }
});
var R = class extends H {
  constructor() {
    super(...arguments), this.formControlController = new Lr(this, {
      value: (t) => t.checked ? t.value || "on" : void 0,
      defaultValue: (t) => t.defaultChecked,
      setValue: (t, e) => t.checked = e
    }), this.hasSlotController = new Lo(this, "help-text"), this.hasFocus = !1, this.title = "", this.name = "", this.size = "medium", this.disabled = !1, this.checked = !1, this.defaultChecked = !1, this.form = "", this.required = !1, this.helpText = "";
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
    return x`
      <div
        class=${pt({
      "form-control": !0,
      "form-control--small": this.size === "small",
      "form-control--medium": this.size === "medium",
      "form-control--large": this.size === "large",
      "form-control--has-help-text": e
    })}
      >
        <label
          part="base"
          class=${pt({
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
            value=${z(this.value)}
            .checked=${Bs(this.checked)}
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
R.styles = [bt, xs, ys];
d([
  V('input[type="checkbox"]')
], R.prototype, "input", 2);
d([
  Rt()
], R.prototype, "hasFocus", 2);
d([
  h()
], R.prototype, "title", 2);
d([
  h()
], R.prototype, "name", 2);
d([
  h()
], R.prototype, "value", 2);
d([
  h({ reflect: !0 })
], R.prototype, "size", 2);
d([
  h({ type: Boolean, reflect: !0 })
], R.prototype, "disabled", 2);
d([
  h({ type: Boolean, reflect: !0 })
], R.prototype, "checked", 2);
d([
  ws("checked")
], R.prototype, "defaultChecked", 2);
d([
  h({ reflect: !0 })
], R.prototype, "form", 2);
d([
  h({ type: Boolean, reflect: !0 })
], R.prototype, "required", 2);
d([
  h({ attribute: "help-text" })
], R.prototype, "helpText", 2);
d([
  nt("checked", { waitUntilFirstUpdate: !0 })
], R.prototype, "handleCheckedChange", 1);
d([
  nt("disabled", { waitUntilFirstUpdate: !0 })
], R.prototype, "handleDisabledChange", 1);
R.define("sl-switch");
var ao = "";
function Yo(t) {
  ao = t;
}
function Fs(t = "") {
  if (!ao) {
    const e = [...document.getElementsByTagName("script")], o = e.find((r) => r.hasAttribute("data-shoelace"));
    if (o)
      Yo(o.getAttribute("data-shoelace"));
    else {
      const r = e.find((l) => /shoelace(\.min)?\.js($|\?)/.test(l.src) || /shoelace-autoloader(\.min)?\.js($|\?)/.test(l.src));
      let s = "";
      r && (s = r.getAttribute("src")), Yo(s.split("/").slice(0, -1).join("/"));
    }
  }
  return ao.replace(/\/$/, "") + (t ? `/${t.replace(/^\//, "")}` : "");
}
var Hs = {
  name: "default",
  resolver: (t) => Fs(`assets/icons/${t}.svg`)
}, Ns = Hs, Go = {
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
}, Is = {
  name: "system",
  resolver: (t) => t in Go ? `data:image/svg+xml,${encodeURIComponent(Go[t])}` : ""
}, Us = Is, ze = [Ns, Us], Ee = [];
function js(t) {
  Ee.push(t);
}
function Ws(t) {
  Ee = Ee.filter((e) => e !== t);
}
function Jo(t) {
  return ze.find((e) => e.name === t);
}
function Cr(t, e) {
  qs(t), ze.push({
    name: t,
    resolver: e.resolver,
    mutator: e.mutator,
    spriteSheet: e.spriteSheet
  }), Ee.forEach((o) => {
    o.library === t && o.setIcon();
  });
}
function qs(t) {
  ze = ze.filter((e) => e.name !== t);
}
const Zs = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
</svg>`, Ks = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
</svg>`, Xs = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-power" viewBox="0 0 16 16">
  <path d="M7.5 1v7h1V1z"/>
  <path d="M3 8.812a5 5 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812"/>
</svg>`, Ys = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
</svg>`, Gs = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sign-stop-fill" viewBox="0 0 16 16">
  <path d="M10.371 8.277v-.553c0-.827-.422-1.234-.987-1.234-.572 0-.99.407-.99 1.234v.553c0 .83.418 1.237.99 1.237.565 0 .987-.408.987-1.237m2.586-.24c.463 0 .735-.272.735-.744s-.272-.741-.735-.741h-.774v1.485z"/>
  <path d="M4.893 0a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146A.5.5 0 0 0 11.107 0zM3.16 10.08c-.931 0-1.447-.493-1.494-1.132h.653c.065.346.396.583.891.583.524 0 .83-.246.83-.62 0-.303-.203-.467-.637-.572l-.656-.164c-.61-.147-.978-.51-.978-1.078 0-.706.597-1.184 1.444-1.184.853 0 1.386.475 1.436 1.087h-.645c-.064-.32-.352-.542-.797-.542-.472 0-.77.246-.77.6 0 .261.196.437.553.522l.654.161c.673.164 1.06.487 1.06 1.11 0 .736-.574 1.228-1.544 1.228Zm3.427-3.51V10h-.665V6.57H4.753V6h3.006v.568H6.587Zm4.458 1.16v.544c0 1.131-.636 1.805-1.661 1.805-1.026 0-1.664-.674-1.664-1.805V7.73c0-1.136.638-1.807 1.664-1.807s1.66.674 1.66 1.807ZM11.52 6h1.535c.82 0 1.316.55 1.316 1.292 0 .747-.501 1.289-1.321 1.289h-.865V10h-.665V6.001Z"/>
</svg>`, Js = ':root,:host,.sl-theme-light{color-scheme:light;--sl-color-gray-50: hsl(0 0% 97.5%);--sl-color-gray-100: hsl(240 4.8% 95.9%);--sl-color-gray-200: hsl(240 5.9% 90%);--sl-color-gray-300: hsl(240 4.9% 83.9%);--sl-color-gray-400: hsl(240 5% 64.9%);--sl-color-gray-500: hsl(240 3.8% 46.1%);--sl-color-gray-600: hsl(240 5.2% 33.9%);--sl-color-gray-700: hsl(240 5.3% 26.1%);--sl-color-gray-800: hsl(240 3.7% 15.9%);--sl-color-gray-900: hsl(240 5.9% 10%);--sl-color-gray-950: hsl(240 7.3% 8%);--sl-color-red-50: hsl(0 85.7% 97.3%);--sl-color-red-100: hsl(0 93.3% 94.1%);--sl-color-red-200: hsl(0 96.3% 89.4%);--sl-color-red-300: hsl(0 93.5% 81.8%);--sl-color-red-400: hsl(0 90.6% 70.8%);--sl-color-red-500: hsl(0 84.2% 60.2%);--sl-color-red-600: hsl(0 72.2% 50.6%);--sl-color-red-700: hsl(0 73.7% 41.8%);--sl-color-red-800: hsl(0 70% 35.3%);--sl-color-red-900: hsl(0 62.8% 30.6%);--sl-color-red-950: hsl(0 60% 19.6%);--sl-color-orange-50: hsl(33.3 100% 96.5%);--sl-color-orange-100: hsl(34.3 100% 91.8%);--sl-color-orange-200: hsl(32.1 97.7% 83.1%);--sl-color-orange-300: hsl(30.7 97.2% 72.4%);--sl-color-orange-400: hsl(27 96% 61%);--sl-color-orange-500: hsl(24.6 95% 53.1%);--sl-color-orange-600: hsl(20.5 90.2% 48.2%);--sl-color-orange-700: hsl(17.5 88.3% 40.4%);--sl-color-orange-800: hsl(15 79.1% 33.7%);--sl-color-orange-900: hsl(15.3 74.6% 27.8%);--sl-color-orange-950: hsl(15.2 69.1% 19%);--sl-color-amber-50: hsl(48 100% 96.1%);--sl-color-amber-100: hsl(48 96.5% 88.8%);--sl-color-amber-200: hsl(48 96.6% 76.7%);--sl-color-amber-300: hsl(45.9 96.7% 64.5%);--sl-color-amber-400: hsl(43.3 96.4% 56.3%);--sl-color-amber-500: hsl(37.7 92.1% 50.2%);--sl-color-amber-600: hsl(32.1 94.6% 43.7%);--sl-color-amber-700: hsl(26 90.5% 37.1%);--sl-color-amber-800: hsl(22.7 82.5% 31.4%);--sl-color-amber-900: hsl(21.7 77.8% 26.5%);--sl-color-amber-950: hsl(22.9 74.1% 16.7%);--sl-color-yellow-50: hsl(54.5 91.7% 95.3%);--sl-color-yellow-100: hsl(54.9 96.7% 88%);--sl-color-yellow-200: hsl(52.8 98.3% 76.9%);--sl-color-yellow-300: hsl(50.4 97.8% 63.5%);--sl-color-yellow-400: hsl(47.9 95.8% 53.1%);--sl-color-yellow-500: hsl(45.4 93.4% 47.5%);--sl-color-yellow-600: hsl(40.6 96.1% 40.4%);--sl-color-yellow-700: hsl(35.5 91.7% 32.9%);--sl-color-yellow-800: hsl(31.8 81% 28.8%);--sl-color-yellow-900: hsl(28.4 72.5% 25.7%);--sl-color-yellow-950: hsl(33.1 69% 13.9%);--sl-color-lime-50: hsl(78.3 92% 95.1%);--sl-color-lime-100: hsl(79.6 89.1% 89.2%);--sl-color-lime-200: hsl(80.9 88.5% 79.6%);--sl-color-lime-300: hsl(82 84.5% 67.1%);--sl-color-lime-400: hsl(82.7 78% 55.5%);--sl-color-lime-500: hsl(83.7 80.5% 44.3%);--sl-color-lime-600: hsl(84.8 85.2% 34.5%);--sl-color-lime-700: hsl(85.9 78.4% 27.3%);--sl-color-lime-800: hsl(86.3 69% 22.7%);--sl-color-lime-900: hsl(87.6 61.2% 20.2%);--sl-color-lime-950: hsl(86.5 60.6% 13.9%);--sl-color-green-50: hsl(138.5 76.5% 96.7%);--sl-color-green-100: hsl(140.6 84.2% 92.5%);--sl-color-green-200: hsl(141 78.9% 85.1%);--sl-color-green-300: hsl(141.7 76.6% 73.1%);--sl-color-green-400: hsl(141.9 69.2% 58%);--sl-color-green-500: hsl(142.1 70.6% 45.3%);--sl-color-green-600: hsl(142.1 76.2% 36.3%);--sl-color-green-700: hsl(142.4 71.8% 29.2%);--sl-color-green-800: hsl(142.8 64.2% 24.1%);--sl-color-green-900: hsl(143.8 61.2% 20.2%);--sl-color-green-950: hsl(144.3 60.7% 12%);--sl-color-emerald-50: hsl(151.8 81% 95.9%);--sl-color-emerald-100: hsl(149.3 80.4% 90%);--sl-color-emerald-200: hsl(152.4 76% 80.4%);--sl-color-emerald-300: hsl(156.2 71.6% 66.9%);--sl-color-emerald-400: hsl(158.1 64.4% 51.6%);--sl-color-emerald-500: hsl(160.1 84.1% 39.4%);--sl-color-emerald-600: hsl(161.4 93.5% 30.4%);--sl-color-emerald-700: hsl(162.9 93.5% 24.3%);--sl-color-emerald-800: hsl(163.1 88.1% 19.8%);--sl-color-emerald-900: hsl(164.2 85.7% 16.5%);--sl-color-emerald-950: hsl(164.3 87.5% 9.4%);--sl-color-teal-50: hsl(166.2 76.5% 96.7%);--sl-color-teal-100: hsl(167.2 85.5% 89.2%);--sl-color-teal-200: hsl(168.4 83.8% 78.2%);--sl-color-teal-300: hsl(170.6 76.9% 64.3%);--sl-color-teal-400: hsl(172.5 66% 50.4%);--sl-color-teal-500: hsl(173.4 80.4% 40%);--sl-color-teal-600: hsl(174.7 83.9% 31.6%);--sl-color-teal-700: hsl(175.3 77.4% 26.1%);--sl-color-teal-800: hsl(176.1 69.4% 21.8%);--sl-color-teal-900: hsl(175.9 60.8% 19%);--sl-color-teal-950: hsl(176.5 58.6% 11.4%);--sl-color-cyan-50: hsl(183.2 100% 96.3%);--sl-color-cyan-100: hsl(185.1 95.9% 90.4%);--sl-color-cyan-200: hsl(186.2 93.5% 81.8%);--sl-color-cyan-300: hsl(187 92.4% 69%);--sl-color-cyan-400: hsl(187.9 85.7% 53.3%);--sl-color-cyan-500: hsl(188.7 94.5% 42.7%);--sl-color-cyan-600: hsl(191.6 91.4% 36.5%);--sl-color-cyan-700: hsl(192.9 82.3% 31%);--sl-color-cyan-800: hsl(194.4 69.6% 27.1%);--sl-color-cyan-900: hsl(196.4 63.6% 23.7%);--sl-color-cyan-950: hsl(196.8 61% 16.1%);--sl-color-sky-50: hsl(204 100% 97.1%);--sl-color-sky-100: hsl(204 93.8% 93.7%);--sl-color-sky-200: hsl(200.6 94.4% 86.1%);--sl-color-sky-300: hsl(199.4 95.5% 73.9%);--sl-color-sky-400: hsl(198.4 93.2% 59.6%);--sl-color-sky-500: hsl(198.6 88.7% 48.4%);--sl-color-sky-600: hsl(200.4 98% 39.4%);--sl-color-sky-700: hsl(201.3 96.3% 32.2%);--sl-color-sky-800: hsl(201 90% 27.5%);--sl-color-sky-900: hsl(202 80.3% 23.9%);--sl-color-sky-950: hsl(202.3 73.8% 16.5%);--sl-color-blue-50: hsl(213.8 100% 96.9%);--sl-color-blue-100: hsl(214.3 94.6% 92.7%);--sl-color-blue-200: hsl(213.3 96.9% 87.3%);--sl-color-blue-300: hsl(211.7 96.4% 78.4%);--sl-color-blue-400: hsl(213.1 93.9% 67.8%);--sl-color-blue-500: hsl(217.2 91.2% 59.8%);--sl-color-blue-600: hsl(221.2 83.2% 53.3%);--sl-color-blue-700: hsl(224.3 76.3% 48%);--sl-color-blue-800: hsl(225.9 70.7% 40.2%);--sl-color-blue-900: hsl(224.4 64.3% 32.9%);--sl-color-blue-950: hsl(226.2 55.3% 18.4%);--sl-color-indigo-50: hsl(225.9 100% 96.7%);--sl-color-indigo-100: hsl(226.5 100% 93.9%);--sl-color-indigo-200: hsl(228 96.5% 88.8%);--sl-color-indigo-300: hsl(229.7 93.5% 81.8%);--sl-color-indigo-400: hsl(234.5 89.5% 73.9%);--sl-color-indigo-500: hsl(238.7 83.5% 66.7%);--sl-color-indigo-600: hsl(243.4 75.4% 58.6%);--sl-color-indigo-700: hsl(244.5 57.9% 50.6%);--sl-color-indigo-800: hsl(243.7 54.5% 41.4%);--sl-color-indigo-900: hsl(242.2 47.4% 34.3%);--sl-color-indigo-950: hsl(243.5 43.6% 22.9%);--sl-color-violet-50: hsl(250 100% 97.6%);--sl-color-violet-100: hsl(251.4 91.3% 95.5%);--sl-color-violet-200: hsl(250.5 95.2% 91.8%);--sl-color-violet-300: hsl(252.5 94.7% 85.1%);--sl-color-violet-400: hsl(255.1 91.7% 76.3%);--sl-color-violet-500: hsl(258.3 89.5% 66.3%);--sl-color-violet-600: hsl(262.1 83.3% 57.8%);--sl-color-violet-700: hsl(263.4 70% 50.4%);--sl-color-violet-800: hsl(263.4 69.3% 42.2%);--sl-color-violet-900: hsl(263.5 67.4% 34.9%);--sl-color-violet-950: hsl(265.1 61.5% 21.4%);--sl-color-purple-50: hsl(270 100% 98%);--sl-color-purple-100: hsl(268.7 100% 95.5%);--sl-color-purple-200: hsl(268.6 100% 91.8%);--sl-color-purple-300: hsl(269.2 97.4% 85.1%);--sl-color-purple-400: hsl(270 95.2% 75.3%);--sl-color-purple-500: hsl(270.7 91% 65.1%);--sl-color-purple-600: hsl(271.5 81.3% 55.9%);--sl-color-purple-700: hsl(272.1 71.7% 47.1%);--sl-color-purple-800: hsl(272.9 67.2% 39.4%);--sl-color-purple-900: hsl(273.6 65.6% 32%);--sl-color-purple-950: hsl(276 59.5% 16.5%);--sl-color-fuchsia-50: hsl(289.1 100% 97.8%);--sl-color-fuchsia-100: hsl(287 100% 95.5%);--sl-color-fuchsia-200: hsl(288.3 95.8% 90.6%);--sl-color-fuchsia-300: hsl(291.1 93.1% 82.9%);--sl-color-fuchsia-400: hsl(292 91.4% 72.5%);--sl-color-fuchsia-500: hsl(292.2 84.1% 60.6%);--sl-color-fuchsia-600: hsl(293.4 69.5% 48.8%);--sl-color-fuchsia-700: hsl(294.7 72.4% 39.8%);--sl-color-fuchsia-800: hsl(295.4 70.2% 32.9%);--sl-color-fuchsia-900: hsl(296.7 63.6% 28%);--sl-color-fuchsia-950: hsl(297.1 56.8% 14.5%);--sl-color-pink-50: hsl(327.3 73.3% 97.1%);--sl-color-pink-100: hsl(325.7 77.8% 94.7%);--sl-color-pink-200: hsl(325.9 84.6% 89.8%);--sl-color-pink-300: hsl(327.4 87.1% 81.8%);--sl-color-pink-400: hsl(328.6 85.5% 70.2%);--sl-color-pink-500: hsl(330.4 81.2% 60.4%);--sl-color-pink-600: hsl(333.3 71.4% 50.6%);--sl-color-pink-700: hsl(335.1 77.6% 42%);--sl-color-pink-800: hsl(335.8 74.4% 35.3%);--sl-color-pink-900: hsl(335.9 69% 30.4%);--sl-color-pink-950: hsl(336.2 65.4% 15.9%);--sl-color-rose-50: hsl(355.7 100% 97.3%);--sl-color-rose-100: hsl(355.6 100% 94.7%);--sl-color-rose-200: hsl(352.7 96.1% 90%);--sl-color-rose-300: hsl(352.6 95.7% 81.8%);--sl-color-rose-400: hsl(351.3 94.5% 71.4%);--sl-color-rose-500: hsl(349.7 89.2% 60.2%);--sl-color-rose-600: hsl(346.8 77.2% 49.8%);--sl-color-rose-700: hsl(345.3 82.7% 40.8%);--sl-color-rose-800: hsl(343.4 79.7% 34.7%);--sl-color-rose-900: hsl(341.5 75.5% 30.4%);--sl-color-rose-950: hsl(341.3 70.1% 17.1%);--sl-color-primary-50: var(--sl-color-sky-50);--sl-color-primary-100: var(--sl-color-sky-100);--sl-color-primary-200: var(--sl-color-sky-200);--sl-color-primary-300: var(--sl-color-sky-300);--sl-color-primary-400: var(--sl-color-sky-400);--sl-color-primary-500: var(--sl-color-sky-500);--sl-color-primary-600: var(--sl-color-sky-600);--sl-color-primary-700: var(--sl-color-sky-700);--sl-color-primary-800: var(--sl-color-sky-800);--sl-color-primary-900: var(--sl-color-sky-900);--sl-color-primary-950: var(--sl-color-sky-950);--sl-color-success-50: var(--sl-color-green-50);--sl-color-success-100: var(--sl-color-green-100);--sl-color-success-200: var(--sl-color-green-200);--sl-color-success-300: var(--sl-color-green-300);--sl-color-success-400: var(--sl-color-green-400);--sl-color-success-500: var(--sl-color-green-500);--sl-color-success-600: var(--sl-color-green-600);--sl-color-success-700: var(--sl-color-green-700);--sl-color-success-800: var(--sl-color-green-800);--sl-color-success-900: var(--sl-color-green-900);--sl-color-success-950: var(--sl-color-green-950);--sl-color-warning-50: var(--sl-color-amber-50);--sl-color-warning-100: var(--sl-color-amber-100);--sl-color-warning-200: var(--sl-color-amber-200);--sl-color-warning-300: var(--sl-color-amber-300);--sl-color-warning-400: var(--sl-color-amber-400);--sl-color-warning-500: var(--sl-color-amber-500);--sl-color-warning-600: var(--sl-color-amber-600);--sl-color-warning-700: var(--sl-color-amber-700);--sl-color-warning-800: var(--sl-color-amber-800);--sl-color-warning-900: var(--sl-color-amber-900);--sl-color-warning-950: var(--sl-color-amber-950);--sl-color-danger-50: var(--sl-color-red-50);--sl-color-danger-100: var(--sl-color-red-100);--sl-color-danger-200: var(--sl-color-red-200);--sl-color-danger-300: var(--sl-color-red-300);--sl-color-danger-400: var(--sl-color-red-400);--sl-color-danger-500: var(--sl-color-red-500);--sl-color-danger-600: var(--sl-color-red-600);--sl-color-danger-700: var(--sl-color-red-700);--sl-color-danger-800: var(--sl-color-red-800);--sl-color-danger-900: var(--sl-color-red-900);--sl-color-danger-950: var(--sl-color-red-950);--sl-color-neutral-50: var(--sl-color-gray-50);--sl-color-neutral-100: var(--sl-color-gray-100);--sl-color-neutral-200: var(--sl-color-gray-200);--sl-color-neutral-300: var(--sl-color-gray-300);--sl-color-neutral-400: var(--sl-color-gray-400);--sl-color-neutral-500: var(--sl-color-gray-500);--sl-color-neutral-600: var(--sl-color-gray-600);--sl-color-neutral-700: var(--sl-color-gray-700);--sl-color-neutral-800: var(--sl-color-gray-800);--sl-color-neutral-900: var(--sl-color-gray-900);--sl-color-neutral-950: var(--sl-color-gray-950);--sl-color-neutral-0: hsl(0, 0%, 100%);--sl-color-neutral-1000: hsl(0, 0%, 0%);--sl-border-radius-small: .1875rem;--sl-border-radius-medium: .25rem;--sl-border-radius-large: .5rem;--sl-border-radius-x-large: 1rem;--sl-border-radius-circle: 50%;--sl-border-radius-pill: 9999px;--sl-shadow-x-small: 0 1px 2px hsl(240 3.8% 46.1% / 6%);--sl-shadow-small: 0 1px 2px hsl(240 3.8% 46.1% / 12%);--sl-shadow-medium: 0 2px 4px hsl(240 3.8% 46.1% / 12%);--sl-shadow-large: 0 2px 8px hsl(240 3.8% 46.1% / 12%);--sl-shadow-x-large: 0 4px 16px hsl(240 3.8% 46.1% / 12%);--sl-spacing-3x-small: .125rem;--sl-spacing-2x-small: .25rem;--sl-spacing-x-small: .5rem;--sl-spacing-small: .75rem;--sl-spacing-medium: 1rem;--sl-spacing-large: 1.25rem;--sl-spacing-x-large: 1.75rem;--sl-spacing-2x-large: 2.25rem;--sl-spacing-3x-large: 3rem;--sl-spacing-4x-large: 4.5rem;--sl-transition-x-slow: 1s;--sl-transition-slow: .5s;--sl-transition-medium: .25s;--sl-transition-fast: .15s;--sl-transition-x-fast: 50ms;--sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;--sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";--sl-font-serif: Georgia, "Times New Roman", serif;--sl-font-size-2x-small: .625rem;--sl-font-size-x-small: .75rem;--sl-font-size-small: .875rem;--sl-font-size-medium: 1rem;--sl-font-size-large: 1.25rem;--sl-font-size-x-large: 1.5rem;--sl-font-size-2x-large: 2.25rem;--sl-font-size-3x-large: 3rem;--sl-font-size-4x-large: 4.5rem;--sl-font-weight-light: 300;--sl-font-weight-normal: 400;--sl-font-weight-semibold: 500;--sl-font-weight-bold: 700;--sl-letter-spacing-denser: -.03em;--sl-letter-spacing-dense: -.015em;--sl-letter-spacing-normal: normal;--sl-letter-spacing-loose: .075em;--sl-letter-spacing-looser: .15em;--sl-line-height-denser: 1;--sl-line-height-dense: 1.4;--sl-line-height-normal: 1.8;--sl-line-height-loose: 2.2;--sl-line-height-looser: 2.6;--sl-focus-ring-color: var(--sl-color-primary-600);--sl-focus-ring-style: solid;--sl-focus-ring-width: 3px;--sl-focus-ring: var(--sl-focus-ring-style) var(--sl-focus-ring-width) var(--sl-focus-ring-color);--sl-focus-ring-offset: 1px;--sl-button-font-size-small: var(--sl-font-size-x-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-large: var(--sl-font-size-medium);--sl-input-height-small: 1.875rem;--sl-input-height-medium: 2.5rem;--sl-input-height-large: 3.125rem;--sl-input-background-color: var(--sl-color-neutral-0);--sl-input-background-color-hover: var(--sl-input-background-color);--sl-input-background-color-focus: var(--sl-input-background-color);--sl-input-background-color-disabled: var(--sl-color-neutral-100);--sl-input-border-color: var(--sl-color-neutral-300);--sl-input-border-color-hover: var(--sl-color-neutral-400);--sl-input-border-color-focus: var(--sl-color-primary-500);--sl-input-border-color-disabled: var(--sl-color-neutral-300);--sl-input-border-width: 1px;--sl-input-required-content: "*";--sl-input-required-content-offset: -2px;--sl-input-required-content-color: var(--sl-input-label-color);--sl-input-border-radius-small: var(--sl-border-radius-medium);--sl-input-border-radius-medium: var(--sl-border-radius-medium);--sl-input-border-radius-large: var(--sl-border-radius-medium);--sl-input-font-family: var(--sl-font-sans);--sl-input-font-weight: var(--sl-font-weight-normal);--sl-input-font-size-small: var(--sl-font-size-small);--sl-input-font-size-medium: var(--sl-font-size-medium);--sl-input-font-size-large: var(--sl-font-size-large);--sl-input-letter-spacing: var(--sl-letter-spacing-normal);--sl-input-color: var(--sl-color-neutral-700);--sl-input-color-hover: var(--sl-color-neutral-700);--sl-input-color-focus: var(--sl-color-neutral-700);--sl-input-color-disabled: var(--sl-color-neutral-900);--sl-input-icon-color: var(--sl-color-neutral-500);--sl-input-icon-color-hover: var(--sl-color-neutral-600);--sl-input-icon-color-focus: var(--sl-color-neutral-600);--sl-input-placeholder-color: var(--sl-color-neutral-500);--sl-input-placeholder-color-disabled: var(--sl-color-neutral-600);--sl-input-spacing-small: var(--sl-spacing-small);--sl-input-spacing-medium: var(--sl-spacing-medium);--sl-input-spacing-large: var(--sl-spacing-large);--sl-input-focus-ring-color: hsl(198.6 88.7% 48.4% / 40%);--sl-input-focus-ring-offset: 0;--sl-input-filled-background-color: var(--sl-color-neutral-100);--sl-input-filled-background-color-hover: var(--sl-color-neutral-100);--sl-input-filled-background-color-focus: var(--sl-color-neutral-100);--sl-input-filled-background-color-disabled: var(--sl-color-neutral-100);--sl-input-filled-color: var(--sl-color-neutral-800);--sl-input-filled-color-hover: var(--sl-color-neutral-800);--sl-input-filled-color-focus: var(--sl-color-neutral-700);--sl-input-filled-color-disabled: var(--sl-color-neutral-800);--sl-input-label-font-size-small: var(--sl-font-size-small);--sl-input-label-font-size-medium: var(--sl-font-size-medium);--sl-input-label-font-size-large: var(--sl-font-size-large);--sl-input-label-color: inherit;--sl-input-help-text-font-size-small: var(--sl-font-size-x-small);--sl-input-help-text-font-size-medium: var(--sl-font-size-small);--sl-input-help-text-font-size-large: var(--sl-font-size-medium);--sl-input-help-text-color: var(--sl-color-neutral-500);--sl-toggle-size-small: .875rem;--sl-toggle-size-medium: 1.125rem;--sl-toggle-size-large: 1.375rem;--sl-overlay-background-color: hsl(240 3.8% 46.1% / 33%);--sl-panel-background-color: var(--sl-color-neutral-0);--sl-panel-border-color: var(--sl-color-neutral-200);--sl-panel-border-width: 1px;--sl-tooltip-border-radius: var(--sl-border-radius-medium);--sl-tooltip-background-color: var(--sl-color-neutral-800);--sl-tooltip-color: var(--sl-color-neutral-0);--sl-tooltip-font-family: var(--sl-font-sans);--sl-tooltip-font-weight: var(--sl-font-weight-normal);--sl-tooltip-font-size: var(--sl-font-size-small);--sl-tooltip-line-height: var(--sl-line-height-dense);--sl-tooltip-padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);--sl-tooltip-arrow-size: 6px;--sl-z-index-drawer: 700;--sl-z-index-dialog: 800;--sl-z-index-dropdown: 900;--sl-z-index-toast: 950;--sl-z-index-tooltip: 1000}@supports (scrollbar-gutter: stable){.sl-scroll-lock{scrollbar-gutter:var(--sl-scroll-lock-gutter)!important}.sl-scroll-lock body{overflow:hidden!important}}@supports not (scrollbar-gutter: stable){.sl-scroll-lock body{padding-right:var(--sl-scroll-lock-size)!important;overflow:hidden!important}}.sl-toast-stack{position:fixed;top:0;inset-inline-end:0;z-index:var(--sl-z-index-toast);width:28rem;max-width:100%;max-height:100%;overflow:auto}.sl-toast-stack sl-alert{margin:var(--sl-spacing-medium)}.sl-toast-stack sl-alert::part(base){box-shadow:var(--sl-shadow-large)}@media(prefers-color-scheme:dark){:root{color-scheme:dark;--sl-color-gray-50: hsl(240 5.1% 15%);--sl-color-gray-100: hsl(240 5.7% 18.2%);--sl-color-gray-200: hsl(240 4.6% 22%);--sl-color-gray-300: hsl(240 5% 27.6%);--sl-color-gray-400: hsl(240 5% 35.5%);--sl-color-gray-500: hsl(240 3.7% 44%);--sl-color-gray-600: hsl(240 5.3% 58%);--sl-color-gray-700: hsl(240 5.6% 73%);--sl-color-gray-800: hsl(240 7.3% 84%);--sl-color-gray-900: hsl(240 9.1% 91.8%);--sl-color-gray-950: hsl(0 0% 95%);--sl-color-red-50: hsl(0 56% 23.9%);--sl-color-red-100: hsl(.6 60% 33.9%);--sl-color-red-200: hsl(.9 67.2% 37.1%);--sl-color-red-300: hsl(1.1 71.3% 43.7%);--sl-color-red-400: hsl(1 76% 52.5%);--sl-color-red-500: hsl(.7 89.6% 57.2%);--sl-color-red-600: hsl(0 98.6% 67.9%);--sl-color-red-700: hsl(0 100% 72.3%);--sl-color-red-800: hsl(0 100% 85.6%);--sl-color-red-900: hsl(0 100% 90.3%);--sl-color-red-950: hsl(0 100% 95.9%);--sl-color-orange-50: hsl(15 64.2% 23.3%);--sl-color-orange-100: hsl(15.1 70.9% 31.1%);--sl-color-orange-200: hsl(15.3 75.7% 35.5%);--sl-color-orange-300: hsl(17.1 83.5% 42.7%);--sl-color-orange-400: hsl(20.1 88% 50.8%);--sl-color-orange-500: hsl(24.3 100% 50.5%);--sl-color-orange-600: hsl(27.2 100% 57.7%);--sl-color-orange-700: hsl(31.3 100% 68.7%);--sl-color-orange-800: hsl(33.8 100% 79.3%);--sl-color-orange-900: hsl(38.9 100% 87.7%);--sl-color-orange-950: hsl(46.2 100% 95%);--sl-color-amber-50: hsl(21.9 66.3% 21.1%);--sl-color-amber-100: hsl(21.5 73.6% 29.7%);--sl-color-amber-200: hsl(22.3 77.6% 33.3%);--sl-color-amber-300: hsl(25.4 84.2% 39.6%);--sl-color-amber-400: hsl(31.4 87.4% 46.7%);--sl-color-amber-500: hsl(37 96.6% 48.3%);--sl-color-amber-600: hsl(43.3 100% 53.4%);--sl-color-amber-700: hsl(46.5 100% 61.1%);--sl-color-amber-800: hsl(49.3 100% 73%);--sl-color-amber-900: hsl(51.8 100% 85%);--sl-color-amber-950: hsl(60 100% 94.6%);--sl-color-yellow-50: hsl(32.5 60% 18.2%);--sl-color-yellow-100: hsl(28.1 68.6% 29%);--sl-color-yellow-200: hsl(31.3 75.8% 30.8%);--sl-color-yellow-300: hsl(34.7 84.4% 35.3%);--sl-color-yellow-400: hsl(40.1 87.3% 43.3%);--sl-color-yellow-500: hsl(44.7 88% 46%);--sl-color-yellow-600: hsl(47.7 100% 50.9%);--sl-color-yellow-700: hsl(51.3 100% 59.9%);--sl-color-yellow-800: hsl(54.6 100% 73%);--sl-color-yellow-900: hsl(58.9 100% 84.2%);--sl-color-yellow-950: hsl(60 100% 94%);--sl-color-lime-50: hsl(86.5 54.4% 18%);--sl-color-lime-100: hsl(87.6 56.8% 23.3%);--sl-color-lime-200: hsl(85.8 63.2% 24.5%);--sl-color-lime-300: hsl(86.1 72% 29.4%);--sl-color-lime-400: hsl(85.5 76.8% 37.3%);--sl-color-lime-500: hsl(84.3 74.2% 42.1%);--sl-color-lime-600: hsl(82.8 81.5% 52.6%);--sl-color-lime-700: hsl(82 89.9% 64%);--sl-color-lime-800: hsl(80.9 97.9% 76.6%);--sl-color-lime-900: hsl(77.9 100% 85.8%);--sl-color-lime-950: hsl(69.5 100% 93.8%);--sl-color-green-50: hsl(144.3 53.6% 16%);--sl-color-green-100: hsl(143.2 55.4% 23.5%);--sl-color-green-200: hsl(141.5 58.2% 26.3%);--sl-color-green-300: hsl(140.8 64.2% 31.8%);--sl-color-green-400: hsl(140.3 68% 39.2%);--sl-color-green-500: hsl(141.1 64.9% 43%);--sl-color-green-600: hsl(141.6 72.4% 55.2%);--sl-color-green-700: hsl(141.7 82.7% 70.1%);--sl-color-green-800: hsl(141 90.9% 82.1%);--sl-color-green-900: hsl(142 100% 89.1%);--sl-color-green-950: hsl(144 100% 95.5%);--sl-color-emerald-50: hsl(164.3 75% 13.5%);--sl-color-emerald-100: hsl(163.5 72.6% 20.1%);--sl-color-emerald-200: hsl(162.1 73.7% 22.4%);--sl-color-emerald-300: hsl(161.3 77.3% 27.6%);--sl-color-emerald-400: hsl(159.6 77.1% 34.3%);--sl-color-emerald-500: hsl(159.1 73.5% 37.9%);--sl-color-emerald-600: hsl(157.8 66.8% 48.9%);--sl-color-emerald-700: hsl(156.2 76.1% 63.8%);--sl-color-emerald-800: hsl(152.4 84.4% 77.4%);--sl-color-emerald-900: hsl(149.3 100% 87%);--sl-color-emerald-950: hsl(158.6 100% 94.8%);--sl-color-teal-50: hsl(176.5 51.5% 15.4%);--sl-color-teal-100: hsl(175.9 54.7% 22.3%);--sl-color-teal-200: hsl(175.9 60.7% 23.9%);--sl-color-teal-300: hsl(174.5 67.3% 28.8%);--sl-color-teal-400: hsl(174.4 71.9% 34.9%);--sl-color-teal-500: hsl(173.1 71% 38.3%);--sl-color-teal-600: hsl(172.3 68.2% 48.1%);--sl-color-teal-700: hsl(170.5 81.3% 61.5%);--sl-color-teal-800: hsl(168.4 92.1% 75.2%);--sl-color-teal-900: hsl(168.3 100% 86%);--sl-color-teal-950: hsl(180 100% 95.5%);--sl-color-cyan-50: hsl(197.1 53.8% 20.3%);--sl-color-cyan-100: hsl(196.8 57.3% 27.2%);--sl-color-cyan-200: hsl(195.3 62.7% 29.4%);--sl-color-cyan-300: hsl(193.5 71.3% 34.1%);--sl-color-cyan-400: hsl(192.5 76.8% 40.6%);--sl-color-cyan-500: hsl(189.4 78.6% 42.6%);--sl-color-cyan-600: hsl(188.2 89.1% 51.7%);--sl-color-cyan-700: hsl(187 98.6% 66.2%);--sl-color-cyan-800: hsl(184.9 100% 78.3%);--sl-color-cyan-900: hsl(180 100% 86.6%);--sl-color-cyan-950: hsl(180 100% 94.8%);--sl-color-sky-50: hsl(203 63.8% 20.9%);--sl-color-sky-100: hsl(203.4 70.4% 28%);--sl-color-sky-200: hsl(202.7 75.8% 30.8%);--sl-color-sky-300: hsl(203.1 80.4% 36.1%);--sl-color-sky-400: hsl(202.1 80.5% 44.3%);--sl-color-sky-500: hsl(199.7 85.9% 47.7%);--sl-color-sky-600: hsl(198.7 97.9% 57.2%);--sl-color-sky-700: hsl(198.7 100% 70.5%);--sl-color-sky-800: hsl(198.8 100% 82.5%);--sl-color-sky-900: hsl(198.5 100% 89.9%);--sl-color-sky-950: hsl(186 100% 95.5%);--sl-color-blue-50: hsl(227.1 49.5% 22.7%);--sl-color-blue-100: hsl(225.8 58.9% 36.8%);--sl-color-blue-200: hsl(227.7 64.4% 42.9%);--sl-color-blue-300: hsl(226.1 72.7% 51.2%);--sl-color-blue-400: hsl(222.6 86.5% 56.3%);--sl-color-blue-500: hsl(217.8 95.8% 57.4%);--sl-color-blue-600: hsl(213.3 100% 65%);--sl-color-blue-700: hsl(210.9 100% 74.8%);--sl-color-blue-800: hsl(211.5 100% 83.4%);--sl-color-blue-900: hsl(211 100% 88.9%);--sl-color-blue-950: hsl(201.8 100% 95.3%);--sl-color-indigo-50: hsl(243.5 40.8% 27%);--sl-color-indigo-100: hsl(242.9 45.7% 37.6%);--sl-color-indigo-200: hsl(244.7 52.7% 43.1%);--sl-color-indigo-300: hsl(245.3 60.5% 52.4%);--sl-color-indigo-400: hsl(244.1 79.2% 60.4%);--sl-color-indigo-500: hsl(239.6 88.7% 63.8%);--sl-color-indigo-600: hsl(234.5 96.7% 70.9%);--sl-color-indigo-700: hsl(229.4 100% 78.3%);--sl-color-indigo-800: hsl(227.1 100% 85%);--sl-color-indigo-900: hsl(223.8 100% 89.9%);--sl-color-indigo-950: hsl(220 100% 95.1%);--sl-color-violet-50: hsl(265.1 57.3% 25.4%);--sl-color-violet-100: hsl(263.5 63.8% 39.4%);--sl-color-violet-200: hsl(263.4 66.2% 44.1%);--sl-color-violet-300: hsl(263.7 72.8% 52.4%);--sl-color-violet-400: hsl(262.5 87.3% 59.8%);--sl-color-violet-500: hsl(258.3 95.1% 63.2%);--sl-color-violet-600: hsl(255.1 100% 67.2%);--sl-color-violet-700: hsl(253 100% 81.5%);--sl-color-violet-800: hsl(251.7 100% 87.9%);--sl-color-violet-900: hsl(254.1 100% 91.7%);--sl-color-violet-950: hsl(257.1 100% 96.1%);--sl-color-purple-50: hsl(276 54.3% 20.5%);--sl-color-purple-100: hsl(273.6 61.8% 35.4%);--sl-color-purple-200: hsl(272.9 64% 41.4%);--sl-color-purple-300: hsl(271.9 68.1% 49.2%);--sl-color-purple-400: hsl(271.5 85.1% 57.8%);--sl-color-purple-500: hsl(270.7 96.4% 62.1%);--sl-color-purple-600: hsl(270.5 100% 71.9%);--sl-color-purple-700: hsl(270.9 100% 81.3%);--sl-color-purple-800: hsl(272.4 100% 87.7%);--sl-color-purple-900: hsl(276.7 100% 91.5%);--sl-color-purple-950: hsl(300 100% 96.5%);--sl-color-fuchsia-50: hsl(297.1 51.2% 18.6%);--sl-color-fuchsia-100: hsl(296.7 59.5% 31.5%);--sl-color-fuchsia-200: hsl(295.4 65.4% 35.1%);--sl-color-fuchsia-300: hsl(294.6 67.4% 42.2%);--sl-color-fuchsia-400: hsl(293.3 68.7% 51.2%);--sl-color-fuchsia-500: hsl(292.1 88.4% 57.7%);--sl-color-fuchsia-600: hsl(292 98.5% 59.5%);--sl-color-fuchsia-700: hsl(292.4 100% 79.5%);--sl-color-fuchsia-800: hsl(292.9 100% 86.8%);--sl-color-fuchsia-900: hsl(300 100% 91.5%);--sl-color-fuchsia-950: hsl(300 100% 96.3%);--sl-color-pink-50: hsl(336.2 59.6% 20%);--sl-color-pink-100: hsl(336.8 63.9% 34%);--sl-color-pink-200: hsl(336.8 68.7% 37.6%);--sl-color-pink-300: hsl(336.1 71.8% 44.5%);--sl-color-pink-400: hsl(333.9 74.9% 53.1%);--sl-color-pink-500: hsl(330.7 86.3% 57.7%);--sl-color-pink-600: hsl(328.6 91.5% 67.2%);--sl-color-pink-700: hsl(327.4 97.6% 78.7%);--sl-color-pink-800: hsl(325.1 100% 86.6%);--sl-color-pink-900: hsl(322.1 100% 91.3%);--sl-color-pink-950: hsl(315 100% 95.9%);--sl-color-rose-50: hsl(342.3 62.9% 21.5%);--sl-color-rose-100: hsl(342.8 68.9% 34.2%);--sl-color-rose-200: hsl(344.8 72.6% 37.3%);--sl-color-rose-300: hsl(346.9 75.8% 43.7%);--sl-color-rose-400: hsl(348.2 80.1% 52.7%);--sl-color-rose-500: hsl(350.4 94.8% 57.5%);--sl-color-rose-600: hsl(351.2 100% 58.1%);--sl-color-rose-700: hsl(352.3 100% 78.1%);--sl-color-rose-800: hsl(352 100% 86.2%);--sl-color-rose-900: hsl(354.5 100% 90.7%);--sl-color-rose-950: hsl(353.3 100% 95.7%);--sl-color-primary-50: var(--sl-color-sky-50);--sl-color-primary-100: var(--sl-color-sky-100);--sl-color-primary-200: var(--sl-color-sky-200);--sl-color-primary-300: var(--sl-color-sky-300);--sl-color-primary-400: var(--sl-color-sky-400);--sl-color-primary-500: var(--sl-color-sky-500);--sl-color-primary-600: var(--sl-color-sky-600);--sl-color-primary-700: var(--sl-color-sky-700);--sl-color-primary-800: var(--sl-color-sky-800);--sl-color-primary-900: var(--sl-color-sky-900);--sl-color-primary-950: var(--sl-color-sky-950);--sl-color-success-50: var(--sl-color-green-50);--sl-color-success-100: var(--sl-color-green-100);--sl-color-success-200: var(--sl-color-green-200);--sl-color-success-300: var(--sl-color-green-300);--sl-color-success-400: var(--sl-color-green-400);--sl-color-success-500: var(--sl-color-green-500);--sl-color-success-600: var(--sl-color-green-600);--sl-color-success-700: var(--sl-color-green-700);--sl-color-success-800: var(--sl-color-green-800);--sl-color-success-900: var(--sl-color-green-900);--sl-color-success-950: var(--sl-color-green-950);--sl-color-warning-50: var(--sl-color-amber-50);--sl-color-warning-100: var(--sl-color-amber-100);--sl-color-warning-200: var(--sl-color-amber-200);--sl-color-warning-300: var(--sl-color-amber-300);--sl-color-warning-400: var(--sl-color-amber-400);--sl-color-warning-500: var(--sl-color-amber-500);--sl-color-warning-600: var(--sl-color-amber-600);--sl-color-warning-700: var(--sl-color-amber-700);--sl-color-warning-800: var(--sl-color-amber-800);--sl-color-warning-900: var(--sl-color-amber-900);--sl-color-warning-950: var(--sl-color-amber-950);--sl-color-danger-50: var(--sl-color-red-50);--sl-color-danger-100: var(--sl-color-red-100);--sl-color-danger-200: var(--sl-color-red-200);--sl-color-danger-300: var(--sl-color-red-300);--sl-color-danger-400: var(--sl-color-red-400);--sl-color-danger-500: var(--sl-color-red-500);--sl-color-danger-600: var(--sl-color-red-600);--sl-color-danger-700: var(--sl-color-red-700);--sl-color-danger-800: var(--sl-color-red-800);--sl-color-danger-900: var(--sl-color-red-900);--sl-color-danger-950: var(--sl-color-red-950);--sl-color-neutral-50: var(--sl-color-gray-50);--sl-color-neutral-100: var(--sl-color-gray-100);--sl-color-neutral-200: var(--sl-color-gray-200);--sl-color-neutral-300: var(--sl-color-gray-300);--sl-color-neutral-400: var(--sl-color-gray-400);--sl-color-neutral-500: var(--sl-color-gray-500);--sl-color-neutral-600: var(--sl-color-gray-600);--sl-color-neutral-700: var(--sl-color-gray-700);--sl-color-neutral-800: var(--sl-color-gray-800);--sl-color-neutral-900: var(--sl-color-gray-900);--sl-color-neutral-950: var(--sl-color-gray-950);--sl-color-neutral-0: hsl(240, 5.9%, 11%);--sl-color-neutral-1000: hsl(0, 0%, 100%);--sl-border-radius-small: .1875rem;--sl-border-radius-medium: .25rem;--sl-border-radius-large: .5rem;--sl-border-radius-x-large: 1rem;--sl-border-radius-circle: 50%;--sl-border-radius-pill: 9999px;--sl-shadow-x-small: 0 1px 2px rgb(0 0 0 / 18%);--sl-shadow-small: 0 1px 2px rgb(0 0 0 / 24%);--sl-shadow-medium: 0 2px 4px rgb(0 0 0 / 24%);--sl-shadow-large: 0 2px 8px rgb(0 0 0 / 24%);--sl-shadow-x-large: 0 4px 16px rgb(0 0 0 / 24%);--sl-spacing-3x-small: .125rem;--sl-spacing-2x-small: .25rem;--sl-spacing-x-small: .5rem;--sl-spacing-small: .75rem;--sl-spacing-medium: 1rem;--sl-spacing-large: 1.25rem;--sl-spacing-x-large: 1.75rem;--sl-spacing-2x-large: 2.25rem;--sl-spacing-3x-large: 3rem;--sl-spacing-4x-large: 4.5rem;--sl-transition-x-slow: 1s;--sl-transition-slow: .5s;--sl-transition-medium: .25s;--sl-transition-fast: .15s;--sl-transition-x-fast: 50ms;--sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;--sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";--sl-font-serif: Georgia, "Times New Roman", serif;--sl-font-size-2x-small: .625rem;--sl-font-size-x-small: .75rem;--sl-font-size-small: .875rem;--sl-font-size-medium: 1rem;--sl-font-size-large: 1.25rem;--sl-font-size-x-large: 1.5rem;--sl-font-size-2x-large: 2.25rem;--sl-font-size-3x-large: 3rem;--sl-font-size-4x-large: 4.5rem;--sl-font-weight-light: 300;--sl-font-weight-normal: 400;--sl-font-weight-semibold: 500;--sl-font-weight-bold: 700;--sl-letter-spacing-denser: -.03em;--sl-letter-spacing-dense: -.015em;--sl-letter-spacing-normal: normal;--sl-letter-spacing-loose: .075em;--sl-letter-spacing-looser: .15em;--sl-line-height-denser: 1;--sl-line-height-dense: 1.4;--sl-line-height-normal: 1.8;--sl-line-height-loose: 2.2;--sl-line-height-looser: 2.6;--sl-focus-ring-color: var(--sl-color-primary-700);--sl-focus-ring-style: solid;--sl-focus-ring-width: 3px;--sl-focus-ring: var(--sl-focus-ring-style) var(--sl-focus-ring-width) var(--sl-focus-ring-color);--sl-focus-ring-offset: 1px;--sl-button-font-size-small: var(--sl-font-size-x-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-large: var(--sl-font-size-medium);--sl-input-height-small: 1.875rem;--sl-input-height-medium: 2.5rem;--sl-input-height-large: 3.125rem;--sl-input-background-color: var(--sl-color-neutral-0);--sl-input-background-color-hover: var(--sl-input-background-color);--sl-input-background-color-focus: var(--sl-input-background-color);--sl-input-background-color-disabled: var(--sl-color-neutral-100);--sl-input-border-color: var(--sl-color-neutral-400);--sl-input-border-color-hover: var(--sl-color-neutral-500);--sl-input-border-color-focus: var(--sl-color-primary-600);--sl-input-border-color-disabled: var(--sl-color-neutral-400);--sl-input-border-width: 1px;--sl-input-required-content: "*";--sl-input-required-content-offset: -2px;--sl-input-required-content-color: var(--sl-input-label-color);--sl-input-border-radius-small: var(--sl-border-radius-medium);--sl-input-border-radius-medium: var(--sl-border-radius-medium);--sl-input-border-radius-large: var(--sl-border-radius-medium);--sl-input-font-family: var(--sl-font-sans);--sl-input-font-weight: var(--sl-font-weight-normal);--sl-input-font-size-small: var(--sl-font-size-small);--sl-input-font-size-medium: var(--sl-font-size-medium);--sl-input-font-size-large: var(--sl-font-size-large);--sl-input-letter-spacing: var(--sl-letter-spacing-normal);--sl-input-color: var(--sl-color-neutral-700);--sl-input-color-hover: var(--sl-color-neutral-700);--sl-input-color-focus: var(--sl-color-neutral-700);--sl-input-color-disabled: var(--sl-color-neutral-900);--sl-input-icon-color: var(--sl-color-neutral-500);--sl-input-icon-color-hover: var(--sl-color-neutral-600);--sl-input-icon-color-focus: var(--sl-color-neutral-600);--sl-input-placeholder-color: var(--sl-color-neutral-500);--sl-input-placeholder-color-disabled: var(--sl-color-neutral-600);--sl-input-spacing-small: var(--sl-spacing-small);--sl-input-spacing-medium: var(--sl-spacing-medium);--sl-input-spacing-large: var(--sl-spacing-large);--sl-input-focus-ring-color: hsl(198.6 88.7% 48.4% / 40%);--sl-input-focus-ring-offset: 0;--sl-input-filled-background-color: var(--sl-color-neutral-100);--sl-input-filled-background-color-hover: var(--sl-color-neutral-100);--sl-input-filled-background-color-focus: var(--sl-color-neutral-100);--sl-input-filled-background-color-disabled: var(--sl-color-neutral-100);--sl-input-filled-color: var(--sl-color-neutral-800);--sl-input-filled-color-hover: var(--sl-color-neutral-800);--sl-input-filled-color-focus: var(--sl-color-neutral-700);--sl-input-filled-color-disabled: var(--sl-color-neutral-800);--sl-input-label-font-size-small: var(--sl-font-size-small);--sl-input-label-font-size-medium: var(--sl-font-size-medium);--sl-input-label-font-size-large: var(--sl-font-size-large);--sl-input-label-color: inherit;--sl-input-help-text-font-size-small: var(--sl-font-size-x-small);--sl-input-help-text-font-size-medium: var(--sl-font-size-small);--sl-input-help-text-font-size-large: var(--sl-font-size-medium);--sl-input-help-text-color: var(--sl-color-neutral-600);--sl-toggle-size-small: .875rem;--sl-toggle-size-medium: 1.125rem;--sl-toggle-size-large: 1.375rem;--sl-overlay-background-color: hsl(0 0% 0% / 43%);--sl-panel-background-color: var(--sl-color-neutral-50);--sl-panel-border-color: var(--sl-color-neutral-200);--sl-panel-border-width: 1px;--sl-tooltip-border-radius: var(--sl-border-radius-medium);--sl-tooltip-background-color: var(--sl-color-neutral-800);--sl-tooltip-color: var(--sl-color-neutral-0);--sl-tooltip-font-family: var(--sl-font-sans);--sl-tooltip-font-weight: var(--sl-font-weight-normal);--sl-tooltip-font-size: var(--sl-font-size-small);--sl-tooltip-line-height: var(--sl-line-height-dense);--sl-tooltip-padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);--sl-tooltip-arrow-size: 6px;--sl-z-index-drawer: 700;--sl-z-index-dialog: 800;--sl-z-index-dropdown: 900;--sl-z-index-toast: 950;--sl-z-index-tooltip: 1000}}:root{--band: #1d4ed8;--band-ink: #ffffff;--rail: #064e3b;--rail-group: #059669;--rail-button: 44px;--power-on: #4ade80;--stop: #ef4444;--sl-color-primary-50: var(--sl-color-blue-100);--sl-color-primary-100: var(--sl-color-blue-200);--sl-color-primary-200: var(--sl-color-blue-300);--sl-color-primary-300: var(--sl-color-blue-400);--sl-color-primary-400: var(--sl-color-blue-500);--sl-color-primary-500: var(--sl-color-blue-600);--sl-color-primary-600: var(--sl-color-blue-700);--sl-color-primary-700: var(--sl-color-blue-800);--sl-color-primary-800: var(--sl-color-blue-900);--sl-color-primary-900: var(--sl-color-blue-950);--sl-color-primary-950: var(--sl-color-blue-950);--sl-input-height-small: 1.75rem;--sl-input-height-medium: 2.25rem;--sl-input-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-border-radius-medium: 3px;--sl-focus-ring-width: 2px;--sl-focus-ring-color: color-mix(in srgb, var(--band) 60%, transparent);--sl-tooltip-background-color: var(--band);--sl-tooltip-color: var(--band-ink);--sl-tooltip-font-size: var(--sl-font-size-x-small)}look-band:not(:defined){display:block;height:60px;background:var(--band)}', co = {
  /** An arrow most of the way round the selection: a quarter turn. */
  rotate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M3.76 12.24A6 6 0 1 1 14 8h-1A5 5 0 1 0 4.46 11.54Z"/><path d="M11.5 8h4l-2 2.6Z"/><path d="M6 6h4v4H6Z"/></svg>',
  /** A lever on its quadrant. */
  throttle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M1.89 9.78A6.5 6.5 0 0 1 14.11 9.78l-.94.34A5.5 5.5 0 0 0 2.83 10.12Z"/><path d="M8.63 12.3 12.01 5.05l-1.26-.6L7.37 11.7Z"/><circle cx="11.38" cy="4.75" r="1.6"/><path d="M1.5 12h13v1.5h-13Z"/></svg>'
}, tl = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -150 618.3 200" fill="currentColor"><path d="M-45.4 58L-39.4 41.2L-33 25.1L-26.3 9.8L-19.2 -4.9L-11.7 -18.8L-3.9 -32L4.3 -44.5L12.9 -56.2L21.9 -67.1L31.2 -77.1L40.9 -86.3L50.9 -94.6L61.2 -102L71.7 -108.5L82.5 -113.9L93.3 -118.4L104.3 -121.9L115.3 -124.4L126.3 -126L137.2 -126.7L148 -126.5L158.8 -125.5L169.4 -123.8L180.1 -121.3L180 -120.7L169.5 -122.6L159 -123.9L148.4 -124.4L137.9 -124.1L127.4 -123L116.8 -121L106.3 -118.2L95.9 -114.4L85.7 -109.7L75.6 -104.1L65.7 -97.6L56.1 -90.2L46.8 -81.9L37.8 -72.8L29.1 -62.8L20.8 -52.1L12.9 -40.6L5.3 -28.3L-1.9 -15.3L-8.8 -1.6L-15.3 12.8L-21.4 28L-27.2 43.8L-32.6 60.3Z"/><path d="M72.6 79.7L73.3 65.2L74.3 51.4L75.6 38.2L77.1 25.6L78.9 13.6L80.9 2.3L83.2 -8.4L85.8 -18.6L88.7 -28.2L91.8 -37.2L95.2 -45.7L98.9 -53.8L102.9 -61.4L107.3 -68.5L112.1 -75.3L117.4 -81.6L123.1 -87.5L129.4 -93L136.3 -98L143.8 -102.6L151.9 -106.6L160.6 -110.1L170 -113L180 -115.3L179.9 -114.7L170 -111.9L160.8 -108.5L152.3 -104.5L144.5 -100L137.4 -95L131 -89.6L125.2 -83.7L120 -77.6L115.3 -71.1L111.2 -64.2L107.4 -57L104.1 -49.4L101.1 -41.4L98.3 -32.9L95.9 -23.9L93.7 -14.5L91.8 -4.5L90.1 6L88.7 17.2L87.5 28.9L86.6 41.2L85.9 54.2L85.5 67.8L85.4 82Z"/><path transform="translate(190 0)" d="M50.9 -72Q52 -71.4 51.7 -69.9L49.3 -57Q49.1 -55.3 47.3 -56Q45.1 -56.7 42.3 -56.7Q40.4 -56.7 39.4 -56.6Q33.4 -56.3 29.4 -52.4Q25.4 -48.4 25.4 -42.1V-1.7Q25.4 -1 24.9 -0.5Q24.4 0 23.7 0H10.6Q9.9 0 9.4 -0.5Q8.9 -1 8.9 -1.7V-71.3Q8.9 -72 9.4 -72.5Q9.9 -73 10.6 -73H23.7Q24.4 -73 24.9 -72.5Q25.4 -72 25.4 -71.3V-64.9Q25.4 -64.3 25.6 -64.2Q25.9 -64.1 26.1 -64.6Q32.1 -73.9 42.9 -73.9Q47.4 -73.9 50.9 -72ZM119.9 -49.9V-1.7Q119.9 -1 119.4 -0.5Q118.9 0 118.1 0H105Q104.3 0 103.8 -0.5Q103.3 -1 103.3 -1.7V-6.3Q103.3 -6.7 103 -6.8Q102.7 -6.9 102.4 -6.6Q95.4 1.1 82.1 1.1Q71.4 1.1 64.5 -4.3Q57.6 -9.7 57.6 -20.4Q57.6 -31.6 65.4 -37.8Q73.1 -44 87.3 -44H102.6Q103.3 -44 103.3 -44.7V-48.1Q103.3 -53.7 100 -56.8Q96.7 -59.9 90.1 -59.9Q84.7 -59.9 81.4 -57.9Q78 -56 77.1 -52.6Q76.7 -50.9 75.1 -51.1L61.3 -52.9Q60.6 -53 60.1 -53.4Q59.6 -53.7 59.7 -54.3Q60.9 -63 69.1 -68.6Q77.3 -74.1 89.7 -74.1Q98.7 -74.1 105.6 -71Q112.4 -67.9 116.1 -62.4Q119.9 -56.9 119.9 -49.9ZM103.3 -25.1V-31.9Q103.3 -32.6 102.6 -32.6H90.6Q83 -32.6 78.6 -29.7Q74.3 -26.9 74.3 -21.6Q74.3 -17 77.6 -14.5Q81 -12 86.3 -12Q93.3 -12 98.3 -15.7Q103.3 -19.4 103.3 -25.1ZM135.7 -93.1Q135.7 -97.6 138.6 -100.4Q141.4 -103.3 145.9 -103.3Q150.3 -103.3 153.1 -100.4Q156 -97.6 156 -93.1Q156 -88.7 153.1 -85.9Q150.3 -83 145.9 -83Q141.4 -83 138.6 -85.9Q135.7 -88.7 135.7 -93.1ZM137.3 -1.7V-71.4Q137.3 -72.1 137.8 -72.6Q138.3 -73.1 139 -73.1H152.1Q152.9 -73.1 153.4 -72.6Q153.9 -72.1 153.9 -71.4V-1.7Q153.9 -1 153.4 -0.5Q152.9 0 152.1 0H139Q138.3 0 137.8 -0.5Q137.3 -1 137.3 -1.7ZM172.9 -1.7V-98.3Q172.9 -99 173.4 -99.5Q173.9 -100 174.6 -100H187.7Q188.4 -100 188.9 -99.5Q189.4 -99 189.4 -98.3V-1.7Q189.4 -1 188.9 -0.5Q188.4 0 187.7 0H174.6Q173.9 0 173.4 -0.5Q172.9 -1 172.9 -1.7ZM204.1 -19.4V-20.7Q204.1 -21.4 204.6 -21.9Q205.1 -22.4 205.9 -22.4H218.4Q219.1 -22.4 219.6 -21.9Q220.1 -21.4 220.1 -20.7V-20.4Q220.1 -16.9 224.1 -14.2Q228 -11.6 234 -11.6Q239.7 -11.6 243.3 -13.9Q246.9 -16.3 246.9 -19.9Q246.9 -23.1 243.9 -24.8Q241 -26.4 234.4 -28.3L229 -30Q221.7 -32.1 216.7 -34.6Q211.7 -37 208.3 -41.2Q204.9 -45.4 204.9 -52Q204.9 -62 212.7 -67.9Q220.6 -73.9 233.4 -73.9Q242.1 -73.9 248.7 -71.1Q255.3 -68.3 258.9 -63.4Q262.4 -58.4 262.4 -52.1Q262.4 -51.4 261.9 -50.9Q261.4 -50.4 260.7 -50.4H248.6Q247.9 -50.4 247.4 -50.9Q246.9 -51.4 246.9 -52.1Q246.9 -55.9 243.2 -58.4Q239.6 -60.9 233.3 -60.9Q227.7 -60.9 224.2 -58.8Q220.7 -56.7 220.7 -53Q220.7 -49.6 224.1 -47.8Q227.4 -46 235.3 -43.9L238.4 -43Q246 -40.7 251.1 -38.4Q256.3 -36 259.9 -31.8Q263.4 -27.6 263.4 -20.9Q263.4 -10.7 255.4 -4.9Q247.4 0.9 234.1 0.9Q225.1 0.9 218.4 -1.8Q211.6 -4.4 207.9 -9.1Q204.1 -13.7 204.1 -19.4ZM344.9 -39.4V-28Q344.9 -27.3 344.4 -26.8Q343.9 -26.3 343.1 -26.3H337.1Q336.4 -26.3 336.4 -25.6V-1.7Q336.4 -1 335.9 -0.5Q335.4 0 334.7 0H321.6Q320.9 0 320.4 -0.5Q319.9 -1 319.9 -1.7V-25.6Q319.9 -26.3 319.1 -26.3H275.7Q275 -26.3 274.5 -26.8Q274 -27.3 274 -28V-37.1Q274 -38 274.4 -39.3L301.4 -98.7Q302 -100 303.4 -100H317.4Q318.4 -100 318.8 -99.5Q319.1 -99 318.7 -98L293.3 -42Q293.1 -41.7 293.3 -41.4Q293.4 -41.1 293.7 -41.1H319.1Q319.9 -41.1 319.9 -41.9V-61.3Q319.9 -62 320.4 -62.5Q320.9 -63 321.6 -63H334.7Q335.4 -63 335.9 -62.5Q336.4 -62 336.4 -61.3V-41.9Q336.4 -41.1 337.1 -41.1H343.1Q343.9 -41.1 344.4 -40.6Q344.9 -40.1 344.9 -39.4ZM420.3 -68.3V-24.7Q420.3 -17 416.4 -11.1Q412.6 -5.3 405.6 -2.1Q398.7 1.1 389.7 1.1Q381 1.1 374.2 -2Q367.4 -5.1 363.6 -10.9Q359.9 -16.6 359.9 -24V-27.1Q359.9 -27.9 360.4 -28.4Q360.9 -28.9 361.6 -28.9H374.7Q375.4 -28.9 375.9 -28.4Q376.4 -27.9 376.4 -27.1V-26.1Q376.4 -20.4 380.1 -16.8Q383.9 -13.1 389.7 -13.1Q395.9 -13.1 399.8 -16.9Q403.7 -20.7 403.7 -26.7V-42.4Q403.7 -42.9 403.4 -43Q403.1 -43.1 402.9 -42.9Q396.7 -36.9 386.1 -36.9Q377.7 -36.9 371.4 -40.4Q365 -44 361.4 -50.7Q357.4 -57.9 357.4 -68.4Q357.4 -77.1 360.3 -83.7Q363.7 -91.9 371.1 -96.4Q378.6 -101 388.7 -101Q399.4 -101 407.1 -96.1Q414.7 -91.1 418 -82.3Q420.3 -76.3 420.3 -68.3ZM403.7 -69.1Q403.7 -74.6 401.9 -78.7Q398.4 -86.6 389 -86.6Q379.9 -86.6 376.1 -78.9Q374 -74.1 374 -68.7Q374 -62.3 376.6 -57.7Q380.6 -50.9 388.9 -50.9Q397.7 -50.9 401.4 -58Q403.7 -62.6 403.7 -69.1Z"/></svg>', el = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -150 200 200" fill="currentColor"><mask id="mark-knock"><rect x="0" y="-150" width="200" height="200" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="22"><path transform="translate(27.9 2) scale(0.95)" d="M76.3 -39.4V-28Q76.3 -27.3 75.8 -26.8Q75.3 -26.3 74.6 -26.3H68.6Q67.9 -26.3 67.9 -25.6V-1.7Q67.9 -1 67.4 -0.5Q66.9 0 66.1 0H53Q52.3 0 51.8 -0.5Q51.3 -1 51.3 -1.7V-25.6Q51.3 -26.3 50.6 -26.3H7.1Q6.4 -26.3 5.9 -26.8Q5.4 -27.3 5.4 -28V-37.1Q5.4 -38 5.9 -39.3L32.9 -98.7Q33.4 -100 34.9 -100H48.9Q49.9 -100 50.2 -99.5Q50.6 -99 50.1 -98L24.7 -42Q24.6 -41.7 24.7 -41.4Q24.9 -41.1 25.1 -41.1H50.6Q51.3 -41.1 51.3 -41.9V-61.3Q51.3 -62 51.8 -62.5Q52.3 -63 53 -63H66.1Q66.9 -63 67.4 -62.5Q67.9 -62 67.9 -61.3V-41.9Q67.9 -41.1 68.6 -41.1H74.6Q75.3 -41.1 75.8 -40.6Q76.3 -40.1 76.3 -39.4ZM151.7 -68.3V-24.7Q151.7 -17 147.9 -11.1Q144 -5.3 137.1 -2.1Q130.1 1.1 121.1 1.1Q112.4 1.1 105.6 -2Q98.9 -5.1 95.1 -10.9Q91.3 -16.6 91.3 -24V-27.1Q91.3 -27.9 91.8 -28.4Q92.3 -28.9 93 -28.9H106.1Q106.9 -28.9 107.4 -28.4Q107.9 -27.9 107.9 -27.1V-26.1Q107.9 -20.4 111.6 -16.8Q115.3 -13.1 121.1 -13.1Q127.3 -13.1 131.2 -16.9Q135.1 -20.7 135.1 -26.7V-42.4Q135.1 -42.9 134.9 -43Q134.6 -43.1 134.3 -42.9Q128.1 -36.9 117.6 -36.9Q109.1 -36.9 102.8 -40.4Q96.4 -44 92.9 -50.7Q88.9 -57.9 88.9 -68.4Q88.9 -77.1 91.7 -83.7Q95.1 -91.9 102.6 -96.4Q110 -101 120.1 -101Q130.9 -101 138.5 -96.1Q146.1 -91.1 149.4 -82.3Q151.7 -76.3 151.7 -68.3ZM135.1 -69.1Q135.1 -74.6 133.3 -78.7Q129.9 -86.6 120.4 -86.6Q111.3 -86.6 107.6 -78.9Q105.4 -74.1 105.4 -68.7Q105.4 -62.3 108 -57.7Q112 -50.9 120.3 -50.9Q129.1 -50.9 132.9 -58Q135.1 -62.6 135.1 -69.1Z"/></g></mask><g mask="url(#mark-knock)"><path d="M-38.1 59L-32.4 42.3L-26.3 26.3L-19.7 10.9L-12.7 -3.7L-5.3 -17.7L2.6 -30.9L10.9 -43.4L19.6 -55.2L28.8 -66.2L38.4 -76.3L48.3 -85.6L58.6 -94L69.3 -101.5L80.2 -108L91.3 -113.6L102.6 -118.3L114.1 -122L125.6 -124.7L137.1 -126.6L148.6 -127.7L160.2 -127.9L171.7 -127.3L183.3 -126.1L194.8 -124.1L194.9 -123.1L183.5 -124.3L172.1 -124.9L160.9 -124.8L149.8 -123.9L138.7 -122.3L127.8 -119.9L117 -116.7L106.3 -112.6L95.8 -107.7L85.5 -101.9L75.5 -95.2L65.8 -87.7L56.5 -79.4L47.5 -70.2L38.8 -60.2L30.6 -49.5L22.8 -38L15.4 -25.8L8.4 -12.9L1.8 0.7L-4.4 15L-10.1 30L-15.4 45.6L-20.3 61.8Z"/><path d="M80.3 78.2L80.8 64.2L81.6 50.9L82.6 38.1L84 25.9L85.7 14.3L87.8 3.3L90.1 -7.2L92.7 -17.2L95.7 -26.6L99 -35.6L102.6 -44.2L106.7 -52.3L111.1 -60L115.9 -67.3L121.2 -74.2L127 -80.7L133.4 -86.8L140.3 -92.6L147.9 -97.9L156.1 -102.7L164.9 -107.1L174.3 -110.9L184.4 -114.2L195.1 -116.9L195.2 -115.9L184.6 -112.5L174.7 -108.5L165.6 -104L157.2 -99L149.5 -93.6L142.6 -87.8L136.3 -81.6L130.7 -75.1L125.7 -68.3L121.3 -61.1L117.3 -53.7L113.9 -46L110.8 -38L108.1 -29.5L105.7 -20.7L103.7 -11.5L102 -1.8L100.5 8.4L99.4 19.1L98.6 30.4L98 42.2L97.7 54.6L97.8 67.5L98.1 81Z"/></g><path transform="translate(27.9 2) scale(0.95)" d="M76.3 -39.4V-28Q76.3 -27.3 75.8 -26.8Q75.3 -26.3 74.6 -26.3H68.6Q67.9 -26.3 67.9 -25.6V-1.7Q67.9 -1 67.4 -0.5Q66.9 0 66.1 0H53Q52.3 0 51.8 -0.5Q51.3 -1 51.3 -1.7V-25.6Q51.3 -26.3 50.6 -26.3H7.1Q6.4 -26.3 5.9 -26.8Q5.4 -27.3 5.4 -28V-37.1Q5.4 -38 5.9 -39.3L32.9 -98.7Q33.4 -100 34.9 -100H48.9Q49.9 -100 50.2 -99.5Q50.6 -99 50.1 -98L24.7 -42Q24.6 -41.7 24.7 -41.4Q24.9 -41.1 25.1 -41.1H50.6Q51.3 -41.1 51.3 -41.9V-61.3Q51.3 -62 51.8 -62.5Q52.3 -63 53 -63H66.1Q66.9 -63 67.4 -62.5Q67.9 -62 67.9 -61.3V-41.9Q67.9 -41.1 68.6 -41.1H74.6Q75.3 -41.1 75.8 -40.6Q76.3 -40.1 76.3 -39.4ZM151.7 -68.3V-24.7Q151.7 -17 147.9 -11.1Q144 -5.3 137.1 -2.1Q130.1 1.1 121.1 1.1Q112.4 1.1 105.6 -2Q98.9 -5.1 95.1 -10.9Q91.3 -16.6 91.3 -24V-27.1Q91.3 -27.9 91.8 -28.4Q92.3 -28.9 93 -28.9H106.1Q106.9 -28.9 107.4 -28.4Q107.9 -27.9 107.9 -27.1V-26.1Q107.9 -20.4 111.6 -16.8Q115.3 -13.1 121.1 -13.1Q127.3 -13.1 131.2 -16.9Q135.1 -20.7 135.1 -26.7V-42.4Q135.1 -42.9 134.9 -43Q134.6 -43.1 134.3 -42.9Q128.1 -36.9 117.6 -36.9Q109.1 -36.9 102.8 -40.4Q96.4 -44 92.9 -50.7Q88.9 -57.9 88.9 -68.4Q88.9 -77.1 91.7 -83.7Q95.1 -91.9 102.6 -96.4Q110 -101 120.1 -101Q130.9 -101 138.5 -96.1Q146.1 -91.1 149.4 -82.3Q151.7 -76.3 151.7 -68.3ZM135.1 -69.1Q135.1 -74.6 133.3 -78.7Q129.9 -86.6 120.4 -86.6Q111.3 -86.6 107.6 -78.9Q105.4 -74.1 105.4 -68.7Q105.4 -62.3 108 -57.7Q112 -50.9 120.3 -50.9Q129.1 -50.9 132.9 -58Q135.1 -62.6 135.1 -69.1Z"/></svg>', Ar = (t) => `data:image/svg+xml,${encodeURIComponent(t)}`;
Cr("rails49", {
  resolver: (t) => t in co ? Ar(co[t]) : ""
});
const zr = (t) => t in co ? "rails49" : "default", ol = {
  "--band": "#1d4ed8",
  "--band-ink": "#ffffff",
  "--rail": "#064e3b",
  "--rail-group": "#059669",
  "--rail-button": "44px",
  "--power-on": "#4ade80",
  "--stop": "#ef4444"
}, rl = 60, sl = 640, tr = 6, Er = 600, ge = `not all and (height > ${sl}px) and (width > ${Er}px)`, ll = Object.entries(ol).map(([t, e]) => `${t}: ${e};`).join(`
`), N = _`
  :host {
    ${W(ll)}
  }
`;
var il = Object.getOwnPropertyDescriptor, nl = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? il(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = i(s) || s);
  return s;
};
let ho = class extends E {
  render() {
    return x`
      <slot name="band"></slot>
      <div class="body">
        <slot name="rail"></slot>
        <div class="work"><slot></slot></div>
      </div>
    `;
  }
};
ho.styles = [
  N,
  _`
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

      @media ${W(ge)} {
        .body {
          flex-direction: column;
        }
      }
    `
];
ho = nl([
  O("look-shell")
], ho);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let uo = class extends Ao {
  constructor(e) {
    if (super(e), this.it = w, e.type !== ht.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(e) {
    if (e === w || e == null) return this._t = void 0, this.it = e;
    if (e === F) return e;
    if (typeof e != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (e === this.it) return this._t;
    this.it = e;
    const o = [e];
    return o.raw = o, this._t = { _$litType$: this.constructor.resultType, strings: o, values: [] };
  }
};
uo.directiveName = "unsafeHTML", uo.resultType = 1;
const er = Co(uo);
var al = _`
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
`, oe = Symbol(), xe = Symbol(), ro, so = /* @__PURE__ */ new Map(), Z = class extends H {
  constructor() {
    super(...arguments), this.initialRender = !1, this.svg = null, this.label = "", this.library = "default";
  }
  /** Given a URL, this function returns the resulting SVG element or an appropriate error symbol. */
  async resolveIcon(t, e) {
    var o;
    let r;
    if (e != null && e.spriteSheet)
      return this.svg = x`<svg part="svg">
        <use part="use" href="${t}"></use>
      </svg>`, this.svg;
    try {
      if (r = await fetch(t, { mode: "cors" }), !r.ok) return r.status === 410 ? oe : xe;
    } catch {
      return xe;
    }
    try {
      const s = document.createElement("div");
      s.innerHTML = await r.text();
      const l = s.firstElementChild;
      if (((o = l == null ? void 0 : l.tagName) == null ? void 0 : o.toLowerCase()) !== "svg") return oe;
      ro || (ro = new DOMParser());
      const n = ro.parseFromString(l.outerHTML, "text/html").body.querySelector("svg");
      return n ? (n.part.add("svg"), document.adoptNode(n)) : oe;
    } catch {
      return oe;
    }
  }
  connectedCallback() {
    super.connectedCallback(), js(this);
  }
  firstUpdated() {
    this.initialRender = !0, this.setIcon();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), Ws(this);
  }
  getIconSource() {
    const t = Jo(this.library);
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
    const { url: e, fromLibrary: o } = this.getIconSource(), r = o ? Jo(this.library) : void 0;
    if (!e) {
      this.svg = null;
      return;
    }
    let s = so.get(e);
    if (s || (s = this.resolveIcon(e, r), so.set(e, s)), !this.initialRender)
      return;
    const l = await s;
    if (l === xe && so.delete(e), e === this.getIconSource().url) {
      if (Ts(l)) {
        if (this.svg = l, r) {
          await this.updateComplete;
          const i = this.shadowRoot.querySelector("[part='svg']");
          typeof r.mutator == "function" && i && r.mutator(i);
        }
        return;
      }
      switch (l) {
        case xe:
        case oe:
          this.svg = null, this.emit("sl-error");
          break;
        default:
          this.svg = l.cloneNode(!0), (t = r == null ? void 0 : r.mutator) == null || t.call(r, this.svg), this.emit("sl-load");
      }
    }
  }
  render() {
    return this.svg;
  }
};
Z.styles = [bt, al];
d([
  Rt()
], Z.prototype, "svg", 2);
d([
  h({ reflect: !0 })
], Z.prototype, "name", 2);
d([
  h()
], Z.prototype, "src", 2);
d([
  h()
], Z.prototype, "label", 2);
d([
  h({ reflect: !0 })
], Z.prototype, "library", 2);
d([
  nt("label")
], Z.prototype, "handleLabelChange", 1);
d([
  nt(["name", "src", "library"])
], Z.prototype, "setIcon", 1);
Z.define("sl-icon");
var cl = _`
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
`, hl = _`
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
const po = /* @__PURE__ */ new Set(), Vt = /* @__PURE__ */ new Map();
let ot, zo = "ltr", Eo = "en";
const Sr = typeof MutationObserver < "u" && typeof document < "u" && typeof document.documentElement < "u";
if (Sr) {
  const t = new MutationObserver(Qr);
  zo = document.documentElement.dir || "ltr", Eo = document.documentElement.lang || navigator.language, t.observe(document.documentElement, {
    attributes: !0,
    attributeFilter: ["dir", "lang"]
  });
}
function Pr(...t) {
  t.map((e) => {
    const o = e.$code.toLowerCase();
    Vt.has(o) ? Vt.set(o, Object.assign(Object.assign({}, Vt.get(o)), e)) : Vt.set(o, e), ot || (ot = e);
  }), Qr();
}
function Qr() {
  Sr && (zo = document.documentElement.dir || "ltr", Eo = document.documentElement.lang || navigator.language), [...po.keys()].map((t) => {
    typeof t.requestUpdate == "function" && t.requestUpdate();
  });
}
let dl = class {
  constructor(e) {
    this.host = e, this.host.addController(this);
  }
  hostConnected() {
    po.add(this.host);
  }
  hostDisconnected() {
    po.delete(this.host);
  }
  dir() {
    return `${this.host.dir || zo}`.toLowerCase();
  }
  lang() {
    const e = `${this.host.lang || Eo}`.toLowerCase().replace(/_/g, "-");
    try {
      return new Intl.Locale(e), e;
    } catch {
      return ot ? ot.$code.toLowerCase() : "en";
    }
  }
  getTranslationData(e) {
    var o, r;
    let s;
    try {
      s = new Intl.Locale(e.replace(/_/g, "-"));
    } catch {
      return { locale: void 0, language: "", region: "", primary: void 0, secondary: void 0 };
    }
    const l = s.language.toLowerCase(), i = (r = (o = s.region) === null || o === void 0 ? void 0 : o.toLowerCase()) !== null && r !== void 0 ? r : "", n = Vt.get(`${l}-${i}`), a = Vt.get(l);
    return { locale: s, language: l, region: i, primary: n, secondary: a };
  }
  exists(e, o) {
    var r;
    const { primary: s, secondary: l } = this.getTranslationData((r = o.lang) !== null && r !== void 0 ? r : this.lang());
    return o = Object.assign({ includeFallback: !1 }, o), !!(s && s[e] || l && l[e] || o.includeFallback && ot && ot[e]);
  }
  term(e, ...o) {
    const { primary: r, secondary: s } = this.getTranslationData(this.lang());
    let l;
    if (r && r[e])
      l = r[e];
    else if (s && s[e])
      l = s[e];
    else if (ot && ot[e])
      l = ot[e];
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
  relativeTime(e, o, r) {
    return new Intl.RelativeTimeFormat(this.lang(), r).format(e, o);
  }
};
var Or = {
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
Pr(Or);
var ul = Or, me = class extends dl {
};
Pr(ul);
const ft = Math.min, st = Math.max, Se = Math.round, _e = Math.floor, lt = (t) => ({
  x: t,
  y: t
}), pl = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function Rr(t, e, o) {
  return st(t, ft(e, o));
}
function jt(t, e) {
  return typeof t == "function" ? t(e) : t;
}
function Et(t) {
  return t.split("-")[0];
}
function Wt(t) {
  return t.split("-")[1];
}
function Tr(t) {
  return t === "x" ? "y" : "x";
}
function So(t) {
  return t === "y" ? "height" : "width";
}
function rt(t) {
  const e = t[0];
  return e === "t" || e === "b" ? "y" : "x";
}
function Po(t) {
  return Tr(rt(t));
}
function fl(t, e, o) {
  o === void 0 && (o = !1);
  const r = Wt(t), s = Po(t), l = So(s);
  let i = s === "x" ? r === (o ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return e.reference[l] > e.floating[l] && (i = Pe(i)), [i, Pe(i)];
}
function gl(t) {
  const e = Pe(t);
  return [fo(t), e, fo(e)];
}
function fo(t) {
  return t.includes("start") ? t.replace("start", "end") : t.replace("end", "start");
}
const or = ["left", "right"], rr = ["right", "left"], ml = ["top", "bottom"], bl = ["bottom", "top"];
function vl(t, e, o) {
  switch (t) {
    case "top":
    case "bottom":
      return o ? e ? rr : or : e ? or : rr;
    case "left":
    case "right":
      return e ? ml : bl;
    default:
      return [];
  }
}
function yl(t, e, o, r) {
  const s = Wt(t);
  let l = vl(Et(t), o === "start", r);
  return s && (l = l.map((i) => i + "-" + s), e && (l = l.concat(l.map(fo)))), l;
}
function Pe(t) {
  const e = Et(t);
  return pl[e] + t.slice(e.length);
}
function wl(t) {
  var e, o, r, s;
  return {
    top: (e = t.top) != null ? e : 0,
    right: (o = t.right) != null ? o : 0,
    bottom: (r = t.bottom) != null ? r : 0,
    left: (s = t.left) != null ? s : 0
  };
}
function Mr(t) {
  return typeof t != "number" ? wl(t) : {
    top: t,
    right: t,
    bottom: t,
    left: t
  };
}
function Qe(t) {
  const {
    x: e,
    y: o,
    width: r,
    height: s
  } = t;
  return {
    width: r,
    height: s,
    top: o,
    left: e,
    right: e + r,
    bottom: o + s,
    x: e,
    y: o
  };
}
function sr(t, e, o) {
  let {
    reference: r,
    floating: s
  } = t;
  const l = rt(e), i = Po(e), n = So(i), a = Et(e), c = l === "y", p = r.x + r.width / 2 - s.width / 2, u = r.y + r.height / 2 - s.height / 2, g = r[n] / 2 - s[n] / 2;
  let f;
  switch (a) {
    case "top":
      f = {
        x: p,
        y: r.y - s.height
      };
      break;
    case "bottom":
      f = {
        x: p,
        y: r.y + r.height
      };
      break;
    case "right":
      f = {
        x: r.x + r.width,
        y: u
      };
      break;
    case "left":
      f = {
        x: r.x - s.width,
        y: u
      };
      break;
    default:
      f = {
        x: r.x,
        y: r.y
      };
  }
  const m = Wt(e);
  return m && (f[i] += g * (m === "end" ? 1 : -1) * (o && c ? -1 : 1)), f;
}
async function xl(t, e) {
  var o;
  e === void 0 && (e = {});
  const {
    x: r,
    y: s,
    platform: l,
    rects: i,
    elements: n,
    strategy: a
  } = t, {
    boundary: c = "clippingAncestors",
    rootBoundary: p = "viewport",
    elementContext: u = "floating",
    altBoundary: g = !1,
    padding: f = 0
  } = jt(e, t), m = Mr(f), y = n[g ? u === "floating" ? "reference" : "floating" : u], v = Qe(await l.getClippingRect({
    element: (o = await (l.isElement == null ? void 0 : l.isElement(y))) == null || o ? y : y.contextElement || await (l.getDocumentElement == null ? void 0 : l.getDocumentElement(n.floating)),
    boundary: c,
    rootBoundary: p,
    strategy: a
  })), $ = u === "floating" ? {
    x: r,
    y: s,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, L = await (l.getOffsetParent == null ? void 0 : l.getOffsetParent(n.floating)), A = await (l.isElement == null ? void 0 : l.isElement(L)) && await (l.getScale == null ? void 0 : l.getScale(L)) || {
    x: 1,
    y: 1
  }, T = Qe(l.convertOffsetParentRelativeRectToViewportRelativeRect ? await l.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: n,
    rect: $,
    offsetParent: L,
    strategy: a
  }) : $);
  return {
    top: (v.top - T.top + m.top) / A.y,
    bottom: (T.bottom - v.bottom + m.bottom) / A.y,
    left: (v.left - T.left + m.left) / A.x,
    right: (T.right - v.right + m.right) / A.x
  };
}
const _l = 50, kl = async (t, e, o) => {
  const {
    placement: r = "bottom",
    strategy: s = "absolute",
    middleware: l = [],
    platform: i
  } = o, n = i.detectOverflow ? i : {
    ...i,
    detectOverflow: xl
  }, a = await (i.isRTL == null ? void 0 : i.isRTL(e));
  let c = await i.getElementRects({
    reference: t,
    floating: e,
    strategy: s
  }), {
    x: p,
    y: u
  } = sr(c, r, a), g = r, f = 0;
  const m = {};
  for (let b = 0; b < l.length; b++) {
    const y = l[b];
    if (!y)
      continue;
    const {
      name: v,
      fn: $
    } = y, {
      x: L,
      y: A,
      data: T,
      reset: S
    } = await $({
      x: p,
      y: u,
      initialPlacement: r,
      placement: g,
      strategy: s,
      middlewareData: m,
      rects: c,
      platform: n,
      elements: {
        reference: t,
        floating: e
      }
    });
    p = L ?? p, u = A ?? u, m[v] = {
      ...m[v],
      ...T
    }, S && f < _l && (f++, typeof S == "object" && (S.placement && (g = S.placement), S.rects && (c = S.rects === !0 ? await i.getElementRects({
      reference: t,
      floating: e,
      strategy: s
    }) : S.rects), {
      x: p,
      y: u
    } = sr(c, g, a)), b = -1);
  }
  return {
    x: p,
    y: u,
    placement: g,
    strategy: s,
    middlewareData: m
  };
}, $l = (t) => ({
  name: "arrow",
  options: t,
  async fn(e) {
    const {
      x: o,
      y: r,
      placement: s,
      rects: l,
      platform: i,
      elements: n,
      middlewareData: a
    } = e, {
      element: c,
      padding: p = 0
    } = jt(t, e) || {};
    if (c == null)
      return {};
    const u = Mr(p), g = {
      x: o,
      y: r
    }, f = Po(s), m = So(f), b = await i.getDimensions(c), y = f === "y", v = y ? "top" : "left", $ = y ? "bottom" : "right", L = y ? "clientHeight" : "clientWidth", A = l.reference[m] + l.reference[f] - g[f] - l.floating[m], T = g[f] - l.reference[f], S = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
    let M = S ? S[L] : 0;
    (!M || !await (i.isElement == null ? void 0 : i.isElement(S))) && (M = n.floating[L] || l.floating[m]);
    const I = A / 2 - T / 2, K = M / 2 - b[m] / 2 - 1, Q = ft(u[v], K), Xt = ft(u[$], K), Yt = M - b[m] - Xt, X = M / 2 - b[m] / 2 + I, U = Rr(Q, X, Yt), wt = !a.arrow && Wt(s) != null && X !== U && l.reference[m] / 2 - (X < Q ? Q : Xt) - b[m] / 2 < 0, et = wt ? X < Q ? X - Q : X - Yt : 0;
    return {
      [f]: g[f] + et,
      data: {
        [f]: U,
        centerOffset: X - U - et,
        ...wt && {
          alignmentOffset: et
        }
      },
      reset: wt
    };
  }
}), Ll = function(t) {
  return t === void 0 && (t = {}), {
    name: "flip",
    options: t,
    async fn(e) {
      var o, r;
      const {
        placement: s,
        middlewareData: l,
        rects: i,
        initialPlacement: n,
        platform: a,
        elements: c
      } = e, {
        mainAxis: p = !0,
        crossAxis: u = !0,
        fallbackPlacements: g,
        fallbackStrategy: f = "bestFit",
        fallbackAxisSideDirection: m = "none",
        flipAlignment: b = !0,
        ...y
      } = jt(t, e);
      if ((o = l.arrow) != null && o.alignmentOffset)
        return {};
      const v = Et(s), $ = rt(n), L = Et(n) === n, A = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)), T = g || (L || !b ? [Pe(n)] : gl(n)), S = m !== "none";
      !g && S && T.push(...yl(n, b, m, A));
      const M = [n, ...T], I = await a.detectOverflow(e, y), K = [];
      let Q = ((r = l.flip) == null ? void 0 : r.overflows) || [];
      if (p && K.push(I[v]), u) {
        const U = fl(s, i, A);
        K.push(I[U[0]], I[U[1]]);
      }
      if (Q = [...Q, {
        placement: s,
        overflows: K
      }], !K.every((U) => U <= 0)) {
        var Xt, Yt;
        const U = (((Xt = l.flip) == null ? void 0 : Xt.index) || 0) + 1, wt = M[U];
        if (wt && (!(u === "alignment" ? $ !== rt(wt) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        Q.every((j) => rt(j.placement) === $ ? j.overflows[0] > 0 : !0)))
          return {
            data: {
              index: U,
              overflows: Q
            },
            reset: {
              placement: wt
            }
          };
        let et = (Yt = Q.filter((xt) => xt.overflows[0] <= 0).sort((xt, j) => xt.overflows[1] - j.overflows[1])[0]) == null ? void 0 : Yt.placement;
        if (!et)
          switch (f) {
            case "bestFit": {
              var X;
              const xt = (X = Q.filter((j) => {
                if (S) {
                  const ct = rt(j.placement);
                  return ct === $ || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  ct === "y";
                }
                return !0;
              }).map((j) => [j.placement, j.overflows.filter((ct) => ct > 0).reduce((ct, ts) => ct + ts, 0)]).sort((j, ct) => j[1] - ct[1])[0]) == null ? void 0 : X[0];
              xt && (et = xt);
              break;
            }
            case "initialPlacement":
              et = n;
              break;
          }
        if (s !== et)
          return {
            reset: {
              placement: et
            }
          };
      }
      return {};
    }
  };
}, Cl = /* @__PURE__ */ new Set(["left", "top"]);
async function Al(t, e) {
  const {
    placement: o,
    platform: r,
    elements: s
  } = t, l = await (r.isRTL == null ? void 0 : r.isRTL(s.floating)), i = Et(o), n = Wt(o), a = rt(o) === "y", c = Cl.has(i) ? -1 : 1, p = l && a ? -1 : 1, u = jt(e, t);
  let {
    mainAxis: g,
    crossAxis: f,
    alignmentAxis: m
  } = typeof u == "number" ? {
    mainAxis: u,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: u.mainAxis || 0,
    crossAxis: u.crossAxis || 0,
    alignmentAxis: u.alignmentAxis
  };
  return n && typeof m == "number" && (f = n === "end" ? m * -1 : m), a ? {
    x: f * p,
    y: g * c
  } : {
    x: g * c,
    y: f * p
  };
}
const zl = function(t) {
  return t === void 0 && (t = 0), {
    name: "offset",
    options: t,
    async fn(e) {
      var o, r;
      const {
        x: s,
        y: l,
        placement: i,
        middlewareData: n
      } = e, a = await Al(e, t);
      return i === ((o = n.offset) == null ? void 0 : o.placement) && (r = n.arrow) != null && r.alignmentOffset ? {} : {
        x: s + a.x,
        y: l + a.y,
        data: {
          ...a,
          placement: i
        }
      };
    }
  };
}, El = function(t) {
  return t === void 0 && (t = {}), {
    name: "shift",
    options: t,
    async fn(e) {
      const {
        x: o,
        y: r,
        placement: s,
        platform: l
      } = e, {
        mainAxis: i = !0,
        crossAxis: n = !1,
        limiter: a = {
          fn: ($) => {
            let {
              x: L,
              y: A
            } = $;
            return {
              x: L,
              y: A
            };
          }
        },
        ...c
      } = jt(t, e), p = {
        x: o,
        y: r
      }, u = await l.detectOverflow(e, c), g = rt(s), f = Tr(g);
      let m = p[f], b = p[g];
      const y = ($, L) => Rr(L + u[$ === "y" ? "top" : "left"], L, L - u[$ === "y" ? "bottom" : "right"]);
      i && (m = y(f, m)), n && (b = y(g, b));
      const v = a.fn({
        ...e,
        [f]: m,
        [g]: b
      });
      return {
        ...v,
        data: {
          x: v.x - o,
          y: v.y - r,
          enabled: {
            [f]: i,
            [g]: n
          }
        }
      };
    }
  };
}, Sl = function(t) {
  return t === void 0 && (t = {}), {
    name: "size",
    options: t,
    async fn(e) {
      const {
        placement: o,
        rects: r,
        platform: s,
        elements: l
      } = e, {
        apply: i = () => {
        },
        ...n
      } = jt(t, e), a = await s.detectOverflow(e, n), c = Et(o), p = Wt(o), u = rt(o) === "y", {
        width: g,
        height: f
      } = r.floating;
      let m, b;
      c === "top" || c === "bottom" ? (m = c, b = p === (await (s.isRTL == null ? void 0 : s.isRTL(l.floating)) ? "start" : "end") ? "left" : "right") : (b = c, m = p === "end" ? "top" : "bottom");
      const y = f - a.top - a.bottom, v = g - a.left - a.right, $ = ft(f - a[m], y), L = ft(g - a[b], v), A = e.middlewareData.shift, T = !A;
      let S = $, M = L;
      A != null && A.enabled.x && (M = v), A != null && A.enabled.y && (S = y), T && !p && (u ? M = g - 2 * st(a.left, a.right) : S = f - 2 * st(a.top, a.bottom)), await i({
        ...e,
        availableWidth: M,
        availableHeight: S
      });
      const I = await s.getDimensions(l.floating);
      return g !== I.width || f !== I.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function He() {
  return typeof window < "u";
}
function qt(t) {
  return Dr(t) ? (t.nodeName || "").toLowerCase() : "#document";
}
function D(t) {
  var e;
  return (t == null || (e = t.ownerDocument) == null ? void 0 : e.defaultView) || window;
}
function at(t) {
  var e;
  return (e = (Dr(t) ? t.ownerDocument : t.document) || window.document) == null ? void 0 : e.documentElement;
}
function Dr(t) {
  return He() ? t instanceof Node || t instanceof D(t).Node : !1;
}
function Y(t) {
  return He() ? t instanceof Element || t instanceof D(t).Element : !1;
}
function vt(t) {
  return He() ? t instanceof HTMLElement || t instanceof D(t).HTMLElement : !1;
}
function lr(t) {
  return !He() || typeof ShadowRoot > "u" ? !1 : t instanceof ShadowRoot || t instanceof D(t).ShadowRoot;
}
function Ne(t) {
  const {
    overflow: e,
    overflowX: o,
    overflowY: r,
    display: s
  } = G(t);
  return /auto|scroll|overlay|hidden|clip/.test(e + r + o) && s !== "inline" && s !== "contents";
}
function Pl(t) {
  return /^(table|td|th)$/.test(qt(t));
}
function Ie(t) {
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
const Ql = /transform|translate|scale|rotate|perspective|filter/, Ol = /paint|layout|strict|content/, kt = (t) => !!t && t !== "none";
let lo;
function Ue(t) {
  const e = Y(t) ? G(t) : t;
  return kt(e.transform) || kt(e.translate) || kt(e.scale) || kt(e.rotate) || kt(e.perspective) || !Qo() && (kt(e.backdropFilter) || kt(e.filter)) || Ql.test(e.willChange || "") || Ol.test(e.contain || "");
}
function Rl(t) {
  let e = St(t);
  for (; vt(e) && !ce(e); ) {
    if (Ue(e))
      return e;
    if (Ie(e))
      return null;
    e = St(e);
  }
  return null;
}
function Qo() {
  return lo == null && (lo = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), lo;
}
function ce(t) {
  return /^(html|body|#document)$/.test(qt(t));
}
function G(t) {
  return D(t).getComputedStyle(t);
}
function je(t) {
  return Y(t) ? {
    scrollLeft: t.scrollLeft,
    scrollTop: t.scrollTop
  } : {
    scrollLeft: t.scrollX,
    scrollTop: t.scrollY
  };
}
function St(t) {
  if (qt(t) === "html")
    return t;
  const e = (
    // Step into the shadow DOM of the parent of a slotted node.
    t.assignedSlot || // DOM Element detected.
    t.parentNode || // ShadowRoot detected.
    lr(t) && t.host || // Fallback.
    at(t)
  );
  return lr(e) ? e.host : e;
}
function Vr(t) {
  const e = St(t);
  return ce(e) ? (t.ownerDocument || t).body : vt(e) && Ne(e) ? e : Vr(e);
}
function he(t, e, o) {
  var r;
  e === void 0 && (e = []), o === void 0 && (o = !0);
  const s = Vr(t), l = s === ((r = t.ownerDocument) == null ? void 0 : r.body), i = D(s);
  if (l) {
    const n = go(i);
    return e.concat(i, i.visualViewport || [], Ne(s) ? s : [], n && o ? he(n) : []);
  } else
    return e.concat(s, he(s, [], o));
}
function go(t) {
  return t.parent && Object.getPrototypeOf(t.parent) ? t.frameElement : null;
}
function Br(t) {
  const e = G(t);
  let o = parseFloat(e.width) || 0, r = parseFloat(e.height) || 0;
  const s = vt(t), l = s ? t.offsetWidth : o, i = s ? t.offsetHeight : r, n = Se(o) !== l || Se(r) !== i;
  return n && (o = l, r = i), {
    width: o,
    height: r,
    $: n
  };
}
function Oo(t) {
  return Y(t) ? t : t.contextElement;
}
function Ft(t) {
  const e = Oo(t);
  if (!vt(e))
    return lt(1);
  const o = e.getBoundingClientRect(), {
    width: r,
    height: s,
    $: l
  } = Br(e);
  let i = (l ? Se(o.width) : o.width) / r, n = (l ? Se(o.height) : o.height) / s;
  return (!i || !Number.isFinite(i)) && (i = 1), (!n || !Number.isFinite(n)) && (n = 1), {
    x: i,
    y: n
  };
}
const Tl = /* @__PURE__ */ lt(0);
function Fr(t) {
  const e = D(t);
  return !Qo() || !e.visualViewport ? Tl : {
    x: e.visualViewport.offsetLeft,
    y: e.visualViewport.offsetTop
  };
}
function Ml(t, e, o) {
  return e === void 0 && (e = !1), !!o && e && o === D(t);
}
function Pt(t, e, o, r) {
  e === void 0 && (e = !1), o === void 0 && (o = !1);
  const s = t.getBoundingClientRect(), l = Oo(t);
  let i = lt(1);
  e && (r ? Y(r) && (i = Ft(r)) : i = Ft(t));
  const n = Ml(l, o, r) ? Fr(l) : lt(0);
  let a = (s.left + n.x) / i.x, c = (s.top + n.y) / i.y, p = s.width / i.x, u = s.height / i.y;
  if (l && r) {
    const g = D(l), f = Y(r) ? D(r) : r;
    let m = g, b = go(m);
    for (; b && f !== m; ) {
      const y = Ft(b), v = b.getBoundingClientRect(), $ = G(b), L = v.left + (b.clientLeft + parseFloat($.paddingLeft)) * y.x, A = v.top + (b.clientTop + parseFloat($.paddingTop)) * y.y;
      a *= y.x, c *= y.y, p *= y.x, u *= y.y, a += L, c += A, m = D(b), b = go(m);
    }
  }
  return Qe({
    width: p,
    height: u,
    x: a,
    y: c
  });
}
function We(t, e) {
  const o = je(t).scrollLeft;
  return e ? e.left + o : Pt(at(t)).left + o;
}
function Hr(t, e) {
  const o = t.getBoundingClientRect(), r = o.left + e.scrollLeft - We(t, o), s = o.top + e.scrollTop;
  return {
    x: r,
    y: s
  };
}
function Dl(t) {
  let {
    elements: e,
    rect: o,
    offsetParent: r,
    strategy: s
  } = t;
  const l = s === "fixed", i = at(r), n = e ? Ie(e.floating) : !1;
  if (r === i || n && l)
    return o;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = lt(1);
  const p = lt(0), u = vt(r);
  if ((u || !l) && ((qt(r) !== "body" || Ne(i)) && (a = je(r)), u)) {
    const f = Pt(r);
    c = Ft(r), p.x = f.x + r.clientLeft, p.y = f.y + r.clientTop;
  }
  const g = i && !u && !l ? Hr(i, a) : lt(0);
  return {
    width: o.width * c.x,
    height: o.height * c.y,
    x: o.x * c.x - a.scrollLeft * c.x + p.x + g.x,
    y: o.y * c.y - a.scrollTop * c.y + p.y + g.y
  };
}
function Vl(t) {
  return t.getClientRects ? Array.from(t.getClientRects()) : [];
}
function Bl(t) {
  const e = je(t), o = t.ownerDocument.body, r = st(t.scrollWidth, t.clientWidth, o.scrollWidth, o.clientWidth), s = st(t.scrollHeight, t.clientHeight, o.scrollHeight, o.clientHeight);
  let l = -e.scrollLeft + We(t);
  const i = -e.scrollTop;
  return G(o).direction === "rtl" && (l += st(t.clientWidth, o.clientWidth) - r), {
    width: r,
    height: s,
    x: l,
    y: i
  };
}
const Fl = 25;
function Hl(t, e, o) {
  o === void 0 && (o = "viewport");
  const r = o === "layoutViewport", s = D(t), l = at(t), i = s.visualViewport;
  let n = l.clientWidth, a = l.clientHeight, c = 0, p = 0;
  if (i) {
    const g = !Qo() || e === "fixed";
    r ? g || (c = -i.offsetLeft, p = -i.offsetTop) : (n = i.width, a = i.height, g && (c = i.offsetLeft, p = i.offsetTop));
  }
  if (We(l) <= 0) {
    const g = l.ownerDocument, f = g.body, m = getComputedStyle(f), b = g.compatMode === "CSS1Compat" && parseFloat(m.marginLeft) + parseFloat(m.marginRight) || 0, y = Math.abs(l.clientWidth - f.clientWidth - b), v = getComputedStyle(l).scrollbarGutter === "stable both-edges" ? y / 2 : y;
    v <= Fl && (n -= v);
  }
  return {
    width: n,
    height: a,
    x: c,
    y: p
  };
}
function Nl(t, e) {
  const o = Pt(t, !0, e === "fixed"), r = o.top + t.clientTop, s = o.left + t.clientLeft, l = Ft(t), i = t.clientWidth * l.x, n = t.clientHeight * l.y, a = s * l.x, c = r * l.y;
  return {
    width: i,
    height: n,
    x: a,
    y: c
  };
}
function ir(t, e, o) {
  let r;
  if (e === "viewport" || e === "layoutViewport")
    r = Hl(t, o, e);
  else if (e === "document")
    r = Bl(at(t));
  else if (Y(e))
    r = Nl(e, o);
  else {
    const s = Fr(t);
    r = {
      x: e.x - s.x,
      y: e.y - s.y,
      width: e.width,
      height: e.height
    };
  }
  return Qe(r);
}
function Il(t, e) {
  const o = e.get(t);
  if (o)
    return o;
  let r = he(t, [], !1).filter((n) => Y(n) && qt(n) !== "body"), s = null;
  const l = G(t).position === "fixed";
  let i = l ? St(t) : t;
  for (; Y(i) && !ce(i); ) {
    const n = G(i), a = Ue(i), c = s ? s.position : l ? "fixed" : "";
    !a && (c === "fixed" || c === "absolute" && n.position === "static") ? r = r.filter((u) => u !== i) : s = n, i = St(i);
  }
  return e.set(t, r), r;
}
function Ul(t) {
  let {
    element: e,
    boundary: o,
    rootBoundary: r,
    strategy: s
  } = t;
  const i = [...o === "clippingAncestors" ? Ie(e) ? [] : Il(e, this._c) : [].concat(o), r], n = ir(e, i[0], s);
  let a = n.top, c = n.right, p = n.bottom, u = n.left;
  for (let g = 1; g < i.length; g++) {
    const f = ir(e, i[g], s);
    a = st(f.top, a), c = ft(f.right, c), p = ft(f.bottom, p), u = st(f.left, u);
  }
  return {
    width: c - u,
    height: p - a,
    x: u,
    y: a
  };
}
function jl(t) {
  const {
    width: e,
    height: o
  } = Br(t);
  return {
    width: e,
    height: o
  };
}
function Wl(t, e, o) {
  const r = vt(e), s = at(e), l = o === "fixed", i = Pt(t, !0, l, e);
  let n = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = lt(0);
  if ((r || !l) && ((qt(e) !== "body" || Ne(s)) && (n = je(e)), r)) {
    const g = Pt(e, !0, l, e);
    a.x = g.x + e.clientLeft, a.y = g.y + e.clientTop;
  }
  !r && s && (a.x = We(s));
  const c = s && !r && !l ? Hr(s, n) : lt(0), p = i.left + n.scrollLeft - a.x - c.x, u = i.top + n.scrollTop - a.y - c.y;
  return {
    x: p,
    y: u,
    width: i.width,
    height: i.height
  };
}
function io(t) {
  return G(t).position === "static";
}
function nr(t, e) {
  if (!vt(t) || G(t).position === "fixed")
    return null;
  if (e)
    return e(t);
  let o = t.offsetParent;
  return at(t) === o && (o = o.ownerDocument.body), o;
}
function Nr(t, e) {
  const o = D(t);
  if (Ie(t))
    return o;
  if (!vt(t)) {
    let s = St(t);
    for (; s && !ce(s); ) {
      if (Y(s) && !io(s))
        return s;
      s = St(s);
    }
    return o;
  }
  let r = nr(t, e);
  for (; r && Pl(r) && io(r); )
    r = nr(r, e);
  return r && ce(r) && io(r) && !Ue(r) ? o : r || Rl(t) || o;
}
const ql = async function(t) {
  const e = this.getOffsetParent || Nr, o = this.getDimensions, r = await o(t.floating);
  return {
    reference: Wl(t.reference, await e(t.floating), t.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function Zl(t) {
  return G(t).direction === "rtl";
}
const Le = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Dl,
  getDocumentElement: at,
  getClippingRect: Ul,
  getOffsetParent: Nr,
  getElementRects: ql,
  getClientRects: Vl,
  getDimensions: jl,
  getScale: Ft,
  isElement: Y,
  isRTL: Zl
};
function Ir(t, e) {
  return t.x === e.x && t.y === e.y && t.width === e.width && t.height === e.height;
}
function Kl(t, e, o) {
  let r = null, s;
  const l = at(t);
  function i() {
    var p;
    clearTimeout(s), (p = r) == null || p.disconnect(), r = null;
  }
  function n(p, u) {
    p === void 0 && (p = !1), u === void 0 && (u = 1), i();
    const g = t.getBoundingClientRect(), {
      left: f,
      top: m,
      width: b,
      height: y
    } = g;
    if (p || e(), !b || !y)
      return;
    const v = _e(m), $ = _e(l.clientWidth - (f + b)), L = _e(l.clientHeight - (m + y)), A = _e(f), S = {
      rootMargin: -v + "px " + -$ + "px " + -L + "px " + -A + "px",
      threshold: st(0, ft(1, u)) || 1
    };
    let M = !0;
    function I(K) {
      const Q = K[0].intersectionRatio;
      if (!Ir(g, t.getBoundingClientRect()))
        return n();
      if (Q !== u) {
        if (!M)
          return n();
        Q ? n(!1, Q) : s = setTimeout(() => {
          n(!1, 1e-7);
        }, 1e3);
      }
      M = !1;
    }
    try {
      r = new IntersectionObserver(I, {
        ...S,
        // Handle <iframe>s
        root: l.ownerDocument
      });
    } catch {
      r = new IntersectionObserver(I, S);
    }
    r.observe(t);
  }
  const a = D(t), c = () => n(o);
  return a.addEventListener("resize", c), n(!0), () => {
    a.removeEventListener("resize", c), i();
  };
}
function Xl(t, e, o, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: s = !0,
    ancestorResize: l = !0,
    elementResize: i = typeof ResizeObserver == "function",
    layoutShift: n = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = r, c = Oo(t), p = s || l ? [...c ? he(c) : [], ...e ? he(e) : []] : [];
  p.forEach((v) => {
    s && v.addEventListener("scroll", o), l && v.addEventListener("resize", o);
  });
  const u = c && n ? Kl(c, o, l) : null;
  let g = -1, f = null;
  i && (f = new ResizeObserver((v) => {
    let [$] = v;
    $ && $.target === c && f && e && (f.unobserve(e), cancelAnimationFrame(g), g = requestAnimationFrame(() => {
      var L;
      (L = f) == null || L.observe(e);
    })), o();
  }), c && !a && f.observe(c), e && f.observe(e));
  let m, b = a ? Pt(t) : null;
  a && y();
  function y() {
    const v = Pt(t);
    b && !Ir(b, v) && o(), b = v, m = requestAnimationFrame(y);
  }
  return o(), () => {
    var v;
    p.forEach(($) => {
      s && $.removeEventListener("scroll", o), l && $.removeEventListener("resize", o);
    }), u == null || u(), (v = f) == null || v.disconnect(), f = null, a && cancelAnimationFrame(m);
  };
}
const Yl = zl, Gl = El, Jl = Ll, ar = Sl, ti = $l, ei = (t, e, o) => {
  const r = /* @__PURE__ */ new Map(), s = o ?? {}, l = {
    ...Le,
    ...s.platform,
    _c: r
  };
  return kl(t, e, {
    ...s,
    platform: l
  });
};
function oi(t) {
  return ri(t);
}
function no(t) {
  return t.assignedSlot ? t.assignedSlot : t.parentNode instanceof ShadowRoot ? t.parentNode.host : t.parentNode;
}
function ri(t) {
  for (let e = t; e; e = no(e)) if (e instanceof Element && getComputedStyle(e).display === "none") return null;
  for (let e = no(t); e; e = no(e)) {
    if (!(e instanceof Element)) continue;
    const o = getComputedStyle(e);
    if (o.display !== "contents" && (o.position !== "static" || Ue(o) || e.tagName === "BODY"))
      return e;
  }
  return null;
}
function si(t) {
  return t !== null && typeof t == "object" && "getBoundingClientRect" in t && ("contextElement" in t ? t.contextElement instanceof Element : !0);
}
var C = class extends H {
  constructor() {
    super(...arguments), this.localize = new me(this), this.active = !1, this.placement = "top", this.strategy = "absolute", this.distance = 0, this.skidding = 0, this.arrow = !1, this.arrowPlacement = "anchor", this.arrowPadding = 10, this.flip = !1, this.flipFallbackPlacements = "", this.flipFallbackStrategy = "best-fit", this.flipPadding = 0, this.shift = !1, this.shiftPadding = 0, this.autoSizePadding = 0, this.hoverBridge = !1, this.updateHoverBridge = () => {
      if (this.hoverBridge && this.anchorEl) {
        const t = this.anchorEl.getBoundingClientRect(), e = this.popup.getBoundingClientRect(), o = this.placement.includes("top") || this.placement.includes("bottom");
        let r = 0, s = 0, l = 0, i = 0, n = 0, a = 0, c = 0, p = 0;
        o ? t.top < e.top ? (r = t.left, s = t.bottom, l = t.right, i = t.bottom, n = e.left, a = e.top, c = e.right, p = e.top) : (r = e.left, s = e.bottom, l = e.right, i = e.bottom, n = t.left, a = t.top, c = t.right, p = t.top) : t.left < e.left ? (r = t.right, s = t.top, l = e.left, i = e.top, n = t.right, a = t.bottom, c = e.left, p = e.bottom) : (r = e.right, s = e.top, l = t.left, i = t.top, n = e.right, a = e.bottom, c = t.left, p = t.bottom), this.style.setProperty("--hover-bridge-top-left-x", `${r}px`), this.style.setProperty("--hover-bridge-top-left-y", `${s}px`), this.style.setProperty("--hover-bridge-top-right-x", `${l}px`), this.style.setProperty("--hover-bridge-top-right-y", `${i}px`), this.style.setProperty("--hover-bridge-bottom-left-x", `${n}px`), this.style.setProperty("--hover-bridge-bottom-left-y", `${a}px`), this.style.setProperty("--hover-bridge-bottom-right-x", `${c}px`), this.style.setProperty("--hover-bridge-bottom-right-y", `${p}px`);
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
    } else this.anchor instanceof Element || si(this.anchor) ? this.anchorEl = this.anchor : this.anchorEl = this.querySelector('[slot="anchor"]');
    this.anchorEl instanceof HTMLSlotElement && (this.anchorEl = this.anchorEl.assignedElements({ flatten: !0 })[0]), this.anchorEl && this.active && this.start();
  }
  start() {
    !this.anchorEl || !this.active || (this.cleanup = Xl(this.anchorEl, this.popup, () => {
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
      Yl({ mainAxis: this.distance, crossAxis: this.skidding })
    ];
    this.sync ? t.push(
      ar({
        apply: ({ rects: o }) => {
          const r = this.sync === "width" || this.sync === "both", s = this.sync === "height" || this.sync === "both";
          this.popup.style.width = r ? `${o.reference.width}px` : "", this.popup.style.height = s ? `${o.reference.height}px` : "";
        }
      })
    ) : (this.popup.style.width = "", this.popup.style.height = ""), this.flip && t.push(
      Jl({
        boundary: this.flipBoundary,
        // @ts-expect-error - We're converting a string attribute to an array here
        fallbackPlacements: this.flipFallbackPlacements,
        fallbackStrategy: this.flipFallbackStrategy === "best-fit" ? "bestFit" : "initialPlacement",
        padding: this.flipPadding
      })
    ), this.shift && t.push(
      Gl({
        boundary: this.shiftBoundary,
        padding: this.shiftPadding
      })
    ), this.autoSize ? t.push(
      ar({
        boundary: this.autoSizeBoundary,
        padding: this.autoSizePadding,
        apply: ({ availableWidth: o, availableHeight: r }) => {
          this.autoSize === "vertical" || this.autoSize === "both" ? this.style.setProperty("--auto-size-available-height", `${r}px`) : this.style.removeProperty("--auto-size-available-height"), this.autoSize === "horizontal" || this.autoSize === "both" ? this.style.setProperty("--auto-size-available-width", `${o}px`) : this.style.removeProperty("--auto-size-available-width");
        }
      })
    ) : (this.style.removeProperty("--auto-size-available-width"), this.style.removeProperty("--auto-size-available-height")), this.arrow && t.push(
      ti({
        element: this.arrowEl,
        padding: this.arrowPadding
      })
    );
    const e = this.strategy === "absolute" ? (o) => Le.getOffsetParent(o, oi) : Le.getOffsetParent;
    ei(this.anchorEl, this.popup, {
      placement: this.placement,
      middleware: t,
      strategy: this.strategy,
      platform: Fe(Ot({}, Le), {
        getOffsetParent: e
      })
    }).then(({ x: o, y: r, middlewareData: s, placement: l }) => {
      const i = this.localize.dir() === "rtl", n = { top: "bottom", right: "left", bottom: "top", left: "right" }[l.split("-")[0]];
      if (this.setAttribute("data-current-placement", l), Object.assign(this.popup.style, {
        left: `${o}px`,
        top: `${r}px`
      }), this.arrow) {
        const a = s.arrow.x, c = s.arrow.y;
        let p = "", u = "", g = "", f = "";
        if (this.arrowPlacement === "start") {
          const m = typeof a == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          p = typeof c == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "", u = i ? m : "", f = i ? "" : m;
        } else if (this.arrowPlacement === "end") {
          const m = typeof a == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          u = i ? "" : m, f = i ? m : "", g = typeof c == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
        } else this.arrowPlacement === "center" ? (f = typeof a == "number" ? "calc(50% - var(--arrow-size-diagonal))" : "", p = typeof c == "number" ? "calc(50% - var(--arrow-size-diagonal))" : "") : (f = typeof a == "number" ? `${a}px` : "", p = typeof c == "number" ? `${c}px` : "");
        Object.assign(this.arrowEl.style, {
          top: p,
          right: u,
          bottom: g,
          left: f,
          [n]: "calc(var(--arrow-size-diagonal) * -1)"
        });
      }
    }), requestAnimationFrame(() => this.updateHoverBridge()), this.emit("sl-reposition");
  }
  render() {
    return x`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${pt({
      "popup-hover-bridge": !0,
      "popup-hover-bridge--visible": this.hoverBridge && this.active
    })}
      ></span>

      <div
        part="popup"
        class=${pt({
      popup: !0,
      "popup--active": this.active,
      "popup--fixed": this.strategy === "fixed",
      "popup--has-arrow": this.arrow
    })}
      >
        <slot></slot>
        ${this.arrow ? x`<div part="arrow" class="popup__arrow" role="presentation"></div>` : ""}
      </div>
    `;
  }
};
C.styles = [bt, hl];
d([
  V(".popup")
], C.prototype, "popup", 2);
d([
  V(".popup__arrow")
], C.prototype, "arrowEl", 2);
d([
  h()
], C.prototype, "anchor", 2);
d([
  h({ type: Boolean, reflect: !0 })
], C.prototype, "active", 2);
d([
  h({ reflect: !0 })
], C.prototype, "placement", 2);
d([
  h({ reflect: !0 })
], C.prototype, "strategy", 2);
d([
  h({ type: Number })
], C.prototype, "distance", 2);
d([
  h({ type: Number })
], C.prototype, "skidding", 2);
d([
  h({ type: Boolean })
], C.prototype, "arrow", 2);
d([
  h({ attribute: "arrow-placement" })
], C.prototype, "arrowPlacement", 2);
d([
  h({ attribute: "arrow-padding", type: Number })
], C.prototype, "arrowPadding", 2);
d([
  h({ type: Boolean })
], C.prototype, "flip", 2);
d([
  h({
    attribute: "flip-fallback-placements",
    converter: {
      fromAttribute: (t) => t.split(" ").map((e) => e.trim()).filter((e) => e !== ""),
      toAttribute: (t) => t.join(" ")
    }
  })
], C.prototype, "flipFallbackPlacements", 2);
d([
  h({ attribute: "flip-fallback-strategy" })
], C.prototype, "flipFallbackStrategy", 2);
d([
  h({ type: Object })
], C.prototype, "flipBoundary", 2);
d([
  h({ attribute: "flip-padding", type: Number })
], C.prototype, "flipPadding", 2);
d([
  h({ type: Boolean })
], C.prototype, "shift", 2);
d([
  h({ type: Object })
], C.prototype, "shiftBoundary", 2);
d([
  h({ attribute: "shift-padding", type: Number })
], C.prototype, "shiftPadding", 2);
d([
  h({ attribute: "auto-size" })
], C.prototype, "autoSize", 2);
d([
  h()
], C.prototype, "sync", 2);
d([
  h({ type: Object })
], C.prototype, "autoSizeBoundary", 2);
d([
  h({ attribute: "auto-size-padding", type: Number })
], C.prototype, "autoSizePadding", 2);
d([
  h({ attribute: "hover-bridge", type: Boolean })
], C.prototype, "hoverBridge", 2);
var Ur = /* @__PURE__ */ new Map(), li = /* @__PURE__ */ new WeakMap();
function ii(t) {
  return t ?? { keyframes: [], options: { duration: 0 } };
}
function cr(t, e) {
  return e.toLowerCase() === "rtl" ? {
    keyframes: t.rtlKeyframes || t.keyframes,
    options: t.options
  } : t;
}
function Tt(t, e) {
  Ur.set(t, ii(e));
}
function $t(t, e, o) {
  const r = li.get(t);
  if (r != null && r[e])
    return cr(r[e], o.dir);
  const s = Ur.get(e);
  return s ? cr(s, o.dir) : {
    keyframes: [],
    options: { duration: 0 }
  };
}
function Oe(t, e) {
  return new Promise((o) => {
    function r(s) {
      s.target === t && (t.removeEventListener(e, r), o());
    }
    t.addEventListener(e, r);
  });
}
function Lt(t, e, o) {
  return new Promise((r) => {
    if ((o == null ? void 0 : o.duration) === 1 / 0)
      throw new Error("Promise-based animations must be finite.");
    const s = t.animate(e, Fe(Ot({}, o), {
      duration: ni() ? 0 : o.duration
    }));
    s.addEventListener("cancel", r, { once: !0 }), s.addEventListener("finish", r, { once: !0 });
  });
}
function hr(t) {
  return t = t.toString().toLowerCase(), t.indexOf("ms") > -1 ? parseFloat(t) : t.indexOf("s") > -1 ? parseFloat(t) * 1e3 : parseFloat(t);
}
function ni() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function Bt(t) {
  return Promise.all(
    t.getAnimations().map((e) => new Promise((o) => {
      e.cancel(), requestAnimationFrame(o);
    }))
  );
}
var P = class extends H {
  constructor() {
    super(), this.localize = new me(this), this.content = "", this.placement = "top", this.disabled = !1, this.distance = 8, this.open = !1, this.skidding = 0, this.trigger = "hover focus", this.hoist = !1, this.handleBlur = () => {
      this.hasTrigger("focus") && this.hide();
    }, this.handleClick = () => {
      this.hasTrigger("click") && (this.open ? this.hide() : this.show());
    }, this.handleFocus = () => {
      this.hasTrigger("focus") && this.show();
    }, this.handleDocumentKeyDown = (t) => {
      t.key === "Escape" && (t.stopPropagation(), this.hide());
    }, this.handleMouseOver = () => {
      if (this.hasTrigger("hover")) {
        const t = hr(getComputedStyle(this).getPropertyValue("--show-delay"));
        clearTimeout(this.hoverTimeout), this.hoverTimeout = window.setTimeout(() => this.show(), t);
      }
    }, this.handleMouseOut = () => {
      if (this.hasTrigger("hover")) {
        const t = hr(getComputedStyle(this).getPropertyValue("--hide-delay"));
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
      }) : document.addEventListener("keydown", this.handleDocumentKeyDown), await Bt(this.body), this.body.hidden = !1, this.popup.active = !0;
      const { keyframes: o, options: r } = $t(this, "tooltip.show", { dir: this.localize.dir() });
      await Lt(this.popup.popup, o, r), this.popup.reposition(), this.emit("sl-after-show");
    } else {
      this.emit("sl-hide"), (e = this.closeWatcher) == null || e.destroy(), document.removeEventListener("keydown", this.handleDocumentKeyDown), await Bt(this.body);
      const { keyframes: o, options: r } = $t(this, "tooltip.hide", { dir: this.localize.dir() });
      await Lt(this.popup.popup, o, r), this.popup.active = !1, this.body.hidden = !0, this.emit("sl-after-hide");
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
      return this.open = !0, Oe(this, "sl-after-show");
  }
  /** Hides the tooltip */
  async hide() {
    if (this.open)
      return this.open = !1, Oe(this, "sl-after-hide");
  }
  //
  // NOTE: Tooltip is a bit unique in that we're using aria-live instead of aria-labelledby to trick screen readers into
  // announcing the content. It works really well, but it violates an accessibility rule. We're also adding the
  // aria-describedby attribute to a slot, which is required by <sl-popup> to correctly locate the first assigned
  // element, otherwise positioning is incorrect.
  //
  render() {
    return x`
      <sl-popup
        part="base"
        exportparts="
          popup:base__popup,
          arrow:base__arrow
        "
        class=${pt({
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
P.styles = [bt, cl];
P.dependencies = { "sl-popup": C };
d([
  V("slot:not([name])")
], P.prototype, "defaultSlot", 2);
d([
  V(".tooltip__body")
], P.prototype, "body", 2);
d([
  V("sl-popup")
], P.prototype, "popup", 2);
d([
  h()
], P.prototype, "content", 2);
d([
  h()
], P.prototype, "placement", 2);
d([
  h({ type: Boolean, reflect: !0 })
], P.prototype, "disabled", 2);
d([
  h({ type: Number })
], P.prototype, "distance", 2);
d([
  h({ type: Boolean, reflect: !0 })
], P.prototype, "open", 2);
d([
  h({ type: Number })
], P.prototype, "skidding", 2);
d([
  h()
], P.prototype, "trigger", 2);
d([
  h({ type: Boolean })
], P.prototype, "hoist", 2);
d([
  nt("open", { waitUntilFirstUpdate: !0 })
], P.prototype, "handleOpenChange", 1);
d([
  nt(["content", "distance", "hoist", "placement", "skidding"])
], P.prototype, "handleOptionsChange", 1);
d([
  nt("disabled")
], P.prototype, "handleDisabledChange", 1);
Tt("tooltip.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 150, easing: "ease" }
});
Tt("tooltip.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 150, easing: "ease" }
});
P.define("sl-tooltip");
function Zt(t, e) {
  t.slot || (t.slot = e);
}
var ai = Object.defineProperty, ci = Object.getOwnPropertyDescriptor, Ro = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? ci(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && ai(e, o, s), s;
};
function hi(t, e) {
  if (!t) return { href: "https://rails49.org", host: "rails49.org" };
  if (e.protocol === "https:") {
    const o = `${t}.`, r = e.host.startsWith(o) ? e.host.slice(o.length) : e.host;
    return { href: `https://${r}/`, host: r };
  }
  return { href: `http://${e.hostname}/`, host: e.hostname };
}
let de = class extends E {
  constructor() {
    super(...arguments), this.ui = "", this.help = "", this.resize = new ResizeObserver(() => this.fit());
  }
  connectedCallback() {
    super.connectedCallback(), Zt(this, "band"), this.resize.observe(this);
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
    const t = this.renderRoot.querySelector("nav"), e = () => t.scrollWidth <= t.clientWidth, o = [".ui, .rule", ".help", 'slot[name="gear"]'].map((r) => [
      ...this.renderRoot.querySelectorAll(r)
    ]);
    for (const r of o) for (const s of r) s.hidden = !1;
    t.classList.remove("cut");
    for (const r of o) {
      if (e()) return;
      for (const s of r) s.hidden = !0;
    }
    e() || t.classList.add("cut");
  }
  render() {
    const t = hi(this.ui, location), e = this.help || (this.ui ? `https://github.com/rails49/${this.ui}` : "https://github.com/rails49");
    return x`
      <nav @slotchange=${() => this.requestUpdate()}>
        <div class="lead">
          <sl-tooltip content=${t.host} placement="bottom" hoist>
            <a class="mark" href=${t.href} target="_blank" rel="noopener" aria-label=${t.host}>
              <span class="wide" aria-hidden="true">${er(tl)}</span>
              <span class="square" aria-hidden="true">${er(el)}</span>
            </a>
          </sl-tooltip>
          ${this.ui ? x`<span class="ui">${this.ui}</span>` : w}
        </div>
        ${this.ui && this.querySelector(':scope > [slot="about"]') ? x`<span class="rule" aria-hidden="true"></span>` : w}
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
de.styles = [
  N,
  _`
      :host {
        display: block;
        height: ${W(rl)}px;
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

      @media (max-width: ${W(Er)}px) {
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
Ro([
  h()
], de.prototype, "ui", 2);
Ro([
  h()
], de.prototype, "help", 2);
de = Ro([
  O("look-band")
], de);
function qe(t, e, o) {
  t.dispatchEvent(new CustomEvent(e, { detail: o, bubbles: !0, composed: !0 }));
}
const Ze = (t, e) => qe(t, "look-press", { shiftKey: e.shiftKey ?? !1 });
var di = Object.defineProperty, ui = Object.getOwnPropertyDescriptor, Ke = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? ui(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && di(e, o, s), s;
};
let It = class extends E {
  constructor() {
    super(...arguments), this.name = "", this.detail = "", this.pressable = !1;
  }
  connectedCallback() {
    super.connectedCallback(), Zt(this, "about");
  }
  render() {
    const t = x`<span class="text"
      >${this.name}${this.detail ? x`<small>${this.detail}</small>` : w}</span
    >`;
    return this.pressable ? x`<button class="about" @click=${(e) => Ze(this, e)}>
      ${t}<sl-icon name="chevron-down"></sl-icon>
    </button>` : x`<div class="about">${t}</div>`;
  }
};
It.styles = [
  N,
  _`
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
Ke([
  h()
], It.prototype, "name", 2);
Ke([
  h()
], It.prototype, "detail", 2);
Ke([
  h({ type: Boolean, reflect: !0 })
], It.prototype, "pressable", 2);
It = Ke([
  O("look-about")
], It);
const pi = () => {
  var t;
  return /Mac|iPhone|iPad/.test(((t = globalThis.navigator) == null ? void 0 : t.platform) ?? "");
}, fi = { Mod: "⌘", Shift: "⇧", Alt: "⌥", Ctrl: "⌃" };
function gi(t, e = pi()) {
  const o = t.endsWith("+") ? "+" : t.slice(t.lastIndexOf("+") + 1), r = [...t.slice(0, t.length - o.length).split("+").filter(Boolean), o];
  if (e) return r.map((n) => fi[n] ?? n).join("");
  const s = ["Mod", "Ctrl", "Alt", "Shift"], l = r.filter((n) => s.includes(n)).sort((n, a) => s.indexOf(n) - s.indexOf(a)), i = r.filter((n) => !s.includes(n));
  return [...new Set(l.map((n) => n === "Mod" ? "Ctrl" : n)), ...i].join("+");
}
const mi = (t, e) => e ? `${t}  ${gi(e)}` : t;
function ue(t) {
  const e = t.disabled ? t.reason : "";
  return x`<sl-tooltip content=${e || mi(t.label, t.key ?? "")} placement=${t.placement} hoist>
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
      ${t.word || x`<sl-icon name=${t.icon} library=${zr(t.icon)}></sl-icon>`}
    </button>
  </sl-tooltip>`;
}
const be = _`
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
var bi = Object.defineProperty, jr = (t, e, o, r) => {
  for (var s = void 0, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = i(e, o, s) || s);
  return s && bi(e, o, s), s;
};
const Do = class Do extends E {
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
    return x`<sl-tooltip content=${o} ?disabled=${!o} placement="bottom" hoist>
      <button>${e}</button>
    </sl-tooltip>`;
  }
};
Do.baseStyles = [
  N,
  be,
  _`
      button {
        max-width: 100%;
        box-sizing: border-box;
        padding: 0;
        white-space: nowrap;
        cursor: default;
      }
    `
];
let J = Do;
jr([
  h()
], J.prototype, "label");
jr([
  Rt()
], J.prototype, "text");
var vi = Object.getOwnPropertyDescriptor, yi = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? vi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = i(s) || s);
  return s;
};
let mo = class extends J {
  render() {
    return this.inTooltip(x`<slot></slot>`);
  }
};
mo.styles = [
  J.baseStyles,
  _`
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
mo = yi([
  O("look-reading")
], mo);
var wi = Object.getOwnPropertyDescriptor, xi = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? wi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = i(s) || s);
  return s;
};
let bo = class extends J {
  render() {
    return this.inTooltip(x`<slot></slot>`);
  }
};
bo.styles = [
  J.baseStyles,
  _`
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
bo = xi([
  O("look-chip")
], bo);
var _i = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, Wr = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? ki(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && _i(e, o, s), s;
};
let Re = class extends J {
  constructor() {
    super(...arguments), this.state = "down";
  }
  render() {
    return this.inTooltip(
      x`<span class="dot" role="img" aria-label=${this.state}></span><span class="text"><slot></slot></span>`
    );
  }
};
Re.styles = [
  J.baseStyles,
  _`
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
Wr([
  h({ reflect: !0 })
], Re.prototype, "state", 2);
Re = Wr([
  O("look-dot")
], Re);
var $i = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, ve = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Li(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && $i(e, o, s), s;
};
let gt = class extends E {
  constructor() {
    super(...arguments), this.icon = "", this.word = "", this.label = "", this.disabled = !1;
  }
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  render() {
    return ue({
      icon: this.icon,
      word: this.word,
      label: this.label,
      disabled: this.disabled,
      placement: "bottom",
      onPress: (t) => Ze(this, t)
    });
  }
};
gt.shadowRootOptions = { ...E.shadowRootOptions, delegatesFocus: !0 };
gt.styles = [
  N,
  be,
  _`
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
ve([
  h()
], gt.prototype, "icon", 2);
ve([
  h()
], gt.prototype, "word", 2);
ve([
  h()
], gt.prototype, "label", 2);
ve([
  h({ type: Boolean, reflect: !0 })
], gt.prototype, "disabled", 2);
gt = ve([
  O("look-band-press")
], gt);
var Ci = Object.getOwnPropertyDescriptor, Ai = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Ci(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = i(s) || s);
  return s;
};
let Te = class extends E {
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  connectedCallback() {
    super.connectedCallback(), Zt(this, "gear");
  }
  render() {
    return ue({
      icon: "gear",
      label: "Settings",
      placement: "bottom",
      onPress: (t) => Ze(this, t)
    });
  }
};
Te.shadowRootOptions = { ...E.shadowRootOptions, delegatesFocus: !0 };
Te.styles = [
  N,
  be,
  _`
      .icon {
        font-size: 1.5rem;
      }
    `
];
Te = Ai([
  O("look-gear")
], Te);
var zi = Object.defineProperty, Ei = Object.getOwnPropertyDescriptor, Xe = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Ei(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && zi(e, o, s), s;
};
const Si = {
  on: "Track power is on; turn it off",
  off: "Track power is off; turn it on",
  stopped: "Stopped; turn track power on",
  draining: "Draining: power goes off when every train is at rest; keep it on"
};
let Ut = class extends E {
  constructor() {
    super(...arguments), this.state = "off", this.reason = "", this.toggleReason = "";
  }
  connectedCallback() {
    super.connectedCallback(), Zt(this, "power");
  }
  ask(t) {
    qe(this, "look-power", { state: t });
  }
  render() {
    const t = this.reason || this.toggleReason;
    return x`
      ${ue({
      icon: "power",
      label: Si[this.state],
      disabled: !!t,
      reason: t,
      placement: "bottom",
      part: "power",
      onPress: () => this.ask(this.state === "on" ? "off" : "on")
    })}
      ${ue({
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
Ut.styles = [
  N,
  be,
  _`
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
Xe([
  h({ reflect: !0 })
], Ut.prototype, "state", 2);
Xe([
  h()
], Ut.prototype, "reason", 2);
Xe([
  h({ attribute: "toggle-reason" })
], Ut.prototype, "toggleReason", 2);
Ut = Xe([
  O("look-power")
], Ut);
var Pi = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, qr = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Qi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && Pi(e, o, s), s;
};
let Me = class extends E {
  constructor() {
    super(...arguments), this.hasViews = !1;
  }
  connectedCallback() {
    super.connectedCallback(), Zt(this, "rail");
  }
  onViews(t) {
    this.hasViews = t.target.assignedElements().length > 0;
  }
  render() {
    return x`
      <div class="views" role="group" aria-label="View" ?hidden=${!this.hasViews}>
        <slot name="views" @slotchange=${this.onViews}></slot>
      </div>
      <slot></slot>
    `;
  }
};
Me.styles = [
  N,
  _`
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

      @media ${W(ge)} {
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
qr([
  Rt()
], Me.prototype, "hasViews", 2);
Me = qr([
  O("look-rail")
], Me);
var Oi = Object.defineProperty, Ri = Object.getOwnPropertyDescriptor, Mt = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Ri(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && Oi(e, o, s), s;
};
let it = class extends E {
  constructor() {
    super(...arguments), this.name = "", this.icon = "", this.label = "", this.current = !1, this.disabled = !1, this.reason = "";
  }
  connectedCallback() {
    super.connectedCallback(), Zt(this, "views");
  }
  choose() {
    !this.current && !this.disabled && qe(this, "look-view", { name: this.name });
  }
  render() {
    const t = this.disabled ? this.reason : "";
    return x`<sl-tooltip content=${t} ?disabled=${!t} placement="right" hoist>
      <button
        aria-current=${this.current ? "page" : w}
        aria-disabled=${this.disabled ? "true" : w}
        aria-description=${t || w}
        @click=${this.choose}
      >
        <sl-icon name=${this.icon} library=${zr(this.icon)}></sl-icon>${this.label}
      </button>
    </sl-tooltip>`;
  }
};
it.styles = [
  N,
  _`
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

      @media ${W(ge)} {
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
Mt([
  h()
], it.prototype, "name", 2);
Mt([
  h()
], it.prototype, "icon", 2);
Mt([
  h()
], it.prototype, "label", 2);
Mt([
  h({ type: Boolean, reflect: !0 })
], it.prototype, "current", 2);
Mt([
  h({ type: Boolean, reflect: !0 })
], it.prototype, "disabled", 2);
Mt([
  h()
], it.prototype, "reason", 2);
it = Mt([
  O("look-view")
], it);
var Ti = Object.defineProperty, Mi = Object.getOwnPropertyDescriptor, To = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Mi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && Ti(e, o, s), s;
};
let pe = class extends E {
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
    return x`<slot></slot>`;
  }
};
pe.styles = [
  N,
  _`
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

      @media ${W(ge)} {
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
To([
  h()
], pe.prototype, "label", 2);
To([
  h({ type: Boolean, reflect: !0 })
], pe.prototype, "end", 2);
pe = To([
  O("look-group")
], pe);
var Di = Object.defineProperty, Vi = Object.getOwnPropertyDescriptor, yt = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Vi(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && Di(e, o, s), s;
};
let q = class extends E {
  constructor() {
    super(...arguments), this.icon = "", this.word = "", this.label = "", this.key = "", this.pressed = !1, this.disabled = !1, this.reason = "";
  }
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  render() {
    return ue({
      icon: this.icon,
      word: this.word,
      label: this.label,
      key: this.key,
      disabled: this.disabled,
      reason: this.reason,
      pressed: this.pressed,
      placement: "right",
      onPress: (t) => Ze(this, t)
    });
  }
};
q.shadowRootOptions = { ...E.shadowRootOptions, delegatesFocus: !0 };
q.styles = [
  N,
  be,
  _`
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

      @media ${W(ge)} {
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
yt([
  h()
], q.prototype, "icon", 2);
yt([
  h()
], q.prototype, "word", 2);
yt([
  h()
], q.prototype, "label", 2);
yt([
  h()
], q.prototype, "key", 2);
yt([
  h({ type: Boolean, reflect: !0 })
], q.prototype, "pressed", 2);
yt([
  h({ type: Boolean, reflect: !0 })
], q.prototype, "disabled", 2);
yt([
  h()
], q.prototype, "reason", 2);
q = yt([
  O("look-command")
], q);
function* Mo(t = document.activeElement) {
  t != null && (yield t, "shadowRoot" in t && t.shadowRoot && t.shadowRoot.mode !== "closed" && (yield* Ps(Mo(t.shadowRoot.activeElement))));
}
function Bi() {
  return [...Mo()].pop();
}
var dr = /* @__PURE__ */ new WeakMap();
function Zr(t) {
  let e = dr.get(t);
  return e || (e = window.getComputedStyle(t, null), dr.set(t, e)), e;
}
function Fi(t) {
  if (typeof t.checkVisibility == "function")
    return t.checkVisibility({ checkOpacity: !1, checkVisibilityCSS: !0 });
  const e = Zr(t);
  return e.visibility !== "hidden" && e.display !== "none";
}
function Hi(t) {
  const e = Zr(t), { overflowY: o, overflowX: r } = e;
  return o === "scroll" || r === "scroll" ? !0 : o !== "auto" || r !== "auto" ? !1 : t.scrollHeight > t.clientHeight && o === "auto" || t.scrollWidth > t.clientWidth && r === "auto";
}
function Ni(t) {
  const e = t.tagName.toLowerCase(), o = Number(t.getAttribute("tabindex"));
  if (t.hasAttribute("tabindex") && (isNaN(o) || o <= -1) || t.hasAttribute("disabled") || t.closest("[inert]"))
    return !1;
  if (e === "input" && t.getAttribute("type") === "radio") {
    const l = t.getRootNode(), i = `input[type='radio'][name="${t.getAttribute("name")}"]`, n = l.querySelector(`${i}:checked`);
    return n ? n === t : l.querySelector(i) === t;
  }
  return Fi(t) ? (e === "audio" || e === "video") && t.hasAttribute("controls") || t.hasAttribute("tabindex") || t.hasAttribute("contenteditable") && t.getAttribute("contenteditable") !== "false" || [
    "button",
    "input",
    "select",
    "textarea",
    "a",
    "audio",
    "video",
    "summary",
    "iframe"
  ].includes(e) ? !0 : Hi(t) : !1;
}
function Ii(t, e) {
  var o;
  return ((o = t.getRootNode({ composed: !0 })) == null ? void 0 : o.host) !== e;
}
function ur(t) {
  const e = /* @__PURE__ */ new WeakMap(), o = [];
  function r(s) {
    if (s instanceof Element) {
      if (s.hasAttribute("inert") || s.closest("[inert]") || e.has(s))
        return;
      e.set(s, !0), !o.includes(s) && Ni(s) && o.push(s), s instanceof HTMLSlotElement && Ii(s, t) && s.assignedElements({ flatten: !0 }).forEach((l) => {
        r(l);
      }), s.shadowRoot !== null && s.shadowRoot.mode === "open" && r(s.shadowRoot);
    }
    for (const l of s.children)
      r(l);
  }
  return r(t), o.sort((s, l) => {
    const i = Number(s.getAttribute("tabindex")) || 0;
    return (Number(l.getAttribute("tabindex")) || 0) - i;
  });
}
var re = [], Ui = class {
  constructor(t) {
    this.tabDirection = "forward", this.handleFocusIn = () => {
      this.isActive() && this.checkFocus();
    }, this.handleKeyDown = (e) => {
      var o;
      if (e.key !== "Tab" || this.isExternalActivated || !this.isActive()) return;
      const r = Bi();
      if (this.previousFocus = r, this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus))
        return;
      e.shiftKey ? this.tabDirection = "backward" : this.tabDirection = "forward";
      const s = ur(this.element);
      let l = s.findIndex((n) => n === r);
      this.previousFocus = this.currentFocus;
      const i = this.tabDirection === "forward" ? 1 : -1;
      for (; ; ) {
        l + i >= s.length ? l = 0 : l + i < 0 ? l = s.length - 1 : l += i, this.previousFocus = this.currentFocus;
        const n = (
          /** @type {HTMLElement} */
          s[l]
        );
        if (this.tabDirection === "backward" && this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus) || n && this.possiblyHasTabbableChildren(n))
          return;
        e.preventDefault(), this.currentFocus = n, (o = this.currentFocus) == null || o.focus({ preventScroll: !1 });
        const a = [...Mo()];
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
    re.push(this.element), document.addEventListener("focusin", this.handleFocusIn), document.addEventListener("keydown", this.handleKeyDown), document.addEventListener("keyup", this.handleKeyUp);
  }
  /** Deactivates focus trapping. */
  deactivate() {
    re = re.filter((t) => t !== this.element), this.currentFocus = null, document.removeEventListener("focusin", this.handleFocusIn), document.removeEventListener("keydown", this.handleKeyDown), document.removeEventListener("keyup", this.handleKeyUp);
  }
  /** Determines if this modal element is currently active or not. */
  isActive() {
    return re[re.length - 1] === this.element;
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
      const t = ur(this.element);
      if (!this.element.matches(":focus-within")) {
        const e = t[0], o = t[t.length - 1], r = this.tabDirection === "forward" ? e : o;
        typeof (r == null ? void 0 : r.focus) == "function" && (this.currentFocus = r, r.focus({ preventScroll: !1 }));
      }
    }
  }
  possiblyHasTabbableChildren(t) {
    return this.elementsWithTabbableControls.includes(t.tagName.toLowerCase()) || t.hasAttribute("controls");
  }
}, vo = /* @__PURE__ */ new Set();
function ji() {
  const t = document.documentElement.clientWidth;
  return Math.abs(window.innerWidth - t);
}
function Wi() {
  const t = Number(getComputedStyle(document.body).paddingRight.replace(/px/, ""));
  return isNaN(t) || !t ? 0 : t;
}
function pr(t) {
  if (vo.add(t), !document.documentElement.classList.contains("sl-scroll-lock")) {
    const e = ji() + Wi();
    let o = getComputedStyle(document.documentElement).scrollbarGutter;
    (!o || o === "auto") && (o = "stable"), e < 2 && (o = ""), document.documentElement.style.setProperty("--sl-scroll-lock-gutter", o), document.documentElement.classList.add("sl-scroll-lock"), document.documentElement.style.setProperty("--sl-scroll-lock-size", `${e}px`);
  }
}
function fr(t) {
  vo.delete(t), vo.size === 0 && (document.documentElement.classList.remove("sl-scroll-lock"), document.documentElement.style.removeProperty("--sl-scroll-lock-size"));
}
var qi = _`
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
`, Zi = (t) => {
  var e;
  const { activeElement: o } = document;
  o && t.contains(o) && ((e = document.activeElement) == null || e.blur());
}, Ki = _`
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
const Kr = Symbol.for(""), Xi = (t) => {
  if ((t == null ? void 0 : t.r) === Kr) return t == null ? void 0 : t._$litStatic$;
}, De = (t, ...e) => ({ _$litStatic$: e.reduce((o, r, s) => o + ((l) => {
  if (l._$litStatic$ !== void 0) return l._$litStatic$;
  throw Error(`Value passed to 'literal' function must be a 'literal' result: ${l}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
})(r) + t[s + 1], t[0]), r: Kr }), gr = /* @__PURE__ */ new Map(), Yi = (t) => (e, ...o) => {
  const r = o.length;
  let s, l;
  const i = [], n = [];
  let a, c = 0, p = !1;
  for (; c < r; ) {
    for (a = e[c]; c < r && (l = o[c], (s = Xi(l)) !== void 0); ) a += s + e[++c], p = !0;
    c !== r && n.push(l), i.push(a), c++;
  }
  if (c === r && i.push(e[r]), p) {
    const u = i.join("$$lit$$");
    (e = gr.get(u)) === void 0 && (i.raw = i, gr.set(u, e = i)), o = n;
  }
  return t(e, ...o);
}, Ce = Yi(x);
var B = class extends H {
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
    const t = !!this.href, e = t ? De`a` : De`button`;
    return Ce`
      <${e}
        part="base"
        class=${pt({
      "icon-button": !0,
      "icon-button--disabled": !t && this.disabled,
      "icon-button--focused": this.hasFocus
    })}
        ?disabled=${z(t ? void 0 : this.disabled)}
        type=${z(t ? void 0 : "button")}
        href=${z(t ? this.href : void 0)}
        target=${z(t ? this.target : void 0)}
        download=${z(t ? this.download : void 0)}
        rel=${z(t && this.target ? "noreferrer noopener" : void 0)}
        role=${z(t ? void 0 : "button")}
        aria-disabled=${this.disabled ? "true" : "false"}
        aria-label="${this.label}"
        tabindex=${this.disabled ? "-1" : "0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${z(this.name)}
          library=${z(this.library)}
          src=${z(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${e}>
    `;
  }
};
B.styles = [bt, Ki];
B.dependencies = { "sl-icon": Z };
d([
  V(".icon-button")
], B.prototype, "button", 2);
d([
  Rt()
], B.prototype, "hasFocus", 2);
d([
  h()
], B.prototype, "name", 2);
d([
  h()
], B.prototype, "library", 2);
d([
  h()
], B.prototype, "src", 2);
d([
  h()
], B.prototype, "href", 2);
d([
  h()
], B.prototype, "target", 2);
d([
  h()
], B.prototype, "download", 2);
d([
  h()
], B.prototype, "label", 2);
d([
  h({ type: Boolean, reflect: !0 })
], B.prototype, "disabled", 2);
var tt = class extends H {
  constructor() {
    super(...arguments), this.hasSlotController = new Lo(this, "footer"), this.localize = new me(this), this.modal = new Ui(this), this.open = !1, this.label = "", this.noHeader = !1, this.handleDocumentKeyDown = (t) => {
      t.key === "Escape" && this.modal.isActive() && this.open && (t.stopPropagation(), this.requestClose("keyboard"));
    };
  }
  firstUpdated() {
    this.dialog.hidden = !this.open, this.open && (this.addOpenListeners(), this.modal.activate(), pr(this));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.modal.deactivate(), fr(this), this.removeOpenListeners();
  }
  requestClose(t) {
    if (this.emit("sl-request-close", {
      cancelable: !0,
      detail: { source: t }
    }).defaultPrevented) {
      const o = $t(this, "dialog.denyClose", { dir: this.localize.dir() });
      Lt(this.panel, o.keyframes, o.options);
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
      this.emit("sl-show"), this.addOpenListeners(), this.originalTrigger = document.activeElement, this.modal.activate(), pr(this);
      const t = this.querySelector("[autofocus]");
      t && t.removeAttribute("autofocus"), await Promise.all([Bt(this.dialog), Bt(this.overlay)]), this.dialog.hidden = !1, requestAnimationFrame(() => {
        this.emit("sl-initial-focus", { cancelable: !0 }).defaultPrevented || (t ? t.focus({ preventScroll: !0 }) : this.panel.focus({ preventScroll: !0 })), t && t.setAttribute("autofocus", "");
      });
      const e = $t(this, "dialog.show", { dir: this.localize.dir() }), o = $t(this, "dialog.overlay.show", { dir: this.localize.dir() });
      await Promise.all([
        Lt(this.panel, e.keyframes, e.options),
        Lt(this.overlay, o.keyframes, o.options)
      ]), this.emit("sl-after-show");
    } else {
      Zi(this), this.emit("sl-hide"), this.removeOpenListeners(), this.modal.deactivate(), await Promise.all([Bt(this.dialog), Bt(this.overlay)]);
      const t = $t(this, "dialog.hide", { dir: this.localize.dir() }), e = $t(this, "dialog.overlay.hide", { dir: this.localize.dir() });
      await Promise.all([
        Lt(this.overlay, e.keyframes, e.options).then(() => {
          this.overlay.hidden = !0;
        }),
        Lt(this.panel, t.keyframes, t.options).then(() => {
          this.panel.hidden = !0;
        })
      ]), this.dialog.hidden = !0, this.overlay.hidden = !1, this.panel.hidden = !1, fr(this);
      const o = this.originalTrigger;
      typeof (o == null ? void 0 : o.focus) == "function" && setTimeout(() => o.focus()), this.emit("sl-after-hide");
    }
  }
  /** Shows the dialog. */
  async show() {
    if (!this.open)
      return this.open = !0, Oe(this, "sl-after-show");
  }
  /** Hides the dialog */
  async hide() {
    if (this.open)
      return this.open = !1, Oe(this, "sl-after-hide");
  }
  render() {
    return x`
      <div
        part="base"
        class=${pt({
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
          aria-label=${z(this.noHeader ? this.label : void 0)}
          aria-labelledby=${z(this.noHeader ? void 0 : "title")}
          tabindex="-1"
        >
          ${this.noHeader ? "" : x`
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
tt.styles = [bt, qi];
tt.dependencies = {
  "sl-icon-button": B
};
d([
  V(".dialog")
], tt.prototype, "dialog", 2);
d([
  V(".dialog__panel")
], tt.prototype, "panel", 2);
d([
  V(".dialog__overlay")
], tt.prototype, "overlay", 2);
d([
  h({ type: Boolean, reflect: !0 })
], tt.prototype, "open", 2);
d([
  h({ reflect: !0 })
], tt.prototype, "label", 2);
d([
  h({ attribute: "no-header", type: Boolean, reflect: !0 })
], tt.prototype, "noHeader", 2);
d([
  nt("open", { waitUntilFirstUpdate: !0 })
], tt.prototype, "handleOpenChange", 1);
Tt("dialog.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 250, easing: "ease" }
});
Tt("dialog.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 250, easing: "ease" }
});
Tt("dialog.denyClose", {
  keyframes: [{ scale: 1 }, { scale: 1.02 }, { scale: 1 }],
  options: { duration: 250 }
});
Tt("dialog.overlay.show", {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  options: { duration: 250 }
});
Tt("dialog.overlay.hide", {
  keyframes: [{ opacity: 1 }, { opacity: 0 }],
  options: { duration: 250 }
});
tt.define("sl-dialog");
const Xr = _`
  sl-button::part(base):hover {
    filter: brightness(1.06);
  }

  sl-dialog::part(panel) {
    color: var(--sl-color-neutral-900);
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
var Gi = Object.defineProperty, Ji = Object.getOwnPropertyDescriptor, ye = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? Ji(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && Gi(e, o, s), s;
};
let Qt = class extends E {
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
    return x`<sl-dialog label=${this.label} ?open=${this.open} @sl-show=${this.follow} @sl-hide=${this.follow}>
      <slot></slot>
      <div slot="footer" class="footer"><slot name="footer"></slot></div>
    </sl-dialog>`;
  }
};
Qt.styles = [
  N,
  Xr,
  _`
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
ye([
  h()
], Qt.prototype, "label", 2);
ye([
  h({ reflect: !0 })
], Qt.prototype, "size", 2);
ye([
  h({ type: Boolean, reflect: !0 })
], Qt.prototype, "open", 2);
ye([
  V("sl-dialog")
], Qt.prototype, "dialog", 2);
Qt = ye([
  O("look-dialog")
], Qt);
var tn = _`
  :host {
    --track-width: 2px;
    --track-color: rgb(128 128 128 / 25%);
    --indicator-color: var(--sl-color-primary-600);
    --speed: 2s;

    display: inline-flex;
    width: 1em;
    height: 1em;
    flex: none;
  }

  .spinner {
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
  }

  .spinner__track,
  .spinner__indicator {
    fill: none;
    stroke-width: var(--track-width);
    r: calc(0.5em - var(--track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
    transform-origin: 50% 50%;
  }

  .spinner__track {
    stroke: var(--track-color);
    transform-origin: 0% 0%;
  }

  .spinner__indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    animation: spin var(--speed) linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.05em, 3em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.05em, 3em;
    }
  }
`, Yr = class extends H {
  constructor() {
    super(...arguments), this.localize = new me(this);
  }
  render() {
    return x`
      <svg part="base" class="spinner" role="progressbar" aria-label=${this.localize.term("loading")}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `;
  }
};
Yr.styles = [bt, tn];
var en = _`
  :host {
    display: inline-block;
    position: relative;
    width: auto;
    cursor: pointer;
  }

  .button {
    display: inline-flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    border-style: solid;
    border-width: var(--sl-input-border-width);
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-font-weight-semibold);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0;
    transition:
      var(--sl-transition-x-fast) background-color,
      var(--sl-transition-x-fast) color,
      var(--sl-transition-x-fast) border,
      var(--sl-transition-x-fast) box-shadow;
    cursor: inherit;
  }

  .button::-moz-focus-inner {
    border: 0;
  }

  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* When disabled, prevent mouse events from bubbling up from children */
  .button--disabled * {
    pointer-events: none;
  }

  .button__prefix,
  .button__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .button__label {
    display: inline-block;
  }

  .button__label::slotted(sl-icon) {
    vertical-align: -2px;
  }

  /*
   * Standard buttons
   */

  /* Default */
  .button--standard.button--default {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--standard.button--default:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-300);
    color: var(--sl-color-primary-700);
  }

  .button--standard.button--default:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-100);
    border-color: var(--sl-color-primary-400);
    color: var(--sl-color-primary-700);
  }

  /* Primary */
  .button--standard.button--primary {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--standard.button--success {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:hover:not(.button--disabled) {
    background-color: var(--sl-color-success-500);
    border-color: var(--sl-color-success-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:active:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--standard.button--neutral {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:hover:not(.button--disabled) {
    background-color: var(--sl-color-neutral-500);
    border-color: var(--sl-color-neutral-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:active:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--standard.button--warning {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }
  .button--standard.button--warning:hover:not(.button--disabled) {
    background-color: var(--sl-color-warning-500);
    border-color: var(--sl-color-warning-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--warning:active:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--standard.button--danger {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:hover:not(.button--disabled) {
    background-color: var(--sl-color-danger-500);
    border-color: var(--sl-color-danger-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:active:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  /*
   * Outline buttons
   */

  .button--outline {
    background: none;
    border: solid 1px;
  }

  /* Default */
  .button--outline.button--default {
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--outline.button--default:hover:not(.button--disabled),
  .button--outline.button--default.button--checked:not(.button--disabled) {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--default:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Primary */
  .button--outline.button--primary {
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-primary-600);
  }

  .button--outline.button--primary:hover:not(.button--disabled),
  .button--outline.button--primary.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--primary:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--outline.button--success {
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-success-600);
  }

  .button--outline.button--success:hover:not(.button--disabled),
  .button--outline.button--success.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--success:active:not(.button--disabled) {
    border-color: var(--sl-color-success-700);
    background-color: var(--sl-color-success-700);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--outline.button--neutral {
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-600);
  }

  .button--outline.button--neutral:hover:not(.button--disabled),
  .button--outline.button--neutral.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--neutral:active:not(.button--disabled) {
    border-color: var(--sl-color-neutral-700);
    background-color: var(--sl-color-neutral-700);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--outline.button--warning {
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-warning-600);
  }

  .button--outline.button--warning:hover:not(.button--disabled),
  .button--outline.button--warning.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--warning:active:not(.button--disabled) {
    border-color: var(--sl-color-warning-700);
    background-color: var(--sl-color-warning-700);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--outline.button--danger {
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-danger-600);
  }

  .button--outline.button--danger:hover:not(.button--disabled),
  .button--outline.button--danger.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--danger:active:not(.button--disabled) {
    border-color: var(--sl-color-danger-700);
    background-color: var(--sl-color-danger-700);
    color: var(--sl-color-neutral-0);
  }

  @media (forced-colors: active) {
    .button.button--outline.button--checked:not(.button--disabled) {
      outline: solid 2px transparent;
    }
  }

  /*
   * Text buttons
   */

  .button--text {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-600);
  }

  .button--text:hover:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:focus-visible:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:active:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-700);
  }

  /*
   * Size modifiers
   */

  .button--small {
    height: auto;
    min-height: var(--sl-input-height-small);
    font-size: var(--sl-button-font-size-small);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
  }

  .button--medium {
    height: auto;
    min-height: var(--sl-input-height-medium);
    font-size: var(--sl-button-font-size-medium);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
  }

  .button--large {
    height: auto;
    min-height: var(--sl-input-height-large);
    font-size: var(--sl-button-font-size-large);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
  }

  /*
   * Pill modifier
   */

  .button--pill.button--small {
    border-radius: var(--sl-input-height-small);
  }

  .button--pill.button--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .button--pill.button--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Circle modifier
   */

  .button--circle {
    padding-left: 0;
    padding-right: 0;
  }

  .button--circle.button--small {
    width: var(--sl-input-height-small);
    border-radius: 50%;
  }

  .button--circle.button--medium {
    width: var(--sl-input-height-medium);
    border-radius: 50%;
  }

  .button--circle.button--large {
    width: var(--sl-input-height-large);
    border-radius: 50%;
  }

  .button--circle .button__prefix,
  .button--circle .button__suffix,
  .button--circle .button__caret {
    display: none;
  }

  /*
   * Caret modifier
   */

  .button--caret .button__suffix {
    display: none;
  }

  .button--caret .button__caret {
    height: auto;
  }

  /*
   * Loading modifier
   */

  .button--loading {
    position: relative;
    cursor: wait;
  }

  .button--loading .button__prefix,
  .button--loading .button__label,
  .button--loading .button__suffix,
  .button--loading .button__caret {
    visibility: hidden;
  }

  .button--loading sl-spinner {
    --indicator-color: currentColor;
    position: absolute;
    font-size: 1em;
    height: 1em;
    width: 1em;
    top: calc(50% - 0.5em);
    left: calc(50% - 0.5em);
  }

  /*
   * Badges
   */

  .button ::slotted(sl-badge) {
    position: absolute;
    top: 0;
    right: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  .button--rtl ::slotted(sl-badge) {
    right: auto;
    left: 0;
    translate: -50% -50%;
  }

  /*
   * Button spacing
   */

  .button--has-label.button--small .button__label {
    padding: 0 var(--sl-spacing-small);
  }

  .button--has-label.button--medium .button__label {
    padding: 0 var(--sl-spacing-medium);
  }

  .button--has-label.button--large .button__label {
    padding: 0 var(--sl-spacing-large);
  }

  .button--has-prefix.button--small {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--small .button__label {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--medium {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--medium .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-suffix.button--small,
  .button--caret.button--small {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--small .button__label,
  .button--caret.button--small .button__label {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--medium,
  .button--caret.button--medium {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--medium .button__label,
  .button--caret.button--medium .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large,
  .button--caret.button--large {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large .button__label,
  .button--caret.button--large .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  /*
   * Button groups support a variety of button types (e.g. buttons with tooltips, buttons as dropdown triggers, etc.).
   * This means buttons aren't always direct descendants of the button group, thus we can't target them with the
   * ::slotted selector. To work around this, the button group component does some magic to add these special classes to
   * buttons and we style them here instead.
   */

  :host([data-sl-button-group__button--first]:not([data-sl-button-group__button--last])) .button {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host([data-sl-button-group__button--inner]) .button {
    border-radius: 0;
  }

  :host([data-sl-button-group__button--last]:not([data-sl-button-group__button--first])) .button {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* All except the first */
  :host([data-sl-button-group__button]:not([data-sl-button-group__button--first])) {
    margin-inline-start: calc(-1 * var(--sl-input-border-width));
  }

  /* Add a visual separator between solid buttons */
  :host(
      [data-sl-button-group__button]:not(
          [data-sl-button-group__button--first],
          [data-sl-button-group__button--radio],
          [variant='default']
        ):not(:hover)
    )
    .button:after {
    content: '';
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    bottom: 0;
    border-left: solid 1px rgb(128 128 128 / 33%);
    mix-blend-mode: multiply;
  }

  /* Bump hovered, focused, and checked buttons up so their focus ring isn't clipped */
  :host([data-sl-button-group__button--hover]) {
    z-index: 1;
  }

  /* Focus and checked are always on top */
  :host([data-sl-button-group__button--focus]),
  :host([data-sl-button-group__button][checked]) {
    z-index: 2;
  }
`, k = class extends H {
  constructor() {
    super(...arguments), this.formControlController = new Lr(this, {
      assumeInteractionOn: ["click"]
    }), this.hasSlotController = new Lo(this, "[default]", "prefix", "suffix"), this.localize = new me(this), this.hasFocus = !1, this.invalid = !1, this.title = "", this.variant = "default", this.size = "medium", this.caret = !1, this.disabled = !1, this.loading = !1, this.outline = !1, this.pill = !1, this.circle = !1, this.type = "button", this.name = "", this.value = "", this.href = "", this.rel = "noreferrer noopener";
  }
  /** Gets the validity state object */
  get validity() {
    return this.isButton() ? this.button.validity : $o;
  }
  /** Gets the validation message */
  get validationMessage() {
    return this.isButton() ? this.button.validationMessage : "";
  }
  firstUpdated() {
    this.isButton() && this.formControlController.updateValidity();
  }
  handleBlur() {
    this.hasFocus = !1, this.emit("sl-blur");
  }
  handleFocus() {
    this.hasFocus = !0, this.emit("sl-focus");
  }
  handleClick() {
    this.type === "submit" && this.formControlController.submit(this), this.type === "reset" && this.formControlController.reset(this);
  }
  handleInvalid(t) {
    this.formControlController.setValidity(!1), this.formControlController.emitInvalidEvent(t);
  }
  isButton() {
    return !this.href;
  }
  isLink() {
    return !!this.href;
  }
  handleDisabledChange() {
    this.isButton() && this.formControlController.setValidity(this.disabled);
  }
  /** Simulates a click on the button. */
  click() {
    this.button.click();
  }
  /** Sets focus on the button. */
  focus(t) {
    this.button.focus(t);
  }
  /** Removes focus from the button. */
  blur() {
    this.button.blur();
  }
  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    return this.isButton() ? this.button.checkValidity() : !0;
  }
  /** Gets the associated form, if one exists. */
  getForm() {
    return this.formControlController.getForm();
  }
  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.isButton() ? this.button.reportValidity() : !0;
  }
  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(t) {
    this.isButton() && (this.button.setCustomValidity(t), this.formControlController.updateValidity());
  }
  render() {
    const t = this.isLink(), e = t ? De`a` : De`button`;
    return Ce`
      <${e}
        part="base"
        class=${pt({
      button: !0,
      "button--default": this.variant === "default",
      "button--primary": this.variant === "primary",
      "button--success": this.variant === "success",
      "button--neutral": this.variant === "neutral",
      "button--warning": this.variant === "warning",
      "button--danger": this.variant === "danger",
      "button--text": this.variant === "text",
      "button--small": this.size === "small",
      "button--medium": this.size === "medium",
      "button--large": this.size === "large",
      "button--caret": this.caret,
      "button--circle": this.circle,
      "button--disabled": this.disabled,
      "button--focused": this.hasFocus,
      "button--loading": this.loading,
      "button--standard": !this.outline,
      "button--outline": this.outline,
      "button--pill": this.pill,
      "button--rtl": this.localize.dir() === "rtl",
      "button--has-label": this.hasSlotController.test("[default]"),
      "button--has-prefix": this.hasSlotController.test("prefix"),
      "button--has-suffix": this.hasSlotController.test("suffix")
    })}
        ?disabled=${z(t ? void 0 : this.disabled)}
        type=${z(t ? void 0 : this.type)}
        title=${this.title}
        name=${z(t ? void 0 : this.name)}
        value=${z(t ? void 0 : this.value)}
        href=${z(t && !this.disabled ? this.href : void 0)}
        target=${z(t ? this.target : void 0)}
        download=${z(t ? this.download : void 0)}
        rel=${z(t ? this.rel : void 0)}
        role=${z(t ? void 0 : "button")}
        aria-disabled=${this.disabled ? "true" : "false"}
        tabindex=${this.disabled ? "-1" : "0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @invalid=${this.isButton() ? this.handleInvalid : null}
        @click=${this.handleClick}
      >
        <slot name="prefix" part="prefix" class="button__prefix"></slot>
        <slot part="label" class="button__label"></slot>
        <slot name="suffix" part="suffix" class="button__suffix"></slot>
        ${this.caret ? Ce` <sl-icon part="caret" class="button__caret" library="system" name="caret"></sl-icon> ` : ""}
        ${this.loading ? Ce`<sl-spinner part="spinner"></sl-spinner>` : ""}
      </${e}>
    `;
  }
};
k.styles = [bt, en];
k.dependencies = {
  "sl-icon": Z,
  "sl-spinner": Yr
};
d([
  V(".button")
], k.prototype, "button", 2);
d([
  Rt()
], k.prototype, "hasFocus", 2);
d([
  Rt()
], k.prototype, "invalid", 2);
d([
  h()
], k.prototype, "title", 2);
d([
  h({ reflect: !0 })
], k.prototype, "variant", 2);
d([
  h({ reflect: !0 })
], k.prototype, "size", 2);
d([
  h({ type: Boolean, reflect: !0 })
], k.prototype, "caret", 2);
d([
  h({ type: Boolean, reflect: !0 })
], k.prototype, "disabled", 2);
d([
  h({ type: Boolean, reflect: !0 })
], k.prototype, "loading", 2);
d([
  h({ type: Boolean, reflect: !0 })
], k.prototype, "outline", 2);
d([
  h({ type: Boolean, reflect: !0 })
], k.prototype, "pill", 2);
d([
  h({ type: Boolean, reflect: !0 })
], k.prototype, "circle", 2);
d([
  h()
], k.prototype, "type", 2);
d([
  h()
], k.prototype, "name", 2);
d([
  h()
], k.prototype, "value", 2);
d([
  h()
], k.prototype, "href", 2);
d([
  h()
], k.prototype, "target", 2);
d([
  h()
], k.prototype, "rel", 2);
d([
  h()
], k.prototype, "download", 2);
d([
  h()
], k.prototype, "form", 2);
d([
  h({ attribute: "formaction" })
], k.prototype, "formAction", 2);
d([
  h({ attribute: "formenctype" })
], k.prototype, "formEnctype", 2);
d([
  h({ attribute: "formmethod" })
], k.prototype, "formMethod", 2);
d([
  h({ attribute: "formnovalidate", type: Boolean })
], k.prototype, "formNoValidate", 2);
d([
  h({ attribute: "formtarget" })
], k.prototype, "formTarget", 2);
d([
  nt("disabled", { waitUntilFirstUpdate: !0 })
], k.prototype, "handleDisabledChange", 1);
k.define("sl-button");
var on = Object.defineProperty, rn = Object.getOwnPropertyDescriptor, Kt = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? rn(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && on(e, o, s), s;
};
let mt = class extends E {
  constructor() {
    super(...arguments), this.label = "", this.text = "", this.error = "", this.open = !1;
  }
  async show() {
    return await this.updateComplete, this.dialog.show();
  }
  async hide() {
    return await this.updateComplete, this.dialog.hide();
  }
  follow(t) {
    this.open = t.type === "sl-show";
  }
  render() {
    return x`<look-dialog
      size="large"
      label=${this.label}
      ?open=${this.open}
      @sl-show=${this.follow}
      @sl-hide=${this.follow}
    >
      ${this.error ? x`<p class="error">${this.error}</p>` : x`<pre>${this.text}</pre>`}
      <sl-button slot="footer" @click=${() => this.hide()}>Close</sl-button>
    </look-dialog>`;
  }
};
mt.styles = [
  Xr,
  _`
      pre {
        margin: 0;
        max-height: 60vh;
        overflow: auto;
        padding: var(--sl-spacing-small);
        border: 1px solid var(--sl-color-neutral-200);
        border-radius: var(--sl-border-radius-medium);
        font-family: var(--sl-font-mono);
        font-size: var(--sl-font-size-small);
        white-space: pre;
      }

      .error {
        margin: 0;
        color: var(--sl-color-danger-700);
      }
    `
];
Kt([
  h()
], mt.prototype, "label", 2);
Kt([
  h()
], mt.prototype, "text", 2);
Kt([
  h()
], mt.prototype, "error", 2);
Kt([
  h({ type: Boolean, reflect: !0 })
], mt.prototype, "open", 2);
Kt([
  V("look-dialog")
], mt.prototype, "dialog", 2);
mt = Kt([
  O("look-text-dialog")
], mt);
var sn = Object.defineProperty, ln = Object.getOwnPropertyDescriptor, Gr = (t, e, o, r) => {
  for (var s = r > 1 ? void 0 : r ? ln(e, o) : e, l = t.length - 1, i; l >= 0; l--)
    (i = t[l]) && (s = (r ? i(e, o, s) : i(s)) || s);
  return r && s && sn(e, o, s), s;
};
let Ve = class extends E {
  constructor() {
    super(), this.axis = "x", this.addEventListener("pointerdown", (t) => this.grab(t)), this.addEventListener("pointermove", (t) => this.move(t)), this.addEventListener("pointerup", () => this.release()), this.addEventListener("pointercancel", () => this.release());
  }
  willUpdate(t) {
    t.has("axis") && this.release();
  }
  render() {
    return x`<div></div>`;
  }
  grab(t) {
    var e;
    t.button === 0 && (t.preventDefault(), (e = this.setPointerCapture) == null || e.call(this, t.pointerId), this.toggleAttribute("dragging", !0));
  }
  move(t) {
    this.hasAttribute("dragging") && qe(this, "look-gap-move", { x: t.clientX, y: t.clientY });
  }
  release() {
    this.removeAttribute("dragging");
  }
};
Ve.styles = _`
    :host {
      --reach: 0.3rem;
      display: block;
      position: relative;
      z-index: 1;
      touch-action: none;
    }

    @media (pointer: coarse) {
      :host {
        --reach: 0.7rem;
      }
    }

    :host([axis='x']) {
      width: ${W(tr)}px;
      cursor: col-resize;
    }

    :host([axis='y']) {
      height: ${W(tr)}px;
      cursor: row-resize;
    }

    div {
      position: absolute;
    }

    :host([axis='x']) div {
      inset: 0 calc(-1 * var(--reach));
    }

    :host([axis='y']) div {
      inset: calc(-1 * var(--reach)) 0;
    }

    :host(:hover),
    :host([dragging]) {
      background: var(--sl-color-primary-600);
    }
  `;
Gr([
  h({ reflect: !0 })
], Ve.prototype, "axis", 2);
Ve = Gr([
  O("look-gap")
], Ve);
const mr = {
  "chevron-down": Zs,
  gear: Ks,
  power: Xs,
  "question-circle": Ys,
  "sign-stop-fill": Gs
};
Cr("default", {
  resolver: (t) => t in mr ? Ar(mr[t]) : ""
});
const Jr = new CSSStyleSheet();
Jr.replaceSync(Js);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, Jr];
export {
  tr as GAP_PX,
  It as LookAbout,
  de as LookBand,
  gt as LookBandPress,
  bo as LookChip,
  q as LookCommand,
  Qt as LookDialog,
  Re as LookDot,
  Ve as LookGap,
  Te as LookGear,
  pe as LookGroup,
  Ut as LookPower,
  Me as LookRail,
  mo as LookReading,
  ho as LookShell,
  mt as LookTextDialog,
  it as LookView,
  Er as NARROW_WIDTH_PX,
  ol as TOKENS,
  sl as TURN_HEIGHT_PX,
  Xr as lookTheme
};
