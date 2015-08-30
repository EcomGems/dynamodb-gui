var debug = require('debug')('main');

module.exports = {
    userStats: userStats,
    serverHealth: serverHealth
};

function calculateApiHealth(original, current) {
    current = current.trim();
    current = current.split(' ');

    current.forEach(function(val) {
        if (!original[val]) {
            original[val] = 1;
        } else {
            original[val]++;
        }
    })
    return original;
}

function serverHealth(data) {
    var response = {};
    data.forEach(function(val) {
        if (!response[val.env]) {
            response[val.env] = {
                success: 0,
                error: 0,
                ratio: 0,
                total: 0,
                apiList: []
            };
        }
        if (val.userStatus === 'OK') {
            response[val.env].success++;
        } else if (val.userStatus !== 'unknown') {
            response[val.env].error++;
            response[val.env].apiList = calculateApiHealth(response[val.env].apiList, val.userStatus);
        }
    });

    for (var key in response) {
        if (response[key].success + response[key].error > 0) {
            response[key].ratio = Math.floor(100 * response[key].success / (response[key].success + response[key].error));
        }
        response[key].total = response[key].success + response[key].error;
    }

    return response;
}

function userStats(data) {
    var response = {
        totalUsers: 0,
        numberInt: 0,
        numberDev: 0,
        intOk: 0,
        devOk: 0,
        intError: 0,
        devError: 0,
        intPercent: 0,
        devPercent: 0,
        lastUpdate: null,
        lastOk: null,
        lastDevOk: null,
        lastIntOk: null,
    };
    data.forEach(function(val) {
        response.totalUsers++;
        if (val.env === 'dev') {
            response.numberDev++;
            if (val.userStatus === 'OK') {
                response.devOk++;
            } else if (val.userStatus !== 'unknown') {
                response.devError++;
            }
            if (!response.lastDevOk || (val.userStatus === 'OK' && new Date(response.lastDevOk).getTime() < new Date(val.updateDate).getTime())) {
                response.lastDevOk = val.updateDate;
            }
        } else if (val.env === 'int') {
            response.numberInt++;
            if (val.userStatus === 'OK') {
                response.intOk++;
            } else if (val.userStatus !== 'unknown') {
                response.intError++;
            }
            if (!response.lastIntOk || (val.userStatus === 'OK' && new Date(response.lastIntOk).getTime() < new Date(val.updateDate).getTime())) {
                response.lastIntOk = val.updateDate;
            }
        }
        if (!response.lastUpdate || new Date(response.lastUpdate).getTime() < new Date(val.updateDate).getTime()) {
            response.lastUpdate = val.updateDate;
        }

        if (!response.lastOk || (val.userStatus === 'OK' && new Date(response.lastOk).getTime() < new Date(val.updateDate).getTime())) {
            response.lastOk = val.updateDate;
        }
    });

    response.intPercent = Math.floor(100 * response.intOk / (response.intOk + response.intError));
    response.devPercent = Math.floor(100 * response.devOk / (response.devOk + response.devError));
    return response;
}
