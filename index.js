let http = require('http')
let handlers = require('./handlers/index.js')

let port = process.env.port || 9876

http
  .createServer((req, res) => {
    for (let handler of handlers) {
      let next = handler(req, res)
      if (!next) {
        break
      }
    }
  })
  .listen(port, () => {
    console.info(`Server listening on port ${port}`)
  })
