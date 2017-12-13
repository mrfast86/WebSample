"use strict";
var express = require("express");
var mysql = require("mysql");

var auditRouter = express.Router();
exports.auditRouter = auditRouter;


auditRouter.get("/", function (req, res, next) {
    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        connection.query("select * from download_audit", function (err, rows) {
            if (!err) {
                res.json(rows);
            }
        });

        connection.on('error', function (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        });
    });
});

auditRouter.post("/", function (req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));

    this.createAuditlog(req, input, function (err, statusCode, statusJson) {
        if(err)
        {
            res.status(statusCode).json(err);
            return;
        }
        res.json(statusJson);
    })
});

//Create audit record for file download and delete. Track pvid and ipaddress accessed from.
exports.createAuditlog = function (req, input, callback) {
    req.getConnection(function (err, connection) {
        if (err) {
            callback({"error" : "Error in database connection"},500);
            return;
        }

        var data = {
            file_id: input.file_id,
            pvid: req.session.pvid,
            ip_address: req.connection.remoteAddress, // Get remote ipAddress
            action: input.action
        };

            connection.query("insert into download_audit set audit_date=UTC_TIMESTAMP(), ?", data, function (err, rows) {
                if (!err) {
                    callback(null, null, {"message": "SUCCESS"});
                    return;
                }

           callback({"error": err.message},500);
        });

        connection.on('error', function (err) {
            callback({"error" : "Error in database connection"},500);
            return;
        });
    });
}