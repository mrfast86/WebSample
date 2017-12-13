"use strict";
var express_1 = require("express");
var http = require('http');
var qs = require('querystring');
var usersRouter = require('./users');

var loginRouter = express_1.Router();
exports.loginRouter = loginRouter;

loginRouter.get("/", function (req, res, next) {
    if (!req.query.hasOwnProperty("token")) {
        var err = new Error("No token");
        return next(err);
    }

    console.log(req.query.token);
    var post_data = {};
    post_data['token'] = req.query.token;

    var post_options = {
        host: 'pv-test.vshower.com',
        path: '/pv_account/web_get_account_by_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var post_req = http.request(post_options, function(response) {
        response.setEncoding('utf8');

        var Result = '';
        response.on('data', function (chunk) {
            Result += chunk;
        });
        
        response.on('end', function () {
            console.log('Response: ' + Result);
            var userData = JSON.parse(Result);
            
            req.session.token = req.query.token;
            req.session.pvid = userData.pvid;
            req.session.otp = userData.otp;
            req.session.nick_name = userData.nick_name;
            req.session.group_id = userData.group_id;
            req.session.group_level = userData.group_level;
            req.session.lang_code = userData.lang_code;

            createOrUpdateUser(req, res, userData, function (err, statusCode, statusJson) {
                if(err) {
                    res.status(statusCode).json(err);
                }
                else {
                    res.redirect('/');
                }

                return;
            });
        });
    });

    post_req.write(qs.stringify(post_data));
    post_req.end();
});

loginRouter.get("/status", function (req, res, next) {
    if (!req.session.hasOwnProperty("token")) {
        req.session.userId = 2;
        res.json({"loggedIn": false});
        return;
    }

    res.json({"loggedIn": true, "userName": req.session.nick_name, "groupLevel": req.session.group_level});

});

function createOrUpdateUser(req, res, input, callback){
    //Find user with given pvid.
    usersRouter.findUser(req, req.session.pvid, function (err, statusCode, row) {
        if(err)
        {
            res.status(statusCode).json(err);
            return;
        }
        else if(!row)
        {
            //If user doesn't exist, then create user record.
            usersRouter.createUser(req, input , function (err, statusCode, statusJson) {
                if(err)
                {
                    res.status(statusCode).json(err);
                    return;
                }
                else if(statusJson)
                {
                    callback(null, null, statusJson);
                    return;
                }
            })
        }
        else
        {
            //If user with pvid exists in system, then update user record with returned response.
            req.session.userId=row.id;

            row.pvid = req.session.pvid;
            row.otp = req.session.otp;
            row.nick_name = req.session.nick_name;
            row.group_id = req.session.group_id ? req.session.group_id : 1;
            row.group_level = req.session.group_level;
            row.is_active = true;
            row.lang_code = req.session.lang_code;
            
            usersRouter.updateUser(req, row.id, row, function(err, statusCode, statusJson) {
                if(err)
                {
                    res.status(statusCode).json(err);
                    return;
                }
                else if(statusJson)
                {
                    callback(null, null, statusJson);
                    return;
                }
            })
        }
    })
}
