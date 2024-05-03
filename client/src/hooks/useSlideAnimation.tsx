import { useState, useEffect } from 'react';

// Custom hook for slide animation
const useSlideAnimation = (open: boolean) => {
    const [animationStyle, setAnimationStyle] = useState({
        transform: 'translateX(-100%)', transition: 'transform 0.3s ease',
    }); // Initial position

    useEffect(() => {
        if (open) {
            setAnimationStyle({ transform: 'translateX(0)', transition: 'transform 0.3s ease' }); 
        } else {
            setAnimationStyle({ transform: 'translateX(-100%)', transition: 'transform 0.3s ease'}); 
        }
    }, [open]);

    return animationStyle;
};

export default useSlideAnimation;
