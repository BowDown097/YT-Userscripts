// ==UserScript==
// @name         Full Likes
// @namespace    http://tampermonkey.net/
// @version      1.2
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

// this observer disables the like count updating while watching a live stream because it messes with a bunch of things and we can't get full like count from it either
var likeObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        for (const node of mutation.addedNodes) {
            while (mutation.target.childNodes.length > 1) {
                mutation.target.removeChild(mutation.target.lastChild);
            }
        }
    });
});

waitForElement("#info ytd-toggle-button-renderer.style-text[is-icon-button]:first-child #text.ytd-toggle-button-renderer").then(function(elm) {
    likeObserver.observe(elm, {
        childList: true,
        subtree: true
    });
});

// thanks objectful
function getLikes() {
    const topLevelButtons = document.querySelector("ytd-app").data.response.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons[0];
    const buttonText = topLevelButtons.isToggled ? topLevelButtons.toggleButtonRenderer.toggledText : topLevelButtons.toggleButtonRenderer.defaultText;
    const likes = parseInt(buttonText.accessibility.accessibilityData.label.replace(/( likes|,)/g, ""));
    const likesTextElm = document.querySelector("#info ytd-toggle-button-renderer.style-text[is-icon-button]:first-child #text.ytd-toggle-button-renderer");
    likesTextElm.innerHTML = likes.toLocaleString();

    document.querySelector("ytd-toggle-button-renderer.style-scope:first-child").addEventListener("click", function() {
        const liked = likesTextElm.classList.contains("style-default-active");
        if (liked) {
            likesTextElm.innerHTML = (likes + 1).toLocaleString();
        } else {
            likesTextElm.innerHTML = likes.toLocaleString();
        }
    }, false);
}

async function getDislikes(elm) {
    await new Promise(resolve => setTimeout(resolve, 500)); // this is necessary because otherwise RYD will *sometimes* update the value after this does. would like to do a better way than this though
    const videoId = new URL(window.location.href).searchParams.get("v");
    let response = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`).then((response) => response.json()).catch();
    if (response === undefined || "traceId" in response) return;

    const dislikeText = document.querySelector("#info ytd-toggle-button-renderer.style-text[is-icon-button]:nth-child(2) #text.ytd-toggle-button-renderer");
    if (response.dislikes == 0 && response.likes == 0 && response.viewCount == 0) { // no ratings
        dislikeText.innerHTML = "";
        document.querySelector("#info ytd-toggle-button-renderer.style-text[is-icon-button]:first-child #text.ytd-toggle-button-renderer").innerHTML = "";
    } else { // we have ratings!
        dislikeText.innerHTML = response.dislikes.toLocaleString();
        document.querySelector("ytd-toggle-button-renderer.style-scope:nth-child(2)").addEventListener("click", async function() {
            const disliked = dislikeText.classList.contains("style-default-active");
            if (disliked) {
                dislikeText.innerHTML = (response.dislikes + 1).toLocaleString();
            } else {
                dislikeText.innerHTML = response.dislikes.toLocaleString();
            }
        }, false);
    }
}

async function setupCounts()
{
    waitForElement('#top-row.ytd-video-secondary-info-renderer').then(() => getLikes());
    waitForElement(".ryd-tooltip-bar-container").then(() => getDislikes());
}

(function() {
    'use strict';
    window.addEventListener("yt-page-data-updated", setupCounts, false);
})();
