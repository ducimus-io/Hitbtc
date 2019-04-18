const WebSocket = require('ws');
const chalk = require('chalk');
const mongoose = require('mongoose');

const log = console.log;

// Ws URL
const WS_URL = 'wss://api.hitbtc.com/api/2/ws';

// DB Config
const db = require('./config/keys').mongoURI;

// Bring in MarketDepth model
const MarketDepth = require('./models/MarketDepth');

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => log('MongoDB Connected'))
    .catch(err => log(err));

/**
 * Subscribe to symbols
 */
function subscribe(ws) {
    var symbols = ['ETHBTC', 'BTCUSD'];
    
    for (let symbol of symbols) {
        ws.send(JSON.stringify({
            "method": "subscribeOrderbook",
            "params": {
                "symbol": symbol
            },
            "id": symbol
        }));
    }
}

/**
 * Initialize Websocket Connection
 */
function init() {
    // Init websocket
    var ws = new WebSocket(WS_URL);

    // onOpen event - subscribe to symbols
    ws.on('open', () => {
        log('open');
        subscribe(ws);
    });

    // Handle data
    ws.on('message', (data) => {

        // Transform string data into Object
        let msg = JSON.parse(data);

        if (msg.params == undefined) {
            log(chalk.red('FIRST UNDEFINED ORDERBOOK'));
        } else {

            // Create new mongoose model
            const newMarketDepth = new MarketDepth({
                id: msg.params.symbol,
                time:  msg.params.timestamp,
                method: msg.method,
                sequence: msg.params.sequence,
                numA: msg.params.ask.length,
                numB: msg.params.bid.length,
                asks: msg.params.ask,
                bids: msg.params.bid
            });

            // Save model to mongoDB
            newMarketDepth.save().then(marketDepth => marketDepth);

            log(chalk.yellow("Method: ") + chalk.magenta(msg.method));
            log(chalk.yellow("Symbol: ") + chalk.magenta(msg.params.symbol));
            log(chalk.yellow("Sequence: ") + chalk.magenta(msg.params.sequence));
            log(chalk.yellow("Timestamp: ") + chalk.magenta(msg.params.timestamp));

            // TO DO: Format data price vs size
            log(chalk.cyan("Asks:  ") + JSON.stringify(msg.params.ask));
            log(chalk.cyan("Bids:  ") + JSON.stringify(msg.params.bid));
            
            
        }
        
    });

    // onClose event
    ws.on('close', () => {
        log(chalk.red('Websocket closed! Trying to reconnect...'));
        init(); // start connection again
    });

    // onError event
    ws.on('error', err => {
        log(chalk.red('Websocket error: ', err));
        init(); // start connection again
    });
}

// Start websocket connection
init();