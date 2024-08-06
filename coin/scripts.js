const apiUrl = 'https://coinmarketcap-proxy-il2mw4geb-mehdis-projects-37a20b81.vercel.app/api/coinmarketcap';
const exchangeRateApiUrl = 'https://api.exchangerate-api.com/v4/latest/USD'; // ExchangeRate-API URL

const MAX_POINTS = 50; 
let currentCurrency = 'USD';
let exchangeRates = { GBP: 0.79, NOK: 10.98 }; // Default rates
const buyPriceNOK = 591922;
const buyPriceUSD = buyPriceNOK / exchangeRates.NOK; // Convert to USD

const fetchData = async () => {
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const fetchExchangeRates = async () => {
    try {
        const response = await fetch(exchangeRateApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        exchangeRates = data.rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
};

const storeData = (symbol, price) => {
    let priceData = JSON.parse(localStorage.getItem(symbol)) || [];
    const timestamp = new Date().toISOString();
    priceData.push({ timestamp, price });

    // Ensure we only keep the most recent MAX_POINTS
    if (priceData.length > MAX_POINTS) {
        priceData = priceData.slice(priceData.length - MAX_POINTS);
    }

    localStorage.setItem(symbol, JSON.stringify(priceData));
};

const getData = (symbol) => {
    return JSON.parse(localStorage.getItem(symbol)) || [];
};

const calculateTrendLine = (data) => {
    const n = data.length;
    if (n === 0) return [];

    const sumX = data.reduce((sum, point, index) => sum + index, 0);
    const sumY = data.reduce((sum, point) => sum + point.price, 0);
    const sumXY = data.reduce((sum, point, index) => sum + index * point.price, 0);
    const sumXX = data.reduce((sum, point, index) => sum + index * index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((point, index) => ({ x: point.timestamp, y: slope * index + intercept }));
};

const updateChart = (chart, data) => {
    chart.data.labels = data.map(entry => entry.timestamp);
    chart.data.datasets[0].data = data.map(entry => entry.price);

    const trendLineData = calculateTrendLine(data);
    if (chart.data.datasets.length > 1) {
        chart.data.datasets[1].data = trendLineData.map(entry => entry.y);
    } else {
        chart.data.datasets.push({
            label: 'Trend Line',
            data: trendLineData.map(entry => entry.y),
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 2,
            fill: false,
            borderDash: [10, 5]
        });
    }

    chart.update();
};

const initChart = (context, label, color, addAnnotation = false) => {
    const options = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                }
            },
            y: {
                beginAtZero: false
            }
        }
    };

    if (addAnnotation) {
        options.plugins = {
            annotation: {
                annotations: [{
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y',
                    value: buyPriceUSD,
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                    label: {
                        enabled: true,
                        content: 'Buy Price (USD)'
                    }
                }]
            }
        };
    }

    return new Chart(context, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${label} Price (${currentCurrency})`,
                data: [],
                borderColor: color,
                borderWidth: 2,
                fill: false
            }]
        },
        options: options
    });
};

const applyChangeClass = (element, value) => {
    element.classList.remove('positive', 'negative');
    if (value > 0) {
        element.classList.add('positive');
    } else if (value < 0) {
        element.classList.add('negative');
    }
};

const displayCurrentPrices = (bitcoin, ethereum) => {
    document.getElementById('bitcoin-price').textContent = formatPrice(bitcoin.quote.USD.price, currentCurrency);
    
    const bitcoinChanges = [
        { id: 'bitcoin-change-1h', value: bitcoin.quote.USD.percent_change_1h },
        { id: 'bitcoin-change-24h', value: bitcoin.quote.USD.percent_change_24h },
        { id: 'bitcoin-change-7d', value: bitcoin.quote.USD.percent_change_7d },
        { id: 'bitcoin-change-30d', value: bitcoin.quote.USD.percent_change_30d },
        { id: 'bitcoin-change-60d', value: bitcoin.quote.USD.percent_change_60d },
        { id: 'bitcoin-change-90d', value: bitcoin.quote.USD.percent_change_90d }
    ];

    bitcoinChanges.forEach(change => {
        const element = document.getElementById(change.id);
        element.textContent = `${change.value.toFixed(2)}%`;
        applyChangeClass(element, change.value);
    });

    document.getElementById('bitcoin-market-cap').textContent = formatPrice(bitcoin.quote.USD.market_cap, currentCurrency);
    document.getElementById('bitcoin-volume-24h').textContent = formatPrice(bitcoin.quote.USD.volume_24h, currentCurrency);
    document.getElementById('bitcoin-circulating-supply').textContent = bitcoin.circulating_supply.toLocaleString();
    document.getElementById('bitcoin-rank').textContent = bitcoin.cmc_rank;

    document.getElementById('ethereum-price').textContent = formatPrice(ethereum.quote.USD.price, currentCurrency);
    
    const ethereumChanges = [
        { id: 'ethereum-change-1h', value: ethereum.quote.USD.percent_change_1h },
        { id: 'ethereum-change-24h', value: ethereum.quote.USD.percent_change_24h },
        { id: 'ethereum-change-7d', value: ethereum.quote.USD.percent_change_7d },
        { id: 'ethereum-change-30d', value: ethereum.quote.USD.percent_change_30d },
        { id: 'ethereum-change-60d', value: ethereum.quote.USD.percent_change_60d },
        { id: 'ethereum-change-90d', value: ethereum.quote.USD.percent_change_90d }
    ];

    ethereumChanges.forEach(change => {
        const element = document.getElementById(change.id);
        element.textContent = `${change.value.toFixed(2)}%`;
        applyChangeClass(element, change.value);
    });

    document.getElementById('ethereum-market-cap').textContent = formatPrice(ethereum.quote.USD.market_cap, currentCurrency);
    document.getElementById('ethereum-volume-24h').textContent = formatPrice(ethereum.quote.USD.volume_24h, currentCurrency);
    document.getElementById('ethereum-circulating-supply').textContent = ethereum.circulating_supply.toLocaleString();
    document.getElementById('ethereum-rank').textContent = ethereum.cmc_rank;
};

const formatPrice = (price, currency) => {
    let exchangeRate = 1;
    let currencySymbol = '';

    if (currency === 'GBP') {
        exchangeRate = exchangeRates.GBP;
        currencySymbol = '';
    } else if (currency === 'NOK') {
        exchangeRate = exchangeRates.NOK;
        currencySymbol = '';
    }

    const formattedPrice = (price * exchangeRate).toLocaleString('en-US', { style: 'currency', currency: currency });
    return `${currencySymbol} ${formattedPrice}`;
};

const changeCurrency = async (currency) => {
    currentCurrency = currency;
    document.querySelectorAll('.currency-selector button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${currency.toLowerCase()}-button`).classList.add('active');

    const data = await fetchData();
    const bitcoin = data.find(crypto => crypto.symbol === 'BTC');
    const ethereum = data.find(crypto => crypto.symbol === 'ETH');

    displayCurrentPrices(bitcoin, ethereum);

    const bitcoinData = getData('BTC');
    const ethereumData = getData('ETH');

    updateChart(bitcoinChart, bitcoinData);
    updateChart(ethereumChart, ethereumData);
};

document.addEventListener('DOMContentLoaded', async () => {
    await fetchExchangeRates();

    const bitcoinCtx = document.getElementById('bitcoinChart').getContext('2d');
    const ethereumCtx = document.getElementById('ethereumChart').getContext('2d');

    const bitcoinChart = initChart(bitcoinCtx, 'Bitcoin', '#f7931a', true);
    const ethereumChart = initChart(ethereumCtx, 'Ethereum', '#3c3c3d');

    const data = await fetchData();
    const bitcoin = data.find(crypto => crypto.symbol === 'BTC');
    const ethereum = data.find(crypto => crypto.symbol === 'ETH');

    storeData('BTC', bitcoin.quote.USD.price);
    storeData('ETH', ethereum.quote.USD.price);

    displayCurrentPrices(bitcoin, ethereum);

    const bitcoinData = getData('BTC');
    const ethereumData = getData('ETH');

    updateChart(bitcoinChart, bitcoinData);
    updateChart(ethereumChart, ethereumData);
});
