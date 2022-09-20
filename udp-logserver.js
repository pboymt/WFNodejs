const { createSocket } = require('dgram')

const socket = createSocket('udp4');

socket.on('message', (msg, rinfo) => {
    console.log(`Got data:`);
    console.log(msg.toString());
    console.log(`From:`);
    console.log(rinfo);
});

socket.on('listening', () => {
    console.log(`Listening on ${socket.address().address}:${socket.address().port}`);
});

socket.bind(5757);