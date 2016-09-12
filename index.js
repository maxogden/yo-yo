var defaultEvents = require('update-events') // Array of DOM update events
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements

module.exports = bel
module.exports.update = function(fromNode, toNode, opts) {
  opts = opts || {}
  opts.onBeforeElUpdated = copier(opts.onBeforeElUpdated)
  return morphdom(fromNode, toNode, opts)
}

function copier(update) {
  update = update || function() {}
  return function(f, t) {
    // copy events:
    defaultEvents.forEach(
      function(e, i) {
        if (t[e]) {
          f[e] = t[e]
        }
        else if (f[e]) {
          f[e] = undefined
        }
      }
    )
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') ||
      f.nodeName === 'TEXTAREA' ||
      f.nodeName === 'SELECT') {
      if (t.getAttribute('value') === null) t.value = f.value
    }
    update(f, t)
  }
}
