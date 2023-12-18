const dal = require("./flights_db.js");

const getFlights = function() {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM flights";
        dal.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result.rows);
            }
        });
    });
};

const getFlightById = function(flightId) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM flights WHERE flight_id = $1";
        dal.query(sql, [flightId], (err, result) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result.rows[0]);
            }
        });
    });
};

const getFlightsByStatus = function(flightStatus) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM flights WHERE status = $1";
        dal.query(sql, [flightStatus], (err, result) => {
            if (err) {
                console.error(err);
                reject({ error: "Database query failed", details: err });
            } else {
                resolve(result.rows);
            }
        });
    });
};


module.exports = {
    getFlights,
    getFlightById,
    getFlightsByStatus,
};