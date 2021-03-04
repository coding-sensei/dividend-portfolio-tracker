function populate_holdings() {
  Logger.log("Populating Holdings")

  var settings = get_settings();
  var holdings = JSON.parse(settings["Portfolio Holdings"])["holdings"];

  var excluded_holdings = settings["Dividend Suspended Holdings"].split(',');
  Logger.log("Holdings to exclude:");
  Logger.log(excluded_holdings);


  var latest_div_data = get_latest_dividends_data();

  for (var i=0; i < holdings.length; i++) {
    ticker_name = holdings[i]["Holding"];

    annual_payout = latest_div_data[ticker_name] != null ? latest_div_data[ticker_name]["AnnualPayout"] : 0;
    holdings[i]["Annual Payout"] = annual_payout;

    dividend_payout = latest_div_data[ticker_name] != null ? latest_div_data[ticker_name]["DividendAmount"] : 0;
    holdings[i]["Dividend Amount"] = dividend_payout;

    holdings[i]["Projected Payout"] = holdings[i]["Shares"] * holdings[i]["Annual Payout"];

    if(excluded_holdings.indexOf(ticker_name) > -1) {
      holdings[i]["Dividend Suspended"] = true;
    }
    else
    {
      holdings[i]["Dividend Suspended"] = false;
    }
  }

  //Writing to holdings spreadsheet
  var ws = get_sheet_object(HOLDINGS_SHEET_NAME);
  ws.getRange("A:K").clear();

  var headerRow = Object.keys(holdings[0]);
  ws.appendRow(headerRow);

  for (var i=0; i < holdings.length; i++) {
    var headerRow = Object.keys(holdings[0]);
    var row = headerRow.map(function(key){ return holdings[i][key]});
    ws.appendRow(row);
  }

  //Set columns to currency format
  var columns = ws.getRange(2,3, ws.getRange("C2").getDataRegion().getLastRow(), ws.getRange("C2").getDataRegion().getLastColumn());
  columns.setNumberFormat("$#,##0.00;$(#,##0.00)");

}

function get_latest_dividends_data() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName(DIVIDEND_SHEET_NAME);

  var header_list = ws.getRange(1,1, 1, ws.getRange("A1").getDataRegion().getLastColumn()).getValues()[0];

  var ticker_row_list = ws.getRange(2,1, ws.getRange("A2").getDataRegion().getLastRow(), 12).getValues();

  var ticker_data = {};

  for (var i=0; i < ticker_row_list.length; i++) {

    var ticker = ticker_row_list[i];
    var ticker_name = ticker[0];
    ticker_data[ticker_name] = {};

    for (var j=1; j < ticker.length; j++) {
      var key = header_list[j];
      var value = ticker[j];

      ticker_data[ticker_name][key] = value;
    }
  }

  return ticker_data
}


