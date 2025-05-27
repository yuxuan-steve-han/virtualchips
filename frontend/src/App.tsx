import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import Player from "./deviceType/Player";
import Pot from "./deviceType/Pot";
import "./index.css";

export interface GameStatus {
    players: { [name: string]: { chips: number; socketID: string; turnBet: number } };
    pot: number;
}

export default function App() {
    const [joinedAs, setJoinedAs] = useState(""); // 'player' or 'pot'
    const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
    const [name, setName] = useState("");

    useEffect(() => {
        socket.on("joinGameStatus", (data) => {
            console.log("Join Game Status:", data);
            if (data.status) {
                setJoinedAs(data.joinedAs);
            } else {
                alert("Failed to join the game. Please try again.");
            }
        });

        socket.on("gameStatus", (status: GameStatus) => {
            console.log("Game Status:", status);
            setGameStatus(status);
        });

        return () => {
            socket.off("joinGameStatus");
            socket.off("gameStatus");
        };
    }, []);

    const handleJoinGame = () => {
        if (name.trim() === "") {
            alert("Please enter a valid name.");
            return;
        }
        socket.emit("joinGame", name);
    };

    const handleJoinAsPot = () => {
        socket.emit("joinAsPot");
    };


    return (
        <div className="App">
            {joinedAs === "" ? (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1>Log In</h1>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />
                    <button className="bg-amber-200 p-2 m-4" onClick={handleJoinGame}>Join Game</button>
                    <button className="bg-amber-200 p-2 m-4" onClick={handleJoinAsPot}>Join as Pot</button>
                </div>
            ) : (
                joinedAs === "player" ? (
                    <Player name={name} socket={socket} gameStatus={gameStatus} />
                ) : (
                    <Pot socket={socket} gameStatus={gameStatus} />
                )
            )}
        </div>
    );
}
