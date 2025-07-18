import requests

# Portfolio: CoinGecko ID → [Quantity, Invested ₹]
portfolio = {
    'the-sandbox': [23, 9909.77],
    'omg-network': [0.25, 92.43],
    'shiba-inu': [5184421, 18324.15],
    'dogecoin': [752, 25083.52],
    'wink': [498376, 25178.19],  # <-- changed from 'winklink' to 'wink'
    'decentraland': [77.3, 19986.57],
    'ethereum-classic': [0.84, 4984.42],
    'cardano': [37.1, 4962.75],
    'ethereum-push-notification-service': [68.73, 20023.10]
}

# CoinGecko API
ids = ','.join(portfolio.keys())
url = 'https://api.coingecko.com/api/v3/simple/price'
params = {'ids': ids, 'vs_currencies': 'inr'}
response = requests.get(url, params=params)
prices = response.json()

# Totals
total_invested = 0
total_current = 0

print("\n📊 Auto-Fetched Portfolio Summary (Live INR Prices)\n")

for coin, (qty, invested) in portfolio.items():
    price = prices.get(coin, {}).get('inr', 0)
    value = qty * price
    pnl = value - invested
    pnl_percent = (pnl / invested) * 100 if invested != 0 else 0

    total_invested += invested
    total_current += value

    print(f"🪙 {coin.upper()}")
    print(f"Qty           : {qty}")
    print(f"Invested      : ₹{invested:,.2f}")
    print(f"Price (INR)   : ₹{price}")
    print(f"Value         : ₹{value:,.2f}")
    print(f"P/L           : ₹{pnl:,.2f} ({pnl_percent:.2f}%)\n")

# Final Summary
net_pnl = total_current - total_invested
net_pnl_percent = (net_pnl / total_invested) * 100

print("===================================")
print("💼 TOTAL PORTFOLIO SUMMARY")
print("===================================")
import requests

# Portfolio: CoinGecko ID → [Quantity, Invested ₹]
portfolio = {
    'the-sandbox': [23, 9909.77],
    'omg-network': [0.25, 92.43],
    'shiba-inu': [5184421, 18324.15],
    'dogecoin': [752, 25083.52],
    'wink': [498376, 25178.19],  # <-- changed from 'winklink' to 'wink'
    'decentraland': [77.3, 19986.57],
    'ethereum-classic': [0.84, 4984.42],
    'cardano': [37.1, 4962.75],
    'ethereum-push-notification-service': [68.73, 20023.10]
}

# CoinGecko API
ids = ','.join(portfolio.keys())
url = 'https://api.coingecko.com/api/v3/simple/price'
params = {'ids': ids, 'vs_currencies': 'inr'}
response = requests.get(url, params=params)
prices = response.json()

# Totals
total_invested = 0
total_current = 0

print("\n📊 Auto-Fetched Portfolio Summary (Live INR Prices)\n")

for coin, (qty, invested) in portfolio.items():
    price = prices.get(coin, {}).get('inr', 0)
    value = qty * price
    pnl = value - invested
    pnl_percent = (pnl / invested) * 100 if invested != 0 else 0

    total_invested += invested
    total_current += value

    print(f"🪙 {coin.upper()}")
    print(f"Qty           : {qty}")
    print(f"Invested      : ₹{invested:,.2f}")
    print(f"Price (INR)   : ₹{price}")
    print(f"Value         : ₹{value:,.2f}")
    print(f"P/L           : ₹{pnl:,.2f} ({pnl_percent:.2f}%)\n")

# Final Summary
net_pnl = total_current - total_invested
net_pnl_percent = (net_pnl / total_invested) * 100

print("===================================")
print("💼 TOTAL PORTFOLIO SUMMARY")
print("===================================")
print(f"Total Invested : ₹{total_invested:,.2f}")
print(f"Total Current  : ₹{total_current:,.2f}")
print(f"Net P/L        : ₹{net_pnl:,.2f} ({net_pnl_percent:.2f}%)")
