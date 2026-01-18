/**
 * DragDemonstrator - Animated cursor showing drag-and-drop action
 * 
 * Shows a grab cursor picking up an element and dropping it on a target
 */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface DragDemonstratorProps {
    /** CSS selector for the source element to "pick up" */
    sourceSelector: string;
    /** CSS selector for the target element to "drop on" */
    targetSelector: string;
    /** Whether to loop the animation */
    loop?: boolean;
    /** Callback when animation completes one cycle */
    onCycleComplete?: () => void;
    /** Optional selector to click after dropping */
    clickTargetSelector?: string;
}

type Phase = "idle" | "moving-to-source" | "picking-up" | "dragging" | "dropping" | "moving-to-click" | "clicking" | "done" | "stopped";

export const DragDemonstrator: React.FC<DragDemonstratorProps> = ({
    sourceSelector,
    targetSelector,
    loop = true,
    onCycleComplete,
    clickTargetSelector,
}) => {
    const [phase, setPhase] = useState<Phase>("idle");
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
    const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
    const [isHolding, setIsHolding] = useState(false);
    const [userDragging, setUserDragging] = useState(false);
    const [clonedData, setClonedData] = useState<{ html: string; className: string } | null>(null);
    const [restartCount, setRestartCount] = useState(0);

    // Listen for user starting to drag
    useEffect(() => {
        const handleUserDrag = () => {
            setUserDragging(true);
            setPhase("stopped");
            setGhostPosition(null);
        };
        const handleRestart = () => {
            setUserDragging(false);
            setPosition(null);
            setPhase("idle");
            setRestartCount(c => c + 1);
        };

        window.addEventListener('tour:user-dragging', handleUserDrag);
        window.addEventListener('tour:restart-animation', handleRestart);
        return () => {
            window.removeEventListener('tour:user-dragging', handleUserDrag);
            window.removeEventListener('tour:restart-animation', handleRestart);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const runAnimation = async () => {
            // Wait for elements to be available (give reactivation time)
            await new Promise(r => setTimeout(r, 100));

            while (isMounted && !userDragging) {
                const source = document.querySelector(sourceSelector);
                // ... rest of loop logic ...

                const target = document.querySelector(targetSelector);

                if (!source || !target) {
                    await new Promise(r => setTimeout(r, 500));
                    continue;
                }

                const sRect = source.getBoundingClientRect();
                const tRect = target.getBoundingClientRect();

                setSourceRect(sRect);
                setClonedData({
                    html: source.innerHTML,
                    className: source.className
                });

                // Start next to the source (to the right)
                setPosition({
                    x: sRect.right + 30,
                    y: sRect.top + sRect.height / 2 + 30
                });
                await new Promise(r => setTimeout(r, 50));

                // Phase 1: Move cursor to source element
                setPhase("moving-to-source");
                setPosition({
                    x: sRect.left + sRect.width / 2,
                    y: sRect.top + sRect.height / 2
                });
                await new Promise(r => setTimeout(r, 400));
                if (!isMounted || userDragging) return;

                // Phase 2: Pick up (mouse down animation)
                setPhase("picking-up");
                setIsHolding(true);
                setGhostPosition({
                    x: sRect.left + sRect.width / 2,
                    y: sRect.top + sRect.height / 2
                });
                // Hide source element to simulate move
                if (source instanceof HTMLElement) source.style.opacity = "0";

                await new Promise(r => setTimeout(r, 400));
                if (!isMounted || userDragging) {
                    if (source instanceof HTMLElement) source.style.opacity = "";
                    return;
                }

                // Phase 3: Drag to target
                setPhase("dragging");
                const targetX = tRect.left + tRect.width / 2;
                const targetY = tRect.top + 80; // Top of the target column

                setPosition({ x: targetX, y: targetY });
                setGhostPosition({ x: targetX, y: targetY });
                await new Promise(r => setTimeout(r, 1000));
                if (!isMounted || userDragging) {
                    if (source instanceof HTMLElement) source.style.opacity = "";
                    return;
                }

                // Phase 4: Drop
                setPhase("dropping");
                setIsHolding(false);
                await new Promise(r => setTimeout(r, 300));

                // Restore source visibility
                if (source instanceof HTMLElement) source.style.opacity = "";

                if (!isMounted || userDragging) return;

                // Optional: Move to Click Target and Click
                if (clickTargetSelector) {
                    let clickTarget = document.querySelector(clickTargetSelector);
                    let attempts = 0;
                    // Wait for element to appear (up to 2s)
                    while (!clickTarget && attempts < 10 && isMounted) {
                        await new Promise(r => setTimeout(r, 200));
                        clickTarget = document.querySelector(clickTargetSelector);
                        attempts++;
                    }

                    if (clickTarget && isMounted && !userDragging) {
                        const cRect = clickTarget.getBoundingClientRect();
                        const cx = cRect.left + cRect.width / 2;
                        const cy = cRect.top + cRect.height / 2;

                        setPhase("moving-to-click");
                        setPosition({ x: cx, y: cy });

                        await new Promise(r => setTimeout(r, 1000));
                        if (!isMounted || userDragging) return;

                        setPhase("clicking");
                        await new Promise(r => setTimeout(r, 300));
                        (clickTarget as HTMLElement).click();
                        await new Promise(r => setTimeout(r, 200));
                    }
                }

                // Phase 5: Done
                setPhase("done");
                // ... (lines skipped)


                setGhostPosition(null);
                onCycleComplete?.();
                await new Promise(r => setTimeout(r, 1500));
                if (!isMounted || userDragging) return;

                if (!loop) break;

                // Reset for next loop
                setPhase("idle");
                await new Promise(r => setTimeout(r, 500));
            }
        };

        if (!userDragging) {
            runAnimation();
        }

        return () => {
            isMounted = false;
        };
    }, [sourceSelector, targetSelector, loop, onCycleComplete, userDragging, restartCount]);

    if (!position || userDragging || phase === "stopped" || phase === "done") return null;

    return (
        <>
            {/* Ghost card being dragged */}
            <AnimatePresence>
                {ghostPosition && sourceRect && (
                    <motion.div
                        key="ghost"
                        initial={{
                            opacity: 0,
                            scale: 1,
                            x: ghostPosition.x - sourceRect.width / 2,
                            y: ghostPosition.y - sourceRect.height / 2,
                        }}
                        animate={{
                            opacity: phase === "dropping" ? 0 : 0.85,
                            scale: phase === "picking-up" ? 1.05 : 1,
                            x: ghostPosition.x - sourceRect.width / 2,
                            y: ghostPosition.y - sourceRect.height / 2,
                            rotate: phase === "dragging" ? 4 : 0, // Gentle tilt
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                            x: { duration: 0.8, ease: "easeInOut" },
                            y: { duration: 0.8, ease: "easeInOut" },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 },
                            rotate: { duration: 0.3, repeat: Infinity },
                        }}
                        style={{
                            position: "fixed",
                            width: sourceRect.width,
                            height: sourceRect.height,
                            pointerEvents: "none",
                            zIndex: 10004,
                        }}
                        className={`pointer-events-none p-4 rounded-xl flex flex-col !m-0 !fixed !z-[10004] box-border !opacity-100 !shadow-2xl !bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700`}
                    >
                        {clonedData ? (
                            <div dangerouslySetInnerHTML={{ __html: clonedData.html }} className="h-full w-full" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-2 gap-2">
                                <div className="w-full h-2 bg-blue-100 dark:bg-slate-700 rounded-full w-1/2 mx-auto" />
                                <div className="text-blue-600 dark:text-blue-400 font-bold text-xs">משימה לדוגמה</div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4 mx-auto" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cursor - Hand for grab/grabbing */}
            <motion.div
                initial={{ x: position.x, y: position.y }}
                animate={{
                    x: position.x,
                    y: position.y,
                    scale: isHolding || phase === "clicking" ? 0.9 : 1,
                    rotate: isHolding ? -15 : 0,
                }}
                transition={{
                    x: { duration: phase === "moving-to-source" ? 0.5 : 0.8, ease: "easeInOut" },
                    y: { duration: phase === "moving-to-source" ? 0.5 : 0.8, ease: "easeInOut" },
                    scale: { duration: 0.15 },
                    rotate: { duration: 0.15 },
                }}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    zIndex: 10006,
                    marginLeft: -16,
                    marginTop: -8,
                }}
            >
                <div className="relative">
                    <MousePointer2
                        className={`w-7 h-7 drop-shadow-md transition-colors duration-300 ${isHolding
                            ? "text-blue-600 fill-blue-50"
                            : "text-slate-900 fill-white"
                            }`}
                        strokeWidth={1.5}
                    />
                    {/* Grab ripple effect */}
                    {isHolding && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0.8 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500/30 rounded-full"
                        />
                    )}
                </div>
            </motion.div>

            {/* Drop target highlight */}
            <AnimatePresence>
                {phase === "dragging" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 pointer-events-none z-[10003]"
                    >
                        <DropTargetHighlight targetSelector={targetSelector} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Helper component to highlight the drop target
const DropTargetHighlight: React.FC<{ targetSelector: string }> = ({ targetSelector }) => {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const target = document.querySelector(targetSelector);
        if (target) {
            setRect(target.getBoundingClientRect());
        }
    }, [targetSelector]);

    if (!rect) return null;

    return (
        <motion.div
            animate={{
                border: "2px dashed rgba(59, 130, 246, 0.6)",
                backgroundColor: "rgba(59, 130, 246, 0.05)",
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.2)",
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
                position: "fixed",
                left: rect.left - 4,
                top: rect.top - 4,
                width: rect.width + 8,
                height: rect.height + 8,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            className="bg-blue-500/10"
        >
            <span className="text-blue-500 font-medium text-lg opacity-60 pointer-events-none select-none">
                שחרר כאן
            </span>
        </motion.div>
    );
};

export default DragDemonstrator;
