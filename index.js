var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements
var defaultEvents = require('./update-events.js') // default events to be copied when dom elements update

module.exports = bel

// TODO move this + defaultEvents to a new module once we receive more feedback
module.exports.update = function (fromNode, toNode, opts) {
  if (!opts) opts = {}
  if (opts.events !== false) {
    opts.onBeforeElUpdated = currier(opts.onBeforeElUpdated, opts)
  }

  return morphdom(fromNode, toNode, opts)

  function currier (userUpdate, opts) {
    // morphdom only copies attributes. we decided we also wanted to copy events
    // that can be set via attributes
    return function copier (f, t) {
      var copyEvents = userUpdate? userUpdate(f, t): true
      if (copyEvents === false) { return false }
      // copy events:
      var events = opts.events || defaultEvents
      for (var i = 0; i < events.length; i++) {
        var ev = events[i]
        if (t[ev]) { // if new element has a whitelisted attribute
          f[ev] = t[ev] // update existing element
        } else if (f[ev]) { // if existing element has it and new one doesnt
          f[ev] = undefined // remove it from existing element
        }
      }
      // copy values for form elements
      if ((f.nodeName === 'INPUT' && f.type !== 'file') || f.nodeName === 'SELECT') {
        if (t.getAttribute('value') === null) t.value = f.value
      } else if (f.nodeName === 'TEXTAREA') {
        if (t.getAttribute('value') === null) f.value = t.value
      }

    }
  }
}
