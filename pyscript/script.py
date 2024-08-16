import json
import matplotlib.pyplot as plt
import requests
from pyscript import Element, display
from js import document

API_KEY = 'your_alpha_vantage_api_key' 

def fetch_data(symbol):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&outputsize=compact&apikey={API_KEY}'
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if 'Time Series (Daily)' in data:
            return data['Time Series (Daily)']
        else:
            return None
    else:
        return None

def plot_data(time_series, symbol):
    dates = []
    closing_prices = []

    for date, stats in sorted(time_series.items()):
        dates.append(date)
        closing_prices.append(float(stats['4. close']))

    # Get the container width dynamically using the updated JS import
    container_width = document.getElementById('plot-container').clientWidth

    # Convert width to inches for Matplotlib (assuming 100px = 1 inch)
    width_in_inches = container_width / 100
    height_in_inches = width_in_inches / 2
    plt.rc('xtick', labelsize=5) 
    plt.rc('ytick', labelsize=5) 

    plt.figure(figsize=(width_in_inches, height_in_inches))
    plt.plot(dates, closing_prices, marker='o')
    plt.title(f'{symbol.upper()} Stock Price')
    plt.xlabel('Date')
    plt.ylabel('Closing Price (USD)')
    plt.xticks(rotation=90)
    plt.tight_layout()

    # Display the plot in the target container
    display(plt.gcf(), target="plot-container")
    plt.close()

def fetch_and_display(*args):
    message_element = Element('message')
    symbol_element = Element('symbol-input')
    symbol = symbol_element.element.value.upper()

    if not symbol:
        message_element.write("Please enter a stock symbol.")
        return

    message_element.write(f"Fetching data for {symbol}...")

    time_series = fetch_data(symbol)
    
    if time_series:
        plot_data(time_series, symbol)
        message_element.write(f"Data for {symbol} displayed below.")
    else:
        message_element.write("Failed to fetch data. Please check the stock symbol and try again.")

Element('fetch-btn').element.onclick = fetch_and_display
