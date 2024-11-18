function doGet() {
  return HtmlService.createTemplateFromFile('index_copy').evaluate();
}

function getData() {
  var spreadSheetId = '1xTH9p2jRBQX6nrEjba5KRTlCwFTRR9i-GN-EFhyYP4s';
  var dataRange = 'Leaderboard!A1:D29';

  var range = Sheets.Spreadsheets.Values.get(spreadSheetId, dataRange);
  var values = range.values;

  return values;
}