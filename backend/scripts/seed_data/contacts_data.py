"""
Seed data for contacts entity.
"""

def get_contacts_data(primary_tag_ids, create_base_fn):
    """Generate contacts seed data linked to primary tags."""
    return [
        { "fullName": 'תמיכה טכנית', "position": 'חיצוני', "department": "IT", "phoneNumber": '050-0000000', "primaryTagIds": [primary_tag_ids[2]], "base": create_base_fn("contact", -30)},
        { "fullName": 'ספק שרתים', "position": 'ספק', "department": "Infra", "phoneNumber": '052-1111111', "primaryTagIds": [primary_tag_ids[2]], "base": create_base_fn("contact", -30)},
    ]


def get_init_contacts_data(primary_tag_ids, create_base_fn):
    """Generate contacts for init mode (10 contacts with tag connections)."""
    return [
        # DB related contacts
        { "fullName": 'יוסי כהן', "position": 'DBA', "department": "IT", "phoneNumber": '050-1234567', "primaryTagIds": [primary_tag_ids[0]], "base": create_base_fn("contact", -30)},
        { "fullName": 'מיכל לוי', "position": 'מנהלת מסדי נתונים', "department": "IT", "phoneNumber": '052-2345678', "primaryTagIds": [primary_tag_ids[0], primary_tag_ids[4]], "base": create_base_fn("contact", -30)},
        
        # APP related contacts
        { "fullName": 'דוד ישראלי', "position": 'מפתח בכיר', "department": "פיתוח", "phoneNumber": '053-3456789', "primaryTagIds": [primary_tag_ids[2]], "base": create_base_fn("contact", -30)},
        { "fullName": 'רחל אברהם', "position": 'ארכיטקטית', "department": "פיתוח", "phoneNumber": '054-4567890', "primaryTagIds": [primary_tag_ids[2], primary_tag_ids[4]], "base": create_base_fn("contact", -30)},
        
        # GO & OCP related contacts
        { "fullName": 'אבי שמעון', "position": 'DevOps', "department": "תפעול", "phoneNumber": '055-5678901', "primaryTagIds": [primary_tag_ids[3], primary_tag_ids[7]], "base": create_base_fn("contact", -30)},
        { "fullName": 'נועה פרידמן', "position": 'מנהלת תפעול', "department": "תפעול", "phoneNumber": '056-6789012', "primaryTagIds": [primary_tag_ids[7]], "base": create_base_fn("contact", -30)},
        
        # DVC related contacts
        { "fullName": 'עומר גולן', "position": 'מהנדס IoT', "department": "R&D", "phoneNumber": '057-7890123', "primaryTagIds": [primary_tag_ids[5]], "base": create_base_fn("contact", -30)},
        { "fullName": 'שירה נחמן', "position": 'מפתחת מובייל', "department": "פיתוח", "phoneNumber": '058-8901234', "primaryTagIds": [primary_tag_ids[5], primary_tag_ids[2]], "base": create_base_fn("contact", -30)},
        
        # TD & COMP related contacts
        { "fullName": 'אלון ברק', "position": 'כותב טכני', "department": "תיעוד", "phoneNumber": '059-9012345', "primaryTagIds": [primary_tag_ids[1]], "base": create_base_fn("contact", -30)},
        { "fullName": 'תמר רוזן', "position": 'מנהלת אינטגרציות', "department": "פיתוח", "phoneNumber": '050-0123456', "primaryTagIds": [primary_tag_ids[6], primary_tag_ids[1]], "base": create_base_fn("contact", -30)},
    ]
