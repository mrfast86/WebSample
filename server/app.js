"use strict";
/// <reference path="../typings/index.d.ts" />
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var body_parser = require("body-parser");
var connection  = require('express-myconnection');
var mysql = require('mysql');
var config = require('./config');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var login = require("./routes/login");
var logout = require("./routes/logout");
var projects = require("./routes/projects");
var files = require("./routes/files");
var audit = require("./routes/audit");
var users = require("./routes/users");
var aws = require("./routes/aws");
var download = require("./routes/download");
var app = express();

exports.app = app;
app.disable("x-powered-by");
app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));
app.use(express.static(path.join(__dirname, '../public')));
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({secret: '1234'}));

app.use(
    connection(mysql,{
        host     : config.host,
        user     : config.user,
        password : config.password,
        database : config.database,
        debug    : false
    },'single')

);

// api routes
app.use("/api/login", login.loginRouter);
app.use("/api/logout", logout.logoutRouter);
app.use("/api/projects", projects.projectsRouter);
app.use("/api/files", files.filesRouter);
app.use("/api/audit", audit.auditRouter);
app.use("/api/users", users.usersRouter);
app.use("/api/aws", aws.awsRouter);
app.use("/api/download", download.downloadRouter);

app.use('/client', express.static(path.join(__dirname, '../client')));

// error handlers
// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use(express.static(path.join(__dirname, '../node_modules')));
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            error: err,
            message: err.message
        });
    });
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    //res.sendFile(path.resolve(__dirname + '/../public/index.html'));
    var err = new Error("Not Found");
    next(err);
});

// production error handler
// no stacktrace leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        error: {},
        message: err.message
    });
});
