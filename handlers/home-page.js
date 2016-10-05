let fs = require('fs')
let url = require('url')
let path = require('path')
let galleryDirectory = require('./global-parameters')['publicDirectory']
let allowedFileTypes = require('./global-parameters')['image-type']

function getImages (imageDir) {
  let list = fs.readdirSync(imageDir)
  let files = []

  for (var i = 0; i < list.length; i++) {
    if (allowedFileTypes.indexOf(path.extname(list[i]).toLowerCase()) > -1) {
      files.push(list[i])
    }
  }

  return files
}

module.exports = (req, res) => {
  req.pathName = req.pathName || url.parse(req.url).pathname
  if (req.pathName === '/') {
    fs.readFile('./index-header.html', (err, data) => {
      if (err) console.log(err)

      let files = getImages(galleryDirectory)

      let imageLists = '<ul>'
      for (var i = 0; i < files.length; i++) {
        imageLists += '<li class="image"><a href="' + galleryDirectory + files[i] + '">' + '<img src="' + galleryDirectory + files[i] + '" alt="' + files[i] + '"></a></li>'
      }

      imageLists += '</ul>'
      data += imageLists

      fs.readFile('./index-footer.html', (err, footerData) => {
        if (err) console.log(err)

        data += footerData

        res.writeHead(200, {
          'Content-Type': 'text/html'
        })
        res.write(data)
        res.end()
      })
    })
  } else {
    return true
  }
}
