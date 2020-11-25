var SPREADSHEET_ID = "UPDATE THIS WITH YOUR GOOGLE SHEET ID";
var TICKER_SHEET_NAME = "tickers";
var DIVIDEND_SHEET_NAME = "latest_dividends";
var HOLDINGS_SHEET_NAME = "Holdings";
var SETTINGS_SHEET_NAME = "Settings";


function initMenu() {
    var ui = SpreadsheetApp.getUi();
    var menu = ui.createMenu("Portfolio Tools");
    menu.addItem("Update Portfolio Holdings", "populate_holdings");
    menu.addItem("Get Latest Dividends", "get_latest_dividends");
    menu.addToUi();
}

function onOpen() {
    initMenu();
}
