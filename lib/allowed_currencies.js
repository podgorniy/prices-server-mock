'use strict'

exports.currencies = ['usd', 'eur', 'rub', 'jpy', 'gbp', 'cad']

exports.isAllowedCurrencyPair = function (pair) {
	if (!pair || typeof pair !== 'string') {
		return false
	}
	var firstCurrency = pair.substr(0, 3)
	var secondCurrency = pair.substr(3, 5)
	return exports.currencies.indexOf(firstCurrency) !== -1 &&
		exports.currencies.indexOf(secondCurrency) !== -1
}