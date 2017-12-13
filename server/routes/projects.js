"use strict";
var express = require("express");
var mysql = require("mysql");
var idGen = require("flake-idgen");
var intformat = require('biguint-format');
var generator = new idGen;
var auditRouter = require('./audit');

var projectsRouter = express.Router();
exports.projectsRouter = projectsRouter;

projectsRouter.get("/:id", function (req, res, next) {
    //todo:add back in
    //if (req.session.hasOwnProperty("token")) {
    if (req.params.id == undefined) {
        res.status(400).json({"error": "id in url is mandatory for update operation"})
    }
    //TODO: apply permission filter
    var id = req.params.id;
    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        var query =  connection.query("select * from projects where id = ? and is_active = 1", id, function (err, rows) {
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
    //  }
});

projectsRouter.get("/", function (req, res, next) {
    if (req.session.hasOwnProperty("token")&& (req.session.group_level == '3'||req.session.group_level == '4')) {
        //TODO: apply permission filter
        req.getConnection(function (err, connection) {
            if (err) {
                res.status(500).json({"error": "Error in database connection"});
                return;
            }

            console.log('connection id: ' + connection.threadId);

            connection.query("select * from projects where is_active = 1", function (err, rows) {
                if (!err) {
                    res.json(rows);
                }
            });

            connection.on('error', function (err) {
                res.status(500).json({"error": "Error in database connection"});
                return;
            });
        });
    }
    else {
        req.getConnection(function (err, connection) {
            if (err) {
                res.status(500).json({"error": "Error in database connection"});
                return;
            }

            console.log('connection id: ' + connection.threadId);

            connection.query("select * from projects where is_public = 1 and is_active = 1", function (err, rows) {
                if (!err) {
                    res.json(rows);
                }
            });

            connection.on('error', function (err) {
                res.status(500).json({"error": "Error in database connection"});
                return;
            });
        });
    }
});

projectsRouter.post("/", function (req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));

    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        var data = {
            project_name: input.project.project_name,
            project_code: input.project.project_code,
            is_public: input.project.is_public,
            file_count: 0,
            is_active: true,
            created_by: req.session.userId,
            modified_by: req.session.userId
        };

        // Duplicate check for project_name. project_name must be unique
        connection.query("select * from projects where project_name=?", data.project_name, function (err, rows) {
            if (rows.length != 0) {
                res.status(500).json({"error": "Project Name already exists!"});
                return;
            }

            connection.query("insert into projects set created_date=UTC_TIMESTAMP(), modified_date=UTC_TIMESTAMP(), ?", data, function (err, rows) {
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

projectsRouter.put("/:id", function (req, res, next) {
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
            project_name: input.project.project_name,
            project_code: input.project.project_code,
            is_public: input.project.is_public,
            is_active: true,
            created_by: req.session.userId,
            modified_by: req.session.userId
        };

        var existingProjectName;

        connection.query("select * from projects where id=?", req.params.id, function (err, rows) {
            if (err) {
                res.status(400).json({"error": "Record not found"});
                return;
            }else
            {
                existingProjectName = rows[0].project_name;
            }

            // If new input is different from existing project_name then do duplicate check on new project_name.
            if(existingProjectName != data.project_name) {
                connection.query("select * from projects where project_name=?", data.project_name, function (err, rows) {
                    if (rows.length != 0) {
                        res.status(500).json({"error": "Project Name already exists!"});
                        return;
                    }

                    connection.query("update projects set modified_date=UTC_TIMESTAMP(), ? where id = ?", [data, id], function (err, rows) {
                        if (!err) {
                            res.json({"message": "SUCCESS"});
                            return;
                        }

                        res.status(500).json({"error": err.message});
                    });
                });
            }
            else // project_name unchanged, good to go with update.
            {
                connection.query("update projects set modified_date=UTC_TIMESTAMP(), ? where id = ?", [data, id], function (err, rows) {
                    if (!err) {
                        res.json({"message": "SUCCESS"});
                        return;
                    }

                    res.status(500).json({"error": err.message});
                });
            }
        });

        connection.on('error', function (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        });
    });
});

projectsRouter.delete("/:id", function (req, res, next) {
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

        connection.query("update projects set is_active=0 where id=?", req.params.id, function (err, rows) {
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


projectsRouter.get("/:projectId/files", function (req, res, next) {

    if (req.params.projectId == undefined) {
        res.status(400).json({"error": "id in url is mandatory for get file operation"})
    }

    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);

        // If user is logged in and has VSMember group level and above, show everything
        if (req.session.hasOwnProperty("token") && (req.session.group_level == '3'||req.session.group_level == '4'))
        {
            connection.query("select * from files where project_id=? and is_active=1", req.params.projectId, function (err, rows) {
                if (!err) {
                    res.json(rows);
                    return;
                }
                res.status(400).json({"error": "Record not found"});
                return;
            });
        }
        else //if user doesn't have VSMember group level and above only show public
        {
          connection.query("SELECT * FROM files where project_id=? and is_public = 1 and is_active=1", [req.params.projectId,req.params.projectId], function (err, rows) {
                if (!err) {
                    res.json(rows);
                    return;
                }
                res.json([]);
                return;
            });
        }

        connection.on('error', function (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        });
    });
});

projectsRouter.post("/:projectId/files", function (req, res, next) {
    var input = JSON.parse(JSON.stringify(req.body));

    req.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({"error": "Error in database connection"});
            return;
        }

        console.log('connection id: ' + connection.threadId);
        var uid = generator.next();
        var data = {
            project_name: input.file.project_name,
            platform: input.file.platform,
            service_type: input.file.service_type,
            version: input.file.version,
            build_datetime: input.file.build_datetime,
            comment: input.file.comment,
            file_name: input.file.file_name,
            project_id: input.file.project_id,
            is_public: input.file.is_public,
            permalink: intformat(uid, 'dec'),
            alias: input.file.alias,

            ip_address: req.connection.remoteAddress,
            is_active: true,
        };
        
        if(req.session.hasOwnProperty("userId"))
        {
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
            res.status(500).json({"error": "Error in database connection"});
            return;
        });
    });
});

projectsRouter.put("/:projectId/files", function (req, res, next) {
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
            project_name: input.project_name,
            platform: input.platform,
            service_type: input.service_type,
            version: input.version,
            build_datetime: input.build_datetime,
            comments: input.comments,
            project_id: input.project_id,
            ip_address: input.ip_address,
            file_name: input.file_name,
            is_public: false,
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

projectsRouter.delete("/:projectId/files/:id", function (req, res, next) {
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
                //Create input for audit logging. For Delete file logging
                var input = {};
                input.pvid = req.session.pvid;
                input.file_id = req.params.id;
                input.action = "delete";
                input.ip_address = req.connection.remoteAddress;

                //Delete file audit log
                auditRouter.createAuditlog(req, input, function (err, statusCode, statusJson) {
                    if(err)
                    {
                        res.status(statusCode).json(err);
                        return;
                    }
                });
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