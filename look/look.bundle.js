var jt = "";
function bo(e) {
  jt = e;
}
function Rs(e = "") {
  if (!jt) {
    const t = [...document.getElementsByTagName("script")], o = t.find((s) => s.hasAttribute("data-shoelace"));
    if (o)
      bo(o.getAttribute("data-shoelace"));
    else {
      const s = t.find((r) => /shoelace(\.min)?\.js($|\?)/.test(r.src) || /shoelace-autoloader(\.min)?\.js($|\?)/.test(r.src));
      let l = "";
      s && (l = s.getAttribute("src")), bo(l.split("/").slice(0, -1).join("/"));
    }
  }
  return jt.replace(/\/$/, "") + (e ? `/${e.replace(/^\//, "")}` : "");
}
var Ms = {
  name: "default",
  resolver: (e) => Rs(`assets/icons/${e}.svg`)
}, Ts = Ms, yo = {
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
}, Ds = {
  name: "system",
  resolver: (e) => e in yo ? `data:image/svg+xml,${encodeURIComponent(yo[e])}` : ""
}, Hs = Ds, dt = [Ts, Hs], ut = [];
function Bs(e) {
  ut.push(e);
}
function Ns(e) {
  ut = ut.filter((t) => t !== e);
}
function wo(e) {
  return dt.find((t) => t.name === e);
}
function Go(e, t) {
  Vs(e), dt.push({
    name: e,
    resolver: t.resolver,
    mutator: t.mutator,
    spriteSheet: t.spriteSheet
  }), ut.forEach((o) => {
    o.library === e && o.setIcon();
  });
}
function Vs(e) {
  dt = dt.filter((t) => t.name !== e);
}
var Jo = Object.defineProperty, Fs = Object.defineProperties, Us = Object.getOwnPropertyDescriptor, js = Object.getOwnPropertyDescriptors, xo = Object.getOwnPropertySymbols, Is = Object.prototype.hasOwnProperty, Ws = Object.prototype.propertyIsEnumerable, Rt = (e, t) => (t = Symbol[e]) ? t : Symbol.for("Symbol." + e), eo = (e) => {
  throw TypeError(e);
}, $o = (e, t, o) => t in e ? Jo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[t] = o, $t = (e, t) => {
  for (var o in t || (t = {}))
    Is.call(t, o) && $o(e, o, t[o]);
  if (xo)
    for (var o of xo(t))
      Ws.call(t, o) && $o(e, o, t[o]);
  return e;
}, es = (e, t) => Fs(e, js(t)), g = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Us(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && Jo(t, o, l), l;
}, ts = (e, t, o) => t.has(e) || eo("Cannot " + o), qs = (e, t, o) => (ts(e, t, "read from private field"), t.get(e)), Zs = (e, t, o) => t.has(e) ? eo("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, o), Ks = (e, t, o, s) => (ts(e, t, "write to private field"), t.set(e, o), o), Xs = function(e, t) {
  this[0] = e, this[1] = t;
}, Ys = (e) => {
  var t = e[Rt("asyncIterator")], o = !1, s, l = {};
  return t == null ? (t = e[Rt("iterator")](), s = (r) => l[r] = (i) => t[r](i)) : (t = t.call(e), s = (r) => l[r] = (i) => {
    if (o) {
      if (o = !1, r === "throw") throw i;
      return i;
    }
    return o = !0, {
      done: !1,
      value: new Xs(new Promise((n) => {
        var a = t[r](i);
        a instanceof Object || eo("Object expected"), n(a);
      }), 1)
    };
  }), l[Rt("iterator")] = () => l, s("next"), "throw" in t ? s("throw") : l.throw = (r) => {
    throw r;
  }, "return" in t && s("return"), l;
};
const Gs = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
</svg>`, Js = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
</svg>`, el = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-power" viewBox="0 0 16 16">
  <path d="M7.5 1v7h1V1z"/>
  <path d="M3 8.812a5 5 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812"/>
</svg>`, tl = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
</svg>`, ol = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sign-stop-fill" viewBox="0 0 16 16">
  <path d="M10.371 8.277v-.553c0-.827-.422-1.234-.987-1.234-.572 0-.99.407-.99 1.234v.553c0 .83.418 1.237.99 1.237.565 0 .987-.408.987-1.237m2.586-.24c.463 0 .735-.272.735-.744s-.272-.741-.735-.741h-.774v1.485z"/>
  <path d="M4.893 0a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146A.5.5 0 0 0 11.107 0zM3.16 10.08c-.931 0-1.447-.493-1.494-1.132h.653c.065.346.396.583.891.583.524 0 .83-.246.83-.62 0-.303-.203-.467-.637-.572l-.656-.164c-.61-.147-.978-.51-.978-1.078 0-.706.597-1.184 1.444-1.184.853 0 1.386.475 1.436 1.087h-.645c-.064-.32-.352-.542-.797-.542-.472 0-.77.246-.77.6 0 .261.196.437.553.522l.654.161c.673.164 1.06.487 1.06 1.11 0 .736-.574 1.228-1.544 1.228Zm3.427-3.51V10h-.665V6.57H4.753V6h3.006v.568H6.587Zm4.458 1.16v.544c0 1.131-.636 1.805-1.661 1.805-1.026 0-1.664-.674-1.664-1.805V7.73c0-1.136.638-1.807 1.664-1.807s1.66.674 1.66 1.807ZM11.52 6h1.535c.82 0 1.316.55 1.316 1.292 0 .747-.501 1.289-1.321 1.289h-.865V10h-.665V6.001Z"/>
</svg>`, sl = ':root,:host,.sl-theme-light{color-scheme:light;--sl-color-gray-50: hsl(0 0% 97.5%);--sl-color-gray-100: hsl(240 4.8% 95.9%);--sl-color-gray-200: hsl(240 5.9% 90%);--sl-color-gray-300: hsl(240 4.9% 83.9%);--sl-color-gray-400: hsl(240 5% 64.9%);--sl-color-gray-500: hsl(240 3.8% 46.1%);--sl-color-gray-600: hsl(240 5.2% 33.9%);--sl-color-gray-700: hsl(240 5.3% 26.1%);--sl-color-gray-800: hsl(240 3.7% 15.9%);--sl-color-gray-900: hsl(240 5.9% 10%);--sl-color-gray-950: hsl(240 7.3% 8%);--sl-color-red-50: hsl(0 85.7% 97.3%);--sl-color-red-100: hsl(0 93.3% 94.1%);--sl-color-red-200: hsl(0 96.3% 89.4%);--sl-color-red-300: hsl(0 93.5% 81.8%);--sl-color-red-400: hsl(0 90.6% 70.8%);--sl-color-red-500: hsl(0 84.2% 60.2%);--sl-color-red-600: hsl(0 72.2% 50.6%);--sl-color-red-700: hsl(0 73.7% 41.8%);--sl-color-red-800: hsl(0 70% 35.3%);--sl-color-red-900: hsl(0 62.8% 30.6%);--sl-color-red-950: hsl(0 60% 19.6%);--sl-color-orange-50: hsl(33.3 100% 96.5%);--sl-color-orange-100: hsl(34.3 100% 91.8%);--sl-color-orange-200: hsl(32.1 97.7% 83.1%);--sl-color-orange-300: hsl(30.7 97.2% 72.4%);--sl-color-orange-400: hsl(27 96% 61%);--sl-color-orange-500: hsl(24.6 95% 53.1%);--sl-color-orange-600: hsl(20.5 90.2% 48.2%);--sl-color-orange-700: hsl(17.5 88.3% 40.4%);--sl-color-orange-800: hsl(15 79.1% 33.7%);--sl-color-orange-900: hsl(15.3 74.6% 27.8%);--sl-color-orange-950: hsl(15.2 69.1% 19%);--sl-color-amber-50: hsl(48 100% 96.1%);--sl-color-amber-100: hsl(48 96.5% 88.8%);--sl-color-amber-200: hsl(48 96.6% 76.7%);--sl-color-amber-300: hsl(45.9 96.7% 64.5%);--sl-color-amber-400: hsl(43.3 96.4% 56.3%);--sl-color-amber-500: hsl(37.7 92.1% 50.2%);--sl-color-amber-600: hsl(32.1 94.6% 43.7%);--sl-color-amber-700: hsl(26 90.5% 37.1%);--sl-color-amber-800: hsl(22.7 82.5% 31.4%);--sl-color-amber-900: hsl(21.7 77.8% 26.5%);--sl-color-amber-950: hsl(22.9 74.1% 16.7%);--sl-color-yellow-50: hsl(54.5 91.7% 95.3%);--sl-color-yellow-100: hsl(54.9 96.7% 88%);--sl-color-yellow-200: hsl(52.8 98.3% 76.9%);--sl-color-yellow-300: hsl(50.4 97.8% 63.5%);--sl-color-yellow-400: hsl(47.9 95.8% 53.1%);--sl-color-yellow-500: hsl(45.4 93.4% 47.5%);--sl-color-yellow-600: hsl(40.6 96.1% 40.4%);--sl-color-yellow-700: hsl(35.5 91.7% 32.9%);--sl-color-yellow-800: hsl(31.8 81% 28.8%);--sl-color-yellow-900: hsl(28.4 72.5% 25.7%);--sl-color-yellow-950: hsl(33.1 69% 13.9%);--sl-color-lime-50: hsl(78.3 92% 95.1%);--sl-color-lime-100: hsl(79.6 89.1% 89.2%);--sl-color-lime-200: hsl(80.9 88.5% 79.6%);--sl-color-lime-300: hsl(82 84.5% 67.1%);--sl-color-lime-400: hsl(82.7 78% 55.5%);--sl-color-lime-500: hsl(83.7 80.5% 44.3%);--sl-color-lime-600: hsl(84.8 85.2% 34.5%);--sl-color-lime-700: hsl(85.9 78.4% 27.3%);--sl-color-lime-800: hsl(86.3 69% 22.7%);--sl-color-lime-900: hsl(87.6 61.2% 20.2%);--sl-color-lime-950: hsl(86.5 60.6% 13.9%);--sl-color-green-50: hsl(138.5 76.5% 96.7%);--sl-color-green-100: hsl(140.6 84.2% 92.5%);--sl-color-green-200: hsl(141 78.9% 85.1%);--sl-color-green-300: hsl(141.7 76.6% 73.1%);--sl-color-green-400: hsl(141.9 69.2% 58%);--sl-color-green-500: hsl(142.1 70.6% 45.3%);--sl-color-green-600: hsl(142.1 76.2% 36.3%);--sl-color-green-700: hsl(142.4 71.8% 29.2%);--sl-color-green-800: hsl(142.8 64.2% 24.1%);--sl-color-green-900: hsl(143.8 61.2% 20.2%);--sl-color-green-950: hsl(144.3 60.7% 12%);--sl-color-emerald-50: hsl(151.8 81% 95.9%);--sl-color-emerald-100: hsl(149.3 80.4% 90%);--sl-color-emerald-200: hsl(152.4 76% 80.4%);--sl-color-emerald-300: hsl(156.2 71.6% 66.9%);--sl-color-emerald-400: hsl(158.1 64.4% 51.6%);--sl-color-emerald-500: hsl(160.1 84.1% 39.4%);--sl-color-emerald-600: hsl(161.4 93.5% 30.4%);--sl-color-emerald-700: hsl(162.9 93.5% 24.3%);--sl-color-emerald-800: hsl(163.1 88.1% 19.8%);--sl-color-emerald-900: hsl(164.2 85.7% 16.5%);--sl-color-emerald-950: hsl(164.3 87.5% 9.4%);--sl-color-teal-50: hsl(166.2 76.5% 96.7%);--sl-color-teal-100: hsl(167.2 85.5% 89.2%);--sl-color-teal-200: hsl(168.4 83.8% 78.2%);--sl-color-teal-300: hsl(170.6 76.9% 64.3%);--sl-color-teal-400: hsl(172.5 66% 50.4%);--sl-color-teal-500: hsl(173.4 80.4% 40%);--sl-color-teal-600: hsl(174.7 83.9% 31.6%);--sl-color-teal-700: hsl(175.3 77.4% 26.1%);--sl-color-teal-800: hsl(176.1 69.4% 21.8%);--sl-color-teal-900: hsl(175.9 60.8% 19%);--sl-color-teal-950: hsl(176.5 58.6% 11.4%);--sl-color-cyan-50: hsl(183.2 100% 96.3%);--sl-color-cyan-100: hsl(185.1 95.9% 90.4%);--sl-color-cyan-200: hsl(186.2 93.5% 81.8%);--sl-color-cyan-300: hsl(187 92.4% 69%);--sl-color-cyan-400: hsl(187.9 85.7% 53.3%);--sl-color-cyan-500: hsl(188.7 94.5% 42.7%);--sl-color-cyan-600: hsl(191.6 91.4% 36.5%);--sl-color-cyan-700: hsl(192.9 82.3% 31%);--sl-color-cyan-800: hsl(194.4 69.6% 27.1%);--sl-color-cyan-900: hsl(196.4 63.6% 23.7%);--sl-color-cyan-950: hsl(196.8 61% 16.1%);--sl-color-sky-50: hsl(204 100% 97.1%);--sl-color-sky-100: hsl(204 93.8% 93.7%);--sl-color-sky-200: hsl(200.6 94.4% 86.1%);--sl-color-sky-300: hsl(199.4 95.5% 73.9%);--sl-color-sky-400: hsl(198.4 93.2% 59.6%);--sl-color-sky-500: hsl(198.6 88.7% 48.4%);--sl-color-sky-600: hsl(200.4 98% 39.4%);--sl-color-sky-700: hsl(201.3 96.3% 32.2%);--sl-color-sky-800: hsl(201 90% 27.5%);--sl-color-sky-900: hsl(202 80.3% 23.9%);--sl-color-sky-950: hsl(202.3 73.8% 16.5%);--sl-color-blue-50: hsl(213.8 100% 96.9%);--sl-color-blue-100: hsl(214.3 94.6% 92.7%);--sl-color-blue-200: hsl(213.3 96.9% 87.3%);--sl-color-blue-300: hsl(211.7 96.4% 78.4%);--sl-color-blue-400: hsl(213.1 93.9% 67.8%);--sl-color-blue-500: hsl(217.2 91.2% 59.8%);--sl-color-blue-600: hsl(221.2 83.2% 53.3%);--sl-color-blue-700: hsl(224.3 76.3% 48%);--sl-color-blue-800: hsl(225.9 70.7% 40.2%);--sl-color-blue-900: hsl(224.4 64.3% 32.9%);--sl-color-blue-950: hsl(226.2 55.3% 18.4%);--sl-color-indigo-50: hsl(225.9 100% 96.7%);--sl-color-indigo-100: hsl(226.5 100% 93.9%);--sl-color-indigo-200: hsl(228 96.5% 88.8%);--sl-color-indigo-300: hsl(229.7 93.5% 81.8%);--sl-color-indigo-400: hsl(234.5 89.5% 73.9%);--sl-color-indigo-500: hsl(238.7 83.5% 66.7%);--sl-color-indigo-600: hsl(243.4 75.4% 58.6%);--sl-color-indigo-700: hsl(244.5 57.9% 50.6%);--sl-color-indigo-800: hsl(243.7 54.5% 41.4%);--sl-color-indigo-900: hsl(242.2 47.4% 34.3%);--sl-color-indigo-950: hsl(243.5 43.6% 22.9%);--sl-color-violet-50: hsl(250 100% 97.6%);--sl-color-violet-100: hsl(251.4 91.3% 95.5%);--sl-color-violet-200: hsl(250.5 95.2% 91.8%);--sl-color-violet-300: hsl(252.5 94.7% 85.1%);--sl-color-violet-400: hsl(255.1 91.7% 76.3%);--sl-color-violet-500: hsl(258.3 89.5% 66.3%);--sl-color-violet-600: hsl(262.1 83.3% 57.8%);--sl-color-violet-700: hsl(263.4 70% 50.4%);--sl-color-violet-800: hsl(263.4 69.3% 42.2%);--sl-color-violet-900: hsl(263.5 67.4% 34.9%);--sl-color-violet-950: hsl(265.1 61.5% 21.4%);--sl-color-purple-50: hsl(270 100% 98%);--sl-color-purple-100: hsl(268.7 100% 95.5%);--sl-color-purple-200: hsl(268.6 100% 91.8%);--sl-color-purple-300: hsl(269.2 97.4% 85.1%);--sl-color-purple-400: hsl(270 95.2% 75.3%);--sl-color-purple-500: hsl(270.7 91% 65.1%);--sl-color-purple-600: hsl(271.5 81.3% 55.9%);--sl-color-purple-700: hsl(272.1 71.7% 47.1%);--sl-color-purple-800: hsl(272.9 67.2% 39.4%);--sl-color-purple-900: hsl(273.6 65.6% 32%);--sl-color-purple-950: hsl(276 59.5% 16.5%);--sl-color-fuchsia-50: hsl(289.1 100% 97.8%);--sl-color-fuchsia-100: hsl(287 100% 95.5%);--sl-color-fuchsia-200: hsl(288.3 95.8% 90.6%);--sl-color-fuchsia-300: hsl(291.1 93.1% 82.9%);--sl-color-fuchsia-400: hsl(292 91.4% 72.5%);--sl-color-fuchsia-500: hsl(292.2 84.1% 60.6%);--sl-color-fuchsia-600: hsl(293.4 69.5% 48.8%);--sl-color-fuchsia-700: hsl(294.7 72.4% 39.8%);--sl-color-fuchsia-800: hsl(295.4 70.2% 32.9%);--sl-color-fuchsia-900: hsl(296.7 63.6% 28%);--sl-color-fuchsia-950: hsl(297.1 56.8% 14.5%);--sl-color-pink-50: hsl(327.3 73.3% 97.1%);--sl-color-pink-100: hsl(325.7 77.8% 94.7%);--sl-color-pink-200: hsl(325.9 84.6% 89.8%);--sl-color-pink-300: hsl(327.4 87.1% 81.8%);--sl-color-pink-400: hsl(328.6 85.5% 70.2%);--sl-color-pink-500: hsl(330.4 81.2% 60.4%);--sl-color-pink-600: hsl(333.3 71.4% 50.6%);--sl-color-pink-700: hsl(335.1 77.6% 42%);--sl-color-pink-800: hsl(335.8 74.4% 35.3%);--sl-color-pink-900: hsl(335.9 69% 30.4%);--sl-color-pink-950: hsl(336.2 65.4% 15.9%);--sl-color-rose-50: hsl(355.7 100% 97.3%);--sl-color-rose-100: hsl(355.6 100% 94.7%);--sl-color-rose-200: hsl(352.7 96.1% 90%);--sl-color-rose-300: hsl(352.6 95.7% 81.8%);--sl-color-rose-400: hsl(351.3 94.5% 71.4%);--sl-color-rose-500: hsl(349.7 89.2% 60.2%);--sl-color-rose-600: hsl(346.8 77.2% 49.8%);--sl-color-rose-700: hsl(345.3 82.7% 40.8%);--sl-color-rose-800: hsl(343.4 79.7% 34.7%);--sl-color-rose-900: hsl(341.5 75.5% 30.4%);--sl-color-rose-950: hsl(341.3 70.1% 17.1%);--sl-color-primary-50: var(--sl-color-sky-50);--sl-color-primary-100: var(--sl-color-sky-100);--sl-color-primary-200: var(--sl-color-sky-200);--sl-color-primary-300: var(--sl-color-sky-300);--sl-color-primary-400: var(--sl-color-sky-400);--sl-color-primary-500: var(--sl-color-sky-500);--sl-color-primary-600: var(--sl-color-sky-600);--sl-color-primary-700: var(--sl-color-sky-700);--sl-color-primary-800: var(--sl-color-sky-800);--sl-color-primary-900: var(--sl-color-sky-900);--sl-color-primary-950: var(--sl-color-sky-950);--sl-color-success-50: var(--sl-color-green-50);--sl-color-success-100: var(--sl-color-green-100);--sl-color-success-200: var(--sl-color-green-200);--sl-color-success-300: var(--sl-color-green-300);--sl-color-success-400: var(--sl-color-green-400);--sl-color-success-500: var(--sl-color-green-500);--sl-color-success-600: var(--sl-color-green-600);--sl-color-success-700: var(--sl-color-green-700);--sl-color-success-800: var(--sl-color-green-800);--sl-color-success-900: var(--sl-color-green-900);--sl-color-success-950: var(--sl-color-green-950);--sl-color-warning-50: var(--sl-color-amber-50);--sl-color-warning-100: var(--sl-color-amber-100);--sl-color-warning-200: var(--sl-color-amber-200);--sl-color-warning-300: var(--sl-color-amber-300);--sl-color-warning-400: var(--sl-color-amber-400);--sl-color-warning-500: var(--sl-color-amber-500);--sl-color-warning-600: var(--sl-color-amber-600);--sl-color-warning-700: var(--sl-color-amber-700);--sl-color-warning-800: var(--sl-color-amber-800);--sl-color-warning-900: var(--sl-color-amber-900);--sl-color-warning-950: var(--sl-color-amber-950);--sl-color-danger-50: var(--sl-color-red-50);--sl-color-danger-100: var(--sl-color-red-100);--sl-color-danger-200: var(--sl-color-red-200);--sl-color-danger-300: var(--sl-color-red-300);--sl-color-danger-400: var(--sl-color-red-400);--sl-color-danger-500: var(--sl-color-red-500);--sl-color-danger-600: var(--sl-color-red-600);--sl-color-danger-700: var(--sl-color-red-700);--sl-color-danger-800: var(--sl-color-red-800);--sl-color-danger-900: var(--sl-color-red-900);--sl-color-danger-950: var(--sl-color-red-950);--sl-color-neutral-50: var(--sl-color-gray-50);--sl-color-neutral-100: var(--sl-color-gray-100);--sl-color-neutral-200: var(--sl-color-gray-200);--sl-color-neutral-300: var(--sl-color-gray-300);--sl-color-neutral-400: var(--sl-color-gray-400);--sl-color-neutral-500: var(--sl-color-gray-500);--sl-color-neutral-600: var(--sl-color-gray-600);--sl-color-neutral-700: var(--sl-color-gray-700);--sl-color-neutral-800: var(--sl-color-gray-800);--sl-color-neutral-900: var(--sl-color-gray-900);--sl-color-neutral-950: var(--sl-color-gray-950);--sl-color-neutral-0: hsl(0, 0%, 100%);--sl-color-neutral-1000: hsl(0, 0%, 0%);--sl-border-radius-small: .1875rem;--sl-border-radius-medium: .25rem;--sl-border-radius-large: .5rem;--sl-border-radius-x-large: 1rem;--sl-border-radius-circle: 50%;--sl-border-radius-pill: 9999px;--sl-shadow-x-small: 0 1px 2px hsl(240 3.8% 46.1% / 6%);--sl-shadow-small: 0 1px 2px hsl(240 3.8% 46.1% / 12%);--sl-shadow-medium: 0 2px 4px hsl(240 3.8% 46.1% / 12%);--sl-shadow-large: 0 2px 8px hsl(240 3.8% 46.1% / 12%);--sl-shadow-x-large: 0 4px 16px hsl(240 3.8% 46.1% / 12%);--sl-spacing-3x-small: .125rem;--sl-spacing-2x-small: .25rem;--sl-spacing-x-small: .5rem;--sl-spacing-small: .75rem;--sl-spacing-medium: 1rem;--sl-spacing-large: 1.25rem;--sl-spacing-x-large: 1.75rem;--sl-spacing-2x-large: 2.25rem;--sl-spacing-3x-large: 3rem;--sl-spacing-4x-large: 4.5rem;--sl-transition-x-slow: 1s;--sl-transition-slow: .5s;--sl-transition-medium: .25s;--sl-transition-fast: .15s;--sl-transition-x-fast: 50ms;--sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;--sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";--sl-font-serif: Georgia, "Times New Roman", serif;--sl-font-size-2x-small: .625rem;--sl-font-size-x-small: .75rem;--sl-font-size-small: .875rem;--sl-font-size-medium: 1rem;--sl-font-size-large: 1.25rem;--sl-font-size-x-large: 1.5rem;--sl-font-size-2x-large: 2.25rem;--sl-font-size-3x-large: 3rem;--sl-font-size-4x-large: 4.5rem;--sl-font-weight-light: 300;--sl-font-weight-normal: 400;--sl-font-weight-semibold: 500;--sl-font-weight-bold: 700;--sl-letter-spacing-denser: -.03em;--sl-letter-spacing-dense: -.015em;--sl-letter-spacing-normal: normal;--sl-letter-spacing-loose: .075em;--sl-letter-spacing-looser: .15em;--sl-line-height-denser: 1;--sl-line-height-dense: 1.4;--sl-line-height-normal: 1.8;--sl-line-height-loose: 2.2;--sl-line-height-looser: 2.6;--sl-focus-ring-color: var(--sl-color-primary-600);--sl-focus-ring-style: solid;--sl-focus-ring-width: 3px;--sl-focus-ring: var(--sl-focus-ring-style) var(--sl-focus-ring-width) var(--sl-focus-ring-color);--sl-focus-ring-offset: 1px;--sl-button-font-size-small: var(--sl-font-size-x-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-large: var(--sl-font-size-medium);--sl-input-height-small: 1.875rem;--sl-input-height-medium: 2.5rem;--sl-input-height-large: 3.125rem;--sl-input-background-color: var(--sl-color-neutral-0);--sl-input-background-color-hover: var(--sl-input-background-color);--sl-input-background-color-focus: var(--sl-input-background-color);--sl-input-background-color-disabled: var(--sl-color-neutral-100);--sl-input-border-color: var(--sl-color-neutral-300);--sl-input-border-color-hover: var(--sl-color-neutral-400);--sl-input-border-color-focus: var(--sl-color-primary-500);--sl-input-border-color-disabled: var(--sl-color-neutral-300);--sl-input-border-width: 1px;--sl-input-required-content: "*";--sl-input-required-content-offset: -2px;--sl-input-required-content-color: var(--sl-input-label-color);--sl-input-border-radius-small: var(--sl-border-radius-medium);--sl-input-border-radius-medium: var(--sl-border-radius-medium);--sl-input-border-radius-large: var(--sl-border-radius-medium);--sl-input-font-family: var(--sl-font-sans);--sl-input-font-weight: var(--sl-font-weight-normal);--sl-input-font-size-small: var(--sl-font-size-small);--sl-input-font-size-medium: var(--sl-font-size-medium);--sl-input-font-size-large: var(--sl-font-size-large);--sl-input-letter-spacing: var(--sl-letter-spacing-normal);--sl-input-color: var(--sl-color-neutral-700);--sl-input-color-hover: var(--sl-color-neutral-700);--sl-input-color-focus: var(--sl-color-neutral-700);--sl-input-color-disabled: var(--sl-color-neutral-900);--sl-input-icon-color: var(--sl-color-neutral-500);--sl-input-icon-color-hover: var(--sl-color-neutral-600);--sl-input-icon-color-focus: var(--sl-color-neutral-600);--sl-input-placeholder-color: var(--sl-color-neutral-500);--sl-input-placeholder-color-disabled: var(--sl-color-neutral-600);--sl-input-spacing-small: var(--sl-spacing-small);--sl-input-spacing-medium: var(--sl-spacing-medium);--sl-input-spacing-large: var(--sl-spacing-large);--sl-input-focus-ring-color: hsl(198.6 88.7% 48.4% / 40%);--sl-input-focus-ring-offset: 0;--sl-input-filled-background-color: var(--sl-color-neutral-100);--sl-input-filled-background-color-hover: var(--sl-color-neutral-100);--sl-input-filled-background-color-focus: var(--sl-color-neutral-100);--sl-input-filled-background-color-disabled: var(--sl-color-neutral-100);--sl-input-filled-color: var(--sl-color-neutral-800);--sl-input-filled-color-hover: var(--sl-color-neutral-800);--sl-input-filled-color-focus: var(--sl-color-neutral-700);--sl-input-filled-color-disabled: var(--sl-color-neutral-800);--sl-input-label-font-size-small: var(--sl-font-size-small);--sl-input-label-font-size-medium: var(--sl-font-size-medium);--sl-input-label-font-size-large: var(--sl-font-size-large);--sl-input-label-color: inherit;--sl-input-help-text-font-size-small: var(--sl-font-size-x-small);--sl-input-help-text-font-size-medium: var(--sl-font-size-small);--sl-input-help-text-font-size-large: var(--sl-font-size-medium);--sl-input-help-text-color: var(--sl-color-neutral-500);--sl-toggle-size-small: .875rem;--sl-toggle-size-medium: 1.125rem;--sl-toggle-size-large: 1.375rem;--sl-overlay-background-color: hsl(240 3.8% 46.1% / 33%);--sl-panel-background-color: var(--sl-color-neutral-0);--sl-panel-border-color: var(--sl-color-neutral-200);--sl-panel-border-width: 1px;--sl-tooltip-border-radius: var(--sl-border-radius-medium);--sl-tooltip-background-color: var(--sl-color-neutral-800);--sl-tooltip-color: var(--sl-color-neutral-0);--sl-tooltip-font-family: var(--sl-font-sans);--sl-tooltip-font-weight: var(--sl-font-weight-normal);--sl-tooltip-font-size: var(--sl-font-size-small);--sl-tooltip-line-height: var(--sl-line-height-dense);--sl-tooltip-padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);--sl-tooltip-arrow-size: 6px;--sl-z-index-drawer: 700;--sl-z-index-dialog: 800;--sl-z-index-dropdown: 900;--sl-z-index-toast: 950;--sl-z-index-tooltip: 1000}@supports (scrollbar-gutter: stable){.sl-scroll-lock{scrollbar-gutter:var(--sl-scroll-lock-gutter)!important}.sl-scroll-lock body{overflow:hidden!important}}@supports not (scrollbar-gutter: stable){.sl-scroll-lock body{padding-right:var(--sl-scroll-lock-size)!important;overflow:hidden!important}}.sl-toast-stack{position:fixed;top:0;inset-inline-end:0;z-index:var(--sl-z-index-toast);width:28rem;max-width:100%;max-height:100%;overflow:auto}.sl-toast-stack sl-alert{margin:var(--sl-spacing-medium)}.sl-toast-stack sl-alert::part(base){box-shadow:var(--sl-shadow-large)}@media(prefers-color-scheme:dark){:root{color-scheme:dark;--sl-color-gray-50: hsl(240 5.1% 15%);--sl-color-gray-100: hsl(240 5.7% 18.2%);--sl-color-gray-200: hsl(240 4.6% 22%);--sl-color-gray-300: hsl(240 5% 27.6%);--sl-color-gray-400: hsl(240 5% 35.5%);--sl-color-gray-500: hsl(240 3.7% 44%);--sl-color-gray-600: hsl(240 5.3% 58%);--sl-color-gray-700: hsl(240 5.6% 73%);--sl-color-gray-800: hsl(240 7.3% 84%);--sl-color-gray-900: hsl(240 9.1% 91.8%);--sl-color-gray-950: hsl(0 0% 95%);--sl-color-red-50: hsl(0 56% 23.9%);--sl-color-red-100: hsl(.6 60% 33.9%);--sl-color-red-200: hsl(.9 67.2% 37.1%);--sl-color-red-300: hsl(1.1 71.3% 43.7%);--sl-color-red-400: hsl(1 76% 52.5%);--sl-color-red-500: hsl(.7 89.6% 57.2%);--sl-color-red-600: hsl(0 98.6% 67.9%);--sl-color-red-700: hsl(0 100% 72.3%);--sl-color-red-800: hsl(0 100% 85.6%);--sl-color-red-900: hsl(0 100% 90.3%);--sl-color-red-950: hsl(0 100% 95.9%);--sl-color-orange-50: hsl(15 64.2% 23.3%);--sl-color-orange-100: hsl(15.1 70.9% 31.1%);--sl-color-orange-200: hsl(15.3 75.7% 35.5%);--sl-color-orange-300: hsl(17.1 83.5% 42.7%);--sl-color-orange-400: hsl(20.1 88% 50.8%);--sl-color-orange-500: hsl(24.3 100% 50.5%);--sl-color-orange-600: hsl(27.2 100% 57.7%);--sl-color-orange-700: hsl(31.3 100% 68.7%);--sl-color-orange-800: hsl(33.8 100% 79.3%);--sl-color-orange-900: hsl(38.9 100% 87.7%);--sl-color-orange-950: hsl(46.2 100% 95%);--sl-color-amber-50: hsl(21.9 66.3% 21.1%);--sl-color-amber-100: hsl(21.5 73.6% 29.7%);--sl-color-amber-200: hsl(22.3 77.6% 33.3%);--sl-color-amber-300: hsl(25.4 84.2% 39.6%);--sl-color-amber-400: hsl(31.4 87.4% 46.7%);--sl-color-amber-500: hsl(37 96.6% 48.3%);--sl-color-amber-600: hsl(43.3 100% 53.4%);--sl-color-amber-700: hsl(46.5 100% 61.1%);--sl-color-amber-800: hsl(49.3 100% 73%);--sl-color-amber-900: hsl(51.8 100% 85%);--sl-color-amber-950: hsl(60 100% 94.6%);--sl-color-yellow-50: hsl(32.5 60% 18.2%);--sl-color-yellow-100: hsl(28.1 68.6% 29%);--sl-color-yellow-200: hsl(31.3 75.8% 30.8%);--sl-color-yellow-300: hsl(34.7 84.4% 35.3%);--sl-color-yellow-400: hsl(40.1 87.3% 43.3%);--sl-color-yellow-500: hsl(44.7 88% 46%);--sl-color-yellow-600: hsl(47.7 100% 50.9%);--sl-color-yellow-700: hsl(51.3 100% 59.9%);--sl-color-yellow-800: hsl(54.6 100% 73%);--sl-color-yellow-900: hsl(58.9 100% 84.2%);--sl-color-yellow-950: hsl(60 100% 94%);--sl-color-lime-50: hsl(86.5 54.4% 18%);--sl-color-lime-100: hsl(87.6 56.8% 23.3%);--sl-color-lime-200: hsl(85.8 63.2% 24.5%);--sl-color-lime-300: hsl(86.1 72% 29.4%);--sl-color-lime-400: hsl(85.5 76.8% 37.3%);--sl-color-lime-500: hsl(84.3 74.2% 42.1%);--sl-color-lime-600: hsl(82.8 81.5% 52.6%);--sl-color-lime-700: hsl(82 89.9% 64%);--sl-color-lime-800: hsl(80.9 97.9% 76.6%);--sl-color-lime-900: hsl(77.9 100% 85.8%);--sl-color-lime-950: hsl(69.5 100% 93.8%);--sl-color-green-50: hsl(144.3 53.6% 16%);--sl-color-green-100: hsl(143.2 55.4% 23.5%);--sl-color-green-200: hsl(141.5 58.2% 26.3%);--sl-color-green-300: hsl(140.8 64.2% 31.8%);--sl-color-green-400: hsl(140.3 68% 39.2%);--sl-color-green-500: hsl(141.1 64.9% 43%);--sl-color-green-600: hsl(141.6 72.4% 55.2%);--sl-color-green-700: hsl(141.7 82.7% 70.1%);--sl-color-green-800: hsl(141 90.9% 82.1%);--sl-color-green-900: hsl(142 100% 89.1%);--sl-color-green-950: hsl(144 100% 95.5%);--sl-color-emerald-50: hsl(164.3 75% 13.5%);--sl-color-emerald-100: hsl(163.5 72.6% 20.1%);--sl-color-emerald-200: hsl(162.1 73.7% 22.4%);--sl-color-emerald-300: hsl(161.3 77.3% 27.6%);--sl-color-emerald-400: hsl(159.6 77.1% 34.3%);--sl-color-emerald-500: hsl(159.1 73.5% 37.9%);--sl-color-emerald-600: hsl(157.8 66.8% 48.9%);--sl-color-emerald-700: hsl(156.2 76.1% 63.8%);--sl-color-emerald-800: hsl(152.4 84.4% 77.4%);--sl-color-emerald-900: hsl(149.3 100% 87%);--sl-color-emerald-950: hsl(158.6 100% 94.8%);--sl-color-teal-50: hsl(176.5 51.5% 15.4%);--sl-color-teal-100: hsl(175.9 54.7% 22.3%);--sl-color-teal-200: hsl(175.9 60.7% 23.9%);--sl-color-teal-300: hsl(174.5 67.3% 28.8%);--sl-color-teal-400: hsl(174.4 71.9% 34.9%);--sl-color-teal-500: hsl(173.1 71% 38.3%);--sl-color-teal-600: hsl(172.3 68.2% 48.1%);--sl-color-teal-700: hsl(170.5 81.3% 61.5%);--sl-color-teal-800: hsl(168.4 92.1% 75.2%);--sl-color-teal-900: hsl(168.3 100% 86%);--sl-color-teal-950: hsl(180 100% 95.5%);--sl-color-cyan-50: hsl(197.1 53.8% 20.3%);--sl-color-cyan-100: hsl(196.8 57.3% 27.2%);--sl-color-cyan-200: hsl(195.3 62.7% 29.4%);--sl-color-cyan-300: hsl(193.5 71.3% 34.1%);--sl-color-cyan-400: hsl(192.5 76.8% 40.6%);--sl-color-cyan-500: hsl(189.4 78.6% 42.6%);--sl-color-cyan-600: hsl(188.2 89.1% 51.7%);--sl-color-cyan-700: hsl(187 98.6% 66.2%);--sl-color-cyan-800: hsl(184.9 100% 78.3%);--sl-color-cyan-900: hsl(180 100% 86.6%);--sl-color-cyan-950: hsl(180 100% 94.8%);--sl-color-sky-50: hsl(203 63.8% 20.9%);--sl-color-sky-100: hsl(203.4 70.4% 28%);--sl-color-sky-200: hsl(202.7 75.8% 30.8%);--sl-color-sky-300: hsl(203.1 80.4% 36.1%);--sl-color-sky-400: hsl(202.1 80.5% 44.3%);--sl-color-sky-500: hsl(199.7 85.9% 47.7%);--sl-color-sky-600: hsl(198.7 97.9% 57.2%);--sl-color-sky-700: hsl(198.7 100% 70.5%);--sl-color-sky-800: hsl(198.8 100% 82.5%);--sl-color-sky-900: hsl(198.5 100% 89.9%);--sl-color-sky-950: hsl(186 100% 95.5%);--sl-color-blue-50: hsl(227.1 49.5% 22.7%);--sl-color-blue-100: hsl(225.8 58.9% 36.8%);--sl-color-blue-200: hsl(227.7 64.4% 42.9%);--sl-color-blue-300: hsl(226.1 72.7% 51.2%);--sl-color-blue-400: hsl(222.6 86.5% 56.3%);--sl-color-blue-500: hsl(217.8 95.8% 57.4%);--sl-color-blue-600: hsl(213.3 100% 65%);--sl-color-blue-700: hsl(210.9 100% 74.8%);--sl-color-blue-800: hsl(211.5 100% 83.4%);--sl-color-blue-900: hsl(211 100% 88.9%);--sl-color-blue-950: hsl(201.8 100% 95.3%);--sl-color-indigo-50: hsl(243.5 40.8% 27%);--sl-color-indigo-100: hsl(242.9 45.7% 37.6%);--sl-color-indigo-200: hsl(244.7 52.7% 43.1%);--sl-color-indigo-300: hsl(245.3 60.5% 52.4%);--sl-color-indigo-400: hsl(244.1 79.2% 60.4%);--sl-color-indigo-500: hsl(239.6 88.7% 63.8%);--sl-color-indigo-600: hsl(234.5 96.7% 70.9%);--sl-color-indigo-700: hsl(229.4 100% 78.3%);--sl-color-indigo-800: hsl(227.1 100% 85%);--sl-color-indigo-900: hsl(223.8 100% 89.9%);--sl-color-indigo-950: hsl(220 100% 95.1%);--sl-color-violet-50: hsl(265.1 57.3% 25.4%);--sl-color-violet-100: hsl(263.5 63.8% 39.4%);--sl-color-violet-200: hsl(263.4 66.2% 44.1%);--sl-color-violet-300: hsl(263.7 72.8% 52.4%);--sl-color-violet-400: hsl(262.5 87.3% 59.8%);--sl-color-violet-500: hsl(258.3 95.1% 63.2%);--sl-color-violet-600: hsl(255.1 100% 67.2%);--sl-color-violet-700: hsl(253 100% 81.5%);--sl-color-violet-800: hsl(251.7 100% 87.9%);--sl-color-violet-900: hsl(254.1 100% 91.7%);--sl-color-violet-950: hsl(257.1 100% 96.1%);--sl-color-purple-50: hsl(276 54.3% 20.5%);--sl-color-purple-100: hsl(273.6 61.8% 35.4%);--sl-color-purple-200: hsl(272.9 64% 41.4%);--sl-color-purple-300: hsl(271.9 68.1% 49.2%);--sl-color-purple-400: hsl(271.5 85.1% 57.8%);--sl-color-purple-500: hsl(270.7 96.4% 62.1%);--sl-color-purple-600: hsl(270.5 100% 71.9%);--sl-color-purple-700: hsl(270.9 100% 81.3%);--sl-color-purple-800: hsl(272.4 100% 87.7%);--sl-color-purple-900: hsl(276.7 100% 91.5%);--sl-color-purple-950: hsl(300 100% 96.5%);--sl-color-fuchsia-50: hsl(297.1 51.2% 18.6%);--sl-color-fuchsia-100: hsl(296.7 59.5% 31.5%);--sl-color-fuchsia-200: hsl(295.4 65.4% 35.1%);--sl-color-fuchsia-300: hsl(294.6 67.4% 42.2%);--sl-color-fuchsia-400: hsl(293.3 68.7% 51.2%);--sl-color-fuchsia-500: hsl(292.1 88.4% 57.7%);--sl-color-fuchsia-600: hsl(292 98.5% 59.5%);--sl-color-fuchsia-700: hsl(292.4 100% 79.5%);--sl-color-fuchsia-800: hsl(292.9 100% 86.8%);--sl-color-fuchsia-900: hsl(300 100% 91.5%);--sl-color-fuchsia-950: hsl(300 100% 96.3%);--sl-color-pink-50: hsl(336.2 59.6% 20%);--sl-color-pink-100: hsl(336.8 63.9% 34%);--sl-color-pink-200: hsl(336.8 68.7% 37.6%);--sl-color-pink-300: hsl(336.1 71.8% 44.5%);--sl-color-pink-400: hsl(333.9 74.9% 53.1%);--sl-color-pink-500: hsl(330.7 86.3% 57.7%);--sl-color-pink-600: hsl(328.6 91.5% 67.2%);--sl-color-pink-700: hsl(327.4 97.6% 78.7%);--sl-color-pink-800: hsl(325.1 100% 86.6%);--sl-color-pink-900: hsl(322.1 100% 91.3%);--sl-color-pink-950: hsl(315 100% 95.9%);--sl-color-rose-50: hsl(342.3 62.9% 21.5%);--sl-color-rose-100: hsl(342.8 68.9% 34.2%);--sl-color-rose-200: hsl(344.8 72.6% 37.3%);--sl-color-rose-300: hsl(346.9 75.8% 43.7%);--sl-color-rose-400: hsl(348.2 80.1% 52.7%);--sl-color-rose-500: hsl(350.4 94.8% 57.5%);--sl-color-rose-600: hsl(351.2 100% 58.1%);--sl-color-rose-700: hsl(352.3 100% 78.1%);--sl-color-rose-800: hsl(352 100% 86.2%);--sl-color-rose-900: hsl(354.5 100% 90.7%);--sl-color-rose-950: hsl(353.3 100% 95.7%);--sl-color-primary-50: var(--sl-color-sky-50);--sl-color-primary-100: var(--sl-color-sky-100);--sl-color-primary-200: var(--sl-color-sky-200);--sl-color-primary-300: var(--sl-color-sky-300);--sl-color-primary-400: var(--sl-color-sky-400);--sl-color-primary-500: var(--sl-color-sky-500);--sl-color-primary-600: var(--sl-color-sky-600);--sl-color-primary-700: var(--sl-color-sky-700);--sl-color-primary-800: var(--sl-color-sky-800);--sl-color-primary-900: var(--sl-color-sky-900);--sl-color-primary-950: var(--sl-color-sky-950);--sl-color-success-50: var(--sl-color-green-50);--sl-color-success-100: var(--sl-color-green-100);--sl-color-success-200: var(--sl-color-green-200);--sl-color-success-300: var(--sl-color-green-300);--sl-color-success-400: var(--sl-color-green-400);--sl-color-success-500: var(--sl-color-green-500);--sl-color-success-600: var(--sl-color-green-600);--sl-color-success-700: var(--sl-color-green-700);--sl-color-success-800: var(--sl-color-green-800);--sl-color-success-900: var(--sl-color-green-900);--sl-color-success-950: var(--sl-color-green-950);--sl-color-warning-50: var(--sl-color-amber-50);--sl-color-warning-100: var(--sl-color-amber-100);--sl-color-warning-200: var(--sl-color-amber-200);--sl-color-warning-300: var(--sl-color-amber-300);--sl-color-warning-400: var(--sl-color-amber-400);--sl-color-warning-500: var(--sl-color-amber-500);--sl-color-warning-600: var(--sl-color-amber-600);--sl-color-warning-700: var(--sl-color-amber-700);--sl-color-warning-800: var(--sl-color-amber-800);--sl-color-warning-900: var(--sl-color-amber-900);--sl-color-warning-950: var(--sl-color-amber-950);--sl-color-danger-50: var(--sl-color-red-50);--sl-color-danger-100: var(--sl-color-red-100);--sl-color-danger-200: var(--sl-color-red-200);--sl-color-danger-300: var(--sl-color-red-300);--sl-color-danger-400: var(--sl-color-red-400);--sl-color-danger-500: var(--sl-color-red-500);--sl-color-danger-600: var(--sl-color-red-600);--sl-color-danger-700: var(--sl-color-red-700);--sl-color-danger-800: var(--sl-color-red-800);--sl-color-danger-900: var(--sl-color-red-900);--sl-color-danger-950: var(--sl-color-red-950);--sl-color-neutral-50: var(--sl-color-gray-50);--sl-color-neutral-100: var(--sl-color-gray-100);--sl-color-neutral-200: var(--sl-color-gray-200);--sl-color-neutral-300: var(--sl-color-gray-300);--sl-color-neutral-400: var(--sl-color-gray-400);--sl-color-neutral-500: var(--sl-color-gray-500);--sl-color-neutral-600: var(--sl-color-gray-600);--sl-color-neutral-700: var(--sl-color-gray-700);--sl-color-neutral-800: var(--sl-color-gray-800);--sl-color-neutral-900: var(--sl-color-gray-900);--sl-color-neutral-950: var(--sl-color-gray-950);--sl-color-neutral-0: hsl(240, 5.9%, 11%);--sl-color-neutral-1000: hsl(0, 0%, 100%);--sl-border-radius-small: .1875rem;--sl-border-radius-medium: .25rem;--sl-border-radius-large: .5rem;--sl-border-radius-x-large: 1rem;--sl-border-radius-circle: 50%;--sl-border-radius-pill: 9999px;--sl-shadow-x-small: 0 1px 2px rgb(0 0 0 / 18%);--sl-shadow-small: 0 1px 2px rgb(0 0 0 / 24%);--sl-shadow-medium: 0 2px 4px rgb(0 0 0 / 24%);--sl-shadow-large: 0 2px 8px rgb(0 0 0 / 24%);--sl-shadow-x-large: 0 4px 16px rgb(0 0 0 / 24%);--sl-spacing-3x-small: .125rem;--sl-spacing-2x-small: .25rem;--sl-spacing-x-small: .5rem;--sl-spacing-small: .75rem;--sl-spacing-medium: 1rem;--sl-spacing-large: 1.25rem;--sl-spacing-x-large: 1.75rem;--sl-spacing-2x-large: 2.25rem;--sl-spacing-3x-large: 3rem;--sl-spacing-4x-large: 4.5rem;--sl-transition-x-slow: 1s;--sl-transition-slow: .5s;--sl-transition-medium: .25s;--sl-transition-fast: .15s;--sl-transition-x-fast: 50ms;--sl-font-mono: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;--sl-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";--sl-font-serif: Georgia, "Times New Roman", serif;--sl-font-size-2x-small: .625rem;--sl-font-size-x-small: .75rem;--sl-font-size-small: .875rem;--sl-font-size-medium: 1rem;--sl-font-size-large: 1.25rem;--sl-font-size-x-large: 1.5rem;--sl-font-size-2x-large: 2.25rem;--sl-font-size-3x-large: 3rem;--sl-font-size-4x-large: 4.5rem;--sl-font-weight-light: 300;--sl-font-weight-normal: 400;--sl-font-weight-semibold: 500;--sl-font-weight-bold: 700;--sl-letter-spacing-denser: -.03em;--sl-letter-spacing-dense: -.015em;--sl-letter-spacing-normal: normal;--sl-letter-spacing-loose: .075em;--sl-letter-spacing-looser: .15em;--sl-line-height-denser: 1;--sl-line-height-dense: 1.4;--sl-line-height-normal: 1.8;--sl-line-height-loose: 2.2;--sl-line-height-looser: 2.6;--sl-focus-ring-color: var(--sl-color-primary-700);--sl-focus-ring-style: solid;--sl-focus-ring-width: 3px;--sl-focus-ring: var(--sl-focus-ring-style) var(--sl-focus-ring-width) var(--sl-focus-ring-color);--sl-focus-ring-offset: 1px;--sl-button-font-size-small: var(--sl-font-size-x-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-large: var(--sl-font-size-medium);--sl-input-height-small: 1.875rem;--sl-input-height-medium: 2.5rem;--sl-input-height-large: 3.125rem;--sl-input-background-color: var(--sl-color-neutral-0);--sl-input-background-color-hover: var(--sl-input-background-color);--sl-input-background-color-focus: var(--sl-input-background-color);--sl-input-background-color-disabled: var(--sl-color-neutral-100);--sl-input-border-color: var(--sl-color-neutral-400);--sl-input-border-color-hover: var(--sl-color-neutral-500);--sl-input-border-color-focus: var(--sl-color-primary-600);--sl-input-border-color-disabled: var(--sl-color-neutral-400);--sl-input-border-width: 1px;--sl-input-required-content: "*";--sl-input-required-content-offset: -2px;--sl-input-required-content-color: var(--sl-input-label-color);--sl-input-border-radius-small: var(--sl-border-radius-medium);--sl-input-border-radius-medium: var(--sl-border-radius-medium);--sl-input-border-radius-large: var(--sl-border-radius-medium);--sl-input-font-family: var(--sl-font-sans);--sl-input-font-weight: var(--sl-font-weight-normal);--sl-input-font-size-small: var(--sl-font-size-small);--sl-input-font-size-medium: var(--sl-font-size-medium);--sl-input-font-size-large: var(--sl-font-size-large);--sl-input-letter-spacing: var(--sl-letter-spacing-normal);--sl-input-color: var(--sl-color-neutral-700);--sl-input-color-hover: var(--sl-color-neutral-700);--sl-input-color-focus: var(--sl-color-neutral-700);--sl-input-color-disabled: var(--sl-color-neutral-900);--sl-input-icon-color: var(--sl-color-neutral-500);--sl-input-icon-color-hover: var(--sl-color-neutral-600);--sl-input-icon-color-focus: var(--sl-color-neutral-600);--sl-input-placeholder-color: var(--sl-color-neutral-500);--sl-input-placeholder-color-disabled: var(--sl-color-neutral-600);--sl-input-spacing-small: var(--sl-spacing-small);--sl-input-spacing-medium: var(--sl-spacing-medium);--sl-input-spacing-large: var(--sl-spacing-large);--sl-input-focus-ring-color: hsl(198.6 88.7% 48.4% / 40%);--sl-input-focus-ring-offset: 0;--sl-input-filled-background-color: var(--sl-color-neutral-100);--sl-input-filled-background-color-hover: var(--sl-color-neutral-100);--sl-input-filled-background-color-focus: var(--sl-color-neutral-100);--sl-input-filled-background-color-disabled: var(--sl-color-neutral-100);--sl-input-filled-color: var(--sl-color-neutral-800);--sl-input-filled-color-hover: var(--sl-color-neutral-800);--sl-input-filled-color-focus: var(--sl-color-neutral-700);--sl-input-filled-color-disabled: var(--sl-color-neutral-800);--sl-input-label-font-size-small: var(--sl-font-size-small);--sl-input-label-font-size-medium: var(--sl-font-size-medium);--sl-input-label-font-size-large: var(--sl-font-size-large);--sl-input-label-color: inherit;--sl-input-help-text-font-size-small: var(--sl-font-size-x-small);--sl-input-help-text-font-size-medium: var(--sl-font-size-small);--sl-input-help-text-font-size-large: var(--sl-font-size-medium);--sl-input-help-text-color: var(--sl-color-neutral-600);--sl-toggle-size-small: .875rem;--sl-toggle-size-medium: 1.125rem;--sl-toggle-size-large: 1.375rem;--sl-overlay-background-color: hsl(0 0% 0% / 43%);--sl-panel-background-color: var(--sl-color-neutral-50);--sl-panel-border-color: var(--sl-color-neutral-200);--sl-panel-border-width: 1px;--sl-tooltip-border-radius: var(--sl-border-radius-medium);--sl-tooltip-background-color: var(--sl-color-neutral-800);--sl-tooltip-color: var(--sl-color-neutral-0);--sl-tooltip-font-family: var(--sl-font-sans);--sl-tooltip-font-weight: var(--sl-font-weight-normal);--sl-tooltip-font-size: var(--sl-font-size-small);--sl-tooltip-line-height: var(--sl-line-height-dense);--sl-tooltip-padding: var(--sl-spacing-2x-small) var(--sl-spacing-x-small);--sl-tooltip-arrow-size: 6px;--sl-z-index-drawer: 700;--sl-z-index-dialog: 800;--sl-z-index-dropdown: 900;--sl-z-index-toast: 950;--sl-z-index-tooltip: 1000}}:root{--band: #1d4ed8;--band-ink: #ffffff;--rail: #064e3b;--rail-group: #059669;--rail-button: 44px;--power-on: #4ade80;--stop: #ef4444;--sl-color-primary-50: var(--sl-color-blue-100);--sl-color-primary-100: var(--sl-color-blue-200);--sl-color-primary-200: var(--sl-color-blue-300);--sl-color-primary-300: var(--sl-color-blue-400);--sl-color-primary-400: var(--sl-color-blue-500);--sl-color-primary-500: var(--sl-color-blue-600);--sl-color-primary-600: var(--sl-color-blue-700);--sl-color-primary-700: var(--sl-color-blue-800);--sl-color-primary-800: var(--sl-color-blue-900);--sl-color-primary-900: var(--sl-color-blue-950);--sl-color-primary-950: var(--sl-color-blue-950);--sl-input-height-small: 1.75rem;--sl-input-height-medium: 2.25rem;--sl-input-font-size-medium: var(--sl-font-size-small);--sl-button-font-size-medium: var(--sl-font-size-small);--sl-border-radius-medium: 3px;--sl-focus-ring-width: 2px;--sl-focus-ring-color: color-mix(in srgb, var(--band) 60%, transparent);--sl-tooltip-background-color: var(--band);--sl-tooltip-color: var(--band-ink);--sl-tooltip-font-size: var(--sl-font-size-x-small)}', It = {
  /** An arrow most of the way round the selection: a quarter turn. */
  rotate: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M3.76 12.24A6 6 0 1 1 14 8h-1A5 5 0 1 0 4.46 11.54Z"/><path d="M11.5 8h4l-2 2.6Z"/><path d="M6 6h4v4H6Z"/></svg>',
  /** A lever on its quadrant. */
  throttle: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M1.89 9.78A6.5 6.5 0 0 1 14.11 9.78l-.94.34A5.5 5.5 0 0 0 2.83 10.12Z"/><path d="M8.63 12.3 12.01 5.05l-1.26-.6L7.37 11.7Z"/><circle cx="11.38" cy="4.75" r="1.6"/><path d="M1.5 12h13v1.5h-13Z"/></svg>'
}, ll = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -150 618.3 200" fill="currentColor"><path d="M-45.4 58L-39.4 41.2L-33 25.1L-26.3 9.8L-19.2 -4.9L-11.7 -18.8L-3.9 -32L4.3 -44.5L12.9 -56.2L21.9 -67.1L31.2 -77.1L40.9 -86.3L50.9 -94.6L61.2 -102L71.7 -108.5L82.5 -113.9L93.3 -118.4L104.3 -121.9L115.3 -124.4L126.3 -126L137.2 -126.7L148 -126.5L158.8 -125.5L169.4 -123.8L180.1 -121.3L180 -120.7L169.5 -122.6L159 -123.9L148.4 -124.4L137.9 -124.1L127.4 -123L116.8 -121L106.3 -118.2L95.9 -114.4L85.7 -109.7L75.6 -104.1L65.7 -97.6L56.1 -90.2L46.8 -81.9L37.8 -72.8L29.1 -62.8L20.8 -52.1L12.9 -40.6L5.3 -28.3L-1.9 -15.3L-8.8 -1.6L-15.3 12.8L-21.4 28L-27.2 43.8L-32.6 60.3Z"/><path d="M72.6 79.7L73.3 65.2L74.3 51.4L75.6 38.2L77.1 25.6L78.9 13.6L80.9 2.3L83.2 -8.4L85.8 -18.6L88.7 -28.2L91.8 -37.2L95.2 -45.7L98.9 -53.8L102.9 -61.4L107.3 -68.5L112.1 -75.3L117.4 -81.6L123.1 -87.5L129.4 -93L136.3 -98L143.8 -102.6L151.9 -106.6L160.6 -110.1L170 -113L180 -115.3L179.9 -114.7L170 -111.9L160.8 -108.5L152.3 -104.5L144.5 -100L137.4 -95L131 -89.6L125.2 -83.7L120 -77.6L115.3 -71.1L111.2 -64.2L107.4 -57L104.1 -49.4L101.1 -41.4L98.3 -32.9L95.9 -23.9L93.7 -14.5L91.8 -4.5L90.1 6L88.7 17.2L87.5 28.9L86.6 41.2L85.9 54.2L85.5 67.8L85.4 82Z"/><path transform="translate(190 0)" d="M50.9 -72Q52 -71.4 51.7 -69.9L49.3 -57Q49.1 -55.3 47.3 -56Q45.1 -56.7 42.3 -56.7Q40.4 -56.7 39.4 -56.6Q33.4 -56.3 29.4 -52.4Q25.4 -48.4 25.4 -42.1V-1.7Q25.4 -1 24.9 -0.5Q24.4 0 23.7 0H10.6Q9.9 0 9.4 -0.5Q8.9 -1 8.9 -1.7V-71.3Q8.9 -72 9.4 -72.5Q9.9 -73 10.6 -73H23.7Q24.4 -73 24.9 -72.5Q25.4 -72 25.4 -71.3V-64.9Q25.4 -64.3 25.6 -64.2Q25.9 -64.1 26.1 -64.6Q32.1 -73.9 42.9 -73.9Q47.4 -73.9 50.9 -72ZM119.9 -49.9V-1.7Q119.9 -1 119.4 -0.5Q118.9 0 118.1 0H105Q104.3 0 103.8 -0.5Q103.3 -1 103.3 -1.7V-6.3Q103.3 -6.7 103 -6.8Q102.7 -6.9 102.4 -6.6Q95.4 1.1 82.1 1.1Q71.4 1.1 64.5 -4.3Q57.6 -9.7 57.6 -20.4Q57.6 -31.6 65.4 -37.8Q73.1 -44 87.3 -44H102.6Q103.3 -44 103.3 -44.7V-48.1Q103.3 -53.7 100 -56.8Q96.7 -59.9 90.1 -59.9Q84.7 -59.9 81.4 -57.9Q78 -56 77.1 -52.6Q76.7 -50.9 75.1 -51.1L61.3 -52.9Q60.6 -53 60.1 -53.4Q59.6 -53.7 59.7 -54.3Q60.9 -63 69.1 -68.6Q77.3 -74.1 89.7 -74.1Q98.7 -74.1 105.6 -71Q112.4 -67.9 116.1 -62.4Q119.9 -56.9 119.9 -49.9ZM103.3 -25.1V-31.9Q103.3 -32.6 102.6 -32.6H90.6Q83 -32.6 78.6 -29.7Q74.3 -26.9 74.3 -21.6Q74.3 -17 77.6 -14.5Q81 -12 86.3 -12Q93.3 -12 98.3 -15.7Q103.3 -19.4 103.3 -25.1ZM135.7 -93.1Q135.7 -97.6 138.6 -100.4Q141.4 -103.3 145.9 -103.3Q150.3 -103.3 153.1 -100.4Q156 -97.6 156 -93.1Q156 -88.7 153.1 -85.9Q150.3 -83 145.9 -83Q141.4 -83 138.6 -85.9Q135.7 -88.7 135.7 -93.1ZM137.3 -1.7V-71.4Q137.3 -72.1 137.8 -72.6Q138.3 -73.1 139 -73.1H152.1Q152.9 -73.1 153.4 -72.6Q153.9 -72.1 153.9 -71.4V-1.7Q153.9 -1 153.4 -0.5Q152.9 0 152.1 0H139Q138.3 0 137.8 -0.5Q137.3 -1 137.3 -1.7ZM172.9 -1.7V-98.3Q172.9 -99 173.4 -99.5Q173.9 -100 174.6 -100H187.7Q188.4 -100 188.9 -99.5Q189.4 -99 189.4 -98.3V-1.7Q189.4 -1 188.9 -0.5Q188.4 0 187.7 0H174.6Q173.9 0 173.4 -0.5Q172.9 -1 172.9 -1.7ZM204.1 -19.4V-20.7Q204.1 -21.4 204.6 -21.9Q205.1 -22.4 205.9 -22.4H218.4Q219.1 -22.4 219.6 -21.9Q220.1 -21.4 220.1 -20.7V-20.4Q220.1 -16.9 224.1 -14.2Q228 -11.6 234 -11.6Q239.7 -11.6 243.3 -13.9Q246.9 -16.3 246.9 -19.9Q246.9 -23.1 243.9 -24.8Q241 -26.4 234.4 -28.3L229 -30Q221.7 -32.1 216.7 -34.6Q211.7 -37 208.3 -41.2Q204.9 -45.4 204.9 -52Q204.9 -62 212.7 -67.9Q220.6 -73.9 233.4 -73.9Q242.1 -73.9 248.7 -71.1Q255.3 -68.3 258.9 -63.4Q262.4 -58.4 262.4 -52.1Q262.4 -51.4 261.9 -50.9Q261.4 -50.4 260.7 -50.4H248.6Q247.9 -50.4 247.4 -50.9Q246.9 -51.4 246.9 -52.1Q246.9 -55.9 243.2 -58.4Q239.6 -60.9 233.3 -60.9Q227.7 -60.9 224.2 -58.8Q220.7 -56.7 220.7 -53Q220.7 -49.6 224.1 -47.8Q227.4 -46 235.3 -43.9L238.4 -43Q246 -40.7 251.1 -38.4Q256.3 -36 259.9 -31.8Q263.4 -27.6 263.4 -20.9Q263.4 -10.7 255.4 -4.9Q247.4 0.9 234.1 0.9Q225.1 0.9 218.4 -1.8Q211.6 -4.4 207.9 -9.1Q204.1 -13.7 204.1 -19.4ZM344.9 -39.4V-28Q344.9 -27.3 344.4 -26.8Q343.9 -26.3 343.1 -26.3H337.1Q336.4 -26.3 336.4 -25.6V-1.7Q336.4 -1 335.9 -0.5Q335.4 0 334.7 0H321.6Q320.9 0 320.4 -0.5Q319.9 -1 319.9 -1.7V-25.6Q319.9 -26.3 319.1 -26.3H275.7Q275 -26.3 274.5 -26.8Q274 -27.3 274 -28V-37.1Q274 -38 274.4 -39.3L301.4 -98.7Q302 -100 303.4 -100H317.4Q318.4 -100 318.8 -99.5Q319.1 -99 318.7 -98L293.3 -42Q293.1 -41.7 293.3 -41.4Q293.4 -41.1 293.7 -41.1H319.1Q319.9 -41.1 319.9 -41.9V-61.3Q319.9 -62 320.4 -62.5Q320.9 -63 321.6 -63H334.7Q335.4 -63 335.9 -62.5Q336.4 -62 336.4 -61.3V-41.9Q336.4 -41.1 337.1 -41.1H343.1Q343.9 -41.1 344.4 -40.6Q344.9 -40.1 344.9 -39.4ZM420.3 -68.3V-24.7Q420.3 -17 416.4 -11.1Q412.6 -5.3 405.6 -2.1Q398.7 1.1 389.7 1.1Q381 1.1 374.2 -2Q367.4 -5.1 363.6 -10.9Q359.9 -16.6 359.9 -24V-27.1Q359.9 -27.9 360.4 -28.4Q360.9 -28.9 361.6 -28.9H374.7Q375.4 -28.9 375.9 -28.4Q376.4 -27.9 376.4 -27.1V-26.1Q376.4 -20.4 380.1 -16.8Q383.9 -13.1 389.7 -13.1Q395.9 -13.1 399.8 -16.9Q403.7 -20.7 403.7 -26.7V-42.4Q403.7 -42.9 403.4 -43Q403.1 -43.1 402.9 -42.9Q396.7 -36.9 386.1 -36.9Q377.7 -36.9 371.4 -40.4Q365 -44 361.4 -50.7Q357.4 -57.9 357.4 -68.4Q357.4 -77.1 360.3 -83.7Q363.7 -91.9 371.1 -96.4Q378.6 -101 388.7 -101Q399.4 -101 407.1 -96.1Q414.7 -91.1 418 -82.3Q420.3 -76.3 420.3 -68.3ZM403.7 -69.1Q403.7 -74.6 401.9 -78.7Q398.4 -86.6 389 -86.6Q379.9 -86.6 376.1 -78.9Q374 -74.1 374 -68.7Q374 -62.3 376.6 -57.7Q380.6 -50.9 388.9 -50.9Q397.7 -50.9 401.4 -58Q403.7 -62.6 403.7 -69.1Z"/></svg>', rl = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -150 200 200" fill="currentColor"><mask id="mark-knock"><rect x="0" y="-150" width="200" height="200" fill="#fff"/><g fill="#000" stroke="#000" stroke-width="22"><path transform="translate(27.9 2) scale(0.95)" d="M76.3 -39.4V-28Q76.3 -27.3 75.8 -26.8Q75.3 -26.3 74.6 -26.3H68.6Q67.9 -26.3 67.9 -25.6V-1.7Q67.9 -1 67.4 -0.5Q66.9 0 66.1 0H53Q52.3 0 51.8 -0.5Q51.3 -1 51.3 -1.7V-25.6Q51.3 -26.3 50.6 -26.3H7.1Q6.4 -26.3 5.9 -26.8Q5.4 -27.3 5.4 -28V-37.1Q5.4 -38 5.9 -39.3L32.9 -98.7Q33.4 -100 34.9 -100H48.9Q49.9 -100 50.2 -99.5Q50.6 -99 50.1 -98L24.7 -42Q24.6 -41.7 24.7 -41.4Q24.9 -41.1 25.1 -41.1H50.6Q51.3 -41.1 51.3 -41.9V-61.3Q51.3 -62 51.8 -62.5Q52.3 -63 53 -63H66.1Q66.9 -63 67.4 -62.5Q67.9 -62 67.9 -61.3V-41.9Q67.9 -41.1 68.6 -41.1H74.6Q75.3 -41.1 75.8 -40.6Q76.3 -40.1 76.3 -39.4ZM151.7 -68.3V-24.7Q151.7 -17 147.9 -11.1Q144 -5.3 137.1 -2.1Q130.1 1.1 121.1 1.1Q112.4 1.1 105.6 -2Q98.9 -5.1 95.1 -10.9Q91.3 -16.6 91.3 -24V-27.1Q91.3 -27.9 91.8 -28.4Q92.3 -28.9 93 -28.9H106.1Q106.9 -28.9 107.4 -28.4Q107.9 -27.9 107.9 -27.1V-26.1Q107.9 -20.4 111.6 -16.8Q115.3 -13.1 121.1 -13.1Q127.3 -13.1 131.2 -16.9Q135.1 -20.7 135.1 -26.7V-42.4Q135.1 -42.9 134.9 -43Q134.6 -43.1 134.3 -42.9Q128.1 -36.9 117.6 -36.9Q109.1 -36.9 102.8 -40.4Q96.4 -44 92.9 -50.7Q88.9 -57.9 88.9 -68.4Q88.9 -77.1 91.7 -83.7Q95.1 -91.9 102.6 -96.4Q110 -101 120.1 -101Q130.9 -101 138.5 -96.1Q146.1 -91.1 149.4 -82.3Q151.7 -76.3 151.7 -68.3ZM135.1 -69.1Q135.1 -74.6 133.3 -78.7Q129.9 -86.6 120.4 -86.6Q111.3 -86.6 107.6 -78.9Q105.4 -74.1 105.4 -68.7Q105.4 -62.3 108 -57.7Q112 -50.9 120.3 -50.9Q129.1 -50.9 132.9 -58Q135.1 -62.6 135.1 -69.1Z"/></g></mask><g mask="url(#mark-knock)"><path d="M-38.1 59L-32.4 42.3L-26.3 26.3L-19.7 10.9L-12.7 -3.7L-5.3 -17.7L2.6 -30.9L10.9 -43.4L19.6 -55.2L28.8 -66.2L38.4 -76.3L48.3 -85.6L58.6 -94L69.3 -101.5L80.2 -108L91.3 -113.6L102.6 -118.3L114.1 -122L125.6 -124.7L137.1 -126.6L148.6 -127.7L160.2 -127.9L171.7 -127.3L183.3 -126.1L194.8 -124.1L194.9 -123.1L183.5 -124.3L172.1 -124.9L160.9 -124.8L149.8 -123.9L138.7 -122.3L127.8 -119.9L117 -116.7L106.3 -112.6L95.8 -107.7L85.5 -101.9L75.5 -95.2L65.8 -87.7L56.5 -79.4L47.5 -70.2L38.8 -60.2L30.6 -49.5L22.8 -38L15.4 -25.8L8.4 -12.9L1.8 0.7L-4.4 15L-10.1 30L-15.4 45.6L-20.3 61.8Z"/><path d="M80.3 78.2L80.8 64.2L81.6 50.9L82.6 38.1L84 25.9L85.7 14.3L87.8 3.3L90.1 -7.2L92.7 -17.2L95.7 -26.6L99 -35.6L102.6 -44.2L106.7 -52.3L111.1 -60L115.9 -67.3L121.2 -74.2L127 -80.7L133.4 -86.8L140.3 -92.6L147.9 -97.9L156.1 -102.7L164.9 -107.1L174.3 -110.9L184.4 -114.2L195.1 -116.9L195.2 -115.9L184.6 -112.5L174.7 -108.5L165.6 -104L157.2 -99L149.5 -93.6L142.6 -87.8L136.3 -81.6L130.7 -75.1L125.7 -68.3L121.3 -61.1L117.3 -53.7L113.9 -46L110.8 -38L108.1 -29.5L105.7 -20.7L103.7 -11.5L102 -1.8L100.5 8.4L99.4 19.1L98.6 30.4L98 42.2L97.7 54.6L97.8 67.5L98.1 81Z"/></g><path transform="translate(27.9 2) scale(0.95)" d="M76.3 -39.4V-28Q76.3 -27.3 75.8 -26.8Q75.3 -26.3 74.6 -26.3H68.6Q67.9 -26.3 67.9 -25.6V-1.7Q67.9 -1 67.4 -0.5Q66.9 0 66.1 0H53Q52.3 0 51.8 -0.5Q51.3 -1 51.3 -1.7V-25.6Q51.3 -26.3 50.6 -26.3H7.1Q6.4 -26.3 5.9 -26.8Q5.4 -27.3 5.4 -28V-37.1Q5.4 -38 5.9 -39.3L32.9 -98.7Q33.4 -100 34.9 -100H48.9Q49.9 -100 50.2 -99.5Q50.6 -99 50.1 -98L24.7 -42Q24.6 -41.7 24.7 -41.4Q24.9 -41.1 25.1 -41.1H50.6Q51.3 -41.1 51.3 -41.9V-61.3Q51.3 -62 51.8 -62.5Q52.3 -63 53 -63H66.1Q66.9 -63 67.4 -62.5Q67.9 -62 67.9 -61.3V-41.9Q67.9 -41.1 68.6 -41.1H74.6Q75.3 -41.1 75.8 -40.6Q76.3 -40.1 76.3 -39.4ZM151.7 -68.3V-24.7Q151.7 -17 147.9 -11.1Q144 -5.3 137.1 -2.1Q130.1 1.1 121.1 1.1Q112.4 1.1 105.6 -2Q98.9 -5.1 95.1 -10.9Q91.3 -16.6 91.3 -24V-27.1Q91.3 -27.9 91.8 -28.4Q92.3 -28.9 93 -28.9H106.1Q106.9 -28.9 107.4 -28.4Q107.9 -27.9 107.9 -27.1V-26.1Q107.9 -20.4 111.6 -16.8Q115.3 -13.1 121.1 -13.1Q127.3 -13.1 131.2 -16.9Q135.1 -20.7 135.1 -26.7V-42.4Q135.1 -42.9 134.9 -43Q134.6 -43.1 134.3 -42.9Q128.1 -36.9 117.6 -36.9Q109.1 -36.9 102.8 -40.4Q96.4 -44 92.9 -50.7Q88.9 -57.9 88.9 -68.4Q88.9 -77.1 91.7 -83.7Q95.1 -91.9 102.6 -96.4Q110 -101 120.1 -101Q130.9 -101 138.5 -96.1Q146.1 -91.1 149.4 -82.3Q151.7 -76.3 151.7 -68.3ZM135.1 -69.1Q135.1 -74.6 133.3 -78.7Q129.9 -86.6 120.4 -86.6Q111.3 -86.6 107.6 -78.9Q105.4 -74.1 105.4 -68.7Q105.4 -62.3 108 -57.7Q112 -50.9 120.3 -50.9Q129.1 -50.9 132.9 -58Q135.1 -62.6 135.1 -69.1Z"/></svg>', os = (e) => `data:image/svg+xml,${encodeURIComponent(e)}`;
Go("rails49", {
  resolver: (e) => e in It ? os(It[e]) : ""
});
const ss = (e) => e in It ? "rails49" : "default";
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = globalThis, to = at.ShadowRoot && (at.ShadyCSS === void 0 || at.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, oo = Symbol(), _o = /* @__PURE__ */ new WeakMap();
let ls = class {
  constructor(t, o, s) {
    if (this._$cssResult$ = !0, s !== oo) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = o;
  }
  get styleSheet() {
    let t = this.o;
    const o = this.t;
    if (to && t === void 0) {
      const s = o !== void 0 && o.length === 1;
      s && (t = _o.get(o)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && _o.set(o, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ce = (e) => new ls(typeof e == "string" ? e : e + "", void 0, oo), A = (e, ...t) => {
  const o = e.length === 1 ? e[0] : t.reduce((s, l, r) => s + ((i) => {
    if (i._$cssResult$ === !0) return i.cssText;
    if (typeof i == "number") return i;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + i + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(l) + e[r + 1], e[0]);
  return new ls(o, e, oo);
}, il = (e, t) => {
  if (to) e.adoptedStyleSheets = t.map((o) => o instanceof CSSStyleSheet ? o : o.styleSheet);
  else for (const o of t) {
    const s = document.createElement("style"), l = at.litNonce;
    l !== void 0 && s.setAttribute("nonce", l), s.textContent = o.cssText, e.appendChild(s);
  }
}, Lo = to ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let o = "";
  for (const s of t.cssRules) o += s.cssText;
  return ce(o);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: nl, defineProperty: al, getOwnPropertyDescriptor: cl, getOwnPropertyNames: hl, getOwnPropertySymbols: dl, getPrototypeOf: ul } = Object, re = globalThis, ko = re.trustedTypes, pl = ko ? ko.emptyScript : "", Mt = re.reactiveElementPolyfillSupport, je = (e, t) => e, pt = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? pl : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let o = e;
  switch (t) {
    case Boolean:
      o = e !== null;
      break;
    case Number:
      o = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        o = JSON.parse(e);
      } catch {
        o = null;
      }
  }
  return o;
} }, so = (e, t) => !nl(e, t), Ao = { attribute: !0, type: String, converter: pt, reflect: !1, useDefault: !1, hasChanged: so };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), re.litPropertyMetadata ?? (re.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let Ce = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, o = Ao) {
    if (o.state && (o.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((o = Object.create(o)).wrapped = !0), this.elementProperties.set(t, o), !o.noAccessor) {
      const s = Symbol(), l = this.getPropertyDescriptor(t, s, o);
      l !== void 0 && al(this.prototype, t, l);
    }
  }
  static getPropertyDescriptor(t, o, s) {
    const { get: l, set: r } = cl(this.prototype, t) ?? { get() {
      return this[o];
    }, set(i) {
      this[o] = i;
    } };
    return { get: l, set(i) {
      const n = l == null ? void 0 : l.call(this);
      r == null || r.call(this, i), this.requestUpdate(t, n, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Ao;
  }
  static _$Ei() {
    if (this.hasOwnProperty(je("elementProperties"))) return;
    const t = ul(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(je("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(je("properties"))) {
      const o = this.properties, s = [...hl(o), ...dl(o)];
      for (const l of s) this.createProperty(l, o[l]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const o = litPropertyMetadata.get(t);
      if (o !== void 0) for (const [s, l] of o) this.elementProperties.set(s, l);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [o, s] of this.elementProperties) {
      const l = this._$Eu(o, s);
      l !== void 0 && this._$Eh.set(l, o);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const o = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const l of s) o.unshift(Lo(l));
    } else t !== void 0 && o.push(Lo(t));
    return o;
  }
  static _$Eu(t, o) {
    const s = o.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((o) => this.enableUpdating = o), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((o) => o(this));
  }
  addController(t) {
    var o;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((o = t.hostConnected) == null || o.call(t));
  }
  removeController(t) {
    var o;
    (o = this._$EO) == null || o.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), o = this.constructor.elementProperties;
    for (const s of o.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return il(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((o) => {
      var s;
      return (s = o.hostConnected) == null ? void 0 : s.call(o);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((o) => {
      var s;
      return (s = o.hostDisconnected) == null ? void 0 : s.call(o);
    });
  }
  attributeChangedCallback(t, o, s) {
    this._$AK(t, s);
  }
  _$ET(t, o) {
    var r;
    const s = this.constructor.elementProperties.get(t), l = this.constructor._$Eu(t, s);
    if (l !== void 0 && s.reflect === !0) {
      const i = (((r = s.converter) == null ? void 0 : r.toAttribute) !== void 0 ? s.converter : pt).toAttribute(o, s.type);
      this._$Em = t, i == null ? this.removeAttribute(l) : this.setAttribute(l, i), this._$Em = null;
    }
  }
  _$AK(t, o) {
    var r, i;
    const s = this.constructor, l = s._$Eh.get(t);
    if (l !== void 0 && this._$Em !== l) {
      const n = s.getPropertyOptions(l), a = typeof n.converter == "function" ? { fromAttribute: n.converter } : ((r = n.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? n.converter : pt;
      this._$Em = l;
      const c = a.fromAttribute(o, n.type);
      this[l] = c ?? ((i = this._$Ej) == null ? void 0 : i.get(l)) ?? c, this._$Em = null;
    }
  }
  requestUpdate(t, o, s, l = !1, r) {
    var i;
    if (t !== void 0) {
      const n = this.constructor;
      if (l === !1 && (r = this[t]), s ?? (s = n.getPropertyOptions(t)), !((s.hasChanged ?? so)(r, o) || s.useDefault && s.reflect && r === ((i = this._$Ej) == null ? void 0 : i.get(t)) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, o, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, o, { useDefault: s, reflect: l, wrapped: r }, i) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, i ?? o ?? this[t]), r !== !0 || i !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (o = void 0), this._$AL.set(t, o)), l === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (o) {
      Promise.reject(o);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var s;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [r, i] of this._$Ep) this[r] = i;
        this._$Ep = void 0;
      }
      const l = this.constructor.elementProperties;
      if (l.size > 0) for (const [r, i] of l) {
        const { wrapped: n } = i, a = this[r];
        n !== !0 || this._$AL.has(r) || a === void 0 || this.C(r, void 0, i, a);
      }
    }
    let t = !1;
    const o = this._$AL;
    try {
      t = this.shouldUpdate(o), t ? (this.willUpdate(o), (s = this._$EO) == null || s.forEach((l) => {
        var r;
        return (r = l.hostUpdate) == null ? void 0 : r.call(l);
      }), this.update(o)) : this._$EM();
    } catch (l) {
      throw t = !1, this._$EM(), l;
    }
    t && this._$AE(o);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var o;
    (o = this._$EO) == null || o.forEach((s) => {
      var l;
      return (l = s.hostUpdated) == null ? void 0 : l.call(s);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((o) => this._$ET(o, this[o]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
Ce.elementStyles = [], Ce.shadowRootOptions = { mode: "open" }, Ce[je("elementProperties")] = /* @__PURE__ */ new Map(), Ce[je("finalized")] = /* @__PURE__ */ new Map(), Mt == null || Mt({ ReactiveElement: Ce }), (re.reactiveElementVersions ?? (re.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ie = globalThis, Co = (e) => e, ft = Ie.trustedTypes, Qo = ft ? ft.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, rs = "$lit$", le = `lit$${Math.random().toFixed(9).slice(2)}$`, is = "?" + le, fl = `<${is}>`, we = document, We = () => we.createComment(""), qe = (e) => e === null || typeof e != "object" && typeof e != "function", lo = Array.isArray, gl = (e) => lo(e) || typeof (e == null ? void 0 : e[Symbol.iterator]) == "function", Tt = `[ 	
\f\r]`, Ve = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Eo = /-->/g, So = />/g, fe = RegExp(`>|${Tt}(?:([^\\s"'>=/]+)(${Tt}*=${Tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), zo = /'/g, Po = /"/g, ns = /^(?:script|style|textarea|title)$/i, ml = (e) => (t, ...o) => ({ _$litType$: e, strings: t, values: o }), L = ml(1), ie = Symbol.for("lit-noChange"), w = Symbol.for("lit-nothing"), Oo = /* @__PURE__ */ new WeakMap(), be = we.createTreeWalker(we, 129);
function as(e, t) {
  if (!lo(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Qo !== void 0 ? Qo.createHTML(t) : t;
}
const vl = (e, t) => {
  const o = e.length - 1, s = [];
  let l, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", i = Ve;
  for (let n = 0; n < o; n++) {
    const a = e[n];
    let c, d, h = -1, f = 0;
    for (; f < a.length && (i.lastIndex = f, d = i.exec(a), d !== null); ) f = i.lastIndex, i === Ve ? d[1] === "!--" ? i = Eo : d[1] !== void 0 ? i = So : d[2] !== void 0 ? (ns.test(d[2]) && (l = RegExp("</" + d[2], "g")), i = fe) : d[3] !== void 0 && (i = fe) : i === fe ? d[0] === ">" ? (i = l ?? Ve, h = -1) : d[1] === void 0 ? h = -2 : (h = i.lastIndex - d[2].length, c = d[1], i = d[3] === void 0 ? fe : d[3] === '"' ? Po : zo) : i === Po || i === zo ? i = fe : i === Eo || i === So ? i = Ve : (i = fe, l = void 0);
    const p = i === fe && e[n + 1].startsWith("/>") ? " " : "";
    r += i === Ve ? a + fl : h >= 0 ? (s.push(c), a.slice(0, h) + rs + a.slice(h) + le + p) : a + le + (h === -2 ? n : p);
  }
  return [as(e, r + (e[o] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class Ze {
  constructor({ strings: t, _$litType$: o }, s) {
    let l;
    this.parts = [];
    let r = 0, i = 0;
    const n = t.length - 1, a = this.parts, [c, d] = vl(t, o);
    if (this.el = Ze.createElement(c, s), be.currentNode = this.el.content, o === 2 || o === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (l = be.nextNode()) !== null && a.length < n; ) {
      if (l.nodeType === 1) {
        if (l.hasAttributes()) for (const h of l.getAttributeNames()) if (h.endsWith(rs)) {
          const f = d[i++], p = l.getAttribute(h).split(le), m = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: r, name: m[2], strings: p, ctor: m[1] === "." ? yl : m[1] === "?" ? wl : m[1] === "@" ? xl : _t }), l.removeAttribute(h);
        } else h.startsWith(le) && (a.push({ type: 6, index: r }), l.removeAttribute(h));
        if (ns.test(l.tagName)) {
          const h = l.textContent.split(le), f = h.length - 1;
          if (f > 0) {
            l.textContent = ft ? ft.emptyScript : "";
            for (let p = 0; p < f; p++) l.append(h[p], We()), be.nextNode(), a.push({ type: 2, index: ++r });
            l.append(h[f], We());
          }
        }
      } else if (l.nodeType === 8) if (l.data === is) a.push({ type: 2, index: r });
      else {
        let h = -1;
        for (; (h = l.data.indexOf(le, h + 1)) !== -1; ) a.push({ type: 7, index: r }), h += le.length - 1;
      }
      r++;
    }
  }
  static createElement(t, o) {
    const s = we.createElement("template");
    return s.innerHTML = t, s;
  }
}
function ze(e, t, o = e, s) {
  var i, n;
  if (t === ie) return t;
  let l = s !== void 0 ? (i = o._$Co) == null ? void 0 : i[s] : o._$Cl;
  const r = qe(t) ? void 0 : t._$litDirective$;
  return (l == null ? void 0 : l.constructor) !== r && ((n = l == null ? void 0 : l._$AO) == null || n.call(l, !1), r === void 0 ? l = void 0 : (l = new r(e), l._$AT(e, o, s)), s !== void 0 ? (o._$Co ?? (o._$Co = []))[s] = l : o._$Cl = l), l !== void 0 && (t = ze(e, l._$AS(e, t.values), l, s)), t;
}
class bl {
  constructor(t, o) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = o;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: o }, parts: s } = this._$AD, l = ((t == null ? void 0 : t.creationScope) ?? we).importNode(o, !0);
    be.currentNode = l;
    let r = be.nextNode(), i = 0, n = 0, a = s[0];
    for (; a !== void 0; ) {
      if (i === a.index) {
        let c;
        a.type === 2 ? c = new tt(r, r.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (c = new $l(r, this, t)), this._$AV.push(c), a = s[++n];
      }
      i !== (a == null ? void 0 : a.index) && (r = be.nextNode(), i++);
    }
    return be.currentNode = we, l;
  }
  p(t) {
    let o = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, o), o += s.strings.length - 2) : s._$AI(t[o])), o++;
  }
}
class tt {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, o, s, l) {
    this.type = 2, this._$AH = w, this._$AN = void 0, this._$AA = t, this._$AB = o, this._$AM = s, this.options = l, this._$Cv = (l == null ? void 0 : l.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const o = this._$AM;
    return o !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = o.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, o = this) {
    t = ze(this, t, o), qe(t) ? t === w || t == null || t === "" ? (this._$AH !== w && this._$AR(), this._$AH = w) : t !== this._$AH && t !== ie && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : gl(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== w && qe(this._$AH) ? this._$AA.nextSibling.data = t : this.T(we.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: o, _$litType$: s } = t, l = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = Ze.createElement(as(s.h, s.h[0]), this.options)), s);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === l) this._$AH.p(o);
    else {
      const i = new bl(l, this), n = i.u(this.options);
      i.p(o), this.T(n), this._$AH = i;
    }
  }
  _$AC(t) {
    let o = Oo.get(t.strings);
    return o === void 0 && Oo.set(t.strings, o = new Ze(t)), o;
  }
  k(t) {
    lo(this._$AH) || (this._$AH = [], this._$AR());
    const o = this._$AH;
    let s, l = 0;
    for (const r of t) l === o.length ? o.push(s = new tt(this.O(We()), this.O(We()), this, this.options)) : s = o[l], s._$AI(r), l++;
    l < o.length && (this._$AR(s && s._$AB.nextSibling, l), o.length = l);
  }
  _$AR(t = this._$AA.nextSibling, o) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, o); t !== this._$AB; ) {
      const l = Co(t).nextSibling;
      Co(t).remove(), t = l;
    }
  }
  setConnected(t) {
    var o;
    this._$AM === void 0 && (this._$Cv = t, (o = this._$AP) == null || o.call(this, t));
  }
}
class _t {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, o, s, l, r) {
    this.type = 1, this._$AH = w, this._$AN = void 0, this.element = t, this.name = o, this._$AM = l, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = w;
  }
  _$AI(t, o = this, s, l) {
    const r = this.strings;
    let i = !1;
    if (r === void 0) t = ze(this, t, o, 0), i = !qe(t) || t !== this._$AH && t !== ie, i && (this._$AH = t);
    else {
      const n = t;
      let a, c;
      for (t = r[0], a = 0; a < r.length - 1; a++) c = ze(this, n[s + a], o, a), c === ie && (c = this._$AH[a]), i || (i = !qe(c) || c !== this._$AH[a]), c === w ? t = w : t !== w && (t += (c ?? "") + r[a + 1]), this._$AH[a] = c;
    }
    i && !l && this.j(t);
  }
  j(t) {
    t === w ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class yl extends _t {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === w ? void 0 : t;
  }
}
class wl extends _t {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== w);
  }
}
class xl extends _t {
  constructor(t, o, s, l, r) {
    super(t, o, s, l, r), this.type = 5;
  }
  _$AI(t, o = this) {
    if ((t = ze(this, t, o, 0) ?? w) === ie) return;
    const s = this._$AH, l = t === w && s !== w || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== w && (s === w || l);
    l && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var o;
    typeof this._$AH == "function" ? this._$AH.call(((o = this.options) == null ? void 0 : o.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class $l {
  constructor(t, o, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = o, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ze(this, t);
  }
}
const Dt = Ie.litHtmlPolyfillSupport;
Dt == null || Dt(Ze, tt), (Ie.litHtmlVersions ?? (Ie.litHtmlVersions = [])).push("3.3.3");
const _l = (e, t, o) => {
  const s = (o == null ? void 0 : o.renderBefore) ?? t;
  let l = s._$litPart$;
  if (l === void 0) {
    const r = (o == null ? void 0 : o.renderBefore) ?? null;
    s._$litPart$ = l = new tt(t.insertBefore(We(), r), r, void 0, o ?? {});
  }
  return l._$AI(e), l;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis;
let C = class extends Ce {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var o;
    const t = super.createRenderRoot();
    return (o = this.renderOptions).renderBefore ?? (o.renderBefore = t.firstChild), t;
  }
  update(t) {
    const o = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = _l(o, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return ie;
  }
};
var Yo;
C._$litElement$ = !0, C.finalized = !0, (Yo = ye.litElementHydrateSupport) == null || Yo.call(ye, { LitElement: C });
const Ht = ye.litElementPolyfillSupport;
Ht == null || Ht({ LitElement: C });
(ye.litElementVersions ?? (ye.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = (e) => (t, o) => {
  o !== void 0 ? o.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ll = { attribute: !0, type: String, converter: pt, reflect: !1, hasChanged: so }, kl = (e = Ll, t, o) => {
  const { kind: s, metadata: l } = o;
  let r = globalThis.litPropertyMetadata.get(l);
  if (r === void 0 && globalThis.litPropertyMetadata.set(l, r = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(o.name, e), s === "accessor") {
    const { name: i } = o;
    return { set(n) {
      const a = t.get.call(this);
      t.set.call(this, n), this.requestUpdate(i, a, e, !0, n);
    }, init(n) {
      return n !== void 0 && this.C(i, void 0, e, n), n;
    } };
  }
  if (s === "setter") {
    const { name: i } = o;
    return function(n) {
      const a = this[i];
      t.call(this, n), this.requestUpdate(i, a, e, !0, n);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function u(e) {
  return (t, o) => typeof o == "object" ? kl(e, t, o) : ((s, l, r) => {
    const i = l.hasOwnProperty(r);
    return l.constructor.createProperty(r, s), i ? Object.getOwnPropertyDescriptor(l, r) : void 0;
  })(e, t, o);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function ro(e) {
  return u({ ...e, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Al = (e, t, o) => (o.configurable = !0, o.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, o), o);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function W(e, t) {
  return (o, s, l) => {
    const r = (i) => {
      var n;
      return ((n = i.renderRoot) == null ? void 0 : n.querySelector(e)) ?? null;
    };
    return Al(o, s, { get() {
      return r(this);
    } });
  };
}
const Cl = {
  "--band": "#1d4ed8",
  "--band-ink": "#ffffff",
  "--rail": "#064e3b",
  "--rail-group": "#059669",
  "--rail-button": "44px",
  "--power-on": "#4ade80",
  "--stop": "#ef4444"
}, Ql = 640, cs = 600, ot = `not all and (height > ${Ql}px) and (width > ${cs}px)`, El = Object.entries(Cl).map(([e, t]) => `${e}: ${t};`).join(`
`), M = A`
  :host {
    ${ce(El)}
  }
`;
var Sl = Object.getOwnPropertyDescriptor, zl = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Sl(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = i(l) || l);
  return l;
};
let Wt = class extends C {
  render() {
    return L`
      <slot name="band"></slot>
      <div class="body">
        <slot name="rail"></slot>
        <div class="work"><slot></slot></div>
      </div>
    `;
  }
};
Wt.styles = [
  M,
  A`
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

      @media ${ce(ot)} {
        .body {
          flex-direction: column;
        }
      }
    `
];
Wt = zl([
  R("look-shell")
], Wt);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hs = { ATTRIBUTE: 1, CHILD: 2 }, ds = (e) => (...t) => ({ _$litDirective$: e, values: t });
let us = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, o, s) {
    this._$Ct = t, this._$AM = o, this._$Ci = s;
  }
  _$AS(t, o) {
    return this.update(t, o);
  }
  update(t, o) {
    return this.render(...o);
  }
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let qt = class extends us {
  constructor(t) {
    if (super(t), this.it = w, t.type !== hs.CHILD) throw Error(this.constructor.directiveName + "() can only be used in child bindings");
  }
  render(t) {
    if (t === w || t == null) return this._t = void 0, this.it = t;
    if (t === ie) return t;
    if (typeof t != "string") throw Error(this.constructor.directiveName + "() called with a non-string value");
    if (t === this.it) return this._t;
    this.it = t;
    const o = [t];
    return o.raw = o, this._t = { _$litType$: this.constructor.resultType, strings: o, values: [] };
  }
};
qt.directiveName = "unsafeHTML", qt.resultType = 1;
const Ro = ds(qt);
var Pl = A`
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
`;
function Re(e, t) {
  const o = $t({
    waitUntilFirstUpdate: !1
  }, t);
  return (s, l) => {
    const { update: r } = s, i = Array.isArray(e) ? e : [e];
    s.update = function(n) {
      i.forEach((a) => {
        const c = a;
        if (n.has(c)) {
          const d = n.get(c), h = this[c];
          d !== h && (!o.waitUntilFirstUpdate || this.hasUpdated) && this[l](d, h);
        }
      }), r.call(this, n);
    };
  };
}
var st = A`
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
`, ct, te = class extends C {
  constructor() {
    super(), Zs(this, ct, !1), this.initialReflectedProperties = /* @__PURE__ */ new Map(), Object.entries(this.constructor.dependencies).forEach(([e, t]) => {
      this.constructor.define(e, t);
    });
  }
  emit(e, t) {
    const o = new CustomEvent(e, $t({
      bubbles: !0,
      cancelable: !1,
      composed: !0,
      detail: {}
    }, t));
    return this.dispatchEvent(o), o;
  }
  /* eslint-enable */
  static define(e, t = this, o = {}) {
    const s = customElements.get(e);
    if (!s) {
      try {
        customElements.define(e, t, o);
      } catch {
        customElements.define(e, class extends t {
        }, o);
      }
      return;
    }
    let l = " (unknown version)", r = l;
    "version" in t && t.version && (l = " v" + t.version), "version" in s && s.version && (r = " v" + s.version), !(l && r && l === r) && console.warn(
      `Attempted to register <${e}>${l}, but <${e}>${r} has already been registered.`
    );
  }
  attributeChangedCallback(e, t, o) {
    qs(this, ct) || (this.constructor.elementProperties.forEach(
      (s, l) => {
        s.reflect && this[l] != null && this.initialReflectedProperties.set(l, this[l]);
      }
    ), Ks(this, ct, !0)), super.attributeChangedCallback(e, t, o);
  }
  willUpdate(e) {
    super.willUpdate(e), this.initialReflectedProperties.forEach((t, o) => {
      e.has(o) && this[o] == null && (this[o] = t);
    });
  }
};
ct = /* @__PURE__ */ new WeakMap();
te.version = "2.20.1";
te.dependencies = {};
g([
  u()
], te.prototype, "dir", 2);
g([
  u()
], te.prototype, "lang", 2);
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ol = (e, t) => (e == null ? void 0 : e._$litType$) !== void 0;
var Fe = Symbol(), it = Symbol(), Bt, Nt = /* @__PURE__ */ new Map(), q = class extends te {
  constructor() {
    super(...arguments), this.initialRender = !1, this.svg = null, this.label = "", this.library = "default";
  }
  /** Given a URL, this function returns the resulting SVG element or an appropriate error symbol. */
  async resolveIcon(e, t) {
    var o;
    let s;
    if (t != null && t.spriteSheet)
      return this.svg = L`<svg part="svg">
        <use part="use" href="${e}"></use>
      </svg>`, this.svg;
    try {
      if (s = await fetch(e, { mode: "cors" }), !s.ok) return s.status === 410 ? Fe : it;
    } catch {
      return it;
    }
    try {
      const l = document.createElement("div");
      l.innerHTML = await s.text();
      const r = l.firstElementChild;
      if (((o = r == null ? void 0 : r.tagName) == null ? void 0 : o.toLowerCase()) !== "svg") return Fe;
      Bt || (Bt = new DOMParser());
      const n = Bt.parseFromString(r.outerHTML, "text/html").body.querySelector("svg");
      return n ? (n.part.add("svg"), document.adoptNode(n)) : Fe;
    } catch {
      return Fe;
    }
  }
  connectedCallback() {
    super.connectedCallback(), Bs(this);
  }
  firstUpdated() {
    this.initialRender = !0, this.setIcon();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), Ns(this);
  }
  getIconSource() {
    const e = wo(this.library);
    return this.name && e ? {
      url: e.resolver(this.name),
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
    var e;
    const { url: t, fromLibrary: o } = this.getIconSource(), s = o ? wo(this.library) : void 0;
    if (!t) {
      this.svg = null;
      return;
    }
    let l = Nt.get(t);
    if (l || (l = this.resolveIcon(t, s), Nt.set(t, l)), !this.initialRender)
      return;
    const r = await l;
    if (r === it && Nt.delete(t), t === this.getIconSource().url) {
      if (Ol(r)) {
        if (this.svg = r, s) {
          await this.updateComplete;
          const i = this.shadowRoot.querySelector("[part='svg']");
          typeof s.mutator == "function" && i && s.mutator(i);
        }
        return;
      }
      switch (r) {
        case it:
        case Fe:
          this.svg = null, this.emit("sl-error");
          break;
        default:
          this.svg = r.cloneNode(!0), (e = s == null ? void 0 : s.mutator) == null || e.call(s, this.svg), this.emit("sl-load");
      }
    }
  }
  render() {
    return this.svg;
  }
};
q.styles = [st, Pl];
g([
  ro()
], q.prototype, "svg", 2);
g([
  u({ reflect: !0 })
], q.prototype, "name", 2);
g([
  u()
], q.prototype, "src", 2);
g([
  u()
], q.prototype, "label", 2);
g([
  u({ reflect: !0 })
], q.prototype, "library", 2);
g([
  Re("label")
], q.prototype, "handleLabelChange", 1);
g([
  Re(["name", "src", "library"])
], q.prototype, "setIcon", 1);
q.define("sl-icon");
var Rl = A`
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
`, Ml = A`
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
const Zt = /* @__PURE__ */ new Set(), Qe = /* @__PURE__ */ new Map();
let X, io = "ltr", no = "en";
const ps = typeof MutationObserver < "u" && typeof document < "u" && typeof document.documentElement < "u";
if (ps) {
  const e = new MutationObserver(gs);
  io = document.documentElement.dir || "ltr", no = document.documentElement.lang || navigator.language, e.observe(document.documentElement, {
    attributes: !0,
    attributeFilter: ["dir", "lang"]
  });
}
function fs(...e) {
  e.map((t) => {
    const o = t.$code.toLowerCase();
    Qe.has(o) ? Qe.set(o, Object.assign(Object.assign({}, Qe.get(o)), t)) : Qe.set(o, t), X || (X = t);
  }), gs();
}
function gs() {
  ps && (io = document.documentElement.dir || "ltr", no = document.documentElement.lang || navigator.language), [...Zt.keys()].map((e) => {
    typeof e.requestUpdate == "function" && e.requestUpdate();
  });
}
let Tl = class {
  constructor(t) {
    this.host = t, this.host.addController(this);
  }
  hostConnected() {
    Zt.add(this.host);
  }
  hostDisconnected() {
    Zt.delete(this.host);
  }
  dir() {
    return `${this.host.dir || io}`.toLowerCase();
  }
  lang() {
    const t = `${this.host.lang || no}`.toLowerCase().replace(/_/g, "-");
    try {
      return new Intl.Locale(t), t;
    } catch {
      return X ? X.$code.toLowerCase() : "en";
    }
  }
  getTranslationData(t) {
    var o, s;
    let l;
    try {
      l = new Intl.Locale(t.replace(/_/g, "-"));
    } catch {
      return { locale: void 0, language: "", region: "", primary: void 0, secondary: void 0 };
    }
    const r = l.language.toLowerCase(), i = (s = (o = l.region) === null || o === void 0 ? void 0 : o.toLowerCase()) !== null && s !== void 0 ? s : "", n = Qe.get(`${r}-${i}`), a = Qe.get(r);
    return { locale: l, language: r, region: i, primary: n, secondary: a };
  }
  exists(t, o) {
    var s;
    const { primary: l, secondary: r } = this.getTranslationData((s = o.lang) !== null && s !== void 0 ? s : this.lang());
    return o = Object.assign({ includeFallback: !1 }, o), !!(l && l[t] || r && r[t] || o.includeFallback && X && X[t]);
  }
  term(t, ...o) {
    const { primary: s, secondary: l } = this.getTranslationData(this.lang());
    let r;
    if (s && s[t])
      r = s[t];
    else if (l && l[t])
      r = l[t];
    else if (X && X[t])
      r = X[t];
    else
      return console.error(`No translation found for: ${String(t)}`), String(t);
    return typeof r == "function" ? r(...o) : r;
  }
  date(t, o) {
    return t = new Date(t), new Intl.DateTimeFormat(this.lang(), o).format(t);
  }
  number(t, o) {
    return t = Number(t), isNaN(t) ? "" : new Intl.NumberFormat(this.lang(), o).format(t);
  }
  relativeTime(t, o, s) {
    return new Intl.RelativeTimeFormat(this.lang(), s).format(t, o);
  }
};
var ms = {
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
  goToSlide: (e, t) => `Go to slide ${e} of ${t}`,
  hidePassword: "Hide password",
  loading: "Loading",
  nextSlide: "Next slide",
  numOptionsSelected: (e) => e === 0 ? "No options selected" : e === 1 ? "1 option selected" : `${e} options selected`,
  previousSlide: "Previous slide",
  progress: "Progress",
  remove: "Remove",
  resize: "Resize",
  scrollToEnd: "Scroll to end",
  scrollToStart: "Scroll to start",
  selectAColorFromTheScreen: "Select a color from the screen",
  showPassword: "Show password",
  slideNum: (e) => `Slide ${e}`,
  toggleColorFormat: "Toggle color format"
};
fs(ms);
var Dl = ms, ao = class extends Tl {
};
fs(Dl);
const ne = Math.min, G = Math.max, gt = Math.round, nt = Math.floor, J = (e) => ({
  x: e,
  y: e
}), Hl = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function vs(e, t, o) {
  return G(e, ne(t, o));
}
function Me(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function xe(e) {
  return e.split("-")[0];
}
function Te(e) {
  return e.split("-")[1];
}
function bs(e) {
  return e === "x" ? "y" : "x";
}
function co(e) {
  return e === "y" ? "height" : "width";
}
function Y(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function ho(e) {
  return bs(Y(e));
}
function Bl(e, t, o) {
  o === void 0 && (o = !1);
  const s = Te(e), l = ho(e), r = co(l);
  let i = l === "x" ? s === (o ? "end" : "start") ? "right" : "left" : s === "start" ? "bottom" : "top";
  return t.reference[r] > t.floating[r] && (i = mt(i)), [i, mt(i)];
}
function Nl(e) {
  const t = mt(e);
  return [Kt(e), t, Kt(t)];
}
function Kt(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Mo = ["left", "right"], To = ["right", "left"], Vl = ["top", "bottom"], Fl = ["bottom", "top"];
function Ul(e, t, o) {
  switch (e) {
    case "top":
    case "bottom":
      return o ? t ? To : Mo : t ? Mo : To;
    case "left":
    case "right":
      return t ? Vl : Fl;
    default:
      return [];
  }
}
function jl(e, t, o, s) {
  const l = Te(e);
  let r = Ul(xe(e), o === "start", s);
  return l && (r = r.map((i) => i + "-" + l), t && (r = r.concat(r.map(Kt)))), r;
}
function mt(e) {
  const t = xe(e);
  return Hl[t] + e.slice(t.length);
}
function Il(e) {
  var t, o, s, l;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (o = e.right) != null ? o : 0,
    bottom: (s = e.bottom) != null ? s : 0,
    left: (l = e.left) != null ? l : 0
  };
}
function ys(e) {
  return typeof e != "number" ? Il(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function vt(e) {
  const {
    x: t,
    y: o,
    width: s,
    height: l
  } = e;
  return {
    width: s,
    height: l,
    top: o,
    left: t,
    right: t + s,
    bottom: o + l,
    x: t,
    y: o
  };
}
function Do(e, t, o) {
  let {
    reference: s,
    floating: l
  } = e;
  const r = Y(t), i = ho(t), n = co(i), a = xe(t), c = r === "y", d = s.x + s.width / 2 - l.width / 2, h = s.y + s.height / 2 - l.height / 2, f = s[n] / 2 - l[n] / 2;
  let p;
  switch (a) {
    case "top":
      p = {
        x: d,
        y: s.y - l.height
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
        x: s.x - l.width,
        y: h
      };
      break;
    default:
      p = {
        x: s.x,
        y: s.y
      };
  }
  const m = Te(t);
  return m && (p[i] += f * (m === "end" ? 1 : -1) * (o && c ? -1 : 1)), p;
}
async function Wl(e, t) {
  var o;
  t === void 0 && (t = {});
  const {
    x: s,
    y: l,
    platform: r,
    rects: i,
    elements: n,
    strategy: a
  } = e, {
    boundary: c = "clippingAncestors",
    rootBoundary: d = "viewport",
    elementContext: h = "floating",
    altBoundary: f = !1,
    padding: p = 0
  } = Me(t, e), m = ys(p), y = n[f ? h === "floating" ? "reference" : "floating" : h], b = vt(await r.getClippingRect({
    element: (o = await (r.isElement == null ? void 0 : r.isElement(y))) == null || o ? y : y.contextElement || await (r.getDocumentElement == null ? void 0 : r.getDocumentElement(n.floating)),
    boundary: c,
    rootBoundary: d,
    strategy: a
  })), x = h === "floating" ? {
    x: s,
    y: l,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, $ = await (r.getOffsetParent == null ? void 0 : r.getOffsetParent(n.floating)), k = await (r.isElement == null ? void 0 : r.isElement($)) && await (r.getScale == null ? void 0 : r.getScale($)) || {
    x: 1,
    y: 1
  }, z = vt(r.convertOffsetParentRelativeRectToViewportRelativeRect ? await r.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: n,
    rect: x,
    offsetParent: $,
    strategy: a
  }) : x);
  return {
    top: (b.top - z.top + m.top) / k.y,
    bottom: (z.bottom - b.bottom + m.bottom) / k.y,
    left: (b.left - z.left + m.left) / k.x,
    right: (z.right - b.right + m.right) / k.x
  };
}
const ql = 50, Zl = async (e, t, o) => {
  const {
    placement: s = "bottom",
    strategy: l = "absolute",
    middleware: r = [],
    platform: i
  } = o, n = i.detectOverflow ? i : {
    ...i,
    detectOverflow: Wl
  }, a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let c = await i.getElementRects({
    reference: e,
    floating: t,
    strategy: l
  }), {
    x: d,
    y: h
  } = Do(c, s, a), f = s, p = 0;
  const m = {};
  for (let v = 0; v < r.length; v++) {
    const y = r[v];
    if (!y)
      continue;
    const {
      name: b,
      fn: x
    } = y, {
      x: $,
      y: k,
      data: z,
      reset: Q
    } = await x({
      x: d,
      y: h,
      initialPlacement: s,
      placement: f,
      strategy: l,
      middlewareData: m,
      rects: c,
      platform: n,
      elements: {
        reference: e,
        floating: t
      }
    });
    d = $ ?? d, h = k ?? h, m[b] = {
      ...m[b],
      ...z
    }, Q && p < ql && (p++, typeof Q == "object" && (Q.placement && (f = Q.placement), Q.rects && (c = Q.rects === !0 ? await i.getElementRects({
      reference: e,
      floating: t,
      strategy: l
    }) : Q.rects), {
      x: d,
      y: h
    } = Do(c, f, a)), v = -1);
  }
  return {
    x: d,
    y: h,
    placement: f,
    strategy: l,
    middlewareData: m
  };
}, Kl = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: o,
      y: s,
      placement: l,
      rects: r,
      platform: i,
      elements: n,
      middlewareData: a
    } = t, {
      element: c,
      padding: d = 0
    } = Me(e, t) || {};
    if (c == null)
      return {};
    const h = ys(d), f = {
      x: o,
      y: s
    }, p = ho(l), m = co(p), v = await i.getDimensions(c), y = p === "y", b = y ? "top" : "left", x = y ? "bottom" : "right", $ = y ? "clientHeight" : "clientWidth", k = r.reference[m] + r.reference[p] - f[p] - r.floating[m], z = f[p] - r.reference[p], Q = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
    let P = Q ? Q[$] : 0;
    (!P || !await (i.isElement == null ? void 0 : i.isElement(Q))) && (P = n.floating[$] || r.floating[m]);
    const H = k / 2 - z / 2, F = P / 2 - v[m] / 2 - 1, S = ne(h[b], F), Be = ne(h[x], F), Ne = P - v[m] - Be, U = P / 2 - v[m] / 2 + H, B = vs(S, U, Ne), ue = !a.arrow && Te(l) != null && U !== B && r.reference[m] / 2 - (U < S ? S : Be) - v[m] / 2 < 0, K = ue ? U < S ? U - S : U - Ne : 0;
    return {
      [p]: f[p] + K,
      data: {
        [p]: B,
        centerOffset: U - B - K,
        ...ue && {
          alignmentOffset: K
        }
      },
      reset: ue
    };
  }
}), Xl = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var o, s;
      const {
        placement: l,
        middlewareData: r,
        rects: i,
        initialPlacement: n,
        platform: a,
        elements: c
      } = t, {
        mainAxis: d = !0,
        crossAxis: h = !0,
        fallbackPlacements: f,
        fallbackStrategy: p = "bestFit",
        fallbackAxisSideDirection: m = "none",
        flipAlignment: v = !0,
        ...y
      } = Me(e, t);
      if ((o = r.arrow) != null && o.alignmentOffset)
        return {};
      const b = xe(l), x = Y(n), $ = xe(n) === n, k = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)), z = f || ($ || !v ? [mt(n)] : Nl(n)), Q = m !== "none";
      !f && Q && z.push(...jl(n, v, m, k));
      const P = [n, ...z], H = await a.detectOverflow(t, y), F = [];
      let S = ((s = r.flip) == null ? void 0 : s.overflows) || [];
      if (d && F.push(H[b]), h) {
        const B = Bl(l, i, k);
        F.push(H[B[0]], H[B[1]]);
      }
      if (S = [...S, {
        placement: l,
        overflows: F
      }], !F.every((B) => B <= 0)) {
        var Be, Ne;
        const B = (((Be = r.flip) == null ? void 0 : Be.index) || 0) + 1, ue = P[B];
        if (ue && (!(h === "alignment" ? x !== Y(ue) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        S.every((N) => Y(N.placement) === x ? N.overflows[0] > 0 : !0)))
          return {
            data: {
              index: B,
              overflows: S
            },
            reset: {
              placement: ue
            }
          };
        let K = (Ne = S.filter((pe) => pe.overflows[0] <= 0).sort((pe, N) => pe.overflows[1] - N.overflows[1])[0]) == null ? void 0 : Ne.placement;
        if (!K)
          switch (p) {
            case "bestFit": {
              var U;
              const pe = (U = S.filter((N) => {
                if (Q) {
                  const se = Y(N.placement);
                  return se === x || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  se === "y";
                }
                return !0;
              }).map((N) => [N.placement, N.overflows.filter((se) => se > 0).reduce((se, Os) => se + Os, 0)]).sort((N, se) => N[1] - se[1])[0]) == null ? void 0 : U[0];
              pe && (K = pe);
              break;
            }
            case "initialPlacement":
              K = n;
              break;
          }
        if (l !== K)
          return {
            reset: {
              placement: K
            }
          };
      }
      return {};
    }
  };
}, Yl = /* @__PURE__ */ new Set(["left", "top"]);
async function Gl(e, t) {
  const {
    placement: o,
    platform: s,
    elements: l
  } = e, r = await (s.isRTL == null ? void 0 : s.isRTL(l.floating)), i = xe(o), n = Te(o), a = Y(o) === "y", c = Yl.has(i) ? -1 : 1, d = r && a ? -1 : 1, h = Me(t, e);
  let {
    mainAxis: f,
    crossAxis: p,
    alignmentAxis: m
  } = typeof h == "number" ? {
    mainAxis: h,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: h.mainAxis || 0,
    crossAxis: h.crossAxis || 0,
    alignmentAxis: h.alignmentAxis
  };
  return n && typeof m == "number" && (p = n === "end" ? m * -1 : m), a ? {
    x: p * d,
    y: f * c
  } : {
    x: f * c,
    y: p * d
  };
}
const Jl = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var o, s;
      const {
        x: l,
        y: r,
        placement: i,
        middlewareData: n
      } = t, a = await Gl(t, e);
      return i === ((o = n.offset) == null ? void 0 : o.placement) && (s = n.arrow) != null && s.alignmentOffset ? {} : {
        x: l + a.x,
        y: r + a.y,
        data: {
          ...a,
          placement: i
        }
      };
    }
  };
}, er = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: o,
        y: s,
        placement: l,
        platform: r
      } = t, {
        mainAxis: i = !0,
        crossAxis: n = !1,
        limiter: a = {
          fn: (x) => {
            let {
              x: $,
              y: k
            } = x;
            return {
              x: $,
              y: k
            };
          }
        },
        ...c
      } = Me(e, t), d = {
        x: o,
        y: s
      }, h = await r.detectOverflow(t, c), f = Y(l), p = bs(f);
      let m = d[p], v = d[f];
      const y = (x, $) => vs($ + h[x === "y" ? "top" : "left"], $, $ - h[x === "y" ? "bottom" : "right"]);
      i && (m = y(p, m)), n && (v = y(f, v));
      const b = a.fn({
        ...t,
        [p]: m,
        [f]: v
      });
      return {
        ...b,
        data: {
          x: b.x - o,
          y: b.y - s,
          enabled: {
            [p]: i,
            [f]: n
          }
        }
      };
    }
  };
}, tr = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      const {
        placement: o,
        rects: s,
        platform: l,
        elements: r
      } = t, {
        apply: i = () => {
        },
        ...n
      } = Me(e, t), a = await l.detectOverflow(t, n), c = xe(o), d = Te(o), h = Y(o) === "y", {
        width: f,
        height: p
      } = s.floating;
      let m, v;
      c === "top" || c === "bottom" ? (m = c, v = d === (await (l.isRTL == null ? void 0 : l.isRTL(r.floating)) ? "start" : "end") ? "left" : "right") : (v = c, m = d === "end" ? "top" : "bottom");
      const y = p - a.top - a.bottom, b = f - a.left - a.right, x = ne(p - a[m], y), $ = ne(f - a[v], b), k = t.middlewareData.shift, z = !k;
      let Q = x, P = $;
      k != null && k.enabled.x && (P = b), k != null && k.enabled.y && (Q = y), z && !d && (h ? P = f - 2 * G(a.left, a.right) : Q = p - 2 * G(a.top, a.bottom)), await i({
        ...t,
        availableWidth: P,
        availableHeight: Q
      });
      const H = await l.getDimensions(r.floating);
      return f !== H.width || p !== H.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Lt() {
  return typeof window < "u";
}
function De(e) {
  return ws(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function O(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function oe(e) {
  var t;
  return (t = (ws(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function ws(e) {
  return Lt() ? e instanceof Node || e instanceof O(e).Node : !1;
}
function j(e) {
  return Lt() ? e instanceof Element || e instanceof O(e).Element : !1;
}
function he(e) {
  return Lt() ? e instanceof HTMLElement || e instanceof O(e).HTMLElement : !1;
}
function Ho(e) {
  return !Lt() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof O(e).ShadowRoot;
}
function kt(e) {
  const {
    overflow: t,
    overflowX: o,
    overflowY: s,
    display: l
  } = I(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + s + o) && l !== "inline" && l !== "contents";
}
function or(e) {
  return /^(table|td|th)$/.test(De(e));
}
function At(e) {
  try {
    if (e.matches(":popover-open"))
      return !0;
  } catch {
  }
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
const sr = /transform|translate|scale|rotate|perspective|filter/, lr = /paint|layout|strict|content/, ge = (e) => !!e && e !== "none";
let Vt;
function Ct(e) {
  const t = j(e) ? I(e) : e;
  return ge(t.transform) || ge(t.translate) || ge(t.scale) || ge(t.rotate) || ge(t.perspective) || !uo() && (ge(t.backdropFilter) || ge(t.filter)) || sr.test(t.willChange || "") || lr.test(t.contain || "");
}
function rr(e) {
  let t = $e(e);
  for (; he(t) && !Ke(t); ) {
    if (Ct(t))
      return t;
    if (At(t))
      return null;
    t = $e(t);
  }
  return null;
}
function uo() {
  return Vt == null && (Vt = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Vt;
}
function Ke(e) {
  return /^(html|body|#document)$/.test(De(e));
}
function I(e) {
  return O(e).getComputedStyle(e);
}
function Qt(e) {
  return j(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function $e(e) {
  if (De(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Ho(e) && e.host || // Fallback.
    oe(e)
  );
  return Ho(t) ? t.host : t;
}
function xs(e) {
  const t = $e(e);
  return Ke(t) ? (e.ownerDocument || e).body : he(t) && kt(t) ? t : xs(t);
}
function Xe(e, t, o) {
  var s;
  t === void 0 && (t = []), o === void 0 && (o = !0);
  const l = xs(e), r = l === ((s = e.ownerDocument) == null ? void 0 : s.body), i = O(l);
  if (r) {
    const n = Xt(i);
    return t.concat(i, i.visualViewport || [], kt(l) ? l : [], n && o ? Xe(n) : []);
  } else
    return t.concat(l, Xe(l, [], o));
}
function Xt(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function $s(e) {
  const t = I(e);
  let o = parseFloat(t.width) || 0, s = parseFloat(t.height) || 0;
  const l = he(e), r = l ? e.offsetWidth : o, i = l ? e.offsetHeight : s, n = gt(o) !== r || gt(s) !== i;
  return n && (o = r, s = i), {
    width: o,
    height: s,
    $: n
  };
}
function po(e) {
  return j(e) ? e : e.contextElement;
}
function Se(e) {
  const t = po(e);
  if (!he(t))
    return J(1);
  const o = t.getBoundingClientRect(), {
    width: s,
    height: l,
    $: r
  } = $s(t);
  let i = (r ? gt(o.width) : o.width) / s, n = (r ? gt(o.height) : o.height) / l;
  return (!i || !Number.isFinite(i)) && (i = 1), (!n || !Number.isFinite(n)) && (n = 1), {
    x: i,
    y: n
  };
}
const ir = /* @__PURE__ */ J(0);
function _s(e) {
  const t = O(e);
  return !uo() || !t.visualViewport ? ir : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function nr(e, t, o) {
  return t === void 0 && (t = !1), !!o && t && o === O(e);
}
function _e(e, t, o, s) {
  t === void 0 && (t = !1), o === void 0 && (o = !1);
  const l = e.getBoundingClientRect(), r = po(e);
  let i = J(1);
  t && (s ? j(s) && (i = Se(s)) : i = Se(e));
  const n = nr(r, o, s) ? _s(r) : J(0);
  let a = (l.left + n.x) / i.x, c = (l.top + n.y) / i.y, d = l.width / i.x, h = l.height / i.y;
  if (r && s) {
    const f = O(r), p = j(s) ? O(s) : s;
    let m = f, v = Xt(m);
    for (; v && p !== m; ) {
      const y = Se(v), b = v.getBoundingClientRect(), x = I(v), $ = b.left + (v.clientLeft + parseFloat(x.paddingLeft)) * y.x, k = b.top + (v.clientTop + parseFloat(x.paddingTop)) * y.y;
      a *= y.x, c *= y.y, d *= y.x, h *= y.y, a += $, c += k, m = O(v), v = Xt(m);
    }
  }
  return vt({
    width: d,
    height: h,
    x: a,
    y: c
  });
}
function Et(e, t) {
  const o = Qt(e).scrollLeft;
  return t ? t.left + o : _e(oe(e)).left + o;
}
function Ls(e, t) {
  const o = e.getBoundingClientRect(), s = o.left + t.scrollLeft - Et(e, o), l = o.top + t.scrollTop;
  return {
    x: s,
    y: l
  };
}
function ar(e) {
  let {
    elements: t,
    rect: o,
    offsetParent: s,
    strategy: l
  } = e;
  const r = l === "fixed", i = oe(s), n = t ? At(t.floating) : !1;
  if (s === i || n && r)
    return o;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, c = J(1);
  const d = J(0), h = he(s);
  if ((h || !r) && ((De(s) !== "body" || kt(i)) && (a = Qt(s)), h)) {
    const p = _e(s);
    c = Se(s), d.x = p.x + s.clientLeft, d.y = p.y + s.clientTop;
  }
  const f = i && !h && !r ? Ls(i, a) : J(0);
  return {
    width: o.width * c.x,
    height: o.height * c.y,
    x: o.x * c.x - a.scrollLeft * c.x + d.x + f.x,
    y: o.y * c.y - a.scrollTop * c.y + d.y + f.y
  };
}
function cr(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function hr(e) {
  const t = Qt(e), o = e.ownerDocument.body, s = G(e.scrollWidth, e.clientWidth, o.scrollWidth, o.clientWidth), l = G(e.scrollHeight, e.clientHeight, o.scrollHeight, o.clientHeight);
  let r = -t.scrollLeft + Et(e);
  const i = -t.scrollTop;
  return I(o).direction === "rtl" && (r += G(e.clientWidth, o.clientWidth) - s), {
    width: s,
    height: l,
    x: r,
    y: i
  };
}
const dr = 25;
function ur(e, t, o) {
  o === void 0 && (o = "viewport");
  const s = o === "layoutViewport", l = O(e), r = oe(e), i = l.visualViewport;
  let n = r.clientWidth, a = r.clientHeight, c = 0, d = 0;
  if (i) {
    const f = !uo() || t === "fixed";
    s ? f || (c = -i.offsetLeft, d = -i.offsetTop) : (n = i.width, a = i.height, f && (c = i.offsetLeft, d = i.offsetTop));
  }
  if (Et(r) <= 0) {
    const f = r.ownerDocument, p = f.body, m = getComputedStyle(p), v = f.compatMode === "CSS1Compat" && parseFloat(m.marginLeft) + parseFloat(m.marginRight) || 0, y = Math.abs(r.clientWidth - p.clientWidth - v), b = getComputedStyle(r).scrollbarGutter === "stable both-edges" ? y / 2 : y;
    b <= dr && (n -= b);
  }
  return {
    width: n,
    height: a,
    x: c,
    y: d
  };
}
function pr(e, t) {
  const o = _e(e, !0, t === "fixed"), s = o.top + e.clientTop, l = o.left + e.clientLeft, r = Se(e), i = e.clientWidth * r.x, n = e.clientHeight * r.y, a = l * r.x, c = s * r.y;
  return {
    width: i,
    height: n,
    x: a,
    y: c
  };
}
function Bo(e, t, o) {
  let s;
  if (t === "viewport" || t === "layoutViewport")
    s = ur(e, o, t);
  else if (t === "document")
    s = hr(oe(e));
  else if (j(t))
    s = pr(t, o);
  else {
    const l = _s(e);
    s = {
      x: t.x - l.x,
      y: t.y - l.y,
      width: t.width,
      height: t.height
    };
  }
  return vt(s);
}
function fr(e, t) {
  const o = t.get(e);
  if (o)
    return o;
  let s = Xe(e, [], !1).filter((n) => j(n) && De(n) !== "body"), l = null;
  const r = I(e).position === "fixed";
  let i = r ? $e(e) : e;
  for (; j(i) && !Ke(i); ) {
    const n = I(i), a = Ct(i), c = l ? l.position : r ? "fixed" : "";
    !a && (c === "fixed" || c === "absolute" && n.position === "static") ? s = s.filter((h) => h !== i) : l = n, i = $e(i);
  }
  return t.set(e, s), s;
}
function gr(e) {
  let {
    element: t,
    boundary: o,
    rootBoundary: s,
    strategy: l
  } = e;
  const i = [...o === "clippingAncestors" ? At(t) ? [] : fr(t, this._c) : [].concat(o), s], n = Bo(t, i[0], l);
  let a = n.top, c = n.right, d = n.bottom, h = n.left;
  for (let f = 1; f < i.length; f++) {
    const p = Bo(t, i[f], l);
    a = G(p.top, a), c = ne(p.right, c), d = ne(p.bottom, d), h = G(p.left, h);
  }
  return {
    width: c - h,
    height: d - a,
    x: h,
    y: a
  };
}
function mr(e) {
  const {
    width: t,
    height: o
  } = $s(e);
  return {
    width: t,
    height: o
  };
}
function vr(e, t, o) {
  const s = he(t), l = oe(t), r = o === "fixed", i = _e(e, !0, r, t);
  let n = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = J(0);
  if ((s || !r) && ((De(t) !== "body" || kt(l)) && (n = Qt(t)), s)) {
    const f = _e(t, !0, r, t);
    a.x = f.x + t.clientLeft, a.y = f.y + t.clientTop;
  }
  !s && l && (a.x = Et(l));
  const c = l && !s && !r ? Ls(l, n) : J(0), d = i.left + n.scrollLeft - a.x - c.x, h = i.top + n.scrollTop - a.y - c.y;
  return {
    x: d,
    y: h,
    width: i.width,
    height: i.height
  };
}
function Ft(e) {
  return I(e).position === "static";
}
function No(e, t) {
  if (!he(e) || I(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let o = e.offsetParent;
  return oe(e) === o && (o = o.ownerDocument.body), o;
}
function ks(e, t) {
  const o = O(e);
  if (At(e))
    return o;
  if (!he(e)) {
    let l = $e(e);
    for (; l && !Ke(l); ) {
      if (j(l) && !Ft(l))
        return l;
      l = $e(l);
    }
    return o;
  }
  let s = No(e, t);
  for (; s && or(s) && Ft(s); )
    s = No(s, t);
  return s && Ke(s) && Ft(s) && !Ct(s) ? o : s || rr(e) || o;
}
const br = async function(e) {
  const t = this.getOffsetParent || ks, o = this.getDimensions, s = await o(e.floating);
  return {
    reference: vr(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: s.width,
      height: s.height
    }
  };
};
function yr(e) {
  return I(e).direction === "rtl";
}
const ht = {
  convertOffsetParentRelativeRectToViewportRelativeRect: ar,
  getDocumentElement: oe,
  getClippingRect: gr,
  getOffsetParent: ks,
  getElementRects: br,
  getClientRects: cr,
  getDimensions: mr,
  getScale: Se,
  isElement: j,
  isRTL: yr
};
function As(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function wr(e, t, o) {
  let s = null, l;
  const r = oe(e);
  function i() {
    var d;
    clearTimeout(l), (d = s) == null || d.disconnect(), s = null;
  }
  function n(d, h) {
    d === void 0 && (d = !1), h === void 0 && (h = 1), i();
    const f = e.getBoundingClientRect(), {
      left: p,
      top: m,
      width: v,
      height: y
    } = f;
    if (d || t(), !v || !y)
      return;
    const b = nt(m), x = nt(r.clientWidth - (p + v)), $ = nt(r.clientHeight - (m + y)), k = nt(p), Q = {
      rootMargin: -b + "px " + -x + "px " + -$ + "px " + -k + "px",
      threshold: G(0, ne(1, h)) || 1
    };
    let P = !0;
    function H(F) {
      const S = F[0].intersectionRatio;
      if (!As(f, e.getBoundingClientRect()))
        return n();
      if (S !== h) {
        if (!P)
          return n();
        S ? n(!1, S) : l = setTimeout(() => {
          n(!1, 1e-7);
        }, 1e3);
      }
      P = !1;
    }
    try {
      s = new IntersectionObserver(H, {
        ...Q,
        // Handle <iframe>s
        root: r.ownerDocument
      });
    } catch {
      s = new IntersectionObserver(H, Q);
    }
    s.observe(e);
  }
  const a = O(e), c = () => n(o);
  return a.addEventListener("resize", c), n(!0), () => {
    a.removeEventListener("resize", c), i();
  };
}
function xr(e, t, o, s) {
  s === void 0 && (s = {});
  const {
    ancestorScroll: l = !0,
    ancestorResize: r = !0,
    elementResize: i = typeof ResizeObserver == "function",
    layoutShift: n = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = s, c = po(e), d = l || r ? [...c ? Xe(c) : [], ...t ? Xe(t) : []] : [];
  d.forEach((b) => {
    l && b.addEventListener("scroll", o), r && b.addEventListener("resize", o);
  });
  const h = c && n ? wr(c, o, r) : null;
  let f = -1, p = null;
  i && (p = new ResizeObserver((b) => {
    let [x] = b;
    x && x.target === c && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
      var $;
      ($ = p) == null || $.observe(t);
    })), o();
  }), c && !a && p.observe(c), t && p.observe(t));
  let m, v = a ? _e(e) : null;
  a && y();
  function y() {
    const b = _e(e);
    v && !As(v, b) && o(), v = b, m = requestAnimationFrame(y);
  }
  return o(), () => {
    var b;
    d.forEach((x) => {
      l && x.removeEventListener("scroll", o), r && x.removeEventListener("resize", o);
    }), h == null || h(), (b = p) == null || b.disconnect(), p = null, a && cancelAnimationFrame(m);
  };
}
const $r = Jl, _r = er, Lr = Xl, Vo = tr, kr = Kl, Ar = (e, t, o) => {
  const s = /* @__PURE__ */ new Map(), l = o ?? {}, r = {
    ...ht,
    ...l.platform,
    _c: s
  };
  return Zl(e, t, {
    ...l,
    platform: r
  });
};
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ye = ds(class extends us {
  constructor(e) {
    var t;
    if (super(e), e.type !== hs.ATTRIBUTE || e.name !== "class" || ((t = e.strings) == null ? void 0 : t.length) > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(e) {
    return " " + Object.keys(e).filter((t) => e[t]).join(" ") + " ";
  }
  update(e, [t]) {
    var s, l;
    if (this.st === void 0) {
      this.st = /* @__PURE__ */ new Set(), e.strings !== void 0 && (this.nt = new Set(e.strings.join(" ").split(/\s/).filter((r) => r !== "")));
      for (const r in t) t[r] && !((s = this.nt) != null && s.has(r)) && this.st.add(r);
      return this.render(t);
    }
    const o = e.element.classList;
    for (const r of this.st) r in t || (o.remove(r), this.st.delete(r));
    for (const r in t) {
      const i = !!t[r];
      i === this.st.has(r) || (l = this.nt) != null && l.has(r) || (i ? (o.add(r), this.st.add(r)) : (o.remove(r), this.st.delete(r)));
    }
    return ie;
  }
});
function Cr(e) {
  return Qr(e);
}
function Ut(e) {
  return e.assignedSlot ? e.assignedSlot : e.parentNode instanceof ShadowRoot ? e.parentNode.host : e.parentNode;
}
function Qr(e) {
  for (let t = e; t; t = Ut(t)) if (t instanceof Element && getComputedStyle(t).display === "none") return null;
  for (let t = Ut(e); t; t = Ut(t)) {
    if (!(t instanceof Element)) continue;
    const o = getComputedStyle(t);
    if (o.display !== "contents" && (o.position !== "static" || Ct(o) || t.tagName === "BODY"))
      return t;
  }
  return null;
}
function Er(e) {
  return e !== null && typeof e == "object" && "getBoundingClientRect" in e && ("contextElement" in e ? e.contextElement instanceof Element : !0);
}
var _ = class extends te {
  constructor() {
    super(...arguments), this.localize = new ao(this), this.active = !1, this.placement = "top", this.strategy = "absolute", this.distance = 0, this.skidding = 0, this.arrow = !1, this.arrowPlacement = "anchor", this.arrowPadding = 10, this.flip = !1, this.flipFallbackPlacements = "", this.flipFallbackStrategy = "best-fit", this.flipPadding = 0, this.shift = !1, this.shiftPadding = 0, this.autoSizePadding = 0, this.hoverBridge = !1, this.updateHoverBridge = () => {
      if (this.hoverBridge && this.anchorEl) {
        const e = this.anchorEl.getBoundingClientRect(), t = this.popup.getBoundingClientRect(), o = this.placement.includes("top") || this.placement.includes("bottom");
        let s = 0, l = 0, r = 0, i = 0, n = 0, a = 0, c = 0, d = 0;
        o ? e.top < t.top ? (s = e.left, l = e.bottom, r = e.right, i = e.bottom, n = t.left, a = t.top, c = t.right, d = t.top) : (s = t.left, l = t.bottom, r = t.right, i = t.bottom, n = e.left, a = e.top, c = e.right, d = e.top) : e.left < t.left ? (s = e.right, l = e.top, r = t.left, i = t.top, n = e.right, a = e.bottom, c = t.left, d = t.bottom) : (s = t.right, l = t.top, r = e.left, i = e.top, n = t.right, a = t.bottom, c = e.left, d = e.bottom), this.style.setProperty("--hover-bridge-top-left-x", `${s}px`), this.style.setProperty("--hover-bridge-top-left-y", `${l}px`), this.style.setProperty("--hover-bridge-top-right-x", `${r}px`), this.style.setProperty("--hover-bridge-top-right-y", `${i}px`), this.style.setProperty("--hover-bridge-bottom-left-x", `${n}px`), this.style.setProperty("--hover-bridge-bottom-left-y", `${a}px`), this.style.setProperty("--hover-bridge-bottom-right-x", `${c}px`), this.style.setProperty("--hover-bridge-bottom-right-y", `${d}px`);
      }
    };
  }
  async connectedCallback() {
    super.connectedCallback(), await this.updateComplete, this.start();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.stop();
  }
  async updated(e) {
    super.updated(e), e.has("active") && (this.active ? this.start() : this.stop()), e.has("anchor") && this.handleAnchorChange(), this.active && (await this.updateComplete, this.reposition());
  }
  async handleAnchorChange() {
    if (await this.stop(), this.anchor && typeof this.anchor == "string") {
      const e = this.getRootNode();
      this.anchorEl = e.getElementById(this.anchor);
    } else this.anchor instanceof Element || Er(this.anchor) ? this.anchorEl = this.anchor : this.anchorEl = this.querySelector('[slot="anchor"]');
    this.anchorEl instanceof HTMLSlotElement && (this.anchorEl = this.anchorEl.assignedElements({ flatten: !0 })[0]), this.anchorEl && this.active && this.start();
  }
  start() {
    !this.anchorEl || !this.active || (this.cleanup = xr(this.anchorEl, this.popup, () => {
      this.reposition();
    }));
  }
  async stop() {
    return new Promise((e) => {
      this.cleanup ? (this.cleanup(), this.cleanup = void 0, this.removeAttribute("data-current-placement"), this.style.removeProperty("--auto-size-available-width"), this.style.removeProperty("--auto-size-available-height"), requestAnimationFrame(() => e())) : e();
    });
  }
  /** Forces the popup to recalculate and reposition itself. */
  reposition() {
    if (!this.active || !this.anchorEl)
      return;
    const e = [
      // The offset middleware goes first
      $r({ mainAxis: this.distance, crossAxis: this.skidding })
    ];
    this.sync ? e.push(
      Vo({
        apply: ({ rects: o }) => {
          const s = this.sync === "width" || this.sync === "both", l = this.sync === "height" || this.sync === "both";
          this.popup.style.width = s ? `${o.reference.width}px` : "", this.popup.style.height = l ? `${o.reference.height}px` : "";
        }
      })
    ) : (this.popup.style.width = "", this.popup.style.height = ""), this.flip && e.push(
      Lr({
        boundary: this.flipBoundary,
        // @ts-expect-error - We're converting a string attribute to an array here
        fallbackPlacements: this.flipFallbackPlacements,
        fallbackStrategy: this.flipFallbackStrategy === "best-fit" ? "bestFit" : "initialPlacement",
        padding: this.flipPadding
      })
    ), this.shift && e.push(
      _r({
        boundary: this.shiftBoundary,
        padding: this.shiftPadding
      })
    ), this.autoSize ? e.push(
      Vo({
        boundary: this.autoSizeBoundary,
        padding: this.autoSizePadding,
        apply: ({ availableWidth: o, availableHeight: s }) => {
          this.autoSize === "vertical" || this.autoSize === "both" ? this.style.setProperty("--auto-size-available-height", `${s}px`) : this.style.removeProperty("--auto-size-available-height"), this.autoSize === "horizontal" || this.autoSize === "both" ? this.style.setProperty("--auto-size-available-width", `${o}px`) : this.style.removeProperty("--auto-size-available-width");
        }
      })
    ) : (this.style.removeProperty("--auto-size-available-width"), this.style.removeProperty("--auto-size-available-height")), this.arrow && e.push(
      kr({
        element: this.arrowEl,
        padding: this.arrowPadding
      })
    );
    const t = this.strategy === "absolute" ? (o) => ht.getOffsetParent(o, Cr) : ht.getOffsetParent;
    Ar(this.anchorEl, this.popup, {
      placement: this.placement,
      middleware: e,
      strategy: this.strategy,
      platform: es($t({}, ht), {
        getOffsetParent: t
      })
    }).then(({ x: o, y: s, middlewareData: l, placement: r }) => {
      const i = this.localize.dir() === "rtl", n = { top: "bottom", right: "left", bottom: "top", left: "right" }[r.split("-")[0]];
      if (this.setAttribute("data-current-placement", r), Object.assign(this.popup.style, {
        left: `${o}px`,
        top: `${s}px`
      }), this.arrow) {
        const a = l.arrow.x, c = l.arrow.y;
        let d = "", h = "", f = "", p = "";
        if (this.arrowPlacement === "start") {
          const m = typeof a == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          d = typeof c == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "", h = i ? m : "", p = i ? "" : m;
        } else if (this.arrowPlacement === "end") {
          const m = typeof a == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
          h = i ? "" : m, p = i ? m : "", f = typeof c == "number" ? `calc(${this.arrowPadding}px - var(--arrow-padding-offset))` : "";
        } else this.arrowPlacement === "center" ? (p = typeof a == "number" ? "calc(50% - var(--arrow-size-diagonal))" : "", d = typeof c == "number" ? "calc(50% - var(--arrow-size-diagonal))" : "") : (p = typeof a == "number" ? `${a}px` : "", d = typeof c == "number" ? `${c}px` : "");
        Object.assign(this.arrowEl.style, {
          top: d,
          right: h,
          bottom: f,
          left: p,
          [n]: "calc(var(--arrow-size-diagonal) * -1)"
        });
      }
    }), requestAnimationFrame(() => this.updateHoverBridge()), this.emit("sl-reposition");
  }
  render() {
    return L`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${Ye({
      "popup-hover-bridge": !0,
      "popup-hover-bridge--visible": this.hoverBridge && this.active
    })}
      ></span>

      <div
        part="popup"
        class=${Ye({
      popup: !0,
      "popup--active": this.active,
      "popup--fixed": this.strategy === "fixed",
      "popup--has-arrow": this.arrow
    })}
      >
        <slot></slot>
        ${this.arrow ? L`<div part="arrow" class="popup__arrow" role="presentation"></div>` : ""}
      </div>
    `;
  }
};
_.styles = [st, Ml];
g([
  W(".popup")
], _.prototype, "popup", 2);
g([
  W(".popup__arrow")
], _.prototype, "arrowEl", 2);
g([
  u()
], _.prototype, "anchor", 2);
g([
  u({ type: Boolean, reflect: !0 })
], _.prototype, "active", 2);
g([
  u({ reflect: !0 })
], _.prototype, "placement", 2);
g([
  u({ reflect: !0 })
], _.prototype, "strategy", 2);
g([
  u({ type: Number })
], _.prototype, "distance", 2);
g([
  u({ type: Number })
], _.prototype, "skidding", 2);
g([
  u({ type: Boolean })
], _.prototype, "arrow", 2);
g([
  u({ attribute: "arrow-placement" })
], _.prototype, "arrowPlacement", 2);
g([
  u({ attribute: "arrow-padding", type: Number })
], _.prototype, "arrowPadding", 2);
g([
  u({ type: Boolean })
], _.prototype, "flip", 2);
g([
  u({
    attribute: "flip-fallback-placements",
    converter: {
      fromAttribute: (e) => e.split(" ").map((t) => t.trim()).filter((t) => t !== ""),
      toAttribute: (e) => e.join(" ")
    }
  })
], _.prototype, "flipFallbackPlacements", 2);
g([
  u({ attribute: "flip-fallback-strategy" })
], _.prototype, "flipFallbackStrategy", 2);
g([
  u({ type: Object })
], _.prototype, "flipBoundary", 2);
g([
  u({ attribute: "flip-padding", type: Number })
], _.prototype, "flipPadding", 2);
g([
  u({ type: Boolean })
], _.prototype, "shift", 2);
g([
  u({ type: Object })
], _.prototype, "shiftBoundary", 2);
g([
  u({ attribute: "shift-padding", type: Number })
], _.prototype, "shiftPadding", 2);
g([
  u({ attribute: "auto-size" })
], _.prototype, "autoSize", 2);
g([
  u()
], _.prototype, "sync", 2);
g([
  u({ type: Object })
], _.prototype, "autoSizeBoundary", 2);
g([
  u({ attribute: "auto-size-padding", type: Number })
], _.prototype, "autoSizePadding", 2);
g([
  u({ attribute: "hover-bridge", type: Boolean })
], _.prototype, "hoverBridge", 2);
var Cs = /* @__PURE__ */ new Map(), Sr = /* @__PURE__ */ new WeakMap();
function zr(e) {
  return e ?? { keyframes: [], options: { duration: 0 } };
}
function Fo(e, t) {
  return t.toLowerCase() === "rtl" ? {
    keyframes: e.rtlKeyframes || e.keyframes,
    options: e.options
  } : e;
}
function ke(e, t) {
  Cs.set(e, zr(t));
}
function me(e, t, o) {
  const s = Sr.get(e);
  if (s != null && s[t])
    return Fo(s[t], o.dir);
  const l = Cs.get(t);
  return l ? Fo(l, o.dir) : {
    keyframes: [],
    options: { duration: 0 }
  };
}
function bt(e, t) {
  return new Promise((o) => {
    function s(l) {
      l.target === e && (e.removeEventListener(t, s), o());
    }
    e.addEventListener(t, s);
  });
}
function ve(e, t, o) {
  return new Promise((s) => {
    if ((o == null ? void 0 : o.duration) === 1 / 0)
      throw new Error("Promise-based animations must be finite.");
    const l = e.animate(t, es($t({}, o), {
      duration: Pr() ? 0 : o.duration
    }));
    l.addEventListener("cancel", s, { once: !0 }), l.addEventListener("finish", s, { once: !0 });
  });
}
function Uo(e) {
  return e = e.toString().toLowerCase(), e.indexOf("ms") > -1 ? parseFloat(e) : e.indexOf("s") > -1 ? parseFloat(e) * 1e3 : parseFloat(e);
}
function Pr() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function Ee(e) {
  return Promise.all(
    e.getAnimations().map((t) => new Promise((o) => {
      t.cancel(), requestAnimationFrame(o);
    }))
  );
}
var E = class extends te {
  constructor() {
    super(), this.localize = new ao(this), this.content = "", this.placement = "top", this.disabled = !1, this.distance = 8, this.open = !1, this.skidding = 0, this.trigger = "hover focus", this.hoist = !1, this.handleBlur = () => {
      this.hasTrigger("focus") && this.hide();
    }, this.handleClick = () => {
      this.hasTrigger("click") && (this.open ? this.hide() : this.show());
    }, this.handleFocus = () => {
      this.hasTrigger("focus") && this.show();
    }, this.handleDocumentKeyDown = (e) => {
      e.key === "Escape" && (e.stopPropagation(), this.hide());
    }, this.handleMouseOver = () => {
      if (this.hasTrigger("hover")) {
        const e = Uo(getComputedStyle(this).getPropertyValue("--show-delay"));
        clearTimeout(this.hoverTimeout), this.hoverTimeout = window.setTimeout(() => this.show(), e);
      }
    }, this.handleMouseOut = () => {
      if (this.hasTrigger("hover")) {
        const e = Uo(getComputedStyle(this).getPropertyValue("--hide-delay"));
        clearTimeout(this.hoverTimeout), this.hoverTimeout = window.setTimeout(() => this.hide(), e);
      }
    }, this.addEventListener("blur", this.handleBlur, !0), this.addEventListener("focus", this.handleFocus, !0), this.addEventListener("click", this.handleClick), this.addEventListener("mouseover", this.handleMouseOver), this.addEventListener("mouseout", this.handleMouseOut);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this.closeWatcher) == null || e.destroy(), document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }
  firstUpdated() {
    this.body.hidden = !this.open, this.open && (this.popup.active = !0, this.popup.reposition());
  }
  hasTrigger(e) {
    return this.trigger.split(" ").includes(e);
  }
  async handleOpenChange() {
    var e, t;
    if (this.open) {
      if (this.disabled)
        return;
      this.emit("sl-show"), "CloseWatcher" in window ? ((e = this.closeWatcher) == null || e.destroy(), this.closeWatcher = new CloseWatcher(), this.closeWatcher.onclose = () => {
        this.hide();
      }) : document.addEventListener("keydown", this.handleDocumentKeyDown), await Ee(this.body), this.body.hidden = !1, this.popup.active = !0;
      const { keyframes: o, options: s } = me(this, "tooltip.show", { dir: this.localize.dir() });
      await ve(this.popup.popup, o, s), this.popup.reposition(), this.emit("sl-after-show");
    } else {
      this.emit("sl-hide"), (t = this.closeWatcher) == null || t.destroy(), document.removeEventListener("keydown", this.handleDocumentKeyDown), await Ee(this.body);
      const { keyframes: o, options: s } = me(this, "tooltip.hide", { dir: this.localize.dir() });
      await ve(this.popup.popup, o, s), this.popup.active = !1, this.body.hidden = !0, this.emit("sl-after-hide");
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
      return this.open = !0, bt(this, "sl-after-show");
  }
  /** Hides the tooltip */
  async hide() {
    if (this.open)
      return this.open = !1, bt(this, "sl-after-hide");
  }
  //
  // NOTE: Tooltip is a bit unique in that we're using aria-live instead of aria-labelledby to trick screen readers into
  // announcing the content. It works really well, but it violates an accessibility rule. We're also adding the
  // aria-describedby attribute to a slot, which is required by <sl-popup> to correctly locate the first assigned
  // element, otherwise positioning is incorrect.
  //
  render() {
    return L`
      <sl-popup
        part="base"
        exportparts="
          popup:base__popup,
          arrow:base__arrow
        "
        class=${Ye({
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
E.styles = [st, Rl];
E.dependencies = { "sl-popup": _ };
g([
  W("slot:not([name])")
], E.prototype, "defaultSlot", 2);
g([
  W(".tooltip__body")
], E.prototype, "body", 2);
g([
  W("sl-popup")
], E.prototype, "popup", 2);
g([
  u()
], E.prototype, "content", 2);
g([
  u()
], E.prototype, "placement", 2);
g([
  u({ type: Boolean, reflect: !0 })
], E.prototype, "disabled", 2);
g([
  u({ type: Number })
], E.prototype, "distance", 2);
g([
  u({ type: Boolean, reflect: !0 })
], E.prototype, "open", 2);
g([
  u({ type: Number })
], E.prototype, "skidding", 2);
g([
  u()
], E.prototype, "trigger", 2);
g([
  u({ type: Boolean })
], E.prototype, "hoist", 2);
g([
  Re("open", { waitUntilFirstUpdate: !0 })
], E.prototype, "handleOpenChange", 1);
g([
  Re(["content", "distance", "hoist", "placement", "skidding"])
], E.prototype, "handleOptionsChange", 1);
g([
  Re("disabled")
], E.prototype, "handleDisabledChange", 1);
ke("tooltip.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 150, easing: "ease" }
});
ke("tooltip.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 150, easing: "ease" }
});
E.define("sl-tooltip");
function He(e, t) {
  e.slot || (e.slot = t);
}
var Or = Object.defineProperty, Rr = Object.getOwnPropertyDescriptor, fo = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Rr(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && Or(t, o, l), l;
};
let Ge = class extends C {
  constructor() {
    super(...arguments), this.ui = "", this.help = "", this.resize = new ResizeObserver(() => this.fit());
  }
  connectedCallback() {
    super.connectedCallback(), He(this, "band"), this.resize.observe(this);
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
    const e = this.renderRoot.querySelector("nav"), t = () => e.scrollWidth <= e.clientWidth, o = [".ui, .rule", ".help", 'slot[name="gear"]'].map((s) => [
      ...this.renderRoot.querySelectorAll(s)
    ]);
    for (const s of o) for (const l of s) l.hidden = !1;
    e.classList.remove("cut");
    for (const s of o) {
      if (t()) return;
      for (const l of s) l.hidden = !0;
    }
    t() || e.classList.add("cut");
  }
  render() {
    const e = this.help || (this.ui ? `https://github.com/rails49/${this.ui}` : "https://github.com/rails49");
    return L`
      <nav @slotchange=${() => this.requestUpdate()}>
        <div class="lead">
          <sl-tooltip content="rails49.org" placement="bottom" hoist>
            <a class="mark" href="https://rails49.org" target="_blank" rel="noopener" aria-label="rails49.org">
              <span class="wide" aria-hidden="true">${Ro(ll)}</span>
              <span class="square" aria-hidden="true">${Ro(rl)}</span>
            </a>
          </sl-tooltip>
          ${this.ui ? L`<span class="ui">${this.ui}</span>` : w}
        </div>
        ${this.ui && this.querySelector(':scope > [slot="about"]') ? L`<span class="rule" aria-hidden="true"></span>` : w}
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
Ge.styles = [
  M,
  A`
      :host {
        display: block;
        height: 60px;
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

      @media (max-width: ${ce(cs)}px) {
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
fo([
  u()
], Ge.prototype, "ui", 2);
fo([
  u()
], Ge.prototype, "help", 2);
Ge = fo([
  R("look-band")
], Ge);
function go(e, t, o) {
  e.dispatchEvent(new CustomEvent(t, { detail: o, bubbles: !0, composed: !0 }));
}
const St = (e, t) => go(e, "look-press", { shiftKey: t.shiftKey ?? !1 });
var Mr = Object.defineProperty, Tr = Object.getOwnPropertyDescriptor, zt = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Tr(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && Mr(t, o, l), l;
};
let Pe = class extends C {
  constructor() {
    super(...arguments), this.name = "", this.detail = "", this.pressable = !1;
  }
  connectedCallback() {
    super.connectedCallback(), He(this, "about");
  }
  render() {
    const e = L`<span class="text"
      >${this.name}${this.detail ? L`<small>${this.detail}</small>` : w}</span
    >`;
    return this.pressable ? L`<button class="about" @click=${(t) => St(this, t)}>
      ${e}<sl-icon name="chevron-down"></sl-icon>
    </button>` : L`<div class="about">${e}</div>`;
  }
};
Pe.styles = [
  M,
  A`
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
zt([
  u()
], Pe.prototype, "name", 2);
zt([
  u()
], Pe.prototype, "detail", 2);
zt([
  u({ type: Boolean, reflect: !0 })
], Pe.prototype, "pressable", 2);
Pe = zt([
  R("look-about")
], Pe);
var Dr = Object.getOwnPropertyDescriptor, Hr = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Dr(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = i(l) || l);
  return l;
};
let Yt = class extends C {
  render() {
    return L`<slot></slot>`;
  }
};
Yt.styles = [
  M,
  A`
      :host {
        display: inline-block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        white-space: nowrap;
        font-size: 0.95rem;
      }
    `
];
Yt = Hr([
  R("look-reading")
], Yt);
var Br = Object.getOwnPropertyDescriptor, Nr = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Br(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = i(l) || l);
  return l;
};
let Gt = class extends C {
  render() {
    return L`<slot></slot>`;
  }
};
Gt.styles = [
  M,
  A`
      :host {
        display: inline-block;
        min-width: 0;
        max-width: 20rem;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: middle;
        white-space: nowrap;
        background: var(--stop);
        color: var(--band-ink);
        padding: 0.1rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
      }
    `
];
Gt = Nr([
  R("look-chip")
], Gt);
var Vr = Object.defineProperty, Fr = Object.getOwnPropertyDescriptor, Qs = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Fr(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && Vr(t, o, l), l;
};
let yt = class extends C {
  constructor() {
    super(...arguments), this.state = "down";
  }
  render() {
    return L`<span class="dot" role="img" aria-label=${this.state}></span><span class="text"><slot></slot></span>`;
  }
};
yt.styles = [
  M,
  A`
      :host {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-width: 0.8rem;
        white-space: nowrap;
        font-size: 0.85rem;
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
Qs([
  u({ reflect: !0 })
], yt.prototype, "state", 2);
yt = Qs([
  R("look-dot")
], yt);
const Ur = () => {
  var e;
  return /Mac|iPhone|iPad/.test(((e = globalThis.navigator) == null ? void 0 : e.platform) ?? "");
}, jr = { Mod: "⌘", Shift: "⇧", Alt: "⌥", Ctrl: "⌃" };
function Ir(e, t = Ur()) {
  const o = e.endsWith("+") ? "+" : e.slice(e.lastIndexOf("+") + 1), s = [...e.slice(0, e.length - o.length).split("+").filter(Boolean), o];
  if (t) return s.map((n) => jr[n] ?? n).join("");
  const l = ["Mod", "Ctrl", "Alt", "Shift"], r = s.filter((n) => l.includes(n)).sort((n, a) => l.indexOf(n) - l.indexOf(a)), i = s.filter((n) => !l.includes(n));
  return [...new Set(r.map((n) => n === "Mod" ? "Ctrl" : n)), ...i].join("+");
}
const Wr = (e, t) => t ? `${e}  ${Ir(t)}` : e;
function Je(e) {
  const t = e.disabled ? e.reason : "";
  return L`<sl-tooltip content=${t || Wr(e.label, e.key ?? "")} placement=${e.placement} hoist>
    <button
      class="${e.word ? "word" : "icon"} ${e.part ?? ""}"
      aria-label=${e.word ? w : e.label}
      aria-disabled=${e.disabled ? "true" : w}
      aria-description=${t || w}
      aria-pressed=${e.pressed ? "true" : w}
      @click=${(o) => {
    e.disabled || e.onPress(o);
  }}
    >
      ${e.word || L`<sl-icon name=${e.icon} library=${ss(e.icon)}></sl-icon>`}
    </button>
  </sl-tooltip>`;
}
const Pt = A`
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
var qr = Object.defineProperty, Zr = Object.getOwnPropertyDescriptor, lt = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Zr(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && qr(t, o, l), l;
};
let ae = class extends C {
  constructor() {
    super(...arguments), this.icon = "", this.word = "", this.label = "", this.disabled = !1;
  }
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  render() {
    return Je({
      icon: this.icon,
      word: this.word,
      label: this.label,
      disabled: this.disabled,
      placement: "bottom",
      onPress: (e) => St(this, e)
    });
  }
};
ae.shadowRootOptions = { ...C.shadowRootOptions, delegatesFocus: !0 };
ae.styles = [
  M,
  Pt,
  A`
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
lt([
  u()
], ae.prototype, "icon", 2);
lt([
  u()
], ae.prototype, "word", 2);
lt([
  u()
], ae.prototype, "label", 2);
lt([
  u({ type: Boolean, reflect: !0 })
], ae.prototype, "disabled", 2);
ae = lt([
  R("look-band-press")
], ae);
var Kr = Object.getOwnPropertyDescriptor, Xr = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Kr(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = i(l) || l);
  return l;
};
let wt = class extends C {
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  connectedCallback() {
    super.connectedCallback(), He(this, "gear");
  }
  render() {
    return Je({
      icon: "gear",
      label: "Settings",
      placement: "bottom",
      onPress: (e) => St(this, e)
    });
  }
};
wt.shadowRootOptions = { ...C.shadowRootOptions, delegatesFocus: !0 };
wt.styles = [
  M,
  Pt,
  A`
      .icon {
        font-size: 1.5rem;
      }
    `
];
wt = Xr([
  R("look-gear")
], wt);
var Yr = Object.defineProperty, Gr = Object.getOwnPropertyDescriptor, Ot = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? Gr(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && Yr(t, o, l), l;
};
const Jr = {
  on: "Track power is on; turn it off",
  off: "Track power is off; turn it on",
  stopped: "Stopped; turn track power on",
  draining: "Draining: power goes off when every train is at rest; keep it on"
};
let Oe = class extends C {
  constructor() {
    super(...arguments), this.state = "off", this.reason = "", this.toggleReason = "";
  }
  connectedCallback() {
    super.connectedCallback(), He(this, "power");
  }
  ask(e) {
    go(this, "look-power", { state: e });
  }
  render() {
    const e = this.reason || this.toggleReason;
    return L`
      ${Je({
      icon: "power",
      label: Jr[this.state],
      disabled: !!e,
      reason: e,
      placement: "bottom",
      part: "power",
      onPress: () => this.ask(this.state === "on" ? "off" : "on")
    })}
      ${Je({
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
Oe.styles = [
  M,
  Pt,
  A`
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
Ot([
  u({ reflect: !0 })
], Oe.prototype, "state", 2);
Ot([
  u()
], Oe.prototype, "reason", 2);
Ot([
  u({ attribute: "toggle-reason" })
], Oe.prototype, "toggleReason", 2);
Oe = Ot([
  R("look-power")
], Oe);
var ei = Object.defineProperty, ti = Object.getOwnPropertyDescriptor, Es = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? ti(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && ei(t, o, l), l;
};
let xt = class extends C {
  constructor() {
    super(...arguments), this.hasViews = !1;
  }
  connectedCallback() {
    super.connectedCallback(), He(this, "rail");
  }
  onViews(e) {
    this.hasViews = e.target.assignedElements().length > 0;
  }
  render() {
    return L`
      <div class="views" role="group" aria-label="View" ?hidden=${!this.hasViews}>
        <slot name="views" @slotchange=${this.onViews}></slot>
      </div>
      <slot></slot>
    `;
  }
};
xt.styles = [
  M,
  A`
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

      @media ${ce(ot)} {
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
Es([
  ro()
], xt.prototype, "hasViews", 2);
xt = Es([
  R("look-rail")
], xt);
var oi = Object.defineProperty, si = Object.getOwnPropertyDescriptor, Ae = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? si(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && oi(t, o, l), l;
};
let ee = class extends C {
  constructor() {
    super(...arguments), this.name = "", this.icon = "", this.label = "", this.current = !1, this.disabled = !1, this.reason = "";
  }
  connectedCallback() {
    super.connectedCallback(), He(this, "views");
  }
  choose() {
    !this.current && !this.disabled && go(this, "look-view", { name: this.name });
  }
  render() {
    const e = this.disabled ? this.reason : "";
    return L`<sl-tooltip content=${e} ?disabled=${!e} placement="right" hoist>
      <button
        aria-current=${this.current ? "page" : w}
        aria-disabled=${this.disabled ? "true" : w}
        aria-description=${e || w}
        @click=${this.choose}
      >
        <sl-icon name=${this.icon} library=${ss(this.icon)}></sl-icon>${this.label}
      </button>
    </sl-tooltip>`;
  }
};
ee.styles = [
  M,
  A`
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

      @media ${ce(ot)} {
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
Ae([
  u()
], ee.prototype, "name", 2);
Ae([
  u()
], ee.prototype, "icon", 2);
Ae([
  u()
], ee.prototype, "label", 2);
Ae([
  u({ type: Boolean, reflect: !0 })
], ee.prototype, "current", 2);
Ae([
  u({ type: Boolean, reflect: !0 })
], ee.prototype, "disabled", 2);
Ae([
  u()
], ee.prototype, "reason", 2);
ee = Ae([
  R("look-view")
], ee);
var li = Object.defineProperty, ri = Object.getOwnPropertyDescriptor, mo = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? ri(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && li(t, o, l), l;
};
let et = class extends C {
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
    return L`<slot></slot>`;
  }
};
et.styles = [
  M,
  A`
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

      @media ${ce(ot)} {
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
mo([
  u()
], et.prototype, "label", 2);
mo([
  u({ type: Boolean, reflect: !0 })
], et.prototype, "end", 2);
et = mo([
  R("look-group")
], et);
var ii = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, de = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? ni(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && ii(t, o, l), l;
};
let V = class extends C {
  constructor() {
    super(...arguments), this.icon = "", this.word = "", this.label = "", this.key = "", this.pressed = !1, this.disabled = !1, this.reason = "";
  }
  /** Presses the button, as a person would. */
  click() {
    this.renderRoot.querySelector("button").click();
  }
  render() {
    return Je({
      icon: this.icon,
      word: this.word,
      label: this.label,
      key: this.key,
      disabled: this.disabled,
      reason: this.reason,
      pressed: this.pressed,
      placement: "right",
      onPress: (e) => St(this, e)
    });
  }
};
V.shadowRootOptions = { ...C.shadowRootOptions, delegatesFocus: !0 };
V.styles = [
  M,
  Pt,
  A`
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

      @media ${ce(ot)} {
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
de([
  u()
], V.prototype, "icon", 2);
de([
  u()
], V.prototype, "word", 2);
de([
  u()
], V.prototype, "label", 2);
de([
  u()
], V.prototype, "key", 2);
de([
  u({ type: Boolean, reflect: !0 })
], V.prototype, "pressed", 2);
de([
  u({ type: Boolean, reflect: !0 })
], V.prototype, "disabled", 2);
de([
  u()
], V.prototype, "reason", 2);
V = de([
  R("look-command")
], V);
function* vo(e = document.activeElement) {
  e != null && (yield e, "shadowRoot" in e && e.shadowRoot && e.shadowRoot.mode !== "closed" && (yield* Ys(vo(e.shadowRoot.activeElement))));
}
function ai() {
  return [...vo()].pop();
}
var jo = /* @__PURE__ */ new WeakMap();
function Ss(e) {
  let t = jo.get(e);
  return t || (t = window.getComputedStyle(e, null), jo.set(e, t)), t;
}
function ci(e) {
  if (typeof e.checkVisibility == "function")
    return e.checkVisibility({ checkOpacity: !1, checkVisibilityCSS: !0 });
  const t = Ss(e);
  return t.visibility !== "hidden" && t.display !== "none";
}
function hi(e) {
  const t = Ss(e), { overflowY: o, overflowX: s } = t;
  return o === "scroll" || s === "scroll" ? !0 : o !== "auto" || s !== "auto" ? !1 : e.scrollHeight > e.clientHeight && o === "auto" || e.scrollWidth > e.clientWidth && s === "auto";
}
function di(e) {
  const t = e.tagName.toLowerCase(), o = Number(e.getAttribute("tabindex"));
  if (e.hasAttribute("tabindex") && (isNaN(o) || o <= -1) || e.hasAttribute("disabled") || e.closest("[inert]"))
    return !1;
  if (t === "input" && e.getAttribute("type") === "radio") {
    const r = e.getRootNode(), i = `input[type='radio'][name="${e.getAttribute("name")}"]`, n = r.querySelector(`${i}:checked`);
    return n ? n === e : r.querySelector(i) === e;
  }
  return ci(e) ? (t === "audio" || t === "video") && e.hasAttribute("controls") || e.hasAttribute("tabindex") || e.hasAttribute("contenteditable") && e.getAttribute("contenteditable") !== "false" || [
    "button",
    "input",
    "select",
    "textarea",
    "a",
    "audio",
    "video",
    "summary",
    "iframe"
  ].includes(t) ? !0 : hi(e) : !1;
}
function ui(e, t) {
  var o;
  return ((o = e.getRootNode({ composed: !0 })) == null ? void 0 : o.host) !== t;
}
function Io(e) {
  const t = /* @__PURE__ */ new WeakMap(), o = [];
  function s(l) {
    if (l instanceof Element) {
      if (l.hasAttribute("inert") || l.closest("[inert]") || t.has(l))
        return;
      t.set(l, !0), !o.includes(l) && di(l) && o.push(l), l instanceof HTMLSlotElement && ui(l, e) && l.assignedElements({ flatten: !0 }).forEach((r) => {
        s(r);
      }), l.shadowRoot !== null && l.shadowRoot.mode === "open" && s(l.shadowRoot);
    }
    for (const r of l.children)
      s(r);
  }
  return s(e), o.sort((l, r) => {
    const i = Number(l.getAttribute("tabindex")) || 0;
    return (Number(r.getAttribute("tabindex")) || 0) - i;
  });
}
var Ue = [], pi = class {
  constructor(e) {
    this.tabDirection = "forward", this.handleFocusIn = () => {
      this.isActive() && this.checkFocus();
    }, this.handleKeyDown = (t) => {
      var o;
      if (t.key !== "Tab" || this.isExternalActivated || !this.isActive()) return;
      const s = ai();
      if (this.previousFocus = s, this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus))
        return;
      t.shiftKey ? this.tabDirection = "backward" : this.tabDirection = "forward";
      const l = Io(this.element);
      let r = l.findIndex((n) => n === s);
      this.previousFocus = this.currentFocus;
      const i = this.tabDirection === "forward" ? 1 : -1;
      for (; ; ) {
        r + i >= l.length ? r = 0 : r + i < 0 ? r = l.length - 1 : r += i, this.previousFocus = this.currentFocus;
        const n = (
          /** @type {HTMLElement} */
          l[r]
        );
        if (this.tabDirection === "backward" && this.previousFocus && this.possiblyHasTabbableChildren(this.previousFocus) || n && this.possiblyHasTabbableChildren(n))
          return;
        t.preventDefault(), this.currentFocus = n, (o = this.currentFocus) == null || o.focus({ preventScroll: !1 });
        const a = [...vo()];
        if (a.includes(this.currentFocus) || !a.includes(this.previousFocus))
          break;
      }
      setTimeout(() => this.checkFocus());
    }, this.handleKeyUp = () => {
      this.tabDirection = "forward";
    }, this.element = e, this.elementsWithTabbableControls = ["iframe"];
  }
  /** Activates focus trapping. */
  activate() {
    Ue.push(this.element), document.addEventListener("focusin", this.handleFocusIn), document.addEventListener("keydown", this.handleKeyDown), document.addEventListener("keyup", this.handleKeyUp);
  }
  /** Deactivates focus trapping. */
  deactivate() {
    Ue = Ue.filter((e) => e !== this.element), this.currentFocus = null, document.removeEventListener("focusin", this.handleFocusIn), document.removeEventListener("keydown", this.handleKeyDown), document.removeEventListener("keyup", this.handleKeyUp);
  }
  /** Determines if this modal element is currently active or not. */
  isActive() {
    return Ue[Ue.length - 1] === this.element;
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
      const e = Io(this.element);
      if (!this.element.matches(":focus-within")) {
        const t = e[0], o = e[e.length - 1], s = this.tabDirection === "forward" ? t : o;
        typeof (s == null ? void 0 : s.focus) == "function" && (this.currentFocus = s, s.focus({ preventScroll: !1 }));
      }
    }
  }
  possiblyHasTabbableChildren(e) {
    return this.elementsWithTabbableControls.includes(e.tagName.toLowerCase()) || e.hasAttribute("controls");
  }
}, Jt = /* @__PURE__ */ new Set();
function fi() {
  const e = document.documentElement.clientWidth;
  return Math.abs(window.innerWidth - e);
}
function gi() {
  const e = Number(getComputedStyle(document.body).paddingRight.replace(/px/, ""));
  return isNaN(e) || !e ? 0 : e;
}
function Wo(e) {
  if (Jt.add(e), !document.documentElement.classList.contains("sl-scroll-lock")) {
    const t = fi() + gi();
    let o = getComputedStyle(document.documentElement).scrollbarGutter;
    (!o || o === "auto") && (o = "stable"), t < 2 && (o = ""), document.documentElement.style.setProperty("--sl-scroll-lock-gutter", o), document.documentElement.classList.add("sl-scroll-lock"), document.documentElement.style.setProperty("--sl-scroll-lock-size", `${t}px`);
  }
}
function qo(e) {
  Jt.delete(e), Jt.size === 0 && (document.documentElement.classList.remove("sl-scroll-lock"), document.documentElement.style.removeProperty("--sl-scroll-lock-size"));
}
var mi = A`
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
`, vi = (e) => {
  var t;
  const { activeElement: o } = document;
  o && e.contains(o) && ((t = document.activeElement) == null || t.blur());
}, bi = A`
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
const zs = Symbol.for(""), yi = (e) => {
  if ((e == null ? void 0 : e.r) === zs) return e == null ? void 0 : e._$litStatic$;
}, Zo = (e, ...t) => ({ _$litStatic$: t.reduce((o, s, l) => o + ((r) => {
  if (r._$litStatic$ !== void 0) return r._$litStatic$;
  throw Error(`Value passed to 'literal' function must be a 'literal' result: ${r}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`);
})(s) + e[l + 1], e[0]), r: zs }), Ko = /* @__PURE__ */ new Map(), wi = (e) => (t, ...o) => {
  const s = o.length;
  let l, r;
  const i = [], n = [];
  let a, c = 0, d = !1;
  for (; c < s; ) {
    for (a = t[c]; c < s && (r = o[c], (l = yi(r)) !== void 0); ) a += l + t[++c], d = !0;
    c !== s && n.push(r), i.push(a), c++;
  }
  if (c === s && i.push(t[s]), d) {
    const h = i.join("$$lit$$");
    (t = Ko.get(h)) === void 0 && (i.raw = i, Ko.set(h, t = i)), o = n;
  }
  return e(t, ...o);
}, xi = wi(L);
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const D = (e) => e ?? w;
var T = class extends te {
  constructor() {
    super(...arguments), this.hasFocus = !1, this.label = "", this.disabled = !1;
  }
  handleBlur() {
    this.hasFocus = !1, this.emit("sl-blur");
  }
  handleFocus() {
    this.hasFocus = !0, this.emit("sl-focus");
  }
  handleClick(e) {
    this.disabled && (e.preventDefault(), e.stopPropagation());
  }
  /** Simulates a click on the icon button. */
  click() {
    this.button.click();
  }
  /** Sets focus on the icon button. */
  focus(e) {
    this.button.focus(e);
  }
  /** Removes focus from the icon button. */
  blur() {
    this.button.blur();
  }
  render() {
    const e = !!this.href, t = e ? Zo`a` : Zo`button`;
    return xi`
      <${t}
        part="base"
        class=${Ye({
      "icon-button": !0,
      "icon-button--disabled": !e && this.disabled,
      "icon-button--focused": this.hasFocus
    })}
        ?disabled=${D(e ? void 0 : this.disabled)}
        type=${D(e ? void 0 : "button")}
        href=${D(e ? this.href : void 0)}
        target=${D(e ? this.target : void 0)}
        download=${D(e ? this.download : void 0)}
        rel=${D(e && this.target ? "noreferrer noopener" : void 0)}
        role=${D(e ? void 0 : "button")}
        aria-disabled=${this.disabled ? "true" : "false"}
        aria-label="${this.label}"
        tabindex=${this.disabled ? "-1" : "0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${D(this.name)}
          library=${D(this.library)}
          src=${D(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${t}>
    `;
  }
};
T.styles = [st, bi];
T.dependencies = { "sl-icon": q };
g([
  W(".icon-button")
], T.prototype, "button", 2);
g([
  ro()
], T.prototype, "hasFocus", 2);
g([
  u()
], T.prototype, "name", 2);
g([
  u()
], T.prototype, "library", 2);
g([
  u()
], T.prototype, "src", 2);
g([
  u()
], T.prototype, "href", 2);
g([
  u()
], T.prototype, "target", 2);
g([
  u()
], T.prototype, "download", 2);
g([
  u()
], T.prototype, "label", 2);
g([
  u({ type: Boolean, reflect: !0 })
], T.prototype, "disabled", 2);
var $i = class {
  constructor(e, ...t) {
    this.slotNames = [], this.handleSlotChange = (o) => {
      const s = o.target;
      (this.slotNames.includes("[default]") && !s.name || s.name && this.slotNames.includes(s.name)) && this.host.requestUpdate();
    }, (this.host = e).addController(this), this.slotNames = t;
  }
  hasDefaultSlot() {
    return [...this.host.childNodes].some((e) => {
      if (e.nodeType === e.TEXT_NODE && e.textContent.trim() !== "")
        return !0;
      if (e.nodeType === e.ELEMENT_NODE) {
        const t = e;
        if (t.tagName.toLowerCase() === "sl-visually-hidden")
          return !1;
        if (!t.hasAttribute("slot"))
          return !0;
      }
      return !1;
    });
  }
  hasNamedSlot(e) {
    return this.host.querySelector(`:scope > [slot="${e}"]`) !== null;
  }
  test(e) {
    return e === "[default]" ? this.hasDefaultSlot() : this.hasNamedSlot(e);
  }
  hostConnected() {
    this.host.shadowRoot.addEventListener("slotchange", this.handleSlotChange);
  }
  hostDisconnected() {
    this.host.shadowRoot.removeEventListener("slotchange", this.handleSlotChange);
  }
}, Z = class extends te {
  constructor() {
    super(...arguments), this.hasSlotController = new $i(this, "footer"), this.localize = new ao(this), this.modal = new pi(this), this.open = !1, this.label = "", this.noHeader = !1, this.handleDocumentKeyDown = (e) => {
      e.key === "Escape" && this.modal.isActive() && this.open && (e.stopPropagation(), this.requestClose("keyboard"));
    };
  }
  firstUpdated() {
    this.dialog.hidden = !this.open, this.open && (this.addOpenListeners(), this.modal.activate(), Wo(this));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.modal.deactivate(), qo(this), this.removeOpenListeners();
  }
  requestClose(e) {
    if (this.emit("sl-request-close", {
      cancelable: !0,
      detail: { source: e }
    }).defaultPrevented) {
      const o = me(this, "dialog.denyClose", { dir: this.localize.dir() });
      ve(this.panel, o.keyframes, o.options);
      return;
    }
    this.hide();
  }
  addOpenListeners() {
    var e;
    "CloseWatcher" in window ? ((e = this.closeWatcher) == null || e.destroy(), this.closeWatcher = new CloseWatcher(), this.closeWatcher.onclose = () => this.requestClose("keyboard")) : document.addEventListener("keydown", this.handleDocumentKeyDown);
  }
  removeOpenListeners() {
    var e;
    (e = this.closeWatcher) == null || e.destroy(), document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }
  async handleOpenChange() {
    if (this.open) {
      this.emit("sl-show"), this.addOpenListeners(), this.originalTrigger = document.activeElement, this.modal.activate(), Wo(this);
      const e = this.querySelector("[autofocus]");
      e && e.removeAttribute("autofocus"), await Promise.all([Ee(this.dialog), Ee(this.overlay)]), this.dialog.hidden = !1, requestAnimationFrame(() => {
        this.emit("sl-initial-focus", { cancelable: !0 }).defaultPrevented || (e ? e.focus({ preventScroll: !0 }) : this.panel.focus({ preventScroll: !0 })), e && e.setAttribute("autofocus", "");
      });
      const t = me(this, "dialog.show", { dir: this.localize.dir() }), o = me(this, "dialog.overlay.show", { dir: this.localize.dir() });
      await Promise.all([
        ve(this.panel, t.keyframes, t.options),
        ve(this.overlay, o.keyframes, o.options)
      ]), this.emit("sl-after-show");
    } else {
      vi(this), this.emit("sl-hide"), this.removeOpenListeners(), this.modal.deactivate(), await Promise.all([Ee(this.dialog), Ee(this.overlay)]);
      const e = me(this, "dialog.hide", { dir: this.localize.dir() }), t = me(this, "dialog.overlay.hide", { dir: this.localize.dir() });
      await Promise.all([
        ve(this.overlay, t.keyframes, t.options).then(() => {
          this.overlay.hidden = !0;
        }),
        ve(this.panel, e.keyframes, e.options).then(() => {
          this.panel.hidden = !0;
        })
      ]), this.dialog.hidden = !0, this.overlay.hidden = !1, this.panel.hidden = !1, qo(this);
      const o = this.originalTrigger;
      typeof (o == null ? void 0 : o.focus) == "function" && setTimeout(() => o.focus()), this.emit("sl-after-hide");
    }
  }
  /** Shows the dialog. */
  async show() {
    if (!this.open)
      return this.open = !0, bt(this, "sl-after-show");
  }
  /** Hides the dialog */
  async hide() {
    if (this.open)
      return this.open = !1, bt(this, "sl-after-hide");
  }
  render() {
    return L`
      <div
        part="base"
        class=${Ye({
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
          aria-label=${D(this.noHeader ? this.label : void 0)}
          aria-labelledby=${D(this.noHeader ? void 0 : "title")}
          tabindex="-1"
        >
          ${this.noHeader ? "" : L`
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
Z.styles = [st, mi];
Z.dependencies = {
  "sl-icon-button": T
};
g([
  W(".dialog")
], Z.prototype, "dialog", 2);
g([
  W(".dialog__panel")
], Z.prototype, "panel", 2);
g([
  W(".dialog__overlay")
], Z.prototype, "overlay", 2);
g([
  u({ type: Boolean, reflect: !0 })
], Z.prototype, "open", 2);
g([
  u({ reflect: !0 })
], Z.prototype, "label", 2);
g([
  u({ attribute: "no-header", type: Boolean, reflect: !0 })
], Z.prototype, "noHeader", 2);
g([
  Re("open", { waitUntilFirstUpdate: !0 })
], Z.prototype, "handleOpenChange", 1);
ke("dialog.show", {
  keyframes: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 250, easing: "ease" }
});
ke("dialog.hide", {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.8 }
  ],
  options: { duration: 250, easing: "ease" }
});
ke("dialog.denyClose", {
  keyframes: [{ scale: 1 }, { scale: 1.02 }, { scale: 1 }],
  options: { duration: 250 }
});
ke("dialog.overlay.show", {
  keyframes: [{ opacity: 0 }, { opacity: 1 }],
  options: { duration: 250 }
});
ke("dialog.overlay.hide", {
  keyframes: [{ opacity: 1 }, { opacity: 0 }],
  options: { duration: 250 }
});
Z.define("sl-dialog");
const _i = A`
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
var Li = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, rt = (e, t, o, s) => {
  for (var l = s > 1 ? void 0 : s ? ki(t, o) : t, r = e.length - 1, i; r >= 0; r--)
    (i = e[r]) && (l = (s ? i(t, o, l) : i(l)) || l);
  return s && l && Li(t, o, l), l;
};
let Le = class extends C {
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
  follow(e) {
    e.target === e.currentTarget && (this.open = e.type === "sl-show");
  }
  render() {
    return L`<sl-dialog label=${this.label} ?open=${this.open} @sl-show=${this.follow} @sl-hide=${this.follow}>
      <slot></slot>
      <div slot="footer" class="footer"><slot name="footer"></slot></div>
    </sl-dialog>`;
  }
};
Le.styles = [
  M,
  _i,
  A`
      sl-dialog {
        --width: 560px;
      }

      :host([size='small']) sl-dialog {
        --width: 420px;
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--sl-spacing-x-small);
      }
    `
];
rt([
  u()
], Le.prototype, "label", 2);
rt([
  u({ reflect: !0 })
], Le.prototype, "size", 2);
rt([
  u({ type: Boolean, reflect: !0 })
], Le.prototype, "open", 2);
rt([
  W("sl-dialog")
], Le.prototype, "dialog", 2);
Le = rt([
  R("look-dialog")
], Le);
const Xo = {
  "chevron-down": Gs,
  gear: Js,
  power: el,
  "question-circle": tl,
  "sign-stop-fill": ol
};
Go("default", {
  resolver: (e) => e in Xo ? os(Xo[e]) : ""
});
const Ps = new CSSStyleSheet();
Ps.replaceSync(sl);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, Ps];
export {
  Pe as LookAbout,
  Ge as LookBand,
  ae as LookBandPress,
  Gt as LookChip,
  V as LookCommand,
  Le as LookDialog,
  yt as LookDot,
  wt as LookGear,
  et as LookGroup,
  Oe as LookPower,
  xt as LookRail,
  Yt as LookReading,
  Wt as LookShell,
  ee as LookView,
  cs as NARROW_WIDTH_PX,
  Cl as TOKENS,
  Ql as TURN_HEIGHT_PX,
  _i as lookTheme
};
