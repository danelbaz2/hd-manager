"""
Seed data for tags (primary and secondary).
"""

def get_primary_tags_data(create_base_fn):
    """Generate primary tags seed data."""
    return [
        { "name": 'פיתוח', "description": "קשור לפיתוח תוכנה", "color": '#3B82F6', "base": create_base_fn("primary_tag", -10)},
        { "name": 'עיצוב', "description": "קשור ל-UI/UX", "color": '#8B5CF6', "base": create_base_fn("primary_tag", -10)},
        { "name": 'שרתים', "description": "DevOps ותשתיות", "color": '#06B6D4', "base": create_base_fn("primary_tag", -10)},
        { "name": 'ניהול', "description": "ניהול פרויקטים", "color": '#22C55E', "base": create_base_fn("primary_tag", -10)},
        { "name": 'בדיקות', "description": "QA וטסטים", "color": '#F97316', "base": create_base_fn("primary_tag", -10)},
    ]


def get_secondary_tags_data(primary_tag_ids, create_base_fn):
    """Generate secondary tags seed data linked to primary tags."""
    return [
        # פיתוח (Dev) secondary tags
        { "name": 'עדכון', "primaryTagId": primary_tag_ids[0], "description": "עדכון קוד או תכונה", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'באג', "primaryTagId": primary_tag_ids[0], "description": "תיקון באג", "base": create_base_fn("secondary_tag", -10)},
        { "name": "פיצ'ר חדש", "primaryTagId": primary_tag_ids[0], "description": "פיתוח תכונה חדשה", "base": create_base_fn("secondary_tag", -10)},
        
        # עיצוב (Design) secondary tags
        { "name": 'UI', "primaryTagId": primary_tag_ids[1], "description": "עיצוב ממשק משתמש", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'UX', "primaryTagId": primary_tag_ids[1], "description": "חווית משתמש", "base": create_base_fn("secondary_tag", -10)},
        
        # שרתים (Servers) secondary tags
        { "name": 'בדיקה', "primaryTagId": primary_tag_ids[2], "description": "בדיקת שרתים", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'גיבוי', "primaryTagId": primary_tag_ids[2], "description": "גיבוי נתונים", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'הגדרה', "primaryTagId": primary_tag_ids[2], "description": "הגדרת סביבה", "base": create_base_fn("secondary_tag", -10)},
        
        # ניהול (Management) secondary tags
        { "name": 'פגישה', "primaryTagId": primary_tag_ids[3], "description": "פגישת צוות", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'מצגת', "primaryTagId": primary_tag_ids[3], "description": "הכנת מצגת", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'תכנון', "primaryTagId": primary_tag_ids[3], "description": "תכנון ספרינט", "base": create_base_fn("secondary_tag", -10)},
        
        # בדיקות (Testing) secondary tags
        { "name": 'אוטומטי', "primaryTagId": primary_tag_ids[4], "description": "בדיקות אוטומטיות", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'ידני', "primaryTagId": primary_tag_ids[4], "description": "בדיקות ידניות", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'E2E', "primaryTagId": primary_tag_ids[4], "description": "בדיקות End-to-End", "base": create_base_fn("secondary_tag", -10)},
    ]


def get_init_primary_tags_data(create_base_fn):
    """Generate primary tags for init mode (8 categories)."""
    return [
        { "name": 'DB', "description": "מסדי נתונים", "color": '#3B82F6', "base": create_base_fn("primary_tag", -10)},
        { "name": 'TD', "description": "תיעוד טכני", "color": '#8B5CF6', "base": create_base_fn("primary_tag", -10)},
        { "name": 'APP', "description": "אפליקציה", "color": '#06B6D4', "base": create_base_fn("primary_tag", -10)},
        { "name": 'GO', "description": "Go Live / העלאה לייצור", "color": '#22C55E', "base": create_base_fn("primary_tag", -10)},
        { "name": 'CORE', "description": "ליבת המערכת", "color": '#F97316', "base": create_base_fn("primary_tag", -10)},
        { "name": 'DVC', "description": "התקנים ומכשירים", "color": '#EC4899', "base": create_base_fn("primary_tag", -10)},
        { "name": 'COMP', "description": "תאימות ואינטגרציה", "color": '#EAB308', "base": create_base_fn("primary_tag", -10)},
        { "name": 'OCP', "description": "תפעול ובקרה", "color": '#14B8A6', "base": create_base_fn("primary_tag", -10)},
    ]


def get_init_secondary_tags_data(primary_tag_ids, create_base_fn):
    """Generate secondary tags for init mode (2 per primary)."""
    return [
        # DB secondary tags
        { "name": 'גיבוי', "primaryTagId": primary_tag_ids[0], "description": "גיבוי מסד נתונים", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'שאילתות', "primaryTagId": primary_tag_ids[0], "description": "אופטימיזציית שאילתות", "base": create_base_fn("secondary_tag", -10)},
        
        # TD secondary tags
        { "name": 'API', "primaryTagId": primary_tag_ids[1], "description": "תיעוד API", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'מדריך', "primaryTagId": primary_tag_ids[1], "description": "מדריך למשתמש", "base": create_base_fn("secondary_tag", -10)},
        
        # APP secondary tags
        { "name": 'פרונטאנד', "primaryTagId": primary_tag_ids[2], "description": "צד לקוח", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'בקאנד', "primaryTagId": primary_tag_ids[2], "description": "צד שרת", "base": create_base_fn("secondary_tag", -10)},
        
        # GO secondary tags
        { "name": 'דיפלוי', "primaryTagId": primary_tag_ids[3], "description": "העלאה לייצור", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'רולבק', "primaryTagId": primary_tag_ids[3], "description": "חזרה לגרסה קודמת", "base": create_base_fn("secondary_tag", -10)},
        
        # CORE secondary tags
        { "name": 'אבטחה', "primaryTagId": primary_tag_ids[4], "description": "אבטחת מידע", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'ביצועים', "primaryTagId": primary_tag_ids[4], "description": "אופטימיזציית ביצועים", "base": create_base_fn("secondary_tag", -10)},
        
        # DVC secondary tags
        { "name": 'מובייל', "primaryTagId": primary_tag_ids[5], "description": "מכשירים ניידים", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'IoT', "primaryTagId": primary_tag_ids[5], "description": "התקנים חכמים", "base": create_base_fn("secondary_tag", -10)},
        
        # COMP secondary tags
        { "name": 'API חיצוני', "primaryTagId": primary_tag_ids[6], "description": "אינטגרציה חיצונית", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'מיגרציה', "primaryTagId": primary_tag_ids[6], "description": "העברת נתונים", "base": create_base_fn("secondary_tag", -10)},
        
        # OCP secondary tags
        { "name": 'ניטור', "primaryTagId": primary_tag_ids[7], "description": "ניטור מערכת", "base": create_base_fn("secondary_tag", -10)},
        { "name": 'התראות', "primaryTagId": primary_tag_ids[7], "description": "מערכת התראות", "base": create_base_fn("secondary_tag", -10)},
    ]
