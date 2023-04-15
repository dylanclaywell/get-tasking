fn create_tags_table() -> bool {
  let connection = sqlite::open("./database.db").unwrap();

  let statement = String::from(
    "
    CREATE TABLE if not exists tags (
      id TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      name TEXT NOT NULL,
      PRIMARY KEY(id)
    );
  ",
  );

  return connection.execute(statement).is_ok();
}

fn create_todo_items_table() -> bool {
  let connection = sqlite::open("./database.db").unwrap();

  let statement = String::from(
    "
      CREATE TABLE if not exists todoItems (
        id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        notes TEXT,
        isCompleted TEXT NOT NULL CHECK(isCompleted in ('true', 'false')),
        dateCompleted TEXT,
        timeCompleted TEXT,
        timezoneCompleted TEXT,
        dateCreated TEXT NOT NULL,
        timeCreated TEXT NOT NULL,
        timezoneCreated TEXT NOT NULL,
        PRIMARY KEY(id)
      );
    ",
  );

  return connection.execute(statement).is_ok();
}

fn create_todo_items_tags_table() -> bool {
  let connection = sqlite::open("./database.db").unwrap();

  let statement = String::from(
    "
      CREATE TABLE if not exists todoItemsTags (
        id TEXT NOT NULL UNIQUE,
        todoItemId TEXT NOT NULL,
        tagId TEXT NOT NULL,
        PRIMARY KEY(id),
        FOREIGN KEY(todoItemId) REFERENCES todoItems(id),
        FOREIGN KEY(tagId) REFERENCES tags(id)
      );
    ",
  );

  return connection.execute(statement).is_ok();
}

#[tauri::command]
pub fn create_tables() -> bool {
  return create_tags_table() && create_todo_items_table() && create_todo_items_tags_table();
}
