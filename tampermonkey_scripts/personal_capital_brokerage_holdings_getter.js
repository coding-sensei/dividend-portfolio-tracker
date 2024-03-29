// ==UserScript==
// @name         Personal Capital Holdings Getter
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  This will create a button on the holdings tab so that the current positions (using Requests) can be copied to the clipboard as JSON for easy import to GoogleSheets or any other program!
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

function set_to_clipboard(text) {
    let temp = document.createElement('textarea');
    document.body.appendChild(temp);
    temp.value = text;
    temp.select();
    document.execCommand('copy');
    temp.remove();
}

function create_filtered_holdings(holdingsText) {
    var filteredHoldings = {"holdings": []};
    var unfilteredHoldings = JSON.parse(holdingsText);
    for (const holding of unfilteredHoldings["spData"]["holdings"]) {
        var stock = {
            "quantity": holding["quantity"],
			"costBasis": holding["costBasis"],
			"price": holding["price"],
			"holdingPercentage": holding["holdingPercentage"],
			"ticker": holding["ticker"],
			"value": holding["value"],
			"accountName": holding["accountName"],
			"holdingType": holding["holdingType"],
			"userAccountId": holding["userAccountId"],
			"exchange": holding["exchange"],
        };
        filteredHoldings["holdings"].push(stock);
    }

    return JSON.stringify(filteredHoldings);

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
                if(accountName === account["name"]) {
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

async function get_all_selected_account_ids() {
    accounts = jQuery('ul[class="menu menu--vertical menu--bordered menu--tiny js-account-selector-menu menu--right"] li').find(":checkbox")

    var account_id_list = [];
    accounts.each(function( index, element ) {
        console.log( index + ": checked: " + element.checked + " value: " + element.value );
        if(!isNaN(element.value) && element.checked) {
          console.log( "Is an account using: " + element.value + "\n");
          account_id_list.push(element.value);
        }
    });

    console.log("account id list");
    console.log(account_id_list);
    return account_id_list

}

function add_copy_button(function_call_on_click) {
      let searchObj = document.getElementsByClassName("pc-input-group  ")[0];
      let btn = document.createElement("button");
      btn.innerHTML = "Copy Holdings";
      btn.className = "copyBtn";
      btn.onclick = () => {
                function_call_on_click()
            }
      console.log(searchObj);

      searchObj.insertBefore(btn, searchObj[0]);
}

async function copy_single_holdings_account() {
    let account_id = await get_account_id()
    console.log("user account id tmp: " + account_id);

    let data = 'userAccountIds=%5B' + account_id + '%5D&' + 'lastServerChangeId=-1&csrf=' + csrf + '&apiClient=WEB'

    console.log(data);
    GM.xmlHttpRequest({
        method: "POST",
        url: "https://home.personalcapital.com/api/invest/getHoldings",
        data: data,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        onload: function(response) {
            console.log(response.responseText);
            set_to_clipboard(create_filtered_holdings(response.responseText));
            alert("Finished copying");
        }
    });
}

async function copy_all_holdings_account() {
    let account_ids = await get_all_selected_account_ids()
    console.log("user account id tmp: ");
    console.log(account_ids);

    let data = 'consolidateMultipleAccounts=true' + '&userAccountIds=%5B' + account_ids.join('%2C') + '%5D&' + 'lastServerChangeId=-1&csrf=' + csrf + '&apiClient=WEB'
    console.log("data being sent: " + data);

    console.log(data);
    GM.xmlHttpRequest({
        method: "POST",
        url: "https://home.personalcapital.com/api/invest/getHoldings",
        data: data,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        onload: function(response) {
            console.log(response.responseText);
            set_to_clipboard(create_filtered_holdings(response.responseText));
            alert("Finished copying");
        }
    });
}

function create_single_account_copy_button() {
      add_copy_button(copy_single_holdings_account)
}

function create_all_account_copy_button() {
      add_copy_button(copy_all_holdings_account)
}

waitForKeyElements (
      "#accountDetails > div > div.appTemplate > div.datagridSection > div > div.holdings-grid-table-client-container.tabular-numbers.js-holdings-grid-table-container > div",
      create_single_account_copy_button,
      false
);

waitForKeyElements (
      "#holdings > div > div.gridFrame.offset > div > div.holdings-grid-default-header > div.holdings-grid-table__groupBy-container.qa-holdings-grid-groupBy.pc-u-ml-",
      create_all_account_copy_button,
      false
);
