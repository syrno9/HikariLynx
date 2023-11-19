"use strict";

var thread = require("../../engine/postingOps").thread;
var post = require("../../engine/postingOps").post;

exports.engineVersion = "2.5";

exports.checkAndApplyFortune = function(parameters) {

    if (!parameters.email || parameters.email.toLowerCase() !== "fortune") {
        return;
    }

    var fortunes = [
        "Your fortune: Excellent Luck",
        "Your fortune: Good Luck",
        "Your fortune: Average Luck",
        "Your fortune: Bad Luck",
        "Your fortune: Better not tell you now",
        "Your fortune: Outlook good",
        "Your fortune: Very Bad Luck",
        "Your fortune: Godly Luck",
        "Your fortune: (YOU ARE BANNED)",
        "ｷﾀ━━━(ﾟ∀ﾟ)━━━!!"
    ];

    var index = Math.floor(Math.random() * fortunes.length);
    var fortune = fortunes[index];
    var fortuneClass = "";

    switch (fortune) {
        case "Your fortune: Excellent Luck":
            fortuneClass = "excellentLuck";
            break;
        case "Your fortune: Good Luck":
            fortuneClass = "goodLuck";
            break;
        case "Your fortune: Average Luck":
            fortuneClass = "averageLuck";
            break;
        case "Your fortune: Bad Luck":
            fortuneClass = "badLuck";
            break;
        case "Your fortune: Better not tell you now":
            fortuneClass = "tellYouNow";
            break;
        case "Your fortune: Outlook good":
            fortuneClass = "outlookGood";
            break;
        case "Your fortune: Very Bad Luck":
            fortuneClass = "veryBadLuck";
            break;
        case "Your fortune: Godly Luck":
            fortuneClass = "godlyLuck";
            break;
        case "Your fortune: (YOU ARE BANNED)":
            fortuneClass = "youAreBanned";
            break;
        default:
            fortuneClass = "divFortune";
    }

    parameters.markdown += `\n\n<div class="${fortuneClass}">${fortune}</div>`;

    // prevent recursive calls
    parameters.email = null;

};

exports.init = function() {

    var oldCreatePost = post.createPost;

    post.createPost = function(req, parameters, newFiles, userData, postId, thread, board, wishesToSign, enabledCaptcha, cb) {

        exports.checkAndApplyFortune(parameters);

        oldCreatePost(req, parameters, newFiles, userData, postId, thread, board, wishesToSign, enabledCaptcha, cb);

    };

    var oldCreateThread = thread.createThread;

    thread.createThread = function(req, userData, parameters, newFiles, board, threadId, wishesToSign, enabledCaptcha, callback) {

        exports.checkAndApplyFortune(parameters);

        oldCreateThread(req, userData, parameters, newFiles, board, threadId, wishesToSign, enabledCaptcha, callback);

    };

};
