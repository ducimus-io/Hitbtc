const WebSocket = require('ws');
const chalk = require('chalk');
const mongoose = require('mongoose');

const log = console.log;

// Ws URL
const WS_URL = '';

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