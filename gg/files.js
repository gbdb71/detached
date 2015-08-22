"use strict";

GG.Files = {
    loadString: function (url, onSuccess, onError) {
        GG.Files.load(url, "text", onSuccess, onError);
    },
    loadArrayBuffer: function (url, onSuccess, onError) {
        GG.Files.load(url, "arraybuffer", onSuccess, onError);
    },
    load: function (url, responseType, onSuccess, onError) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = responseType;
        request.onload = function (e) {
            if (request.readyState === 4) {
                if (request.status === 200)
                    onSuccess(request.response);
                else if (onError)
                    onError(url + ": " + request.status + " - " + request.statusText);
                else
                    console.error(url, request.status, request.statusText);
            }
        };
        request.onerror = function (e) {
            if (onError)
                onError(url + ": " + request.status + " - " + request.statusText);
            else
                console.error(url, request.status, request.statusText);
        };
        request.send();
    }
};
