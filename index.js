var path = require('path')
var fs = require('fs')

// Asynchronously save a file or folder to later restore
function snapshot (origin, opts) {
  if (!fs.existsSync(origin)) {
    console.log('Can\'t make a snapshot for ' + origin + '\nPath doesn\'t exists')
  }
  // create simple struct to represent the file/folder
  var s = createStruct(origin)
  if (opts && opts.db) {
    var ops = createBatchOps(s, origin)
    console.log(ops)
    opts.db.batch(ops, function (err) {
      if (err) {
        throw err
      }
    })
  }

  return {
    data: s,
    name: origin,
    restore: opts && opts.db
              ? restoreFromDb(opts.db)
              : normalRestore
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

  function normalRestore (srcNode, src) {
    src = src || origin || '.'
    srcNode = srcNode || s
    if (srcNode.type === 'dir') {
      safeMkdir(src)
      for (var child in srcNode.children) {
        normalRestore(srcNode.children[child], path.resolve(src, child))
      }
    } else {
      srcNode.data.pipe(fs.createWriteStream(src))
    }
  }

  function restoreFromDb (db) {
    // restore a folder from a levelUp datastore
    // use createReadStream() to get all the data
    // regardless of which keys are saved
    return function () {
      db.createReadStream()
        .on('data', function (data) {
          var isFile = !!data.value
          var value = data.value
          var path = ensurePath(data.key)
          if (isFile) {
            // pipe the stream to a writeStream to save the file
            // enjoy
          }
          // ensure that a path is created, and return the path when is done
          function ensurePath () {
            
          }
        })
        .on('error', function (err) {
          if (err) throw err
        })
        .on('end', function () {
          // close the db
          db.close()
        })
    }
  }

  function safeMkdir (dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }
  function createBatchOps (struct, origin, ops) {
    ops = ops || []
    origin = typeof origin === 'string' ? [origin] : origin
    // return an array of objects like
    // { type: 'put', key: '', value: '' }
    // where key will be a path of a file or folder
    // if it is the path of a file, then value will be a Buffer of the ReadStream from data property in the struct
    // if it is the path of a folder, then it means it is an empty folder (only leafs are represented here)
    // so for instance, this folder
    //
    // public/
    // ├── images/
    // │   ├── img01.png
    // │   └── img01.png
    // ├── data.txt
    // └── data.log
    // should return this array
    // [
    //  { type: 'put', key: 'public/images/img01.png', value: Buffer < ... >},
    //  { type: 'put', key: 'public/images/img02.png', value: Buffer < ... >},
    //  { type: 'put', key: 'public/data.txt', value: Buffer < ... >},
    //  { type: 'put', key: 'public/data.log', value: Buffer < ... >},
    // ]
    //
    // since the struct save in a data property a ReadStream with the content of files, is necesary to convert it
    // to a Buffer to save it to levelDown compliant data store
    // we will use https://github.com/nfroidure/bufferstreams

    // if it is a file or a empty dir
    if (struct.type === 'file' || (struct.type === 'dir' && Object.keys(struct.children).length < 1)) {
      // console.log(origin)
      ops.push({ type: 'put', key: origin.join('/'), value: struct.type === 'file' ? struct.data : '' })
      return ops
    // there is no type property, so we are in the children object
    } else if (!struct.type) {
      for (var child in struct) {
        origin.push(child)
        ops.concat(createBatchOps(struct[child], origin, ops))
        origin.pop()
      }
      return ops
    } else {
      return createBatchOps(struct.children, origin, ops)
    }
  }
}
module.exports = snapshot
