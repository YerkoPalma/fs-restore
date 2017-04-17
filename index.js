var path = require('path')
var fs = require('fs')

// Asynchronously save a file or folder to later restore
function snapshot (origin) {
  if (!fs.existsSync(origin)) {
    console.log('Can\'t make a snapshot for ' + origin + '\nPath doesn\'t exists')
  }
  // create simple struct to represent the file/folder
  var s = createStruct(origin)

  return {
    data: s,
    name: origin,
    restore: function (srcNode, src) {
      src = src || origin || '.'
      srcNode = srcNode || s
      if (srcNode.type === 'dir') {
        safeMkdir(src)
        for (var child in srcNode.children) {
          this.restore(srcNode.children[child], path.resolve(src, child))
        }
      } else {
        srcNode.data.pipe(fs.createWriteStream(src))
      }
    }
  }

  function createStruct (origin, obj) {
    obj = obj || {}

    if (fs.statSync(origin).isDirectory()) {
      var dirStruct = {
        type: 'dir',
        children: {}
      }
      const files = fs.readdirSync(origin)
      for (var file of files) {
        var filePath = path.resolve(origin, file)
        dirStruct.children[file] = createStruct(filePath)
      }
      return dirStruct
    } else {
      var fileStruct = {
        type: 'file',
        data: fs.createReadStream(origin)
      }
      obj[path] = fileStruct
      return fileStruct
    }
  }

  function safeMkdir (dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
}
module.exports = snapshot
