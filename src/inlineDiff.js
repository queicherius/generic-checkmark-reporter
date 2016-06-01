var diff = require('diff')
var stringify = require('./stringify.js')
var legend = 'actual'.red + ' ' + 'expected'.green + '\n\n'

function inlineDiff (actual, expected) {
  actual = stringify(actual)
  expected = stringify(expected)

  var lines = diff.diffWordsWithSpace(actual, expected)
    .map(mapColor).join('').split('\n')

  if (lines.length > 4) {
    lines = lineNumbers(lines)
  }

  return legend + lines.join('\n')
}

function mapColor (str) {
  if (str.added) {
    return str.value.red
  }

  if (str.removed) {
    return str.value.green
  }

  return str.value
}

function lineNumbers (lines) {
  var width = String(lines.length).length

  return lines.map(function (str, i) {
    return pad(++i, width) + ' |' + ' ' + str;
  })
}

function pad (str, len) {
  str = String(str)
  return new Array(len - str.length + 1).join(' ') + str
}

module.exports = inlineDiff
