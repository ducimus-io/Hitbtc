import HitBTC from 'hitbtc-api';

const restClient = new HitBTC({ key, secret, isDemo: false });
const websocketClient =
    new HitBTC.WebsocketClient({ key, secret, isDemo: false });

restClient.getOrderBook('BTCUSD')
    .then(console.log)
    .catch(console.error);

websocketClient.addMarketMessageListener(data => {
    if (data.MarketDataSnapshotFullRefresh) console.log(data);
});

// The methods are bound properly, so feel free to destructure them:
const { getMyBalance } = restClient;
getMyBalance()
    .then(({ balance }) => console.log(
    `My USD balance is ${balance.USD.cash}!`
))