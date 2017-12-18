var request = require('request');
var async = require('async');
var moment = require('moment');

module.exports = function() {
  var self = this,
    requestBuilds = function(callback) {
      request({
        url: self.configuration.url + '/api/repos/' + self.configuration.repo + '/builds',
        json: true,
        headers: {
          'Authorization': 'Bearer ' + self.configuration.token
        }
      }, function(error, response, body) {
        callback(error, body);
      });
    },
    requestBuild = function(build, callback) {
      request({
        url: self.configuration.url + '/api/repos/' + self.configuration.repo + '/builds/' + build.number,
        json: true,
        headers: {
          'Authorization': 'Bearer ' + self.configuration.token
        }
      }, function(error, response, body) {
        if (error) {
          callback(error);
          return;
        }

        callback(error, simplifyBuild(body));
      });
    },
    queryBuilds = function(callback) {
      requestBuilds(function(error, body) {
        if (error) {
          callback(error);
          return;
        }

        async.map(body, requestBuild, function(error, results) {
          callback(error, results);
        });
      });
    },
    parseDate = function(timestamp) {
      return moment.unix(timestamp).toDate();
    },
    getStatus = function(status) {
      if (['running', 'pending', 'blocked'].includes(status)) return 'Blue';
      if (['killed', 'skipped'].includes(status)) return 'Gray';
      if (['failure', 'error', 'declined'].includes(status)) return 'Red';
      if (status === 'success') return 'Green';

      return null;
    },
    simplifyBuild = function(res) {
      return {
        id: self.configuration.repo + '|' + res.number,
        project: self.configuration.repo,
        number: res.number,
        isRunning: res.state === 'started',
        startedAt: parseDate(res.started_at),
        finishedAt: parseDate(res.finished_at),
        requestedFor: res.author,
        status: getStatus(res.status),
        statusText: res.status,
        reason: res.event,
        hasErrors: false,
        hasWarnings: false,
        branch: res.branch,
        url: self.configuration.url + '/' + self.configuration.repo + '/' + res.id
      };
    };

  self.configure = function(config) {
    self.configuration = config;
  };

  self.check = function(callback) {
    queryBuilds(callback);
  };
};
