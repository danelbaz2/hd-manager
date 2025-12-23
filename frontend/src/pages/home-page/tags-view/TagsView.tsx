import React from "react";
import { useTheme, useSettings } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import {
  type PrimaryTagData,
  type SecondaryTagData,
} from "../../../schemas/tagTypes";
import TagAccordion from "./TagAccordion";

interface TagsViewProps {
  tasks: Task[];
  users: UserData[];
  searchQuery?: string;
  onTaskClick?: (task: Task) => void;
}

/**
 * Filter primary tags by search query (matches primary or secondary tag names)
 */
const filterTagsBySearch = (
  primaryTags: PrimaryTagData[],
  secondaryTags: SecondaryTagData[],
  query: string
): PrimaryTagData[] => {
  if (!query.trim()) return primaryTags;

  const lowerQuery = query.toLowerCase();

  return primaryTags.filter((primaryTag) => {
    // Check if primary tag name matches
    if (primaryTag.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Check if any secondary tag under this primary matches
    const relatedSecondary = secondaryTags.filter(
      (st) => st.primaryTagId === primaryTag.id
    );
    return relatedSecondary.some((st) =>
      st.name.toLowerCase().includes(lowerQuery)
    );
  });
};

/**
 * TagsView - Shows tasks grouped by tags in accordion style
 * Search filters by tag names (primary or secondary)
 */
const TagsView: React.FC<TagsViewProps> = ({
  tasks,
  users,
  searchQuery = "",
  onTaskClick,
}) => {
  const { primaryTags, secondaryTags } = useSettings();

  // Filter tags by search query (matches tag names)
  const filteredPrimaryTags = filterTagsBySearch(
    primaryTags,
    secondaryTags,
    searchQuery
  );

  // Group tasks by primary tag
  const groupedByPrimaryTag = filteredPrimaryTags.map((primaryTag) => {
    // Get secondary tags for this primary tag
    const relatedSecondaryTags = secondaryTags.filter(
      (st) => st.primaryTagId === primaryTag.id
    );

    // Get tasks that have any of these secondary tags
    const tagTasks = tasks.filter((task) =>
      task.secondaryTagIds?.some((tagId) =>
        relatedSecondaryTags.some((st) => st.id === tagId)
      )
    );

    return {
      primaryTag,
      secondaryTags: relatedSecondaryTags,
      tasks: tagTasks,
      count: tagTasks.length,
    };
  });

  // Filter out empty groups
  const nonEmptyGroups = groupedByPrimaryTag.filter((g) => g.count > 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Tags Accordion */}
      {nonEmptyGroups.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <div className="space-y-3">
          {nonEmptyGroups.map((group) => (
            <TagAccordion
              key={group.primaryTag.id}
              primaryTag={group.primaryTag}
              secondaryTags={group.secondaryTags}
              tasks={group.tasks}
              users={users}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`text-center py-16
        ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
    >
      <p className="text-lg">אין משימות להצגה</p>
      <p className="text-sm mt-2">
        {searchQuery
          ? "לא נמצאו תגיות התואמות לחיפוש"
          : "אין משימות עם תגיות בתאריך הנבחר"}
      </p>
    </div>
  );
};

export default TagsView;
