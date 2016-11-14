var PORT = 8084
require('./lib/server').listen(PORT)
console.log('server started on port', PORT)