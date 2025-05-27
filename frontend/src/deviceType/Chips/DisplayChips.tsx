import { useEffect, useState } from "react";
import DisplayChipStack from "./DisplayChipStack";
import { ChipCount, ChipDenomination } from "./ControlChips";

export default function DisplayChips({amount, scaleMultiplier}: { amount: number, scaleMultiplier?: number }) {
    const [chipDistribution, setChipDistribution] = useState<ChipCount>({
        '1': 0,
        '5': 0,
        '10': 0,
        '25': 0,
        '50': 0,
        '100': 0,
        '500': 0
    });
    
    useEffect(() => {
        // Calculate chip distribution when amount changes
        setChipDistribution(getPlayingChipGreedy(amount));
    }
    , [amount]);

    return (
        <div className="flex flex-wrap flex-row items-center justify-center">
            {
                Object.entries(chipDistribution).map(([denomination, count]) => (
                    count > 0 && (
                        <DisplayChipStack scaleMultiplier={scaleMultiplier} key={denomination} chipType={denomination} amount={count} />
                    )
                ))
            }
        </div>
    );
}

// Standard greedy algorithm without minimum chip requirement
function getPlayingChipGreedy(amount: number): ChipCount {
    const chips: ChipCount = {
        '1': 0,
        '5': 0,
        '10': 0,
        '25': 0,
        '50': 0,
        '100': 0,
        '500': 0
    };
    
    const denominations: number[] = [500, 100, 50, 25, 10, 5, 1];
    let remaining = amount;
    
    // Greedy approach: use highest denominations first
    for (const denom of denominations) {
        if (remaining >= denom) {
            const chipCount = Math.floor(remaining / denom);
            chips[denom.toString() as ChipDenomination] = chipCount;
            remaining -= chipCount * denom;
        }
    }
    
    return chips;
}