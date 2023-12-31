const bcrypt = require('bcrypt');
const dal = require("./auth_db");
const saltRounds = 10;


const DEBUG = false;

//get all logins.
var getLogins = function() {
    if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log("logins.pg.dal.getLogins()");
    return new Promise(function(resolve, reject) {
        const sql = `SELECT id, username, password FROM public."Logins" \
        ORDER BY id DESC LIMIT 7;`
        dal.query(sql, [], (err, result) => {
            if (err) {
                if (DEBUG) console.log(err);
                reject(err);
            } else {
                resolve(result.rows);
            }
        });
    });
};

var getLoginByLoginId = function(id) {
    if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log("logins.pg.dal.getLoginByLoginId()");
    return new Promise(function(resolve, reject) {
        const sql = `SELECT id, username, password FROM public."Logins" WHERE id = $1`;
        dal.query(sql, [id], (err, result) => {
            if (err) {
                // logging should go here
                if (DEBUG) console.log(err);
                reject(err);
            } else {
                resolve(result.rows);
            }
        });
    });
};

var addLogin = function(username, password, first_name, last_name, email) {
    if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log("logins.pg.dal.addLogin()");
    return new Promise(function(resolve, reject) {

        const checkDuplicateSql = `SELECT id FROM public."Logins" WHERE username = $1;`;
        dal.query(checkDuplicateSql, [username], (checkErr, checkResult) => {
            if (checkErr) {
                if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log(checkErr);
                reject(checkErr);
            } else if (checkResult.rows.length > 0) {
                // Username already exists, reject the request
                const error = new Error("Duplicate username");
                reject(error);
            } else {
                bcrypt.hash(password, saltRounds, (hashErr, hash) => {
                    if (hashErr) {
                        if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log(hashErr);
                        reject(hashErr);
                    } else {
                        const sql = `INSERT INTO public."Logins"(username, password)
                VALUES ($1, $2)
                RETURNING id, username;`;
                        dal.query(sql, [username, hash], (err, result) => {
                            if (err) {
                                if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log(err);
                                reject(err);
                            } else {
                                const user_id = result.rows[0].id;
                                const username = result.rows[0].username;

                                const userSql = `
                    INSERT INTO public."Users"(user_id, first_name, last_name, email, username)
                    VALUES ($1, $2, $3, $4, $5);`

                                dal.query(userSql, [user_id, first_name, last_name, email, username], (userErr, userResult) => {
                                    if (userErr) {
                                        if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log(userErr);
                                        reject(userErr);
                                    } else {
                                        resolve(userResult.rows);
                                    }


                                });
                            }
                        });
                    }
                });
            }
        });
    });
};

var patchLogin = function(id, username, password) {
    if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log("logins.pg.dal.patchLogin()");
    return new Promise(function(resolve, reject) {
        const sql = `UPDATE public."Logins" SET username=$2, password=$3 WHERE id=$1;`;
        dal.query(sql, [id, username, password], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.rows);
            }
        });
    });
};

var deleteLogin = function(id) {
    if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log("logins.pg.dal.deleteLogin()");
    return new Promise(function(resolve, reject) {
        const sql = `DELETE FROM public."Logins" WHERE id = $1;`;
        dal.query(sql, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.rows);
            }
        });
    });
};
var getLoginByUsername = function(username) {
    if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log("logins.pg.dal.getLoginByUsername()");
    return new Promise(function(resolve, reject) {
        const sql = `SELECT id, username, password FROM public."Logins" WHERE username = $1`;
        dal.query(sql, [username], (err, result) => {
            if (err) {
                if (global.DEBUG || global.DAL_DEBUG || DEBUG) console.log(err);
                reject(err);
            } else {
                resolve(result.rows[0]); // Assuming there is only one user with the given username
            }
        });
    });
};


module.exports = {
    getLogins,
    getLoginByUsername,
    getLoginByLoginId,
    addLogin,
    deleteLogin,
    patchLogin,
}