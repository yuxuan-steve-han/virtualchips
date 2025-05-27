import React from "react";
import { useEffect, useState, useRef } from "react";
import DisplayChips from "./Chips/DisplayChips";
import { Socket } from "socket.io-client";
import { GameStatus } from "@/App";
import PlayerInfo from "./PlayerInfo";

interface PotProps {
    socket: Socket;
    gameStatus: GameStatus | null;
}

export default function Pot({ socket, gameStatus }: PotProps) {

    const handleNextRound = () => {
        socket.emit("wipeTurnBets");
    };

    return (
        <div className="player h-full w-full" style={{ position: "relative" }}>
            { gameStatus?.players && Object.keys(gameStatus.players).map((playerName, index) => (
                <PlayerInfo
                    key={playerName}
                    playerName={playerName}
                    gameStatus={gameStatus}
                    playerIndex={index}
                    totalPlayers={Object.keys(gameStatus.players).length}
                    centerPoint={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
                    socket={socket}
                    pot={gameStatus.pot}
                />
            )) }
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="h-full w-full max-w-2/3 mx-auto -mt-20 scale-75">
                    <DisplayChips amount={gameStatus?.pot || 0} />
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="h-full w-full">
                    <div className="flex -mt-10 flex-col items-center max-w-1/2 mx-auto">
                        <h2 className="text-4xl text-white mb-2 rotate-180 text-center">${gameStatus?.pot}</h2>
                        <h2 className="text-4xl text-white ml-50 rotate-90 text-center">${gameStatus?.pot}</h2>
                        <h2 className="text-4xl text-white mr-50 -rotate-90 text-center">${gameStatus?.pot}</h2>
                        <h2 className="text-4xl text-white text-center">${gameStatus?.pot}</h2>
                    </div>
                    <button className="mt-4 bg-blue-500 w-full text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleNextRound}>
                        Next Round
                    </button>
                    
                </div>
            </div>
        </div>
    );
}