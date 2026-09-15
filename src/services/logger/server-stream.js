/*
 * This is an almost identical port of
 * https://raw.githubusercontent.com/philmander/browser-bunyan/v1.8.0/packages/server-stream/src/index.js
 *
 * Minimal changes to get it working on react-native + allow for URL overriding
 * after the logger is created
 */

const userAgent = typeof window !== 'undefined' ? window?.navigator?.userAgent : 'no-window';
const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

const defaultHeaders = { 'Content-Type': 'application/json' };

// JSON.stringify throws on BigInt, which reaches us through protobuf int64
// fields in the LiveKit SDK log context.
const bigIntSafeReplacer = (key, value) => (typeof value === 'bigint' ? value.toString() : value);

export class ServerStream {
    constructor(opts = {}) {
        const {
            method = 'PUT',
            url = '/log',
            headers = {},
            throttleInterval = 3000,
            withCredentials = false,
            onError,
            writeCondition = ServerStream.defaultWriteCondition,
        } = opts;

        this.writeCondition = writeCondition;
        this.records = {};

        this.headers = { ...defaultHeaders, ...headers };
        this.url = url;

        this.start({ method, throttleInterval, withCredentials, onError });
    }

    start({ method, throttleInterval, withCredentials, onError }) {
        const send = (url, recs) => new Promise((resolve) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 400) {
                            if (typeof onError === 'function') {
                                onError.call(this, recs, xhr);
                            } else {
                                // Do nothing - muffle the logs for the time being - prlanzarin
                                //console.warn('Browser Bunyan: A server log write failed');
                            }
                        }
                        resolve();
                    }
                };
                xhr.open(method, url);
                for (const [name, value] of Object.entries(this.headers)) {
                    xhr.setRequestHeader(name, value);
                }
                xhr.withCredentials = withCredentials;
                xhr.send(JSON.stringify(recs, bigIntSafeReplacer));
            } catch (error) {
                resolve();
            }
        });

        const throttleRequests = () => {
            // wait for any errors to accumulate
            this.currentThrottleTimeout = setTimeout(() => {
                const recs = this.recordsAsArray();
                if (!recs.length) {
                    throttleRequests();
                    return;
                }

                // Records may target different endpoints (a record pins its own
                // `endpointURL`, see ServerLoggerStream.write): group and post one
                // request per endpoint. Records written while these requests are
                // in flight go to the next batch instead of being dropped.
                this.records = {};
                const groups = new Map();
                recs.forEach((rec) => {
                    const url = rec.endpointURL || this.url;
                    if (!groups.has(url)) groups.set(url, []);
                    groups.get(url).push(rec);
                });

                Promise.all(Array.from(groups.entries()).map(([url, group]) => send(url, group)))
                    .then(throttleRequests, throttleRequests);
            }, throttleInterval);
        };

        throttleRequests();
    }

    stop() {
        setTimeout(() => {
            if (this.currentThrottleTimeout) {
                clearTimeout(this.currentThrottleTimeout);
                this.currentThrottleTimeout = null;
            }
        }, 1);
    }

    write(rec) {
        rec.url = typeof window !== 'undefined' && window?.location?.href;
        rec.userAgent = userAgent;
        if (this.currentThrottleTimeout && this.writeCondition(rec)) {
            if (this.records[rec.msg]) {
                this.records[rec.msg].count++;
            } else {
                rec.count = 1;
                this.records[rec.msg] = rec;
            }
        }
    }

    recordsAsArray() {
        return Object.keys(this.records).map(errKey => this.records[errKey]);
    }

    static defaultWriteCondition() {
        return window?.navigator?.onLine && !isBot;
    }
}
