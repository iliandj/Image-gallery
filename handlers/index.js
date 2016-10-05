let favicon = require('./favicon')
let homePage = require('./home-page')
let staticFiles = require('./static-files')
let addImageInfo = require('./upload-image')

module.exports = [
  favicon,
  homePage,
  addImageInfo,
  staticFiles
]
