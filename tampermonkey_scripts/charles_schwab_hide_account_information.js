// ==UserScript==
// @name         Charles Schwab Hide Account Information
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Hide Important information from Charles Schwab page when recording videos
// @author       Coding Sensei
// @match        https://client.schwab.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-end
// ==/UserScript==

setInterval(hide_account_info, 50);

function hide_account_info() {

	// Let's say my name was John Smith
	// My account number was 1234-5678
	// My bank name is REGIONS
	// Just add the sub strings of the stuff that you want hidden
    var replaceArry = [
        [/JOHN SMITH/gi, '****'],
        [/JOHN S/gi, '****'],
        [/JOHN/gi, '****'],
        [/1234-5678/gi, '****'],
        [/...678/gi, '...***'],
        [/REGIONS/gi, '****'],
        // etc.
    ];
    var numTerms = replaceArry.length;
    var txtWalker = document.createTreeWalker (
        document.body,
        NodeFilter.SHOW_TEXT,
        { acceptNode: function (node) {
            //-- Skip whitespace-only nodes
            if (node.nodeValue.trim() ) {
                return NodeFilter.FILTER_ACCEPT;
            }

            return NodeFilter.FILTER_SKIP;
        }
        },
        false
    );
    var txtNode = null;

    while (txtNode = txtWalker.nextNode () ) {
        var oldTxt = txtNode.nodeValue;

        for (var J = 0; J < numTerms; J++) {
            oldTxt = oldTxt.replace (replaceArry[J][0], replaceArry[J][1]);
        }
        txtNode.nodeValue = oldTxt;
    }

}
