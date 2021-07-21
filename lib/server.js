'use strict'

var express = require('express')
var expressServer = express()
var httpServer = require('http').Server(expressServer)
var wssServer = require('socket.io')(httpServer)
var LiquidityProvider = require('./liquidity_provider').LiquidityProvider
var LiquiditySubscribers = require('./liquidity_subscribers').LiquiditySubscribers
var validateMessage = require('./server_protocol').validateMessage
var liquidityProvider = new LiquidityProvider
var liquiditySubscribers = new LiquiditySubscribers(liquidityProvider)

function emitError(socket, message, errorMessage) {
	var errorResponse = {}
	if ('uid' in message) {
		errorResponse.uid = message.uid
	}
	errorResponse.message = errorMessage
	socket.emit('server-error', errorResponse)
}


function withValidMessage(socket, eventName, callback) {
	socket.on(eventName, function (message) {
		var validationResult = validateMessage(eventName, message)
		if (validationResult === true) {
			try {
				callback(message)
			} catch (err) {
				emitError(socket, message, err.message)
			}
		} else {
			emitError(socket, message, validationResult)
		}
	})
}


wssServer.on('connection', function (socket) {
	withValidMessage(socket, 'subscribe-req', function (eventData) {
		liquiditySubscribers.add(eventData.pair, socket)
		socket.emit('subscribe-res', {uid: eventData.uid})
	})

	withValidMessage(socket, 'unsubscribe-req', function (eventData) {
		liquiditySubscribers.remove(eventData.pair, socket)
		socket.emit('unsubscribe-res', {uid: eventData.uid})
	})

	socket.on('disconnect', function () {
		liquiditySubscribers.removeAll(socket)
	})
})


expressServer.use(express.static('client'))


module.exports = httpServer
