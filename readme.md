# fs-restore [![npm version](https://img.shields.io/npm/v/fs-restore.svg?style=flat-square)](https://www.npmjs.com/package/fs-restore) 
[![Build Status](https://img.shields.io/travis/YerkoPalma/fs-restore/master.svg?style=flat-square)](https://travis-ci.org/YerkoPalma/fs-restore)  [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> Take a snapshot of a file or folder to later restore it.

## Usage

```js
var snapshot = require('fs-restore')

// take a snapshot of /src folder

var s = snapshot('/src')

// do whatever you want to the folder (delete it for example)

// restore it at the point when the snapshot was taken
s.restore()
```

## API

### `var s = snapshot(path)`

A function that expect the path of the file or folder to be restored later. Returns an object with a data object property and a restore function property.

### `s.data`

An object with the representation of the folder.
It is a tree data structure, each node has a `type` property. If type equals `'file'`, it also has a property data with the file contents as a stream. If type equals `'dir'`, it has a children property which is an object and each property of this object is the name of the file/path in this directory.
So, suppose this file structure:

```
public/
├── images/
│   ├── img01.png
│   └── img01.png
├── data.txt
└── data.log
```

The object that would represent this directory would be like this

```js
var publicFs = {
  type: 'dir',
  children: {
    'images': {
      type: 'dir',
      children: {
        'img01.png': {
          type: 'file',
          data: '...' // ReadStream
        },
        'img02.png': {
          type: 'file',
          data: '...' // ReadStream
        }
      }
    },
    'data.txt': {
      type: 'file',
      data: '...' // ReadStream
    },
    'data.log': {
      type: 'file',
      data: '...' // ReadStream
    }
  }
}
```

### `s.restore()`

Restore the folder at the pointe described by `s.data`.

## Install

```bash
$ npm install fs-restore
```

## TODO

- Add an option to specify a datastore, like `memdb`, to make restores even when the current program is finished or killed.

```js
var snapshot = require('fs-restore')

var s = snapshot('/src', { db: require('memdb')() })

// in other program or node instance
var snapshot = require('fs-restore')

var s = snapshot('/src', { db: require('memdb')() })
```

- Handle sync and async versions.

## License

[MIT](/license) © [Yerko Palma](https://github.com/YerkoPalma).