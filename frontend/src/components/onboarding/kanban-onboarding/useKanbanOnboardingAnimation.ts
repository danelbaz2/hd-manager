import { useState, useEffect, useRef } from "react";
import { ANIMATION_CYCLE_DURATION } from "./constants";

export const useKanbanOnboardingAnimation = () => {
    const [animationProgress, setAnimationProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [columnPositions, setColumnPositions] = useState<{ x: number; width: number }[]>([]);

    // Derive current phase from animationProgress
    const currentPhase = animationProgress < 0.15 ? "idle"
        : animationProgress < 0.25 ? "lifting"
            : animationProgress < 0.70 ? "dragging"
                : animationProgress < 0.80 ? "dropping"
                    : "complete";

    // Calculate column positions for animation
    useEffect(() => {
        const updatePositions = () => {
            if (containerRef.current) {
                const columns = containerRef.current.querySelectorAll('[data-demo-column]');
                const positions: { x: number; width: number }[] = [];
                const containerRect = containerRef.current!.getBoundingClientRect();

                columns.forEach((col) => {
                    const rect = col.getBoundingClientRect();
                    positions.push({
                        x: rect.left - containerRect.left,
                        width: rect.width,
                    });
                });
                setColumnPositions(positions);
            }
        };

        updatePositions();
        window.addEventListener('resize', updatePositions);
        return () => window.removeEventListener('resize', updatePositions);
    }, [currentPhase]); // Recalculate when phase changes

    // Animation loop
    useEffect(() => {
        let animationFrame: number;
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = (timestamp - startTime) % ANIMATION_CYCLE_DURATION;
            const progress = elapsed / ANIMATION_CYCLE_DURATION;
            setAnimationProgress(progress);
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    const getAnimationState = () => {
        if (animationProgress < 0.15) {
            return { phase: "idle", dragProgress: 0 };
        } else if (animationProgress < 0.25) {
            const liftProgress = (animationProgress - 0.15) / 0.1;
            return { phase: "lifting", dragProgress: 0, liftProgress };
        } else if (animationProgress < 0.70) {
            const dragProgress = (animationProgress - 0.25) / 0.45;
            return { phase: "dragging", dragProgress };
        } else if (animationProgress < 0.80) {
            return { phase: "dropping", dragProgress: 1 };
        } else {
            return { phase: "complete", dragProgress: 1 };
        }
    };

    const animState = getAnimationState();

    return {
        animationProgress,
        containerRef,
        columnPositions,
        animState,
    };
};
