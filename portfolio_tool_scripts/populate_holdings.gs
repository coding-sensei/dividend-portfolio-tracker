function populate_holdings() {
  Logger.log("Populating Holdings")

  var settings = get_settings();
  var holdings = JSON.parse(settings["Portfolio Holdings"])["spData"]["holdings"];

  var excluded_holdings = settings["Dividend Suspended Holdings"].split(',');
  Logger.log("Holdings to exclude:");
  Logger.log(excluded_holdings);

  var latest_div_data = get_latest_dividends_data();

  Logger.log("Holdings:");
  Logger.log(holdings);

  Logger.log("latest_div_data:");
  Logger.log(latest_div_data);

  for (var i=0; i < holdings.length; i++) {
    ticker_name = holdings[i]["ticker"];

    annual_payout = latest_div_data[ticker_name] != null ? latest_div_data[ticker_name]["AnnualPayout"] : 0;
    holdings[i]["Annual Payout"] = annual_payout;

    dividend_payout = latest_div_data[ticker_name] != null ? latest_div_data[ticker_name]["DividendAmount"] : 0;
    holdings[i]["Dividend Amount"] = dividend_payout;

    holdings[i]["Projected Payout"] = holdings[i]["quantity"] * holdings[i]["Annual Payout"];

    holdings[i]["Cost Basis Per Share"] = holdings[i]["costBasis"] / holdings[i]["quantity"];
    holdings[i]["Yield On Cost"] = holdings[i]["Annual Payout"] / holdings[i]["Cost Basis Per Share"];
    holdings[i]["Dividend Yield"] = holdings[i]["Annual Payout"] / holdings[i]["price"];
    holdings[i]["Holding %"] = holdings[i]["holdingPercentage"] / 100;

    if(excluded_holdings.indexOf(ticker_name) > -1) {
      holdings[i]["Dividend Suspended"] = true;
    }
    else
    {
      holdings[i]["Dividend Suspended"] = false;
    }

    delete holdings[i]["Change"];
  }

  //Writing to holdings spreadsheet
  var ws = get_sheet_object(HOLDINGS_SHEET_NAME);
  ws.getRange("A:AI").clear();

  var headerRow = ['Ticker', 'Shares', 'Price', 'Value', 'Cost Basis', 'Cost Basis Per Share', 'Yield On Cost', 'Dividend Yield', 'Annual Payout', 'Dividend Amount', 'Projected Payout', 'Dividend Suspended', 'Holding %']
  Logger.log(headerRow);
  ws.appendRow(headerRow);

  Logger.log(holdings[0]);
  for (var i=0; i < holdings.length; i++) {
    var dict = {
      "Ticker": holdings[i]["ticker"],
      "Shares": holdings[i]["quantity"],
      "Price": holdings[i]["price"],
      "Value": holdings[i]["value"],
      "Cost Basis": holdings[i]["costBasis"],
      "Cost Basis Per Share": holdings[i]["Cost Basis Per Share"],
      "Yield On Cost": holdings[i]["Yield On Cost"],
      "Dividend Yield": holdings[i]["Dividend Yield"],
      "Annual Payout": holdings[i]["Annual Payout"],
      "Dividend Amount": holdings[i]["Dividend Amount"],
      "Projected Payout": holdings[i]["Projected Payout"],
      "Dividend Suspended": holdings[i]["Dividend Suspended"],
      "Holding %": holdings[i]["Holding %"],
    }
    var headerRow = Object.keys(dict);
    var row = headerRow.map(function(key){ return dict[key]});
    ws.appendRow(row);
  }

}

function get_latest_dividends_data() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName(DIVIDEND_SHEET_NAME);

  var header_list = ws.getRange(1,1, 1, ws.getRange("A1").getDataRegion().getLastColumn()).getValues()[0];

  var ticker_row_list = ws.getRange(2,1, ws.getRange("A2").getDataRegion().getLastRow(), header_list.length).getValues();

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
