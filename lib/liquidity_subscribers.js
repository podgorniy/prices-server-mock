'use strict'

var isAllowedCurrencyPair = require('./allowed_currencies').isAllowedCurrencyPair


function validateCurrencyPair(func) {
	return function (currencyPair) {
		if (!isAllowedCurrencyPair(currencyPair)) {
			throw new Error('Unexpected currency pair: "' + currencyPair + '"')
		} else {
			return func.apply(this, arguments)
		}
	}
}


function LiquiditySubscribers(liquidityProvider) {
	this._subscribers = {}
	this._liquidityProvider = liquidityProvider
	this._handlePricesChanges()
}

LiquiditySubscribers.prototype._notifySubscriber = function (subscriber, pair, price) {
	subscriber.emit('price-change', {
		pair: pair,
		price: price
	})
}


LiquiditySubscribers.prototype._handlePricesChanges = function () {
	this._liquidityProvider.on('price-change', function (eventData) {
		var pair = eventData.pair
		var price = eventData.price

		var subscribers = this._subscribers[pair]
		if (!subscribers) {
				return
		}
		for (var i = 0; i < subscribers.length; i += 1) {
			this._notifySubscriber(subscribers[i], pair, price)
		}
	}.bind(this))
}


LiquiditySubscribers.prototype._isSubscribed = validateCurrencyPair(function (currencyPair, socket) {
	if (!this._subscribers[currencyPair]) {
		return false
	}
	return this._subscribers[currencyPair].indexOf(socket) !== -1
})


LiquiditySubscribers.prototype.add = validateCurrencyPair(function (pair, socket) {
	var isSubscribed = this._isSubscribed(pair, socket)
	if (isSubscribed) {
		throw new Error('Already subscribed to "' + pair + '"')
	}

	if (!this._subscribers[pair]) {
		this._subscribers[pair] = []
	}
	this._subscribers[pair].push(socket)
	this._notifySubscriber(socket, pair, this._liquidityProvider.getCurrentPrice(pair))
})


LiquiditySubscribers.prototype.remove = validateCurrencyPair(function (pair, socket) {
	var isSubscribed = this._isSubscribed(pair, socket)
	if (!isSubscribed) {
		throw new Error('Client is not subscribed to "' + pair + '"')
	}
	this._subscribers[pair].splice(this._subscribers[pair].indexOf(socket), 1);
})


LiquiditySubscribers.prototype.removeAll = function (socket) {
	var subscriberIndex
	for (var currencyPair in this._subscribers) {
		subscriberIndex = this._subscribers[currencyPair].indexOf(socket)
		if (subscriberIndex !== -1) {
			this._subscribers[currencyPair].splice(subscriberIndex, 1)
		}
	}
}

exports.LiquiditySubscribers = LiquiditySubscribers