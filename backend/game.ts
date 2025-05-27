interface Players {
    [name: string]: Player;
}

class Game {
    private players: Players = {};
    private pot: number = 0;

    addPlayer(playerName: string, socketID: string): boolean {
        if (this.players[playerName]) {
            return false; // Player already exists
        }
        let player = new Player(playerName, 1000, socketID);
        this.players[player.name] = player;
        return true;
    }

    changeSocketID(playerName: string, newSocketID: string): boolean {
        const player = this.players[playerName];
        if (!player) {
            return false; // Player not founds
        }
        player.socketID = newSocketID; // Update socket ID
        return true;
    }

    bet(playerName: string, amount: number): boolean {
        const player = this.players[playerName];
        if (!player) {
            return false; // Player not found
        }
        if (amount <= 0) {
            return false; // Invalid bet amount
        }
        if (!player.bet(amount)) {
            return false; // Player cannot afford the bet
        }
        this.pot += amount;
        return true;
    }

    wipeTurnBets(): void {
        for (const playerName in this.players) {
            const player = this.players[playerName];
            if (!player) continue;
            player['turnBet'] = 0; // Reset turn bet
        }
    }

    claimPot(playerName: string, amount: number): boolean {
        const player = this.players[playerName];
        if (!player) {
            return false; // Player not found
        }
        if (amount > this.pot) {
            return false; // Not enough pot to claim
        }

        this.pot -= amount; // Deduct from pot
        player.modifyChips(amount); // Add to player's chips
        return true;
    }

    getStatus() {
        return {
            players: this.players,
            pot: this.pot
        };
    }
}

class Player {
    public chips: number;
    public name: string;
    public turnBet: number = 0;
    public socketID: string;

    constructor(name: string, initialChips: number = 1000, socketID: string) {
        this.chips = initialChips;
        this.name = name;
        this.socketID = socketID;
    }

    bet(amount: number): boolean {
        if (amount > this.chips) {
            return false; // Not enough chips to bet
        }
        this.chips -= amount;
        this.turnBet += amount;
        return true;
    }

    modifyChips(amount: number): void {
        this.chips += amount;
    }
}

// Export the Game and Player classes for use in other modules
export { Game, Player };