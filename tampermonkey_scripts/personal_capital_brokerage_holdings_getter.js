// ==UserScript==
// @name         Personal Capital Holdings Getter Requests (Testing)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  This will create a button on the holdings tab so that the current positions can be copied to the clipboard as JSON for easy import to GoogleSheets or any other program!
// @author       Coding Sensei
// @include      /^https://home\.personalcapital\.com/page/login/app*/
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM.xmlHttpRequest
// ==/UserScript==


let styleSheet = `
.copyBtn {
    background-color: green;
    padding: 5px;
    font-size: 12px;
}
`;

let s = document.createElement('style');
s.type = "text/css";
s.innerHTML = styleSheet;
(document.head || document.documentElement).appendChild(s);


function get_list_of_headers(headers_data) {
    var all_headers = [];
    for (const header of headers_data.childNodes) {
        all_headers.push(header.text);
    }

    return all_headers
}

function populate_ticker_map(headers, ticker_data) {
    var info = new Map();

    for (const data of ticker_data.childNodes) {
        var text = data.childNodes[0].textContent;
        info.set(headers.shift(), text);
    }

    return info
}

function get_table_holdings() {

    let holdingsTable = document.getElementsByClassName("table table--hoverable table--primary table__body--primary pc-holdings-grid qa-datagrid-rows centi pc-holdings-grid--account-details table--actionable")[0];

    console.log(holdingsTable);

    var headers = get_list_of_headers(holdingsTable.childNodes[0]);
    let rows = holdingsTable.childNodes[1];
    let summary = holdingsTable.childNodes[2];


    var holdings = [];

    for (const row of rows.childNodes) {
        var ticker_map = populate_ticker_map(headers.slice(0), row);
        holdings.push(ticker_map);
    }

    console.log(holdings);
    console.log(convert_holdings_to_json(holdings));

    return holdings
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


function get_json_holdings() {

    let data = '%5B79701341%5D&' + 'lastServerChangeId=-1&csrf=' + csrf + '&apiClient=WEB'
    console.log(data);
    GM.xmlHttpRequest({
        method: "POST",
        url: "https://home.personalcapital.com/api/invest/getHoldings",
        data: data,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        onload: function(response) {
            console.log(response.responseText);
        }
    });
    var json_holdings = {
        holdings:[]
    };
    for (const stock of positions) {
        json_holdings.holdings.push(mapToObj(stock));
    }

    return JSON.stringify(json_holdings)
}

function set_to_clipboard(text) {
    let temp = document.createElement('textarea');
    document.body.appendChild(temp);
    temp.value = text;
    temp.select();
    document.execCommand('copy');
    temp.remove();
}

async function get_account_id() {

    let accountName = document.querySelector("#accountDetails > div > div.appTemplate > div.detailsSection > div > div.nav-secondary.js-secondary-nav > div:nth-child(2) > div.account-details-account-name.js-account-details-account-name.js-closed-text").textContent;
    console.log("accountName found on html page: " + accountName);

    let data = 'lastServerChangeId=-1&csrf=' + csrf + '&apiClient=WEB'
    console.log(data);
		let user_account_id
    await GM.xmlHttpRequest({
        method: "POST",
        url: "https://home.personalcapital.com/api/newaccount/getAccounts2",
        data: data,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        onload: function(response) {
            console.log("Getting account id:");
            console.log(response.responseText);

            var accounts = JSON.parse(response.responseText);
            for (const account of accounts["spData"]["accounts"]) {
                console.log("account name key: " + account["name"] + " account id: " + account["userAccountId"]);
                if(accountName == account["name"]) {
                  user_account_id = account["userAccountId"];
                  break;
                }
            }

            console.log("Done Getting account id");
            console.log("final user account id: " + user_account_id);
        }
    });

    return user_account_id

}


async function copy() {

    let account_id = await get_account_id()
    console.log("user account id tmp: " + account_id);

//    let data = 'lastServerChangeId=-1&csrf=' + csrf + '&apiClient=WEB'
//    let data = 'userAccountIds=%5B79701341%5D&' + 'lastServerChangeId=-1&csrf=' + csrf + '&apiClient=WEB'
    let data = 'userAccountIds=%5B' + account_id + '%5D&' + 'lastServerChangeId=-1&csrf=' + csrf + '&apiClient=WEB'

    console.log(data);
    GM.xmlHttpRequest({
        method: "POST",
        url: "https://home.personalcapital.com/api/invest/getHoldings",
        data: data,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        onload: function(response) {
            console.log(response.responseText);
            set_to_clipboard(response.responseText);
            alert("Finished copying");
        }
    });

}

function add_copy_button() {

    let searchObj = document.getElementsByClassName("pc-input-group  pc-input-group--with-prefix")[0];
    let btn = document.createElement("button");
    btn.innerHTML = "Copy Holdings";
    btn.className = "copyBtn";
    btn.onclick = () => {
        copy();
    }
    console.log(searchObj);

    searchObj.insertBefore(btn, searchObj[0]);
}

waitForKeyElements (
    "#accountDetails > div > div.appTemplate > div.datagridSection > div > div:nth-child(1) > div > div > div > label",
    add_copy_button,
    false
);
