import react, { useEffect } from 'react';
import ChipStack from './ChipStack';

export default function ControlChips({amount, handleClick}: { amount: number, handleClick: (amount: number) => void }) {
    const [chipDistribution, setChipDistribution] = react.useState({
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
        setChipDistribution(getPlayingChip(amount));
    }
    , [amount]);

    return (
        <>
        <div className="chips w-full h-full flex flex-wrap flex-row items-center justify-center">
            {
                Object.entries(chipDistribution).map(([denomination, count]) => (
                    count > 0 && (
                        <ChipStack handleClick={handleClick} key={denomination} chipType={denomination} amount={count} />
                    )
                ))
            }
        </div>
        </>
    );
}

// Define chip denominations as a type
export type ChipDenomination = '1' | '5' | '10' | '25' | '50' | '100' | '500';
export type ChipCount = Record<ChipDenomination, number>;

// Method to get chip count with minimum 1 chip of each denomination (when possible)
// If amount is less than sum of all denominations, higher denominations are skipped
function getPlayingChip(amount: number): ChipCount {
    const chips: ChipCount = {
        '1': 0,
        '5': 0,
        '10': 0,
        '25': 0,
        '50': 0,
        '100': 0,
        '500': 0
    };
    
    // Array of denominations in ascending order for minimum allocation
    const denominationsAsc: number[] = [1, 5, 10, 25, 50, 100, 500];
    let remaining = amount;
    
    // First pass: Try to allocate 1 chip of each denomination from smallest to largest
    for (const denom of denominationsAsc) {
        if (remaining >= denom) {
            chips[denom.toString() as ChipDenomination] = 1;
            remaining -= denom;
        } else {
            // Can't afford this denomination, stop here
            break;
        }
    }
    
    // Second pass: Distribute remaining amount using highest denominations first
    const denominationsDesc: number[] = [500, 100, 50, 25, 10, 5, 1];
    for (const denom of denominationsDesc) {
        if (remaining >= denom) {
            const additionalChips = Math.floor(remaining / denom);
            chips[denom.toString() as ChipDenomination] += additionalChips;
            remaining -= additionalChips * denom;
        }
    }
    
    return chips;
}