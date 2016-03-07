/**
 * Created by stewartdunlop on 22/02/2016.
 */
'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Interval = mongoose.model('Interval'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an interval
 */
exports.create = function (req, res) {
    var interval = new Interval(req.body);
    interval.user = req.user;

    interval.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(interval);
        }
    });
};

/**
 * Show the current interval
 */
exports.read = function (req, res) {
    // convert mongoose document to JSON
    var interval = req.interval ? req.interval.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    interval.isCurrentUserOwner = req.user && interval.user && interval.user._id.toString() === req.user._id.toString() ? true : false;

    res.json(interval);
};

/**
 * Update an interval
 */
exports.update = function (req, res) {
    var interval = req.interval;

    interval.title = req.body.title;
    interval.content = req.body.content;

    interval.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(interval);
        }
    });
};

/**
 * Delete an interval
 */
exports.delete = function (req, res) {
    var interval = req.interval;

    interval.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(interval);
        }
    });
};

/**
 * List of interval
 */
exports.list = function (req, res) {
    Interval.find().sort('-created').populate('user', 'displayName').exec(function (err, intervals) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(intervals);
        }
    });
};

/**
 * Default welcome message
 */
exports.notify = function (req,res) {
    console.log('intervals notify ');
    res.json("Success, you have reached the Interval api");
};

/**
 * interval middleware
 */
exports.intervalByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'interval is invalid'
        });
    }

    Interval.findById(id).populate('user', 'displayName').exec(function (err, interval) {
        if (err) {
            return next(err);
        } else if (!interval) {
            return res.status(404).send({
                message: 'No interval with that identifier has been found'
            });
        }
        req.interval = interval;
        next();
    });
};
