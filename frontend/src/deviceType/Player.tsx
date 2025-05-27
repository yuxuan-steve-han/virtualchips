import React from "react";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ControlChips from "./Chips/ControlChips";
import DisplayChips from "./Chips/DisplayChips";
import { GameStatus } from "@/App";


interface PlayerProps {
    name: string;
    socket: Socket;
    gameStatus : GameStatus | null;
}

export default function Player({ name, socket, gameStatus }: PlayerProps) {
    const [sliderValue, setSliderValue] = useState(0);

    const handleMovingChips = (amount: number) => {
        if (amount < 0 || amount > (gameStatus?.players[name]?.chips || 0) - sliderValue) {
            console.error("Invalid chip amount:", amount);
            return;
        }
        setSliderValue(sliderValue + amount);
    }

    return (
        <div className="player h-full w-full flex flex-row items-center justify-center">
            <div className="flex-3/4 h-full">
                <div className="flex h-full flex-col items-center mb-4">
                    <div className="flex-10/12 w-full flex flex-col items-center">
                        <h1 className="text-2xl font-bold mt-2 text-white">Chips</h1>
                        <ControlChips handleClick={handleMovingChips} amount={((gameStatus?.players[name]) ? gameStatus?.players[name].chips : 0) - sliderValue} />
                    </div>
                    <div className="flex-2/12 w-full p-4 flex flex-col items-center">
                        <input className="moneySlider w-full accent-indigo-600" type="range" value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))} min={0} max={(gameStatus?.players[name]) ? gameStatus?.players[name].chips : 0} />
                        <div className="-mt-2 flex w-full justify-between">
                            <span className="text-sm text-white">0</span>
                            <span className="text-sm text-white">{(gameStatus?.players[name]) ? gameStatus?.players[name].chips : 0}</span>
                        </div>
                        <div className="mt-2 flex w-full flex-row items-center justify-center">
                            <span className="flex-1/2 text-xl text-center text-white">${sliderValue}</span>
                            <h2 className="flex-1/2 text-sm text-center text-white">Socket ID: {(gameStatus?.players[name]) ? gameStatus?.players[name].socketID : ""}</h2>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1/4 p-4 h-full" style={{ backgroundColor: "#204533" }}>
                <div className="flex h-full flex-col items-center">
                    <div className="flex-10/12 h-full">
                        <h1 className="text-2xl text-center font-bold text-white mb-2">Player: {name}</h1>
                        <DisplayChips amount={sliderValue} />
                    </div>
                    <div className="flex-2/12 border-t-2 border-white p-4 flex flex-col items-center">
                        <h2 className="text-lg text-white">Pot: ${gameStatus?.pot}</h2>
                        <h2 className="text-lg text-white">Turne Bet: ${(gameStatus?.players[name]) ? gameStatus?.players[name].turnBet : 0}</h2>
                        <h2 className="text-lg text-blue-400">Betting: ${sliderValue}</h2>
                        <button className="flex-1/2 bg-blue-500 text-white w-50 px-4 py-2 mt-2 rounded hover:bg-blue-700" onClick={() => {socket.emit("bet", name, sliderValue); setSliderValue(0)}}>Bet</button>
                    </div>
                </div>
            </div>
        </div>
    );
}