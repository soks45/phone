/* Replace with your SQL commands */
ALTER TABLE user_data
    ADD CONSTRAINT user_data_unique_login UNIQUE (login);
ALTER TABLE user_data
    ADD CONSTRAINT user_data_unique_email UNIQUE (email);
