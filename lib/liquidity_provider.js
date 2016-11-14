'use strict'

var util = require('util')
var EventEmitter = require('events')

// http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
function random(low, high) {
	return Math.random() * (high - low) + low;
}

var currenciesSetUp = {
	'usd': {
		'eur': {
			initial: 0.92,
			frequencyFrom: 3,
			frequencyTo: 0.5,
			priceDeviation: 0.001
		},
		'rub': {
			initial: 74,
			frequencyFrom: 0.25,
			frequencyTo: 0.5,
			priceDeviation: 0.04
		},
		'jpy': {
			initial: 117,
			frequencyFrom: 2,
			frequencyTo: 1,
			priceDeviation: 0.02
		},
		'gbp': {
			initial: 0.69,
			frequencyFrom: 0.75,
			frequencyTo: 1.5,
			priceDeviation: 0.002
		},
		'cad': {
			initial: 1.42,
			frequencyFrom: 1,
			frequencyTo: 2,
			priceDeviation: 0.001
		}
	},
	'eur': {
		'rub': {
			initial: 81.75,
			frequencyFrom: 0.25,
			frequencyTo: 0.5,
			priceDeviation: 0.04
		},
		'jpy': {
			initial: 128.04,
			frequencyFrom: 2,
			frequencyTo: 1,
			priceDeviation: 0.02
		},
		'gbp': {
			initial: 0.75,
			frequencyFrom: 0.75,
			frequencyTo: 1.5,
			priceDeviation: 0.002
		},
		'cad': {
			initial: 1.55,
			frequencyFrom: 1,
			frequencyTo: 2,
			priceDeviation: 0.001
		}
	},
	'rub': {
		'jpy': {
			initial: 1.57,
			frequencyFrom: 2,
			frequencyTo: 1,
			priceDeviation: 0.007
		},
		'gbp': {
			initial: 0.0092,
			frequencyFrom: 2,
			frequencyTo: 1,
			priceDeviation: 0.000007
		},
		'cad': {
			initial: 0.019,
			frequencyFrom: 1,
			frequencyTo: 5,
			priceDeviation: 0.00001
		}
	},
	'jpy': {
		'gbp': {
			initial: 0.0059,
			frequencyFrom: 0.15,
			frequencyTo: 1,
			priceDeviation: 0.00005
		},
		'cad': {
			initial: 0.012,
			frequencyFrom: 0.7,
			frequencyTo: 1.8,
			priceDeviation: 0.001
		}
	},
	'gbp': {
		'cad': {
			initial: 2.06,
			frequencyFrom: 2,
			frequencyTo: 3,
			priceDeviation: 0.001
		}
	}
}

function LiquidityProvider() {
	EventEmitter.call(this)
	this._latestPrices = {}
	this._storeLatestPrices()
	this._startFakingPrices()
}
util.inherits(LiquidityProvider, EventEmitter)


LiquidityProvider.prototype.getCurrentPrice = function (pair) {
	return this._latestPrices[pair]
}


LiquidityProvider.prototype._storeLatestPrices = function () {
	this.on('price-change', function (eventData) {
		this._latestPrices[eventData.pair] = eventData.price
	}.bind(this))
}


LiquidityProvider.prototype._startFakingPrices = function () {
	for (var currency in currenciesSetUp) {
		var subcurrencies = currenciesSetUp[currency]
		for (var subcurrency in subcurrencies) {
			this._startFakingPrice({
				currency1: currency,
				currency2: subcurrency,
				initial: subcurrencies[subcurrency].initial,
				priceDeviation: subcurrencies[subcurrency].priceDeviation,
				frequencyFrom: subcurrencies[subcurrency].frequencyFrom,
				frequencyTo: subcurrencies[subcurrency].frequencyTo
			})
		}
	}
}


LiquidityProvider.prototype._startFakingPrice = function (options) {
	var currency1 = options.currency1
	var currency2 = options.currency2
	var frequencyFrom = options.frequencyFrom
	var frequencyTo = options.frequencyTo
	var priceDeviation = options.priceDeviation
	var currentPrice = options.initial
	var self = this

	;(function updatePrice() {
		currentPrice = currentPrice + random(-priceDeviation / 2, priceDeviation / 2)
		self.emit('price-change', {
			pair: currency1 + currency2,
			price: currentPrice
		})
		self.emit('price-change', {
			pair: currency2 + currency1,
			price: 1 / currentPrice
		})
		setTimeout(updatePrice, 1000 / random(frequencyFrom, frequencyTo))
	}())
}


exports.LiquidityProvider = LiquidityProvider
