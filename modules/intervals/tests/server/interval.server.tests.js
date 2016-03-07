// This is test/server.js
'use strict';

var path = require('path'),
    config = require(path.resolve('./config/config')),
    mongoose = require('mongoose'),
    supertest = require('supertest'),
    assert = require('chai').should();

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';
// this makes sure we use a separate test dbase
//uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/mean-test',
var connect_string = 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || '192.168.0.9:27017') + '/intervals-test';
var serverString = 'http://' + (process.env.LOCAL_ADDRESS || '192.168.0.9')+':'+(process.env.PORT || '27017');
var api = supertest(serverString);

beforeEach(function (done) {
    function clearDB() {
        for (var i in mongoose.connection.collections) {
            mongoose.connection.collections[i].remove();
        }
        return done();
    }

    function reconnect() {
        mongoose.connect(connect_string, function (err) {
            if (err) {
                console.log('reconnect err '+err);
                throw err;
            }
            return clearDB();
        });
    }

    function checkState() {
        switch (mongoose.connection.readyState) {
            case 0:
                reconnect();
                break;
            case 1:
                clearDB();
                break;
            default:
                process.nextTick(checkState);
        }
    }

    checkState();
});

afterEach(function (done) {
    mongoose.disconnect();
    return done();
});


describe('Server', function() {
    var createdInterval = null;
    var foundInterval = null;
    var updatedInterval = null;

    describe('GET /api', function () {
        it('responds with server success message', function (done) {
            api.get('/api')
                .end(function (err, res) {
                    // Make sure there was no error
                    console.log('err is '+err);
                    assert.equal(err, null);

                    var body = res.body;
                    console.log('body is '+JSON.stringify(body));
                    assert.equal(body.message, 'Success, you have reached the Interval api');
                    done();
                });
        });
    });

    describe('POST /api/intervals', function () {
        it('responds with created interval', function (done) {
            api.post('/api/intervals')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .send({start : 20000, duration : 10000, type: 'testType'})
                .end(function (err, res) {
                    // Make sure there was no error
                    assert.equal(err, null);
                    createdInterval = res.body;
                    assert.equal(createdInterval.start, 20000);
                    assert.equal(createdInterval.duration, 10000);
                    assert.equal(createdInterval.type, 'testType');
                    done();
                });
        });
    });

    describe('get /api/intervals/intervalId', function () {
        it('responds with found interval', function (done) {
            api.get('/api/intervals/'+createdInterval._id)
                .end(function (err, res) {
                    // Make sure there was no error
                    assert.equal(err, null);
                    foundInterval = res.body;
                    assert.equal(foundInterval.start, 20000);
                    assert.equal(foundInterval.duration, 10000);
                    assert.equal(foundInterval.type, 'testType');
                    done();
                });
        });
    });

    describe('put /api/intervals/intervalId', function () {
        it('update responds with found interval', function (done) {
            foundInterval.duration = 50000;
            foundInterval.start = 25000;
            foundInterval.type = 'updatedType';
            api.put('/api/intervals/'+foundInterval._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .send(foundInterval)
                .end(function (err, res) {
                    // Make sure there was no error
                    assert.equal(err, null);
                    //console.log('res interval is '+JSON.stringify(res));
                    updatedInterval = res.body;
                    //console.log('udpated interval is '+JSON.stringify(updatedInterval));
                    assert.equal(updatedInterval.start, 25000);
                    assert.equal(updatedInterval.duration, 50000);
                    assert.equal(updatedInterval.type, 'updatedType');
                    done();
                });
        });
    });



});
