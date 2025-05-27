import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Game } from './game';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}, cors: {
        origin: "*",
    }
});
const game = new Game();

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('you probably need a frontend to play this game');
});

server.listen(3001, () => {
    console.log('server running at port 3001');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinAsPot', () => {
        io.to(socket.id).emit('joinGameStatus', { status: true, joinedAs: 'pot' });
        console.log('pot has joined the game');
        io.to(socket.id).emit("gameStatus", game.getStatus());
    })

    socket.on('joinGame', (playerName: string) => {
        if (game.addPlayer(playerName, socket.id)) {
            console.log(`${playerName} joined the game`);
            io.to(socket.id).emit('joinGameStatus', { status: true, joinedAs: 'player' });
        }
        else {
            console.log(`Player ${playerName} already exists. Changing SocketID for ${socket.id}`);
            io.to(socket.id).emit('joinGameStatus', { status: game.changeSocketID(playerName, socket.id), joinedAs: 'player' });
        }
        io.emit('gameStatus', game.getStatus());
    });

    socket.on('getState', () => {
        io.to(socket.id).emit('gameStatus', game.getStatus());
    });

    socket.on('bet', (playerName: string, amount: number) => {
        if (game.bet(playerName, amount)) {
            console.log(`${playerName} bet ${amount}`);
        } else {
            console.log(`Failed bet by ${playerName}`);
        }
        io.emit('gameStatus', game.getStatus());
    });

    socket.on('claimPot', (playerName: string, amount: number) => {
        if (game.claimPot(playerName, amount)) {
            console.log(`${playerName} claimed the pot of ${amount}`);
            io.emit('gameUpdate', { type: "claimPot", status: true, playerName: playerName, amount: amount });
            io.emit('gameStatus', game.getStatus());
        } else {
            console.log(`Failed claim by ${playerName}`);
            io.emit('gameUpdate', { type: "claimPot", status: false, playerName: playerName });
        }
    });

    socket.on('wipeTurnBets', () => {
        game.wipeTurnBets();
        console.log('Turn bets wiped');
        io.emit('gameStatus', game.getStatus());
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});