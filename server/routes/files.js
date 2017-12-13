"use strict";
var express = require("express");
var mysql = require("mysql");
var idGen = require("flake-idgen");
var generator = new idGen;
var intformat = require('biguint-format');

var filesRouter = express.Router();
exports.filesRouter = filesRouter;

filesRouter.get("/", function (req, res, next) {
    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        connection.query("select * from files where is_active = 1", function (err, rows) {
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


filesRouter.get("/:id", function (req, res, next) {

    if (req.params.id == undefined) {
        res.status(400).json({"error": "id in url is mandatory for update operation"})
    }

    var id = req.params.id;
    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        var query =  connection.query("select * from files where id = ? and is_active = 1", id, function (err, rows) {
            if (!err) {
                res.json(rows.slice(-1).pop());
            }
        });

        console.log(query.sql);

        connection.on('error', function (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        });
    });

});

// Upload new files
filesRouter.post("/", function (req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        req.getConnection(function (err, connection) {
            if (err) {
                res.status(500).json({"error": "Error in database connection"});
                return;
            }

        if (!(req.session.hasOwnProperty("token") && (req.session.group_level == '3'||req.session.group_level == '4')))
        {
            res.status(403).json({"error": "Unauthorized"});
            return;
        }

        console.log('connection id: ' + connection.threadId);
        var uid = generator.next();

        // We need to find project by project name, get its ID
        connection.query("select * from projects where project_name=? and is_active=1", input.file.project_name, function (err, rows) {
            if (!err && rows.length != 0) {
                var row = rows[0];
                var data = {
                    project_name: input.file.project_name,
                    platform: input.file.platform,
                    service_type: input.file.service_type,
                    version: input.file.version,
                    build_datetime: input.file.build_datetime,
                    comment: input.file.comment,
                    file_name: input.file.file_name,
                    project_id: row.id,
                    is_public: input.file.is_public,
                    permalink: intformat(uid, 'dec'),
                    alias: input.file.alias,

                    ip_address: req.connection.remoteAddress,
                    is_active: true,
                };

                if (req.session.hasOwnProperty("userId")) {
                    data.uploaded_by = req.session.userId;
                    data.created_by = req.session.userId;
                    data.modified_by = req.session.userId;
                }

                connection.query("insert into files set uploaded_date=UTC_TIMESTAMP(), created_date=UTC_TIMESTAMP(), modified_date=UTC_TIMESTAMP(), ?", data, function (err, rows) {
                    if (!err) {
                        res.json({"message": "SUCCESS"});
                        return;
                    }
                    res.status(500).json({"error": err.message});
                });

                connection.on('error', function (err) {
                    res.status(500).json({"error": err.message});
                    return;
                });
            }
            else
            {
                res.status(500).json({"error": "Invalid Project Name"});
            }
        });

        connection.on('error', function (err) {
            res.status(500).json({"error": err.message});
            return;
        });
    });
});

filesRouter.put("/:id", function (req, res, next) {
    if (req.params.id == undefined) {
        res.status(400).json({"error": "id in url is mandatory for update operation"})
    }

    var id = req.params.id;
    var input = JSON.parse(JSON.stringify(req.body));

    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        var data = {
            project_name: input.file.project_name,
            service_type: input.file.service_type,
            version: input.file.version,
            build_datetime: input.file.build_datetime,
            comment: input.file.comment,
            alias: input.file.alias,
            project_id: input.file.project_id,
            ip_address: input.file.ip_address,
            file_name: input.file.file_name,
            is_public: input.file.is_public,
            is_active: true
        };

        if(req.session.hasOwnProperty("userId"))
        {
            data.modified_by = req.session.userId;
        }

        connection.query("select * from files where id=?", req.params.id, function (err, rows) {
            if (err) {
                res.status(400).json({"error": "Record not found"});
                return;
            }

            connection.query("update files set modified_date=UTC_TIMESTAMP(), ? where id = ?", [data, id], function (err, rows) {
                if (!err) {
                    res.json({"message": "SUCCESS"});
                    return;
                }

                res.status(500).json({"error": err.message});
            });
        });

        connection.on('error', function (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        });
    });
});

filesRouter.delete("/:id", function (req, res, next) {
    if (req.params.id == undefined) {
        res.status(400).json({"error": "id in url is mandatory for update operation"})
    }

    var id = req.params.id;

    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        connection.query("update files set is_active = 0 where id=?", req.params.id, function (err, rows) {
            if (err) {
                res.status(400).json({"error": "Record not found"});
                return;
            }
            if (rows.affectedRows > 0) {
                res.json({"message": "SUCCESS"});
            }
            else {
                res.status(400).json({"message": "Record not found"});
            }
        });

        connection.on('error', function (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        });
    });
});