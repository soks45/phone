/* Replace with your SQL commands */
create extension if not exists moddatetime;

create trigger user_data_handle_updated_at before update on user_data
    for each row execute procedure moddatetime(updated_at);
