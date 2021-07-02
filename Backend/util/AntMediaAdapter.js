const logger = require("./logger");
const request = require('request');

class AntMediaAdapter {

    constructor(serverUrl) {
        this.serverUrl = serverUrl;
    }

    static get secretKey() { return 'Supernova2020' };

    get url() {
        return `${this.serverUrl}/LiveApp/rest/v2/broadcasts`
    }

    async save(params) {
        let option = {
            rejectUnauthorized: false,
            url: `${this.url}/create`,
            method: 'POST',
            json: true,
            body: params,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return await AntMediaAdapter.apiRequest(option, "post");
    }

    async load(streamId) {
        let option = {
            rejectUnauthorized: false,
            url: `${this.url}/${streamId}`,
            json: true,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return await AntMediaAdapter.apiRequest(option);
    }

    async delete(streamId) {
        let option = {
            rejectUnauthorized: false,
            url: `${this.url}/${streamId}`,
            json: true,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        await this.stop();
        return await AntMediaAdapter.apiRequest(option);
    }

    async stop(streamId) {
        let option = {
            rejectUnauthorized: false,
            url: `${this.url}/${streamId}/stop`,
            json: true,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return await AntMediaAdapter.apiRequest(option);
    }

    static apiRequest(option) {
        let response = { success: true, message: '' };
        return new Promise((res) => {
            try {
                request(option, (err, httpResponse, body) => {
                    let is404Error = httpResponse
                        ? httpResponse.statusCode == 404
                        : null;
                    if (err || is404Error) {
                        response.success = false;
                        response.message = is404Error ? "404 Not Found" : err.message
                        logger.error(`Media Server API Request: Error: ${err && err.message ? err.message : response && response.message ? response.message : ""}`);
                    }
                    res(Object.assign({}, response, body));
                });
            } catch (ex) {
                response.success = false;
                response.message.ex.message;
                logger.error(`Media Server API Request: Error: ${ex.message}`);
                res(response);
            }
        });
    }
}
module.exports = AntMediaAdapter;