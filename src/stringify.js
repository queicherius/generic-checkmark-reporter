function stringify (val) {
  switch (type(val)) {
    case 'null':
    case 'undefined':
      return '[' + val + ']'

    case 'array':
    case 'object':
      return JSON.stringify(val, null, 2)

    case 'boolean':
    case 'regexp':
    case 'symbol':
    case 'number':
      return val.toString()

    case 'string':
      return val

    case 'date':
      var date = isNaN(val.getTime())
        ? val.toString()
        : val.toISOString()
      return '[Date: ' + date + ']'

    case 'buffer':
      var json = val.toJSON()
      json = json.data && json.type ? json.data : json
      return '[Buffer: ' + JSON.stringify(json, null, 2) + ']'

    case 'function':
      return '[Function]'

    default:
      return (val === '[Function]' || val === '[Circular]') ? val : JSON.stringify(val)
  }
}

function type (value) {
  if (value === undefined) {
    return 'undefined';
  } else if (value === null) {
    return 'null';
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    return 'buffer';
  }

  return Object.prototype.toString.call(value)
    .replace(/^\[.+\s(.+?)\]$/, '$1')
    .toLowerCase();
}

module.exports = stringify
