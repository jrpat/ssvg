function SSVG(attrs = {}) {
  if (attrs instanceof SVGElement)
    this.$node = attrs;
  else
    this.$node = SSVG.create('svg', attrs);
  return new Proxy(this, SSVG.proxyHandler)
}

SSVG.create = (name, attrs) => {
  let e = document.createElementNS('http://www.w3.org/2000/svg', name)
  for (let [k,v] of Object.entries(attrs)) e.setAttribute(k,v);
  return e
}

SSVG.set = (o, key, val) => {
  let desc = Object.getOwnPropertyDescriptor(o, key)
  if (desc && desc.writable)
    o[key] = val;
  else
    o.$node.setAttribute(key, val);
}

SSVG.proxyHandler = {
  get(o, key) {
    if (key == '$node') { return o.$node }

    if ((o instanceof SVGElement) || (o instanceof SVGGElement)) {
      let [_, isCreate, elemName] = key.match(/(create)?(\w+)/)
      elemName = elemName[0].toUpperCase() + elemName.slice(1)
      if (window.hasOwnProperty('SVG'+elemName+'Element')) {
        return function(attrs = {}) {
          let node = SSVG.create(elemName.toLowerCase(), attrs)
          if (! isCreate) { o.append(node) }
          return new Proxy(node, SSVG.proxyHandler)
        }
      }
      if (Object.hasOwnProperty(o, key)) {
        return o[key]
      } else {
        return function(newValue) {
          SSVG.set(o, key, newValue)
        }
      }
    }
  },

  set(o, key, val) {
    SSVG.set(o, key, val)
  }
}


