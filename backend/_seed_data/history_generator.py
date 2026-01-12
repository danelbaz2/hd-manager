"""
History generator for coherent task history entries.
Ensures histories are logically consistent:
- First entry is always CREATE by the task creator
- Subsequent actions only by responsible users
- Chronological timestamp progression
- Realistic status flow (pending -> in_progress -> completed)
"""

import random
from datetime import datetime
from bson.objectid import ObjectId


# Example notes in Hebrew
NOTES_EXAMPLES = [
    "התחלתי לעבוד על זה",
    "צריך לבדוק עם הצוות",
    "ממתין לאישור",
    "בודק את הפתרון",
    "מתקדם יפה",
    "נתקלתי בבעיה קטנה",
    "הבעיה נפתרה",
    "מעדכן את הקוד",
    "בדיקות עברו בהצלחה",
    "מחכה לסקירת קוד",
    "סיימתי את החלק הראשון",
    "עובר לשלב הבא",
    "צריך עזרה מהצוות",
    "בדקתי והכל תקין",
]

# Weight distribution for action types
ACTION_WEIGHTS = {
    'note': 50,
    'status_change': 30,
    'assignment': 20,
}


def get_timestamp_ms():
    """Get current timestamp in milliseconds."""
    return int(datetime.now().timestamp() * 1000)


class HistoryGenerator:
    """
    Generates coherent history entries for tasks.
    """
    
    def __init__(self, users_data, mongo_db):
        """
        Initialize the history generator.
        
        Args:
            users_data: List of user dicts with '_id' and 'fullName'
            mongo_db: MongoDB database instance
        """
        self.users_data = users_data
        self.user_ids = [u['_id'] for u in users_data]
        self.user_map = {u['_id']: u for u in users_data}
        self.db = mongo_db
    
    def get_user_name(self, user_id):
        """Get user full name by ID."""
        user = self.user_map.get(user_id)
        return user['fullName'] if user else 'מערכת'
    
    def get_responsible_users(self, task):
        """Get list of users who can perform actions on this task."""
        responsible_ids = task.get('responsibleUserIds', [])
        return [self.user_map[uid] for uid in responsible_ids if uid in self.user_map]
    
    def generate_history_for_task(self, task, min_entries=0, max_entries=5):
        """
        Generate coherent history entries for a single task.
        
        The first entry is CREATE (already logged during task creation).
        This method generates subsequent UPDATE entries.
        
        Args:
            task: The task dict
            min_entries: Minimum history entries to add
            max_entries: Maximum history entries to add
        
        Returns:
            Number of history entries created
        """
        # Determine how many entries to add (weighted towards fewer)
        weights = [25, 25, 20, 15, 10, 5][:max_entries - min_entries + 1]
        num_entries = random.choices(
            range(min_entries, max_entries + 1),
            weights=weights
        )[0]
        
        if num_entries == 0:
            return 0
        
        task_id = task['_id']
        current_status = task['status']
        current_responsible = task['responsibleUserIds'].copy()
        current_task = task.copy()
        
        # Get responsible users who can perform actions
        responsible_users = self.get_responsible_users(task)
        if not responsible_users:
            # Fallback: use a random user
            responsible_users = [random.choice(self.users_data)]
        
        entries_created = 0
        base_time = task['base']['createdAt']
        
        for i in range(num_entries):
            # Pick an actor from responsible users
            actor = random.choice(responsible_users)
            actor_name = actor['fullName']
            
            # Calculate timestamp (each entry is 10-60 minutes after the previous)
            minutes_later = random.randint(10, 60)
            entry_timestamp = base_time + ((i + 1) * minutes_later * 60 * 1000)
            
            # Choose action type
            action_type = random.choices(
                ['note', 'status_change', 'assignment'],
                weights=[ACTION_WEIGHTS['note'], ACTION_WEIGHTS['status_change'], ACTION_WEIGHTS['assignment']]
            )[0]
            
            success = False
            
            if action_type == 'note':
                success = self._add_note_entry(task_id, actor_name, entry_timestamp)
            
            elif action_type == 'status_change':
                success, new_status = self._add_status_change(
                    task_id, current_task, current_status, actor_name, entry_timestamp
                )
                if success:
                    current_status = new_status
                    current_task['status'] = new_status
            
            elif action_type == 'assignment':
                success, new_responsible = self._add_assignment_change(
                    task_id, current_task, current_responsible, actor_name, entry_timestamp
                )
                if success:
                    current_responsible = new_responsible
                    current_task['responsibleUserIds'] = new_responsible
                    # Update responsible users for future actions
                    responsible_users = [self.user_map[uid] for uid in new_responsible if uid in self.user_map]
                    if not responsible_users:
                        responsible_users = [random.choice(self.users_data)]
            
            if success:
                entries_created += 1
                base_time = entry_timestamp
        
        return entries_created
    
    def _add_note_entry(self, task_id, actor_name, timestamp):
        """Add a NOTE history entry."""
        note_text = random.choice(NOTES_EXAMPLES)
        
        note_id = str(ObjectId())
        entry = {
            'o': None,
            'c': {
                'action': 'CREATE',
                'timestamp': timestamp,
                'content': note_text,
                'base': {
                    'updatedBy': actor_name,
                    'updatedAt': timestamp
                }
            },
            'n': {
                'id': note_id,
                'taskId': task_id,
                'content': note_text,
                'base': {
                    'isDeleted': False,
                    'isActive': True,
                    'createdAt': timestamp,
                    'updatedAt': timestamp,
                    'entityType': 'note',
                    'createdBy': actor_name,
                    'updatedBy': actor_name
                }
            }
        }
        
        self.db.ents_archive.insert_one(entry)
        return True
    
    def _add_status_change(self, task_id, current_task, current_status, actor_name, timestamp):
        """
        Add a status change history entry.
        Status can only progress: pending -> in_progress -> completed
        """
        # Determine valid next status
        if current_status == 'pending':
            new_status = 'in_progress'
        elif current_status == 'in_progress':
            # 70% chance to complete, 30% chance to stay in progress (no change)
            if random.random() < 0.7:
                new_status = 'completed'
            else:
                return False, current_status
        else:
            # Already completed, can't change
            return False, current_status
        
        # Update task in DB
        self.db.ents.update_one(
            {'_id': task_id},
            {'$set': {
                'status': new_status,
                'base.updatedAt': timestamp,
                'base.updatedBy': actor_name
            }}
        )
        
        # Create history entry
        old_task = current_task.copy()
        new_task = current_task.copy()
        new_task['status'] = new_status
        new_task['base'] = new_task.get('base', {}).copy()
        new_task['base']['updatedAt'] = timestamp
        new_task['base']['updatedBy'] = actor_name
        
        # Clean _id to id for history
        if '_id' in old_task:
            old_task['id'] = old_task.pop('_id')
        if '_id' in new_task:
            new_task['id'] = new_task.pop('_id')
        
        entry = {
            '_id': str(ObjectId()),
            'o': old_task,
            'c': {
                'action': 'UPDATE',
                'timestamp': timestamp,
                'status': new_status,
                'base': {
                    'updatedAt': timestamp,
                    'updatedBy': actor_name
                }
            },
            'n': new_task
        }
        
        self.db.ents_archive.insert_one(entry)
        return True, new_status
    
    def _add_assignment_change(self, task_id, current_task, current_responsible, actor_name, timestamp):
        """Add a reassignment history entry."""
        # Pick a different user to assign
        available_users = [uid for uid in self.user_ids if uid not in current_responsible]
        
        if not available_users:
            return False, current_responsible
        
        new_user_id = random.choice(available_users)
        new_responsible = [new_user_id]
        
        # Update task in DB
        self.db.ents.update_one(
            {'_id': task_id},
            {'$set': {
                'responsibleUserIds': new_responsible,
                'base.updatedAt': timestamp,
                'base.updatedBy': actor_name
            }}
        )
        
        # Create history entry
        old_task = current_task.copy()
        new_task = current_task.copy()
        new_task['responsibleUserIds'] = new_responsible
        new_task['base'] = new_task.get('base', {}).copy()
        new_task['base']['updatedAt'] = timestamp
        new_task['base']['updatedBy'] = actor_name
        
        # Clean _id to id for history
        if '_id' in old_task:
            old_task['id'] = old_task.pop('_id')
        if '_id' in new_task:
            new_task['id'] = new_task.pop('_id')
        
        entry = {
            '_id': str(ObjectId()),
            'o': old_task,
            'c': {
                'action': 'UPDATE',
                'timestamp': timestamp,
                'responsibleUserIds': new_responsible,
                'base': {
                    'updatedAt': timestamp,
                    'updatedBy': actor_name
                }
            },
            'n': new_task
        }
        
        self.db.ents_archive.insert_one(entry)
        return True, new_responsible
