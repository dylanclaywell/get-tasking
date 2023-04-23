use sqlite::Connection;
use sqlite::Error;

fn create_tags_table(connection: &Connection) -> bool {
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

fn create_todo_items_table(connection: &Connection) -> bool {
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

fn create_todo_items_tags_table(connection: &Connection) -> bool {
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

pub fn create_tables(connection: &Connection) -> bool {
    return create_tags_table(connection)
        && create_todo_items_table(connection)
        && create_todo_items_tags_table(connection);
}

pub fn initialize_database(app_handle: &tauri::AppHandle) -> Result<Connection, Error> {
    let path = app_handle.path_resolver().app_data_dir().unwrap();
    let path_string = path.display();

    if !path.exists() {
        std::fs::create_dir_all(&path).unwrap();
    }

    let connection = sqlite::open(format!("{}{}", path_string, String::from("/database.db")))?;

    create_tables(&connection);

    return Ok(connection);
}
