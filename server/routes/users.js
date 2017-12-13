"use strict";
var express = require("express");
var mysql = require("mysql");

var usersRouter = express.Router();
exports.usersRouter = usersRouter;

usersRouter.get("/", function (req, res, next) {
    req.getConnection(function(err,connection){
        if (err) {
            res.status(500).json({"error" : "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        connection.query("select * from users ",function(err,rows){
            if(!err) {
                res.json(rows);
            }
        });

        connection.on('error', function(err) {
            res.status(500).json({"error" : "Error in database connection"});
            return;
        });
    });
});

usersRouter.get("/:id", function (req, res, next) {
    if(req.params.id == undefined)
    {
        res.status(400).json({"error": "id in url is mandatory for get by id operation"})
    }

    var id = req.params.id;
    
    req.getConnection(function(err,connection){
        if (err) {
            res.status(500).json({"error" : "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        connection.query("select * from users where id=?",req.params.id,function(err,rows){
            if(!err) {
                res.json(rows);
            }
        });

        connection.on('error', function(err) {
            res.status(500).json({"error" : "Error in database connection"});
            return;
        });
    });
});

usersRouter.post("/", function (req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));

    this.createUser(req, input, function (err, statusCode, statusJson) {
        if(err)
        {
            res.status(statusCode).json(err);
            return;
        }
        res.json(statusJson);
    })
});

usersRouter.put("/:id", function (req, res, next) {
    if(req.params.id == undefined)
    {
        res.status(400).json({"error": "id in url is mandatory for update operation"})
    }

    var id = req.params.id;
    var input = JSON.parse(JSON.stringify(req.body));

    this.updateUser(req, id, input, function (err, statusCode, statusJson) {
        if(err)
        {
            res.status(statusCode).json(err);
            return;
        }
        res.json(statusJson);
    });
});

usersRouter.delete("/:id", function (req, res, next) {
    if(req.params.id == undefined)
    {
        res.status(400).json({"error": "id in url is mandatory for update operation"})
    }

    var id = req.params.id;

    req.getConnection(function(err,connection){
        if (err) {
            res.status(500).json({"error" : "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        connection.query("update users set is_active where id=?",req.params.id,function(err,rows){
            if(err) {
                res.status(400).json({"error": "Record not found"});
                return;
            }
            if(rows.affectedRows > 0) {
                res.json({"message": "SUCCESS"});
            }
            else {
                res.status(400).json({"message": "Record not found"});
            }
        });

        connection.on('error', function(err) {
            res.status(500).json({"error" : "Error in database connection"});
            return;
        });
    });
});

exports.findUser = function (req, pvid, callback)
{
    req.getConnection(function(err,connection){
        if (err) {
            callback({"error" : "Error in database connection"}, 500);
            return;
        }

        console.log('connection id: ' + connection.threadId);

        connection.query("select * from users where pvid = ?",pvid,function(err,rows){
            if(!err) {
                callback(null, null, rows[rows.length - 1]);
            }
            return;
        });

        connection.on('error', function(err) {
            callback({"error" : "Error in database connection"}, 500);
            return;
        });
    });
}


exports.updateUser = function (req, id, input, callback)
{
    req.getConnection(function(err,connection){
        if (err) {
            callback({"error": "Error in database connection"}, 500);
            return;
        }

        connection.query("select * from users where id=?",id,function(err,rows){
            if(err) {
                callback({"error": "Record not found"}, 400);
                return;
            }

            var data = rows[rows.length - 1];
            data.pvid = input.pvid;
            data.otp = input.otp;
            data.email = input.email;
            data.nick_name = input.nick_name;
            data.group_id = input.group_id ? input.group_id: 1;
            data.group_level = input.group_level ? input.group_level: 1;
            data.is_active = true;
            data.lang_code = input.lang_code;

            connection.query("update users set modified_date=UTC_TIMESTAMP(), ? where id = ?", [data, id],function(err,rows){
                if(!err) {
                    callback(null,null,{"message": "SUCCESS"});
                    return;
                }

                callback({"error": err.message}, 500);
                return;
            });
        });

        connection.on('error', function(err) {
            callback({"error" : "Error in database connection"}, 500);
            return;
        });
    });
}

exports.createUser = function (req, input, callback) {
    req.getConnection(function(err,connection){
        if (err) {
            callback({"error" : "Error in database connection"}, 500);
            return;
        }

        var data = {
            pvid  : input.pvid,
            otp  : input.otp,
            email     : input.email,
            nick_name : input.nick_name,
            group_id : input.group_id ? input.group_id: 1,
            group_level : input.group_level ? input.group_level: 1,
            is_active     : true,
            lang_code : input.lang_code
        };

        connection.query("insert into users set created_date=UTC_TIMESTAMP(), modified_date=UTC_TIMESTAMP(), ?", data,function(err,rows){
            if(!err) {
                callback(null, null, {"message": "SUCCESS"});
                return;
            }

            if(rows.hasOwnProperty('insertId')) {
                req.session.userId=rows.insertId;
            }
            
            callback({"error": err.message},500);
        });

        connection.on('error', function(err) {
            callback({"error" : "Error in database connection"},500);
            return;
        });
    });
}