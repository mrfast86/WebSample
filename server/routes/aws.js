"use strict";
var express = require("express");
var http = require('http');
var config = require('../config');
var aws = require("aws-sdk");

var awsRouter = express.Router();
exports.awsRouter = awsRouter;

awsRouter.get("/", function (req, res, next) {
    if (!req.query.fileName) {
        res.status(400).json({"error": "fileName query parameter is mandatory for aws policy generation"});
        return;
    }

    aws.config.update({ accessKeyId: config.s3.accessKey, secretAccessKey: config.s3.accessSecret });
    aws.config.region = config.s3.region;

    var fileName = req.query.fileName;
    var s3 = new aws.S3();

    const s3Params = {
        Bucket: config.s3.bucket,
        Key: fileName,
        Expires: 1800,
        ACL: 'bucket-owner-full-control'
    };

    s3.getSignedUrl('putObject', s3Params, function(err, data) {
        if(err){
            console.log(err);
            return res.end();
        }
        const returnData = {
            url: data
        };
        res.json(returnData);
        return;
    });
});
