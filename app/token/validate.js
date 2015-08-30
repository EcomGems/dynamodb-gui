// 3rd party libraries
var q = require('q');
var async = require('async');
var lo = require('lodash');
var debug = require('debug')('main');

// private libraries
var db = require('./data/tokendb');

module.exports = validate;

function validate(params){
    return db.getItem(params.token);
}
