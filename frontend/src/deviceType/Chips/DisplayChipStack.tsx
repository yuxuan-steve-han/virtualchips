import React from 'react';
import Chip1 from '../../assets/1.svg';
import Chip5 from '../../assets/5.svg';
import Chip10 from '../../assets/10.svg';
import Chip25 from '../../assets/25.svg';
import Chip50 from '../../assets/50.svg';
import Chip100 from '../../assets/100.svg';
import Chip500 from '../../assets/500.svg';

let chipImages: { [key: string]: string } = {
    '1': Chip1,
    '5': Chip5,
    '10': Chip10,
    '25': Chip25,
    '50': Chip50,
    '100': Chip100,
    '500': Chip500
};

const CHIP_OVERLAP = 0.93;

// Responsive chip height based on screen width
function useResponsiveChipHeight(scaleMultiplier: number) {
    const [chipHeight, setChipHeight] = React.useState(getChipHeight(scaleMultiplier));

    React.useEffect(() => {
        function handleResize() {
            setChipHeight(getChipHeight(scaleMultiplier));
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function getChipHeight(scaleMultiplier: number) {
        const size = Math.min(window.innerWidth, window.innerHeight);
        return size / scaleMultiplier; // Adjust divisor for desired chip size
    }

    return chipHeight;
}

export default function DisplayChipStack({chipType, amount, scaleMultiplier = 10}: 
    { chipType: string, amount: number, scaleMultiplier?: number }) {
    const CHIP_HEIGHT = useResponsiveChipHeight(scaleMultiplier);

    // Calculate the total stack height
    const stackHeight = amount > 1
        ? CHIP_HEIGHT + (amount - 1) * CHIP_HEIGHT * (1 - CHIP_OVERLAP)
        : CHIP_HEIGHT;

    // Set a max stack height (e.g., 160px)
    const maxStackHeight = 160;
    // Calculate scale if stack is too tall
    const scale = stackHeight > maxStackHeight ? maxStackHeight / stackHeight : 1;

    return (
        <div
            className="relative flex flex-col align-center justify-end"
            style={{
                width: `${CHIP_HEIGHT * scale}px`,
                height: `${Math.min(stackHeight, maxStackHeight)}px`,
            }}
        >
            {[...Array(amount)].map((_, i) => (
                <img
                    key={i}
                    src={chipImages[chipType]}
                    alt={`${chipType} chip`}
                    style={{
                        position: 'absolute',
                        left: 0,
                        bottom: `${i * CHIP_HEIGHT * (1 - CHIP_OVERLAP) * scale}px`,
                        width: `${CHIP_HEIGHT * scale}px`,
                        height: `${CHIP_HEIGHT * scale}px`,
                        zIndex: i,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                    draggable={false}
                />
            ))}
        </div>
    );
}
