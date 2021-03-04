// ==UserScript==
// @name         Personal Capital Holdings Getter
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  This will create a button on the holdings tab so that the current positions can be copied to the clipboard as JSON for easy import to GoogleSheets or any other program!
// @author       Coding Sensei
// @include      /^https://home\.personalcapital\.com/page/login/app*/
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
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

function get_table_holdings(class_name_element) {

    let holdingsTable = document.getElementsByClassName(class_name_element)[0];

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

function add_copy_button(function_call_on_click) {
    let searchObj = document.getElementsByClassName("pc-input-group  pc-input-group--with-prefix")[0];
    let btn = document.createElement("button");
    btn.innerHTML = "Copy Holdings";
    btn.className = "copyBtn";
    btn.onclick = () => {
        function_call_on_click()
        alert("Finished copying");
    }
    console.log(searchObj);

    searchObj.insertBefore(btn, searchObj[0]);
}

function copy_single_holdings_account() {
    var html_table_element = "table table--hoverable table--primary table__body--primary pc-holdings-grid qa-datagrid-rows centi pc-holdings-grid--account-details table--actionable";
    let temp = document.createElement('textarea');
    document.body.appendChild(temp);
    var holdings = get_table_holdings(html_table_element);
    temp.value = convert_holdings_to_json(holdings);
    temp.select();
    document.execCommand('copy');
    temp.remove();
}

function copy_all_holdings_account() {
    var html_table_element = "table table--hoverable table--primary table__body--primary pc-holdings-grid qa-datagrid-rows centi  table--actionable";
    let temp = document.createElement('textarea');
    document.body.appendChild(temp);
    var holdings = get_table_holdings(html_table_element);
    temp.value = convert_holdings_to_json(holdings);
    temp.select();
    document.execCommand('copy');
    temp.remove();
}

function create_single_account_copy_button() {
    add_copy_button(copy_single_holdings_account)
}

function create_all_account_copy_button() {
    add_copy_button(copy_all_holdings_account)
}

waitForKeyElements (
    "#accountDetails > div > div.appTemplate > div.datagridSection > div > div.pc-search-input.pc-u-pl-",
    create_single_account_copy_button,
    false
);

waitForKeyElements (
    "#holdings > div > div.gridFrame.offset > div > div.pc-search-input.pc-u-pl-",
    create_all_account_copy_button,
    false
);

