// ==UserScript==
// @name         Charles Schwab Dividend Calculator
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  This will create a button so that it can add up all of the dividends in the transaction window!
// @author       Coding Sensei
// @include      https://client.schwab.com/app/accounts/history/
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

function get_list_of_headers(headers_data) {
    var all_headers = [];
    for (var j = 0, col; col = headers_data.cells[j]; j++) {
        console.log(col.innerText);
        all_headers.push(col.innerText);
    }
    return all_headers
}

function populate_transaction_map(headers_list, row_data) {
    var info = new Map();
    for (var i = 0; i < headers_list.length; i++) {
        info.set(headers_list[i], row_data.cells[i].textContent);
    }

    return info
}

function get_transaction_table_values(class_name_element) {
    var table = document.getElementsByClassName("sdps-table sdps-table--bordered")[0];
    var headers = get_list_of_headers(table.rows[0]);
    console.log(headers);

    var transactions = [];
    for (var i = 1, row; row = table.rows[i]; i++) {
        var transaction_map = populate_transaction_map(headers, row);
        transactions.push(transaction_map);
    }
    console.log(transactions);

    return transactions
}

function is_transaction_a_dividend(transaction) {
    if(transaction.get("Action").includes("Div")) {
        console.log("Transaction has Div in Action column!")
        var columns_to_check = ["Price", "Quantity", "Fees & Comm"]
        for (const column of columns_to_check) {
            console.log(column)
            console.log(transaction.get(column).trim())
            if(transaction.get(column).trim() != "") {
                console.log("Transaction column: " + column + " does not dividend criteria... returning false")
                return false
            }
        }
        console.log("Transaction is a dividend... returning true")
        return true
    } else {
        console.log("Transaction does not have Div in Action column... returning false")
        return false
    }
}

function get_total_dividends_from_transactions(transactions) {
    var sum = 0;
    var transactions_added = [];
    for (const transaction of transactions) {
        console.log(transaction);
        if(is_transaction_a_dividend(transaction)) {
            var msg = "Adding " + transaction.get("Amount") + " from " + transaction.get("Symbol / Description*");
            console.log(msg);
            transactions_added.push(msg);
            var dividend = transaction.get("Amount").replace("$","");
            sum = sum + parseFloat(dividend);
            console.log("Current Total: " + sum);
        }
    }

    console.log("All transactions added: ");
    console.log(transactions_added);
    return sum.toFixed(2)
}

function calculate_dividend_amount() {
    var html_table_element = "sdps-table sdps-table--bordered table sdps-table--responsive";
    var current_transactions = get_transaction_table_values(html_table_element);
    var total = get_total_dividends_from_transactions(current_transactions)
    alert("Total Dividends on this page: $" + total);
}

function add_calc_button(function_call_on_click) {
    let searchObj = document.getElementsByClassName("sdps-button sdps-button--secondary")[0];
    let btn = document.createElement("button");
    btn.innerHTML = "Calculate Dividends";
    btn.className = "sdps-button sdps-button--secondary";
    btn.onclick = () => {
        function_call_on_click()
    }
    console.log(searchObj);

    searchObj.after(btn, searchObj);
}

function create_calc_button() {
    add_calc_button(calculate_dividend_amount)
}

waitForKeyElements (
    "#dropdown-form > app-search-button > div > sdps-button",
    create_calc_button,
    false
);
