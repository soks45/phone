/* Replace with your SQL commands */
CREATE TABLE meeting_user (
   meeting_id UUID NOT NULL REFERENCES meeting(id),
   user_id SERIAL NOT NULL REFERENCES user_data(id),
   PRIMARY KEY (meeting_id, user_id)
);

CREATE INDEX idx_meeting_user_meeting_id ON meeting_user (meeting_id);
