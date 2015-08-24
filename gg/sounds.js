"use strict";

GG.Sounds = {
    getContext: function () {
        if ("AudioContext" in window)
            return new window.AudioContext();
        else if ("webkitAudioContext" in window)
            return new window.webkitAudioContext();
    },
    loadSound: function (audioContext, url, onSuccess, onError) {
        GG.Files.loadArrayBuffer(url, function (response) {
            audioContext.decodeAudioData(response, onSuccess, onError);
        }, onError);
    },
    playSound: function (audioContext, buffer) {
        if (buffer !== undefined) {
            var source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            if ("start" in source)
                source.start(0);
            else if ("noteOn" in source)
                source.noteOn(0);
        }
    }
};
