import React, { useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { User, Clock } from "lucide-react";
import { useTheme, useSettings } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { getLighterColor, getTextColor } from "../../../schemas/tagTypes";
import { Tooltip } from "../../../components/tags-tooltip";
export interface DropConfirmRequest {
  taskId: string;
  taskTitle: string;
  fromStatus: string;
  toStatus: TaskStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

interface KanbanTaskCardProps {
  task: Task;
  users: UserData[];
  onClick?: (task: Task) => void;
  columnStatus: string;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onDropConfirmRequest?: (request: DropConfirmRequest) => void;
}

// Minimum distance to consider it a drag (in pixels)
const DRAG_THRESHOLD = 5;

// Animation duration in ms
const ANIMATION_DURATION = 500;

// Format date for display
const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  users,
  onClick,
  columnStatus,
  onTaskStatusChange,
  onDropConfirmRequest,
}) => {
  const { isDarkMode } = useTheme();
  const { primaryTags, secondaryTags } = useSettings();

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [animationTarget, setAnimationTarget] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Track positions
  const startPosRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const originalRectRef = useRef<DOMRect | null>(null);
  const hasDraggedRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const dropTargetRef = useRef<{ status: string; isNewColumn: boolean } | null>(
    null
  );

  // Find responsible user
  const responsibleUser =
    task.responsibleUserIds && task.responsibleUserIds.length > 0
      ? users.find((u) => u.id === task.responsibleUserIds![0])
      : null;

  // Get secondary tags for this task with their primary tag info
  const taskSecondaryTags = (task.secondaryTagIds || [])
    .map((tagId) => {
      const secondaryTag = secondaryTags.find((st) => st.id === tagId);
      if (!secondaryTag) return null;
      const primaryTag = primaryTags.find(
        (pt) => pt.id === secondaryTag.primaryTagId
      );
      return {
        ...secondaryTag,
        primaryColor: primaryTag?.color || "#1E40AF",
      };
    })
    .filter((tag): tag is NonNullable<typeof tag> => tag !== null);

  // Mouse down - prepare for potential drag
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click

    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      originalRectRef.current = rect;
    }

    startPosRef.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    isMouseDownRef.current = true;
    dropTargetRef.current = null;

    e.preventDefault();
  }, []);

  // Global mouse handlers
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only start dragging if we exceeded threshold
      if (!hasDraggedRef.current && distance > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
        setIsDragging(true);

        // Set drag data on body
        document.body.setAttribute("data-dragging-task", task.id);
        document.body.setAttribute("data-dragging-from", columnStatus);
        document.body.style.cursor = "grabbing";
      }

      if (hasDraggedRef.current) {
        setDragPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isMouseDownRef.current) return;

      isMouseDownRef.current = false;
      document.body.style.cursor = "";

      // If we didn't drag, it's a click
      if (!hasDraggedRef.current) {
        onClick?.(task);
        return;
      }

      // Clean up global drag attributes
      document.body.removeAttribute("data-dragging-task");
      document.body.removeAttribute("data-dragging-from");

      // Find which column we're over
      const columns = document.querySelectorAll("[data-column-status]");
      let targetColumn: Element | null = null;
      let targetStatus: string | null = null;

      for (const col of columns) {
        const rect = col.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          targetColumn = col;
          targetStatus = col.getAttribute("data-column-status");
          break;
        }
      }

      const isNewColumn =
        targetStatus !== null && targetStatus !== columnStatus;
      dropTargetRef.current = targetStatus
        ? { status: targetStatus, isNewColumn }
        : null;

      // Helper: complete the animation sequence
      const proceedWithAnimation = (shouldApplyChange: boolean) => {
        // Calculate animation target
        let targetX: number;
        let targetY: number;

        if (shouldApplyChange && isNewColumn && targetColumn) {
          // Dropping in new column - animate to the bottom of the list
          const listContainer =
            targetColumn.querySelector("div.overflow-y-auto") ||
            targetColumn.lastElementChild;

          if (listContainer) {
            const containerRect = listContainer.getBoundingClientRect();
            const taskCards = listContainer.querySelectorAll(".kanban-card");

            if (taskCards.length > 0) {
              const lastCard = taskCards[taskCards.length - 1];
              const lastCardRect = lastCard.getBoundingClientRect();
              targetY = lastCardRect.bottom + 8;
            } else {
              targetY = containerRect.top + 8;
            }

            targetY = Math.min(
              targetY,
              Math.min(containerRect.bottom - 50, window.innerHeight - 100)
            );
            targetX =
              containerRect.left +
              containerRect.width / 2 -
              (cardRef.current?.offsetWidth || 280) / 2;
          } else {
            const colRect = targetColumn.getBoundingClientRect();
            targetX =
              colRect.left +
              colRect.width / 2 -
              (cardRef.current?.offsetWidth || 280) / 2;
            targetY = colRect.top + 80;
          }

          // Start collapsing the original card (causes siblings to slide up)
          setIsCollapsing(true);
        } else {
          // Return to original position (cancelled or same column)
          if (originalRectRef.current) {
            targetX = originalRectRef.current.left;
            targetY = originalRectRef.current.top;
          } else {
            targetX = e.clientX - offsetRef.current.x;
            targetY = e.clientY - offsetRef.current.y;
          }
        }

        // Start animation
        setAnimationTarget({ x: targetX, y: targetY });
        setIsAnimating(true);
        setIsDragging(false);
        setIsPendingConfirmation(false);

        // Wait for animation to complete
        setTimeout(() => {
          const dropInfo = dropTargetRef.current;

          if (
            shouldApplyChange &&
            dropInfo?.isNewColumn &&
            dropInfo.status &&
            onTaskStatusChange
          ) {
            onTaskStatusChange(task.id, dropInfo.status as TaskStatus);
          }

          // Small delay before showing the new card - allows React to settle
          setTimeout(() => {
            setIsAnimating(false);
            setIsCollapsing(false);
            hasDraggedRef.current = false;
            dropTargetRef.current = null;
          }, 50);
        }, ANIMATION_DURATION);
      };

      // If dropping to a new column, request confirmation
      if (isNewColumn && targetStatus && onDropConfirmRequest) {
        // Freeze the card in place - stop dragging but keep floating overlay visible
        setIsDragging(false);
        setIsPendingConfirmation(true);

        // Request confirmation from parent
        onDropConfirmRequest({
          taskId: task.id,
          taskTitle: task.title || "משימה",
          fromStatus: columnStatus,
          toStatus: targetStatus as TaskStatus,
          onConfirm: () => {
            proceedWithAnimation(true);
          },
          onCancel: () => {
            proceedWithAnimation(false);
          },
        });
      } else if (isNewColumn && targetStatus && !onDropConfirmRequest) {
        // No confirmation required - proceed directly
        proceedWithAnimation(true);
      } else {
        // Same column or no valid target - return to original position
        proceedWithAnimation(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [task, columnStatus, onClick, onTaskStatusChange, onDropConfirmRequest]);

  // Calculate overlay position
  const overlayPosition = isAnimating
    ? animationTarget
    : {
        x: dragPosition.x - offsetRef.current.x,
        y: dragPosition.y - offsetRef.current.y,
      };

  // Card styles based on state
  const getCardClasses = (isOverlay: boolean) => {
    const baseClasses = `
            p-4 rounded-xl border select-none kanban-card
            ${isOverlay ? "" : "mb-3"}
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-100"
            }
        `;

    if (isOverlay) {
      return baseClasses;
    }

    // Original card classes
    if (isCollapsing) {
      // Collapsing - triggers sibling slide animation
      return `${baseClasses} h-0 p-0 m-0 border-0 overflow-hidden opacity-0 transition-all duration-[${ANIMATION_DURATION}ms] ease-out`;
    }

    if (isDragging || isAnimating) {
      // During drag/animation - show faded placeholder
      return `${baseClasses} opacity-30 pointer-events-none border-dashed`;
    }

    // Normal state - has transition for smooth sibling sliding
    return `${baseClasses} cursor-grab hover:shadow-lg hover:-translate-y-0.5 shadow-sm transition-all duration-500 ease-out`;
  };

  // Render card content
  const renderCardContent = (isOverlay: boolean = false) => (
    <div
      ref={isOverlay ? undefined : cardRef}
      onMouseDown={isOverlay ? undefined : handleMouseDown}
      className={getCardClasses(isOverlay)}
      style={
        isOverlay
          ? { boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.35)" }
          : isCollapsing
          ? {
              height: 0,
              padding: 0,
              margin: 0,
              opacity: 0,
              transition: `all ${ANIMATION_DURATION}ms ease-out`,
            }
          : undefined
      }
    >
      {/* Task Title */}
      <div className="flex justify-between items-start mb-2">
        <h4
          className={`font-bold text-sm leading-tight ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {task.title || "ללא כותרת"}
        </h4>
      </div>

      {/* Task Description */}
      {task.description && (
        <p
          className={`text-xs mb-3 line-clamp-2 ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {task.description}
        </p>
      )}

      {/* Secondary Tags */}
      {taskSecondaryTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {taskSecondaryTags.slice(0, 3).map((tag) => {
            const lightColor = getLighterColor(tag.primaryColor);
            return (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{
                  backgroundColor: lightColor,
                  color: getTextColor(lightColor),
                }}
              >
                {tag.name}
              </span>
            );
          })}
          {taskSecondaryTags.length > 3 && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                isDarkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              +{taskSecondaryTags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: Deadline & User */}
      <div className="flex items-center justify-between mt-auto">
        {task.deadline && (
          <div
            className={`flex items-center gap-1 text-xs ${
              isDarkMode ? "text-slate-400" : "text-slate-400"
            }`}
          >
            <Clock size={12} />
            <span>{formatDate(task.deadline)}</span>
          </div>
        )}

        {responsibleUser && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: responsibleUser.color }}
          >
            {responsibleUser.profileImage ? (
              <img
                src={responsibleUser.profileImage}
                alt={responsibleUser.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={12} className="text-white" />
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Original card in place */}
      {renderCardContent(false)}

      {/* Floating overlay during drag/animation/pending confirmation */}
      {(isDragging || isAnimating || isPendingConfirmation) &&
        ReactDOM.createPortal(
          <div
            className={`
                        fixed pointer-events-none
                        ${isPendingConfirmation ? "z-[50]" : "z-[9999]"}
                    `}
            dir="rtl"
            style={{
              left: overlayPosition.x,
              top: overlayPosition.y,
              width: cardRef.current?.offsetWidth || 280,
              transition: isAnimating
                ? `left ${ANIMATION_DURATION}ms ease-out, top ${ANIMATION_DURATION}ms ease-out, opacity 200ms ease-out`
                : "opacity 200ms ease-out",
              opacity: isPendingConfirmation ? 0.5 : 1,
              filter: isPendingConfirmation ? "saturate(0.7)" : "none",
            }}
          >
            {renderCardContent(true)}
          </div>,
          document.body
        )}
    </>
  );
};

export default KanbanTaskCard;
