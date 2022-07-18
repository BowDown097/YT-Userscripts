// ==UserScript==
// @name        Show Video Tags
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @grant       none
// @version     1.0
// @author      BowDown097
// @description Shows YouTube video tags in the description.
// @icon        https://www.google.com/s2/favicons?domain=youtube.com
// ==/UserScript==

function createDescriptionSection(items, tags) {
    const sectionRenderer = document.createElement("ytd-video-description-course-section-renderer"); 
    sectionRenderer.className = "style-scope ytd-structured-description-content-renderer";
    items.appendChild(sectionRenderer);
    
    const title = sectionRenderer.querySelector("#title");
    title.innerHTML = "Tags: " + tags.join(", ");
    title.style = "font-size: inherit; line-height: inherit; max-height: fit-content";
}

function showTags() {
    if (window.location.pathname != "/watch")
        return;

    const tags = document.querySelector("ytd-app").data.playerResponse.videoDetails.keywords;
    if (tags.length == 0)
        return;

    const descContent = document.querySelector("#items.ytd-structured-description-content-renderer");
    if (descContent !== null) {
        createDescriptionSection(descContent, tags);
    } else {
        const customDescContent = document.createElement("ytd-structured-description-content-renderer");
        customDescContent.className = "style-scope ytd-video-secondary-info-renderer";
        customDescContent.setAttribute("inline-structured-description", "");
        
        const customItems = document.createElement("div");
        customItems.id = "items";
        customItems.className = "style-scope ytd-structured-description-content-renderer";
        
        createDescriptionSection(customItems, tags);
    }
}

(function() {
    'use strict';
    window.addEventListener("yt-page-data-updated", showTags, false);
})();
