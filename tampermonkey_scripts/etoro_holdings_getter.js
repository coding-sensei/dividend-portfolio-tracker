// ==UserScript==
// @name         Etoro Holdings Getter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  This will create a button on the portfolio tab so that the current positions can be copied to the clipboard as JSON for easy import to GoogleSheets or any other program!
// @author       Coding Sensei
// @author.      github.com/sirkro
// @match        https://www.etoro.com/portfolio
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==




let styleSheet = `
.copyBtn {
    vertical-align: middle;
    padding: 15px;
    display: inline-block;
    border: 1px solid #0079B9;
}
`;

let s = document.createElement('style');
s.type = "text/css";
s.innerHTML = styleSheet;
(document.head || document.documentElement).appendChild(s);


function get_list_of_headers() {
    var all_headers = [];

    // Market
    all_headers.push("Holding");
    // Units
    all_headers.push("Shares");
    // Avg. Open
    all_headers.push("Price");
    all_headers.push("Value");
    all_headers.push("1 Day $");
    all_headers.push("1 Day %");

    return all_headers
}

function populate_ticker_map(headers, row) {
    var info = new Map();

    var market = row.getElementsByClassName("table-first-name")[0].textContent.trim();
    var shares = row.querySelector("a > ui-table-body-slot > ui-table-cell:nth-child(1) > div > span").textContent.trim().replace(/,/g, "");
    var invested = row.querySelector("a > ui-table-body-slot > ui-table-cell:nth-child(3) > span").textContent.trim().replace(/,/g, "").replace(/\$/g, "");
    var price = invested / shares;
    var value = row.querySelector("a > ui-table-body-slot > ui-table-cell:nth-child(6) > span").textContent.trim();

    info.set(headers[0], market);
    info.set(headers[1], shares);
    info.set(headers[2], "$" + price);
    info.set(headers[3], value);
    info.set(headers[4], "");
    info.set(headers[5], "");

    return info
}

function removeCharacters(str, chrs) {
    for(const chr in chrs) {
        str = str.replace(chr, '');
    }
    return str;
}

function get_table_holdings() {
    let holdingsTableRows = document.getElementsByClassName("ui-table-row buy");
    var headers = get_list_of_headers();
    var holdings = [];

    for (const row of holdingsTableRows) {
        var ticker_map = populate_ticker_map(headers, row);
        holdings.push(ticker_map);
    }

    return holdings;
}

function mapToObj (map) {
    return [...map].reduce((acc, val) => {
        acc[val[0]] = val[1];
        return acc;
    }, {});
}

function convert_holdings_to_json(positions) {
    var json_holdings = {
        holdings:[]
    };
    for (const stock of positions) {
        json_holdings.holdings.push(mapToObj(stock));
    }

    return JSON.stringify(json_holdings)
}

function copy() {

    let temp = document.createElement('textarea');
    document.body.appendChild(temp);
    var holdings = get_table_holdings();
    temp.value = convert_holdings_to_json(holdings);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    }

function add_copy_button() {
    let searchObj = document.getElementsByClassName("table-tab-menu ng-scope")[0];
    let btn = document.createElement("button");
    btn.innerHTML = "Copy Holdings";
    btn.className = "copyBtn";
    btn.onclick = () => {
        if (!document.URL.indexOf("manual") == -1) {
            alert("You must open portfolio to copy");
        } else {
            copy()
            alert("Portfolio copied to clipboard");
        }
    }

    searchObj.insertBefore(btn, searchObj[0]);
}

waitForKeyElements (
    "body > ui-layout > div > div > div.main-app-view.ng-scope > div > div.p-portfolio-header > div > div > div.filter.dropdown-menu.ng-scope",
    add_copy_button,
    false
);
