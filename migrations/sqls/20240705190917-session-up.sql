/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS session (
     sid VARCHAR PRIMARY KEY,
     sess JSON NOT NULL,
     expire TIMESTAMP(6) NOT NULL
);
