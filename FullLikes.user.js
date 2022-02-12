// ==UserScript==
// @name         Full Likes
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Restore full like counts.
// @author       BowDown097
// @match        *://*.youtube.com/*
// @match        *://*.youtu.be/*
// @exclude      *://www.youtube.com/c/*
// @exclude      *://www.youtube.com/channel/*
// @exclude      *://www.youtube.com/user/*
// @icon         https://www.google.com/s2/favicons?domain=youtube.com
// ==/UserScript==

function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(document, {
            childList: true,
            subtree: true
        });
    });
}

async function getLikes() {
    const topLevelButtons = document.querySelector("ytd-app").data.response.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons[0];
    const buttonText = topLevelButtons.isToggled ? topLevelButtons.toggleButtonRenderer.toggledText : topLevelButtons.toggleButtonRenderer.defaultText;
    const likes = parseInt(buttonText.accessibility.accessibilityData.label.replace(/( likes|,)/g, "")).toLocaleString();
    document.querySelector("yt-formatted-string#text.ytd-toggle-button-renderer").innerHTML = likes;
}

async function getDislikes(elm) {
    await new Promise(resolve => setTimeout(resolve, 500)); // this is necessary because otherwise RYD will *sometimes* update the value after this does. would like to do a better way than this though
    const videoId = new URL(window.location.href).searchParams.get("v");
    let response = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`).then((response) => response.json()).catch();
    if (response === undefined || "traceId" in response) return;

    if (response.dislikes == 0 && response.likes == 0 && response.viewCount == 0) { // no ratings
        document.querySelector("ytd-toggle-button-renderer.style-scope:nth-child(2) > a:nth-child(1) > yt-formatted-string:nth-child(2)").innerHTML = "";
        document.querySelector("yt-formatted-string#text.ytd-toggle-button-renderer").innerHTML = "";
    } else { // we have ratings!
        document.querySelector("ytd-toggle-button-renderer.style-scope:nth-child(2) > a:nth-child(1) > yt-formatted-string:nth-child(2)").innerHTML = response.dislikes.toLocaleString();
    }
}

async function setupCounts()
{
    waitForElement('#top-row.ytd-video-secondary-info-renderer').then(function(elm) {
        getLikes();
    });

    waitForElement(".ryd-tooltip-bar-container").then(function(elm) {
        getDislikes();
    });
}

(function() {
    'use strict';
    window.addEventListener("yt-page-data-updated", setupCounts, false);
})();
