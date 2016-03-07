/**
 * Created by stewartdunlop on 22/02/2016.
 */
'use strict';

/**
 * Module dependencies
 */
var intervalsPolicy = require('../policies/intervals.server.policy'),
    intervals = require('../controllers/intervals.server.controller');

module.exports = function (app) {
    // Base route
    app.route('/api').all().get(intervals.notify);

    // Intervals collection routes
    app.route('/api/intervals').all(intervalsPolicy.isAllowed)
        .get(intervals.list)
        .post(intervals.create);

    // Single article routes
    app.route('/api/intervals/:intervalId').all(intervalsPolicy.isAllowed)
        .get(intervals.read)
        .put(intervals.update)
        .delete(intervals.delete);

    // Finish by binding the article middleware
    app.param('intervalId', intervals.intervalByID);
};
