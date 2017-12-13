"use strict";
var express = require("express");
var http = require('http');
var config = require('../config');
var aws = require("aws-sdk");
var auditRouter = require('./audit');
var tal  = require ('template-tal');

var downloadRouter = express.Router();
exports.downloadRouter = downloadRouter;

downloadRouter.get("/:id", function (req, res, next) {
    if (!req.params.id) {
        res.status(400).json({"error": "invalid download url"});
        return;
    }

    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        var permalink = req.params.id.split(".")[0];

        // If user is logged on with sufficient access and permalink is accessed, do not check public.
        if (req.session.hasOwnProperty("token") && (req.session.group_level == '3' || req.session.group_level == '4')) {
            connection.query("select * from files where permalink=? and is_active=1", permalink, function (err, rows) {
                if (!err && rows.length != 0) {
                    var row = rows[0];
                    // Will always return one record as permalink is unique id.
                    var fileName = row.file_name;
                    generateSignedUrl(req, res, fileName, row.id, row.version, row.platform, logAndSendResponseHandler);
                    return;
                }
                else
                {
                    // Try alias
                    connection.query("select * from files where alias=? and is_active=1", permalink, function (err, rows) {
                        if (!err && rows.length != 0) {
                            var row = rows[0];
                            // Will always return one record as permalink is unique id.
                            var fileName = row.file_name;
                            generateSignedUrl(req, res, fileName, row.id, row.version, row.platform, logAndSendResponseHandler);
                            return;
                        }
                        res.status(400).json({"error": "requested file does not exist"});
                        return;
                    });
                }
            });

            connection.on('error', function (err) {
                res.status(500).json({"error": "Error in database connection"});
                return;
            });

        } else {
            //If user tries to access permalink without login, then file must be public,
            connection.query("select * from files where permalink=? and is_active=1 and is_public=1", permalink, function (err, rows) {
                if (!err && rows.length != 0) {
                    var row = rows[0];
                    var fileName = row.file_name;
                    generateSignedUrl(req, res, fileName, row.id, row.version, row.platform, logAndSendResponseHandler);
                    return;
                }
                else {
                    connection.query("select * from files where alias=? and is_active=1 and is_public=1", permalink, function (err, rows) {
                        if (!err && rows.length != 0) {
                            var row = rows[0];
                            var fileName = row.file_name;
                            generateSignedUrl(req, res, fileName, row.id, row.version, row.platform, logAndSendResponseHandler);
                            return;
                        }
                        res.status(400).json({"error": "Requested file does not exist or you don't have permissions to download"});
                        return;
                    });
                }
            });
            connection.on('error', function (err) {
                res.status(500).json({"error": "Error in database connection"});
                return;
            });
        }
    });
});

function generateSignedUrl(req, res, fileName, fileId, version, type, callback) {
    aws.config.update({ accessKeyId: config.s3.accessKey, secretAccessKey: config.s3.accessSecret });
    aws.config.region = config.s3.region;

    var s3 = new aws.S3();

    const s3Params = {
        Bucket: config.s3.bucket,
        Key: fileName,
        Expires: 1800
    };

    s3.getSignedUrl('getObject', s3Params, function(err, url) {
        if(err){
            console.log(err);
            callback(err);
        }
        callback(null, req, res, fileName, fileId, version, type, url);
        return;
    });
}


function generatePlist(url, fileName, version) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?> <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"> <plist version="1.0"> <dict> <key>items</key> <array> <dict> <key>assets</key> <array> <dict> <key>kind</key> <string>software-package</string> <key>url</key> <string tal:content="self.url">http://</string> </dict> </array> <key>metadata</key> <dict> <key>bundle-identifier</key> <string tal:content="self.projectName">projectName</string> <key>bundle-version</key> <string tal:content="self.version">version</string> <key>kind</key> <string>software</string> <key>title</key> <string tal:content="self.projectName">Wireless AdHoc Demo</string> </dict> </dict> </array> </dict> </plist>';

    var data = {};
    data.url = url;
    data.projectName = fileName;
    data.version = version;

    var plist = tal.process(xml, data);
    console.log(plist);
    return plist;
}


var logAndSendResponseHandler = function(err, req, res, fileName, fileId, version, type, url) {
    if (!err) {
        //Create input for audit logging. Download file logging.
        var input = {};
        input.pvid = req.session.pvid;
        input.file_id = fileId;
        input.action = "download";
        input.ip_address = req.connection.remoteAddress;

        auditRouter.createAuditlog(req, input, function (err, statusCode, statusJson) {
            if(err)
            {
                res.status(statusCode).json(err);
                return;
            }
        });

        if(type === 'IOS') {
            var plist = generatePlist(url, fileName, version)
            res.header("Content-Type", "application/octet-stream");
            res.send(plist);
            return;
        }

        res.redirect(url);
        return;
    }
    return res.end();
}