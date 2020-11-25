# All Information For Each Script

This will provide some detailed information for each script in this directory.

## main.gs

This is the main App script that will host all of the buttons that will appear on the Google Sheets.


## get_latest_dividends.gs

This is the script that will collect the latest dividend payout information for the portfolio.

### Google Sheet Formulas

#### Sorted By Pay Date

Get Headers

`=QUERY(latest_dividends!A1:L1, "SELECT A,D,E,L,B,K")`

Filter and Sort by Pay Date

`=SORT(FILTER(ArrayFormula({latest_dividends!A2:A,latest_dividends!D2:E,if(latest_dividends!L2:L>0,DOLLAR(latest_dividends!L2:L),""),if(latest_dividends!B2:B>0,DOLLAR(latest_dividends!B2:B),""),if(latest_dividends!K2:K>0,TO_PERCENT(latest_dividends!K2:K),""),if(latest_dividends!K2:K>0,"Increase from prior payout of " & DOLLAR(latest_dividends!J2:J),"")}),latest_dividends!E2:E>=TODAY()),3,TRUE)`

#### Sorted By Ex Dividend Date

`=QUERY(latest_dividends!A:I, "SELECT A,E,D,B WHERE D IS NOT NULL AND E >= date'"&TEXT(TODAY(),"yyyy-mm-dd")&"' ORDER BY D",-1)`

## populate_holdings.gs

This is the script that will populate the portfolio holdings into the `Holdings` sheet.
The portfolio holdings are easily copied from the Personal Capital Website using the Tampermonkey script with a click of a button.

### Google Sheet Formulas

Setup Projected Annual Income Table

For Annual Income

`=SUMIF(Holdings!J2:J,"FALSE",Holdings!I2:I)`

For Monthly Average Income

`=AnnualIncomeResult/12` or `=SUMIF(Holdings!J2:J,"FALSE",Holdings!I2:I)/12`

For Weekly Average Income

`=AnnualIncomeResult/52` or `=SUMIF(Holdings!J2:J,"FALSE",Holdings!I2:I)/52`

For Daily Average Income

`=AnnualIncomeResult/365` or `=SUMIF(Holdings!J2:J,"FALSE",Holdings!I2:I)/365`

For Hourly Average Income

`=AnnualIncomeResult/8760` or `=SUMIF(Holdings!J2:J,"FALSE",Holdings!I2:I)/8760`

## utilities.gs

This is the script that will hold any common functionality that could be reused by other scripts.
