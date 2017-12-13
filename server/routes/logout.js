"use strict";
var express = require("express");
var http = require('http');

var logoutRouter = express.Router();
exports.logoutRouter = logoutRouter;

logoutRouter.get("/", function (req, res, next) {
    
    req.session.token = undefined;
    req.session.pvid = undefined;
    req.session.otp = undefined;
    req.session.name = undefined;
    req.session.group_level = undefined;

    res.json({"loggedIn": false});
});