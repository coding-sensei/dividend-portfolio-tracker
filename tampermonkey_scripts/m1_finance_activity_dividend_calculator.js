// ==UserScript==
// @name         M1 Finance Activities Dividend Calculator
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  This will create a button so that it can add up all of the dividends in the activity window!
// @author       Coding Sensei
// @include      /^https://dashboard\.m1\.com/d/invest/activity
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==


let styleSheet = `
.copyBtn {
	box-shadow:inset 0px 1px 0px 0px #caefab;
	background:linear-gradient(to bottom, #77d42a 5%, #5cb811 100%);
	background-color:#77d42a;
	border-radius:6px;
	border:1px solid #268a16;
	display:inline-block;
	cursor:pointer;
	color:#306108;
	font-family:Arial;
	font-size:15px;
	font-weight:bold;
	padding:6px 24px;
	text-decoration:none;
	text-shadow:0px 1px 0px #aade7c;
}
.copyBtn:hover {
	background:linear-gradient(to bottom, #5cb811 5%, #77d42a 100%);
	background-color:#5cb811;
}
.copyBtn:active {
	position:relative;
	top:1px;
}
`;

let s = document.createElement('style');
s.type = "text/css";
s.innerHTML = styleSheet;
(document.head || document.documentElement).appendChild(s);

function get_list_of_headers(headers_data) {
    var all_headers = [];
    for (const header of headers_data.childNodes) {
        all_headers.push(header.textContent);
    }

    return all_headers
}

function populate_activity_map(headers_list, row_data) {
    var info = new Map();
    for (var i = 0; i < headers_list.length; i++) {
        info.set(headers_list[i], row_data.childNodes[i].textContent);
    }

    return info
}

function get_activity_table_values(class_name_element) {
    let holdingsTable = document.getElementsByClassName(class_name_element)[0];

    var headers = get_list_of_headers(holdingsTable.childNodes[0]);
    let rows = Array.from(holdingsTable.childNodes).slice(1);

    var activities = [];
    for (const row of rows) {
        var activity_map = populate_activity_map(headers, row);
        activities.push(activity_map);
    }
    console.log(activities);

    return activities
}

function get_total_dividends_from_activities(activities) {
    var sum = 0;
    console.log("Debug 00");
    for (const activity of activities) {
        if(activity.get("Activity") == "Dividend") {
            console.log("Adding " + activity.get("Value") + " from " + activity.get("Summary"));
            var dividend = activity.get("Value").replace("+","").replace("$","");
            sum = sum + parseFloat(dividend);
            console.log("Current Total: " + sum);
        }
    }

    return sum
}

function calculate_dividend_amount() {
    var html_table_element = "table__StyledGridTable-ju5h8r-0 RaeLg";
    var current_activities = get_activity_table_values(html_table_element);
    var total = get_total_dividends_from_activities(current_activities)
    alert("Total Dividends on this page: $" + total);
}

function add_calc_button(function_call_on_click) {
    let searchObj = document.getElementsByClassName("style__filterCol__vGxVW style__root__15AZ1 style__sm8__1y6nR style__xs12__2rudP")[0];
    let btn = document.createElement("button");
    btn.innerHTML = "Calculate Dividends";
    btn.className = "copyBtn";
    btn.onclick = () => {
        function_call_on_click()
    }
    console.log(searchObj);

    searchObj.insertBefore(btn, searchObj[0]);
}

function create_calc_button() {
    add_calc_button(calculate_dividend_amount)
}

waitForKeyElements (
    "#root > div > div > div > div:nth-child(2) > div > div.style__root__2dfkG.style__constrain__-PeaO > div:nth-child(2) > div > div",
    create_calc_button,
    false
);
