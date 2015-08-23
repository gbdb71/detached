"use strict";

GG.Cookies = {
    get: function(name, defaultValue) {
        var nameEq = name + "=";
        var cookieParts = document.cookie.split(';');
        for (var i = 0; i < cookieParts.length; i++) {
            var cookiePart = cookieParts[i];
            while (cookiePart.charAt(0) == ' ')
                cookiePart = cookiePart.substring(1, cookiePart.length);
            if (cookiePart.indexOf(nameEq) == 0)
                return cookiePart.substring(nameEq.length, cookiePart.length);
        }
        return defaultValue;
    },
    set: function(name, value) {
        document.cookie = name + "=" + value +  "; path=/";
    }
};
