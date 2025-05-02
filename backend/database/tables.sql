CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS users (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rfid_tags (
    rfid INT PRIMARY KEY,
    used BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS camera (
    camera_id INT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS employee (
    emp_id INT PRIMARY KEY,
    safety_met BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    id INT PRIMARY KEY,
    category TEXT NOT NULL,
    perishable BOOLEAN NOT NULL,
    weight INT NOT NULL,
    dry BOOLEAN NOT NULL,
    fragile BOOLEAN NOT NULL,
    threshold INT NOT NULL,
    expiry_date DATE,
    timestamp_in TIMESTAMP,
    timestamp_out TIMESTAMP,
    camera_id INT,
    rfid INT,
    FOREIGN KEY (camera_id) REFERENCES camera(camera_id),
    FOREIGN KEY (rfid) REFERENCES rfid_tags(rfid)
);

CREATE TABLE IF NOT EXISTS cv_models (
    id INT PRIMARY KEY,
    alarm_type TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    camera_id INT,
    FOREIGN KEY (camera_id) REFERENCES camera(camera_id)
);