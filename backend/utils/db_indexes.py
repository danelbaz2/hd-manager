"""
MongoDB Index Management
Creates necessary indexes for optimal query performance.
Indexes are created if they don't already exist.

Based on PERF-005 recommendations from 3.1.md diagnostic report.
"""
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import OperationFailure
import logging

logger = logging.getLogger(__name__)


def ensure_indexes(db):
    """
    Create all necessary indexes for optimal performance.
    Skips indexes that already exist.
    
    Args:
        db: PyMongo database instance (mongo.db)
    """
    print("\n🔍 Checking database indexes...")
    
    indexes_created = 0
    indexes_existed = 0
    
    # ========================================
    # Collection: ents (tasks, tags, chat, etc.)
    # ========================================
    
    # Compound index for filtering by entity type and deleted status
    # Used by: GET /api/tasks/, GET /api/primary-tags/, etc.
    indexes_created += _create_index_if_not_exists(
        db.ents,
        [("base.entityType", ASCENDING), ("base.isDeleted", ASCENDING)],
        "idx_ents_entityType_isDeleted",
        background=True
    )
    
    # Index on date for date-range queries
    # Used by: GET /api/tasks/?startDate=X&endDate=Y
    indexes_created += _create_index_if_not_exists(
        db.ents,
        [("date", DESCENDING)],
        "idx_ents_date",
        background=True
    )
    
    # Compound index for task queries with date range
    # Optimizes: tasks filtered by type, not deleted, and date range
    indexes_created += _create_index_if_not_exists(
        db.ents,
        [("base.entityType", ASCENDING), ("base.isDeleted", ASCENDING), ("date", DESCENDING)],
        "idx_ents_entityType_isDeleted_date",
        background=True
    )
    
    # Index on responsibleUserIds for user-specific task queries
    indexes_created += _create_index_if_not_exists(
        db.ents,
        [("responsibleUserIds", ASCENDING)],
        "idx_ents_responsibleUserIds",
        background=True
    )
    
    # ========================================
    # Collection: users
    # ========================================
    
    # Unique index on username for login queries
    # Used by: POST /api/auth/login
    indexes_created += _create_index_if_not_exists(
        db.users,
        [("username", ASCENDING)],
        "idx_users_username",
        unique=True,
        background=True
    )
    
    # Index for active user queries
    # Used by: GET /api/users/
    indexes_created += _create_index_if_not_exists(
        db.users,
        [("base.isDeleted", ASCENDING)],
        "idx_users_isDeleted",
        background=True
    )
    
    # ========================================
    # Collection: ents_archive (task history)
    # ========================================
    
    # Index on timestamp for history queries
    # Used by: GET /api/tasks/history, Activity Feed
    indexes_created += _create_index_if_not_exists(
        db.ents_archive,
        [("c.timestamp", DESCENDING)],
        "idx_archive_timestamp",
        background=True
    )
    
    # Index on taskId for task-specific history
    # Used by: GET /api/tasks/{id}/history
    indexes_created += _create_index_if_not_exists(
        db.ents_archive,
        [("c.taskId", ASCENDING)],
        "idx_archive_taskId",
        background=True
    )
    
    # Compound index for task history queries
    indexes_created += _create_index_if_not_exists(
        db.ents_archive,
        [("c.taskId", ASCENDING), ("c.timestamp", DESCENDING)],
        "idx_archive_taskId_timestamp",
        background=True
    )
    
    # ========================================
    # Collection: contacts
    # ========================================
    
    # Index for active contact queries
    indexes_created += _create_index_if_not_exists(
        db.contacts,
        [("base.isDeleted", ASCENDING)],
        "idx_contacts_isDeleted",
        background=True
    )
    
    # ========================================
    # Collection: idempotency_keys (for request deduplication)
    # ========================================
    
    # TTL index for automatic cleanup (24 hours)
    indexes_created += _create_index_if_not_exists(
        db.idempotency_keys,
        [("createdAt", ASCENDING)],
        "idx_idempotency_ttl",
        expireAfterSeconds=86400,  # 24 hours
        background=True
    )
    
    # Summary
    total_checked = indexes_created + indexes_existed
    if indexes_created > 0:
        print(f"✅ Created {indexes_created} new index(es)")
    print(f"📊 Total indexes verified: {total_checked}")
    print()


def _create_index_if_not_exists(collection, keys, name, **kwargs):
    """
    Create an index if it doesn't already exist.
    
    Args:
        collection: PyMongo collection
        keys: List of (field, direction) tuples
        name: Index name
        **kwargs: Additional index options (unique, expireAfterSeconds, etc.)
    
    Returns:
        1 if index was created, 0 if it already existed
    """
    try:
        # Check if index already exists
        existing_indexes = collection.index_information()
        
        if name in existing_indexes:
            logger.debug(f"Index '{name}' already exists on {collection.name}")
            return 0
        
        # Create the index
        collection.create_index(keys, name=name, **kwargs)
        logger.info(f"Created index '{name}' on {collection.name}")
        print(f"  ✓ Created index: {name}")
        return 1
        
    except OperationFailure as e:
        if "already exists" in str(e):
            logger.debug(f"Index '{name}' already exists (race condition)")
            return 0
        logger.error(f"Failed to create index '{name}': {e}")
        print(f"  ✗ Failed to create index: {name} - {e}")
        return 0
    except Exception as e:
        logger.error(f"Unexpected error creating index '{name}': {e}")
        print(f"  ✗ Error creating index: {name} - {e}")
        return 0


def list_all_indexes(db):
    """
    List all indexes in the database (for debugging).
    
    Args:
        db: PyMongo database instance
    """
    collections = ["ents", "users", "ents_archive", "contacts", "idempotency_keys"]
    
    print("\n📋 Current Database Indexes:")
    print("=" * 50)
    
    for coll_name in collections:
        try:
            collection = db[coll_name]
            indexes = collection.index_information()
            print(f"\n{coll_name}:")
            for name, info in indexes.items():
                keys = info.get("key", [])
                unique = "UNIQUE" if info.get("unique") else ""
                ttl = f"TTL:{info.get('expireAfterSeconds')}s" if "expireAfterSeconds" in info else ""
                extras = " ".join(filter(None, [unique, ttl]))
                print(f"  - {name}: {keys} {extras}")
        except Exception as e:
            print(f"\n{coll_name}: (error: {e})")
    
    print("=" * 50)
