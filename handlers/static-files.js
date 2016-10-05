let fs = require('fs')
let url = require('url')
let path = require('path')
let mimeTypes = require('./mime-types')
let rootDirectory = '/content/'

function getPathExtension (url) {
  let filePath = '.' + url
  let extName = String(path.extname(filePath)).toLowerCase()
  return extName
}

function getContentType (url) {
  let extName = getPathExtension(url)
  let contentType = mimeTypes[extName] || mimeTypes['default']

  return contentType
}

function errorResponse (res) {
  res.writeHead(404)
  res.write('404 Not Found')
  res.end()
}

module.exports = (req, res) => {
  req.pathName = req.pathName || url.parse(req.url).pathname

  // prevent poison null bytes and directory traversal
  if (req.pathName.indexOf('\0') !== -1 ||
    req.pathName.indexOf(rootDirectory) !== 0) {
    errorResponse(res)
    return true
  }

  // check for allowed file types
  let contentType = getContentType(req.pathName)
  if (contentType === mimeTypes['default']) {
    errorResponse(res)
    return true
  }

  fs.readFile('.' + req.pathName, (err, data) => {
    if (err) {
      errorResponse(res)
      return true
    }

    res.writeHead(200, {
      'Content-Type': contentType
    })
    res.write(data)
    res.end()
  })
}
