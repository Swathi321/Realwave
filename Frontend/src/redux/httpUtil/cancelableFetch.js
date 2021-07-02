export default {
    makeCancelable: (promise, timeout) => {
        let hasCanceled_ = false;
        let timer = null;

        const wrappedPromise = new Promise((resolve, reject) => {
            promise.then((val) => {
                clearTimeout(timer);
                hasCanceled_ ? reject({
                    isCanceled: true
                }) : resolve(val)
            }, (error) => {
                clearTimeout(timer);
                hasCanceled_ ? reject({
                    isCanceled: true
                }) : reject(error)
            });
            if (timeout > 0) {
                timer = setTimeout(function () {
                    hasCanceled_ = true;
                    reject({
                        isTimedOut: true,
                        isCanceled: hasCanceled_
                    });
                }, timeout)
            }
        });

        wrappedPromise.cancel = function () {
            hasCanceled_ = true;
            clearTimeout(timer);
        };

        return wrappedPromise;
    }
};