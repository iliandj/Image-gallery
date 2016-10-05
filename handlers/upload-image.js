let fs = require('fs')
let path = require('path')
let url = require('url')
let multiparty = require('multiparty')
let crypto = require('crypto')
let publicDirectory = require('./global-parameters')['publicDirectory']
let privateDirectory = require('./global-parameters')['privateDirectory']

function ramdomImageNameBase64 (len) {
  let result = crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len)
    .replace(/\+/g, '0')
    .replace(/\//g, '0')

  return result
}

module.exports = (req, res) => {
  req.pathName = req.pathName || url.parse(req.url).pathname
  if (req.pathName === '/upload') {
    fs.readFile('./content/upload.html', (err, data) => {
      if (err) console.log(err)

      console.log('[200] ' + req.method + ' to ' + req.url)

      if (req.method === 'POST') {
        // let size = ''
        // let fileName = ''
        let destinationPath = ''
        let randomImageName = ''

        let form = new multiparty.Form({
          uploadDir: publicDirectory,
          maxFilesSize: '15mb',
          autoFields: true,
          autoFiles: true
        })

        form.on('error', (err) => {
          console.log('Error parsing form: ' + err.stack)
        })

        //         form.on('part', part => {
        //           console.log("Part input")
        //           if (part.filename) {
        //             size = part.byteCount
        //             fileName = part.filename
        //           } else {
        //             let result = ''
        //             part.on('date', data => {
        //               result += data
        //             })
        //           }
        //           part.resume()
        //         })

        form.on('field', (name, field) => {
          if (name === 'visibility' && field === 'private') {
            fs.exists(destinationPath, (exists) => {
              if (exists) {
                let newPath = privateDirectory + randomImageName
                fs.rename(destinationPath, newPath, (err) => {
                  if (err) console.log(err)

                  destinationPath = newPath
                })
              }
            })
          }
        })

        form.on('file', (name, file) => {
          console.log("file")
          let temporalPath = file.path
          let extension = path.extname(file.originalFilename)
          randomImageName = ramdomImageNameBase64(12) + extension 
          destinationPath = publicDirectory + randomImageName
          let inputStream = fs.createReadStream(temporalPath)
          let outputStream = fs.createWriteStream(destinationPath)
          inputStream.pipe(outputStream)

          inputStream.on('end', () => {
            fs.unlinkSync(temporalPath)
            console.log('Uploaded: ', file.originalFilename, file.size / 1024 | 0, 'kb', destinationPath)
          })
        })

        form.on('close', () => {
          res.writeHead(200)
          res.write('<p>Image Uploaded Successful<p>')
          res.write('<a href="' + destinationPath + '">' + 'Direct Image Link' + '</a>')
          res.write('<br />')
          res.write('<a href="/">Back to gallery</a>')
          res.end()
        })

        form.parse(req)
      }
    })
  } else {
    return true
  }
}
