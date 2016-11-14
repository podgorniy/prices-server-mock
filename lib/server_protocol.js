'use strict'

var isAllowedCurrencyPair = require('./allowed_currencies').isAllowedCurrencyPair

function validUid(val) {
	return typeof val === "number" || typeof val === 'string'
}


exports.schemas = {
	'server-error': {
		message: function (val) {return typeof val === 'string'}
	},
	'subscribe-req': {
		pair: isAllowedCurrencyPair,
		uid: validUid
	},
	'subscribe-res': {
		uid: validUid
	},
	'unsubscribe-req': {
		pair: isAllowedCurrencyPair,
		uid: validUid
	},
	'unsubscribe-res': {
		uid: validUid
	},
	'price-change': {
		pair: isAllowedCurrencyPair,
		price: function (val) {return typeof val === 'number'}
	}
}


exports.validateMessage = function (messageName, message) {
	var messageScheme = exports.schemas[messageName]
	if (!messageScheme) {
		return 'Unknown message name: "' + messageName + '"';
	}
	var messagePropertiesNames = Object.keys(message)
	var schemePropertiesNames = Object.keys(messageScheme)

	if (messagePropertiesNames.length !== schemePropertiesNames.length) {
		return 'Unexpected number of properties. Expected exactly "' + schemePropertiesNames.length + '", but got "' + messagePropertiesNames.length + '"'
	}

	for (var i = 0; i < schemePropertiesNames.length; i += 1) {
		var propertyName = schemePropertiesNames[i]
		var isValidValue = messageScheme[propertyName](message[propertyName])
		if (!isValidValue) {
			return 'Invalid "' + propertyName + '" property value'
		}
	}

	return true
}