require('colors')

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
  if (count % 25 === 0) {
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
  log('(' + diff + 'ms)'.grey)

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
    log('(' + failure.environment + ')'.grey)
  }

  log('\n\n')

  // Log the actual error message + stack trace, and
  // show usable diffs for assertions
  var error = failure.error
  log('    ' + error.message.red + '\n')
  if (error.stack) {
    log('\n    ' + error.stack.grey + '\n')
  }
}

module.exports = {
  start: start,
  result: result,
  end: end
}
