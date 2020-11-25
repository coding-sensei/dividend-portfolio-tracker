function get_settings() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var ws = ss.getSheetByName(SETTINGS_SHEET_NAME);

  var values = ws.getRange(2,1, ws.getRange("A2").getDataRegion().getLastRow(), 2).getValues();
  var settings = convert_to_dictionary(values);
  return settings
}

function convert_to_dictionary(spreadsheet_data) {
  var dictionary = {};

  for (var i=0; i < spreadsheet_data.length; i++) {

    var key = spreadsheet_data[i][0];
    var value = spreadsheet_data[i][1];

    dictionary[key] = value;
  }

  return dictionary

}
