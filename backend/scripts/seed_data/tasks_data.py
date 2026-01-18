"""
Seed data for tasks entity.
Provides task generation with random dates within a configurable range.
"""

import random
from datetime import datetime, timedelta
from bson.objectid import ObjectId


# Task title templates for variety
TASK_TITLES = [
    "בדיקת שרתים", "פיתוח פיצ'ר חדש", "תיקון באג", "סקירת קוד",
    "עדכון תיעוד", "פגישת צוות", "בדיקות אוטומטיות", "אינטגרציה",
    "אופטימיזציה", "עיצוב UI", "ניהול פרויקט", "תמיכה טכנית",
    "פיתוח API", "הגדרת סביבה", "העלאה לייצור", "גיבוי נתונים",
    "שדרוג מערכת", "בדיקת אבטחה", "תיקון ביצועים", "עיצוב UX",
    "ריפקטורינג קוד", "הוספת לוגים", "טסט יחידות", "דוקומנטציה"
]

TASK_DESCRIPTIONS = [
    "משימה לטובת בדיקת ביצועים",
    "פיתוח קומפוננטה חדשה",
    "פתרון בעיה קריטית",
    "עבודה שוטפת",
    "משימה דחופה",
    "שיפור חווית משתמש",
    "תחזוקה שוטפת",
    "אופטימיזציה למהירות",
]

STATUSES = ['pending', 'in_progress', 'completed']
PRIORITIES = ['low', 'medium', 'high']
PRIORITY_WEIGHTS = [30, 50, 20]  # low=30%, medium=50%, high=20%


def get_timestamp_ms():
    """Get current timestamp in milliseconds."""
    return int(datetime.now().timestamp() * 1000)


def get_relative_date(diff_days):
    """Get timestamp for a date relative to today."""
    return int((datetime.now() + timedelta(days=diff_days)).timestamp() * 1000)


class TaskGenerator:
    """
    Generates random tasks with configurable parameters.
    """
    
    def __init__(self, users_data, secondary_tag_ids, contact_ids=None):
        """
        Initialize the task generator.
        
        Args:
            users_data: List of user dicts with '_id' and 'fullName'
            secondary_tag_ids: List of secondary tag IDs to assign
            contact_ids: Optional list of contact IDs for participants
        """
        self.users_data = users_data
        self.user_ids = [u['_id'] for u in users_data]
        self.secondary_tag_ids = secondary_tag_ids
        self.contact_ids = contact_ids or []
    
    def generate_tasks(self, count=20, date_range_days=7, date_range_before=0):
        """
        Generate random tasks within a date range.
        
        Args:
            count: Number of tasks to generate
            date_range_days: Days after today for task dates (0 = today only)
            date_range_before: Days before today for task dates (0 = no past dates)
        
        Returns:
            List of task dicts ready for insertion
        """
        tasks = []
        
        # Total range includes both before and after
        total_range = date_range_before + date_range_days + 1  # +1 for today
        
        for i in range(count):
            task = self._create_task(i, date_range_days, date_range_before, total_range)
            tasks.append(task)
        
        return tasks
    
    def _create_task(self, index, date_range_days, date_range_before, total_range):
        """Create a single task with random properties."""
        # Spread tasks across the full date range (before and after today)
        # Range is from -date_range_before to +date_range_days
        day_offset = (index % total_range) - date_range_before
        task_date = get_relative_date(day_offset)
        deadline = get_relative_date(day_offset + random.randint(1, 3))
        
        # Random assignment
        creator_idx = random.randint(0, len(self.users_data) - 1)
        creator = self.users_data[creator_idx]
        creator_id = creator['_id']
        creator_name = creator['fullName']
        
        # Sometimes assign to multiple users (20% chance)
        responsible_user_ids = [creator_id]
        if random.random() < 0.2 and len(self.user_ids) > 1:
            other_idx = random.choice([i for i in range(len(self.user_ids)) if i != creator_idx])
            responsible_user_ids.append(self.user_ids[other_idx])
        
        # Sometimes add participants (contacts) - 15% chance
        participant_ids = []
        if self.contact_ids and random.random() < 0.15:
            participant_ids = [random.choice(self.contact_ids)]
        
        # Random secondary tags (0-2)
        num_tags = random.randint(0, min(2, len(self.secondary_tag_ids)))
        selected_tags = random.sample(self.secondary_tag_ids, num_tags) if num_tags > 0 else []
        
        # Creation timestamp (hours ago for realism)
        hours_ago = random.randint(1, 48)
        created_at = get_timestamp_ms() - (hours_ago * 3600 * 1000)
        
        # Title with index for uniqueness
        title = f"{random.choice(TASK_TITLES)} #{index + 1}"
        
        task = {
            "_id": str(ObjectId()),
            "title": title,
            "description": random.choice(TASK_DESCRIPTIONS),
            "status": "pending",  # All start as pending, history will update
            "priority": random.choices(PRIORITIES, weights=PRIORITY_WEIGHTS)[0],
            "responsibleUserIds": responsible_user_ids,
            "participantIds": participant_ids,
            "secondaryTagIds": selected_tags,
            "date": task_date,
            "deadline": deadline,
            "base": {
                "isDeleted": False,
                "isActive": True,
                "createdAt": created_at,
                "updatedAt": created_at,
                "entityType": "task",
                "createdBy": creator_name,
                "updatedBy": creator_name
            }
        }
        
        return task
    
    def get_creator_info(self, task):
        """Get the creator user info for a task."""
        creator_name = task['base']['createdBy']
        for user in self.users_data:
            if user['fullName'] == creator_name:
                return user
        return self.users_data[0]  # Fallback to first user
