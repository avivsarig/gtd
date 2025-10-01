-- Seed default contexts for testing
-- Run with: psql -U gtd -d gtd -f seed_contexts.sql

INSERT INTO contexts (name, description, icon, sort_order) VALUES
    ('@computer', 'Tasks requiring a computer', 'computer', 1),
    ('@phone', 'Calls to make', 'phone', 2),
    ('@home', 'Tasks to do at home', 'home', 3),
    ('@office', 'Tasks to do at office', 'briefcase', 4),
    ('@errands', 'Things to do while out', 'shopping-cart', 5),
    ('@waiting', 'Waiting for someone else', 'clock', 6),
    ('@anywhere', 'Can do from anywhere', 'globe', 7)
ON CONFLICT (name) DO NOTHING;
