import React, { useState, useEffect, useRef } from 'react';
import { GameStatus } from '@/App';
import DisplayChips from './Chips/DisplayChips';
import { Socket } from 'socket.io-client';

interface Position {
    x: number;
    y: number;
}

interface PlayerInfoProps {
    playerName: string;
    gameStatus: GameStatus | null;
    playerIndex?: number;
    totalPlayers?: number;
    centerPoint?: Position;
    socket: Socket;
    pot: number;
}

export default function PlayerInfo({
    playerName, 
    gameStatus,
    playerIndex = 0,
    totalPlayers = 1,
    centerPoint = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    socket,
    pot
}: PlayerInfoProps) {
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [rotation, setRotation] = useState(0);
    const elementRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<Position>({ x: 0, y: 0 });
    const currentPositionRef = useRef<Position>({ x: 0, y: 0 });

    const [claimAmount, setClaimAmount] = useState(0);

    // Calculate initial position and rotation based on player index
    useEffect(() => {
        // Calculate oval dimensions based on screen size
        // Make the oval wider than it is tall, like a poker table
        const radiusX = Math.min(window.innerWidth * 0.35, 400); // Horizontal radius
        const radiusY = Math.min(window.innerHeight * 0.25, 200); // Vertical radius
        
        const angleStep = (2 * Math.PI) / totalPlayers;
        const angle = angleStep * playerIndex - Math.PI / 2; // Start from top
        
        // Calculate position on oval using parametric equations
        const x = centerPoint.x + radiusX * Math.cos(angle) - 75; // Offset for element width
        const y = centerPoint.y + radiusY * Math.sin(angle) - 50; // Offset for element height
        
        setPosition({ x, y });
        currentPositionRef.current = { x, y };
        
        // Calculate rotation to face outward (just use the angle + 90 degrees)
        const rotationDegrees = (angle * 180 / Math.PI) + 90;
        setRotation(rotationDegrees);
    }, [playerIndex, totalPlayers, centerPoint.x, centerPoint.y]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !elementRef.current) return;
            
            e.preventDefault();
            
            // Calculate the new position
            const deltaX = e.clientX - dragStartRef.current.x;
            const deltaY = e.clientY - dragStartRef.current.y;
            
            const newX = currentPositionRef.current.x + deltaX;
            const newY = currentPositionRef.current.y + deltaY;
            
            setPosition({
                x: newX,
                y: newY
            });
            
            // Calculate rotation based on new position relative to center
            const elementCenterX = newX + 75; // Half of approximate element width
            const elementCenterY = newY + 50; // Half of approximate element height
            
            const angleToCenter = Math.atan2(
                elementCenterY - centerPoint.y,
                elementCenterX - centerPoint.x
            );
            
            // Convert to degrees and add 90 to face away from center
            const rotationDegrees = (angleToCenter * 180 / Math.PI) + 90;
            setRotation(rotationDegrees);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            // Update the position ref when dragging ends
            currentPositionRef.current = position;
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, centerPoint.x, centerPoint.y, position]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY
        };
        currentPositionRef.current = position;
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            // Recalculate position when window resizes
            const radiusX = Math.min(window.innerWidth * 0.35, 400);
            const radiusY = Math.min(window.innerHeight * 0.25, 200);
            
            const angleStep = (2 * Math.PI) / totalPlayers;
            const angle = angleStep * playerIndex - Math.PI / 2;
            
            const x = window.innerWidth / 2 + radiusX * Math.cos(angle) - 75;
            const y = window.innerHeight / 2 + radiusY * Math.sin(angle) - 50;
            
            setPosition({ x, y });
            currentPositionRef.current = { x, y };
            
            // Simple rotation calculation
            const rotationDegrees = (angle * 180 / Math.PI) + 90;
            setRotation(rotationDegrees);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [playerIndex, totalPlayers]);

    if (!gameStatus || !gameStatus.players[playerName]) {
        return (
            <div 
                ref={elementRef}
                className="player-info" 
                onMouseDown={handleMouseDown}
                style={{ 
                    position: "absolute", 
                    backgroundColor: "#f0f0f0", 
                    padding: "10px", 
                    borderRadius: "5px",
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `rotate(${rotation+180}deg)`,
                    transformOrigin: "center center",
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                    transition: isDragging ? "none" : "transform 0.3s ease"
                }}
            >
                Player not found
            </div>
        );
    }

    return (
        <div 
            ref={elementRef}
            className="player-info text-white" 
            style={{ 
                position: "absolute", 
                backgroundColor: "#204533", 
                padding: "10px", 
                borderRadius: "5px",
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `rotate(${rotation+180}deg)`,
                transformOrigin: "center center",
                userSelect: "none",
                zIndex: isDragging ? 1000 : 1,
                transition: isDragging ? "none" : "transform 0.3s ease",
                minWidth: "150px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
            }}
        >
            <div className="rotate-180 border-t-2 border-white mb-2" onMouseDown={handleMouseDown}
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
            >
                <h2 className='text-center text-xl'>{playerName}</h2>
                <p className="text-blue-400 text-3xl">Turn Bet: {gameStatus?.players[playerName].turnBet}</p>
                { gameStatus?.players[playerName].turnBet > 0 && (
                    <DisplayChips scaleMultiplier={20} amount={gameStatus?.players[playerName].turnBet || 0} />
                )}
            </div>
            <p className='text-xl'>Turn Bet: {gameStatus?.players[playerName].turnBet}</p>
            <div className="flex-2/12 w-fullflex flex-col items-center">
                <input className="claimSlider w-full accent-indigo-600" type="range" value={claimAmount} onChange={(e) => setClaimAmount(Number(e.target.value))} min={0} max={pot} />
                <div className="-mt-2 flex w-full justify-between">
                    <span className="text-sm text-white">0</span>
                    <span className="text-sm text-white">{pot}</span>
                </div>
                <div className="flex w-full flex-row items-center justify-center">
                    <span className="flex-1/2 w-full text-lg text-center text-white">${claimAmount}</span>
                    <button
                        className="flex-1/2 bg-blue-500 text-white py-2 mt-2 rounded hover:bg-blue-700"
                        onClick={() => {
                            socket.emit("claimPot", playerName, claimAmount);
                            setClaimAmount(0);
                        }
                    }
                    >
                        Claim
                    </button>
                </div>
            </div>
        </div>
    );
}
