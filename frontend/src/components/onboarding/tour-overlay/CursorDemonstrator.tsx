import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface CursorDemonstratorProps {
    sequence: string[];
    loop?: boolean;
}

export const CursorDemonstrator: React.FC<CursorDemonstratorProps> = ({
    sequence,
    loop = true,
}) => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Ref to track current index to avoid closure staleness in timeouts if needed,
    // but straight useEffect with async delay loop is easier.

    useEffect(() => {
        let isMounted = true;

        const runSequence = async () => {
            // Initialize position near first target
            if (sequence.length > 0) {
                const firstEl = document.querySelector(sequence[0]);
                if (firstEl) {
                    const rect = firstEl.getBoundingClientRect();
                    setPosition({
                        x: rect.left + rect.width / 2 + 40,
                        y: rect.top + rect.height / 2 + 40
                    });
                }
            }

            // Short initial delay
            await new Promise((r) => setTimeout(r, 500));

            while (isMounted) {
                for (const selector of sequence) {
                    if (!isMounted) return;

                    const el = document.querySelector(selector);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        // Target center of element
                        const x = rect.left + rect.width / 2;
                        const y = rect.top + rect.height / 2;

                        // Move to target
                        setIsVisible(true);
                        setPosition({ x, y });

                        // Wait for movement (approx match transition duration)
                        await new Promise((r) => setTimeout(r, 1000));
                        if (!isMounted) return;

                        // Click animation
                        setIsClicking(true);
                        await new Promise((r) => setTimeout(r, 200));

                        // Trigger actual click
                        if (el instanceof HTMLElement) {
                            el.click();
                        }

                        // Unclick animation
                        await new Promise((r) => setTimeout(r, 200));
                        setIsClicking(false);

                        // Wait a bit to show effect
                        await new Promise((r) => setTimeout(r, 1500));
                    } else {
                        // If element not found, wait a bit and try next
                        await new Promise((r) => setTimeout(r, 500));
                    }
                }

                if (!loop) break;
                // Small pause before restart
                await new Promise((r) => setTimeout(r, 500));
            }
        };

        runSequence();

        return () => {
            isMounted = false;
        };
    }, [sequence, loop]);

    if (!position) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                x: position.x,
                y: position.y,
                scale: isClicking ? 0.8 : 1,
                opacity: isVisible ? 1 : 0,
            }}
            transition={{
                // Movement duration
                x: { duration: 0.8, ease: "easeInOut" },
                y: { duration: 0.8, ease: "easeInOut" },
                // Click scale duration
                scale: { duration: 0.1 },
                opacity: { duration: 0.3 }
            }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                pointerEvents: "none",
                zIndex: 10005,
                marginLeft: -4, // Center pointer tip roughly
                marginTop: -2,
            }}
        >
            <div className="relative">
                <MousePointer2
                    className="w-8 h-8 text-slate-900 fill-white drop-shadow-lg"
                    strokeWidth={1.5}
                />
                {/* Ripple effect on click? Optional */}
                {isClicking && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        className="absolute -top-2 -left-2 w-12 h-12 bg-blue-500/30 rounded-full"
                        transition={{ duration: 0.4 }}
                    />
                )}
            </div>
        </motion.div>
    );
};
