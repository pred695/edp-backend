#!/bin/bash

# Script to populate the PostgreSQL database in Docker container with dummy data

# Variables
CONTAINER_NAME="edp_database"  # Update this if your container has a different name
DB_USER="postgres"
DB_NAME="edp_database"

# Create a temporary SQL file
TMP_SQL_FILE="./tmp_populate_data.sql"

echo "Creating temporary SQL file with dummy data..."

# Write SQL data to temporary file
cat > $TMP_SQL_FILE << 'EOF'
-- Populate rfid_tags table
INSERT INTO rfid_tags (rfid, used) VALUES 
(1001, true),
(1002, false),
(1003, true),
(1004, false),
(1005, true),
(1006, false),
(1007, true),
(1008, false),
(1009, true),
(1010, false);dock

-- Populate camera table
INSERT INTO camera (camera_id) VALUES 
(101),
(102),
(103),
(104),
(105);

-- Populate employee table
INSERT INTO employee (emp_id, safety_met) VALUES 
(201, true),
(202, false),
(203, true),
(204, true),
(205, false);

-- Populate items table
INSERT INTO items (
    id, 
    category, 
    perishable, 
    weight, 
    dry, 
    fragile, 
    threshold, 
    expiry_date, 
    timestamp_in, 
    timestamp_out, 
    camera_id, 
    rfid
) VALUES 
(301, 'Electronics', false, 500, true, true, 100, NULL, '2023-04-10 08:30:00', NULL, 101, 1001),
(302, 'Food', true, 200, false, false, 50, '2023-05-15', '2023-04-10 09:15:00', '2023-04-11 14:30:00', 102, 1003),
(303, 'Clothing', false, 300, false, false, 30, NULL, '2023-04-10 10:00:00', NULL, 101, 1005),
(304, 'Furniture', false, 2000, true, true, 150, NULL, '2023-04-10 11:30:00', NULL, 103, 1007),
(305, 'Books', false, 800, true, false, 40, NULL, '2023-04-11 08:00:00', '2023-04-12 16:45:00', 104, 1009),
(306, 'Toys', false, 150, true, false, 25, NULL, '2023-04-11 09:30:00', NULL, 102, 1002),
(307, 'Dairy', true, 100, false, true, 15, '2023-04-20', '2023-04-11 10:15:00', NULL, 105, 1004),
(308, 'Vegetables', true, 250, false, false, 20, '2023-04-18', '2023-04-11 11:45:00', '2023-04-13 09:30:00', 103, 1006),
(309, 'Glass', false, 350, true, true, 60, NULL, '2023-04-12 08:30:00', NULL, 104, 1008),
(310, 'Paper', false, 400, true, false, 35, NULL, '2023-04-12 09:45:00', '2023-04-14 11:15:00', 105, 1010);

-- Populate cv_models table
INSERT INTO cv_models (id, alarm_type, timestamp, camera_id) VALUES 
(401, 'Motion', '2023-04-10 08:35:00', 101),
(402, 'Object', '2023-04-10 09:20:00', 102),
(403, 'Face', '2023-04-10 10:05:00', 101),
(404, 'Motion', '2023-04-10 11:35:00', 103),
(405, 'Object', '2023-04-11 08:05:00', 104),
(406, 'Face', '2023-04-11 09:35:00', 102),
(407, 'Motion', '2023-04-11 10:20:00', 105),
(408, 'Object', '2023-04-11 11:50:00', 103),
(409, 'Face', '2023-04-12 08:35:00', 104),
(410, 'Motion', '2023-04-12 09:50:00', 105);

-- Verify data insertion
SELECT 'RFID Tags: ' || COUNT(*) AS rfid_tag_count FROM rfid_tags;
SELECT 'Cameras: ' || COUNT(*) AS camera_count FROM camera;
SELECT 'Employees: ' || COUNT(*) AS employee_count FROM employee;
SELECT 'Items: ' || COUNT(*) AS item_count FROM items;
SELECT 'CV Models: ' || COUNT(*) AS cv_model_count FROM cv_models;
EOF

echo "Copying SQL file to Docker container..."
docker cp $TMP_SQL_FILE $CONTAINER_NAME:/tmp/populate_data.sql

echo "Executing SQL script inside Docker container..."
docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -f /tmp/populate_data.sql

echo "Cleaning up temporary file..."
rm $TMP_SQL_FILE
docker exec $CONTAINER_NAME rm /tmp/populate_data.sql

echo "Database population complete!"