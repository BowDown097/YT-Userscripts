// ==UserScript==
// @name         Classic Search
// @namespace    http://tampermonkey.net/
// @homepage     https://github.com/BowDown097/YT-Userscripts
// @version      0.1
// @description  Restoration of the 2019 search
// @author       BowDown097
// @match        *://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// @run-at       document-start
// @grant        none
// ==/UserScript==

function addStyle(css) {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    const head = document.getElementsByTagName('head')[0];
    if (head) head.appendChild(style);
    else document.documentElement.appendChild(style);
}

(function() {
    window['yt'] = window['yt'] || {};
    yt['config_'] = yt.config_ || {};
    yt.config_['SBOX_SETTINGS'] = yt.config_.SBOX_SETTINGS || {};

    var iv = setInterval(function() {
        yt.config_.SBOX_SETTINGS.IS_POLYMER = false;
        yt.config_.SBOX_JS_URL = "https://www.youtube.com/yts/jsbin/www-searchbox-vflo1t401/www-searchbox.js";
    }, 1);

    var to = setTimeout(function() {
        clearInterval(iv);
    }, 1000);
})();

addStyle(`
html[dark] .sbdd_b,
html[dark] .sbsb_a
{
    background: hsl(0, 0%, 7%) !important;
    color: hsla(0, 100%, 100%, 0.88) !important;
}

html[dark] .sbsb_d
{
    background: hsla(0, 0%, 100%, 0.08) !important;
}

html[dark] .sbdd_b
{
    border: 1px solid hsla(0, 0%, 53.3%, 0.4) !important;
    border-top-style: none !important;
}

.sbfl_b
{
    display: none;
}

ytd-searchbox.ytd-masthead
{
    max-width: 650px;
}

#masthead #search-form.ytd-searchbox,
#masthead #search-icon-legacy.ytd-searchbox
{
    height: 29px;
}

div.gstl_50
{
    min-width: 584px !important;
}

.sbdd_a
{
    top: 38px !important;
}

#search-icon-legacy.ytd-searchbox
{
    width: 66px;
}
`);
