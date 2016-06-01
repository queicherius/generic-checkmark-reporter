require('colors')
var inlineDiff = require('./inlineDiff.js')

var SYMBOLS = {
  success: '✓'.green,
  failure: '✗'.red,
  skipped: '»'.cyan
}

var startTime = false
var failures = []
var count = 0
var stats = {success: 0, failure: 0, skipped: 0}
var log = process.stdout.write

// Function to call at the start of the test run, resets all variables
function start (outputFunction) {
  startTime = new Date()
  failures = []
  count = 0
  stats = {success: 0, failure: 0, skipped: 0}
  log = outputFunction || log
}

// Function to call to report a single spec result
function result (type, error) {
  if (count % 40 === 0) {
    log('\n  ')
  }

  count++
  stats[type]++
  log(SYMBOLS[type] + ' ')

  if (type === 'failure') {
    failures.push(error)
  }
}

// Function to call to report end results
function end () {
  var diff = new Date() - startTime

  log('\n\n')
  log('  ' + SYMBOLS.success + ' ' + (stats.success + ' passing ').green)
  log(('(' + diff + 'ms)').grey)

  if (stats.skipped) {
    log('\n  ' + SYMBOLS.skipped + ' ' + (stats.skipped + ' pending').cyan)
  }

  if (stats.failure) {
    log('\n  ' + SYMBOLS.failure + ' ' + (stats.failure + ' failing').red)

    // Log all accumulated errors
    log('\n\n')
    failures.forEach(logError)
    log('\n')
  }

  log('\n\n')
}

// Log a single error
function logError (failure, index) {
  index = index + 1

  if (index > 1) {
    log('\n\n')
  }

  log('  ' + index + ') ' + failure.description + ': ')

  if (failure.environment) {
    log(('(' + failure.environment + ')').grey)
  }

  log('\n\n')

  // Log the actual error message + stack trace, and
  // show usable diffs for assertions
  var error = formatError(failure.error)
  if (error.message && error.message !== '') {
    log(error.message + '\n')
  }
  if (error.stack && error.stack !== '') {
    log('\n' + error.stack + '\n')
  }
}

// Try and extract the best error message / stacktrace and generate inline diffs
function formatError (error) {
  var message

  // Get the error message based on the error
  var errorMessage = ''
  if (error.message && typeof error.message.toString === 'function') {
    errorMessage = error.message + ''
  }
  if (typeof error.inspect === 'function') {
    errorMessage = error.inspect() + ''
  }
  message = errorMessage

  // Build a clean stack trace (and extract the error message out of it,
  // if it is included in the stack trace, since it's usually better)
  var stack = error.stack || errorMessage
  var index = stack.indexOf(errorMessage)
  if (index !== -1) {
    index += errorMessage.length
    message = stack.slice(0, index)
    stack = stack.slice(index + 1)
  }

  // Add extra text for uncaught errors
  if (error.uncaught) {
    message = 'Uncaught ' + message
  }

  // Show diffs for assertion errors
  var actual = error.actual
  var expected = error.expected
  if (error.showDiff !== false && sameType(actual, expected) && expected !== undefined) {
    // Try and get a better message ouf of the assertion error
    // (this is when the user supplied his own description to "expect")
    var match = errorMessage.match(/^([^:]+): expected/)
    message = match ? match[1].red + '\n\n' : ''

    // Add the diff
    message += inlineDiff(error.actual, error.expected)
  } else {
    message = message.red
  }

  return {
    message: intendLines(message),
    stack: intendLines(stack, true).grey
  }
}

// Intend every line of a string
function intendLines (string, trim) {
  return string
    .split('\n')
    .map(function (s) {
      return trim ? s.trim() : s
    })
    .join('\n')
    .replace(/^/gm, '     ')
}

// Check if two variables have the same type
var _toString = Object.prototype.toString
function sameType (a, b) {
  return _toString.call(a) === _toString.call(b)
}

module.exports = {
  start: start,
  result: result,
  end: end
}
