var restore = require('./')
var level = require('level')

var db = level('~/.db')
restore('public', { db: db })
