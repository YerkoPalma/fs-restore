var snapshot = require('./')
var level = require('level')

var db = level('~/.db')
var s = snapshot('public', { db: db })
s.restore()
