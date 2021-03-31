# All Information For Each Tampermonkey Script

This will provide some detailed information for each script in this directory.

## m1_finance_activity_dividend_calculator.js

This script will run on the M1 Finance Website in the Activity section and place a green `Calculate Dividends` button.
When the button is clicked, the button will show an alert with the total amount of dividends for that activity page.
Here is the location where the button is placed in the `Activity` section:

![image](https://user-images.githubusercontent.com/55446606/113147629-8ee09f80-91f6-11eb-9ed2-80cc33ced9d9.png)

Here is the Alert pop up that is received after clicking the button:

![image](https://user-images.githubusercontent.com/55446606/113147693-a61f8d00-91f6-11eb-8f64-5d15a8748b73.png)

One thing to note is if you are not seeing the button show up, then you need to be logged into M1 Finance and be in the `Activity` section and just refresh the page.
That should show up the button.

## personal_capital_brokerage_holdings_getter.js

This script will run on the Personal Capital Website and place a green `Copy Holdings` button on
the `Holdings` tab of the brokerage account that you want to copy from. When the button is clicked,
the button will copy the holdings into JSON data to your clipboard which can then be pasted into
the GoogleSheets or any other program that wants to use the JSON data.

## etoro_holdings_getter.js

This script will run on etoro.com/portfolio and place a grey `Copy Holdings` button next to navbar buttons.
When the button is clicked, the button will copy the holdings into JSON data to your clipboard which can then
be pasted into the GoogleSheets or any other program that wants to use the JSON data.

###Known issues:
- Currency won't always calculate correct price
- You'll not get holdings from people you're copying
