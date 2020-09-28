'use strict';

class MockRouteBuilderBase {
    constructor() {
        this.reset();
    }
    reset() {
        this.req = null;
        this.res = null;
        this.configRecord = null;
        this.headers = [];
        this.cookies = [];
        this.err = null;
        this.status = null;
    }
    defaultResponse(req, res) {
        this.req = req;
        this.res = res;
    };
    addHeaders(configRecord, req, res) {
        this.configRecord = configRecord;
        if (configRecord.headers && configRecord.headers.length) this.headers = this.headers.concat(configRecord.headers);
        this.res = res;
    }
    addCookies(configRecord, req, res) {
        this.configRecord = configRecord;
        if (configRecord.cookies && configRecord.cookies.length) this.cookies = this.cookies.concat(configRecord.cookies);
        this.res = res;
    }
    sendErrorResponse(error, res, status) {
        this.err = error;
        this.res = res;
        this.status = status;
    }
}

module.exports = MockRouteBuilderBase;
