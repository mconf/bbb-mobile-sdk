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
        const throttleRequests = () => {
            // wait for any errors to accumulate
            this.currentThrottleTimeout = setTimeout(() => {
                const recs = this.recordsAsArray();
                if (recs.length) {
                    // A batch we cannot send must cost us that batch, not the
                    // stream: throwing here skips onreadystatechange, so the
                    // records would never be cleared and nothing would re-arm.
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
                                this.records = {};
                                throttleRequests();
                            }
                        };
                        xhr.open(method, this.url);
                        for (const [name, value] of Object.entries(this.headers)) {
                            xhr.setRequestHeader(name, value);
                        }
                        xhr.withCredentials = withCredentials;
                        xhr.send(JSON.stringify(recs, bigIntSafeReplacer));
                    } catch (error) {
                        this.records = {};
                        throttleRequests();
                    }
                } else {
                    throttleRequests();
                }
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
