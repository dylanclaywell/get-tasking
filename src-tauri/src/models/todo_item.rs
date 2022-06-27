use crate::database;
use serde::{Deserialize, Serialize};
use sqlite::State;

#[derive(Serialize, Deserialize, Debug)]
pub struct TodoItem {
  pub id: String,
  pub title: String,
  pub description: Option<String>,
  pub notes: Option<String>,
  pub is_completed: bool,
  pub date_completed: Option<String>,
  pub time_completed: Option<String>,
  pub timezone_completed: Option<String>,
  pub date_created: String,
  pub time_created: String,
  pub timezone_created: String,
}

fn create_todo_items_folder() {
  let connection = sqlite::open("./database.db").unwrap();

  let statement = String::from(
    "
      CREATE TABLE todoItems (
        id	INTEGER NOT NULL UNIQUE,
        title	TEXT NOT NULL,
        description	TEXT,
        notes	TEXT,
        isCompleted	TEXT NOT NULL CHECK(isCompleted in ('true', 'false')),
        dateCompleted	TEXT,
        timeCompleted	TEXT,
        timezoneCompleted	TEXT,
        dateCreated	TEXT NOT NULL,
        timeCreated	TEXT NOT NULL,
        timezoneCreated	TEXT NOT NULL,
        PRIMARY KEY(id)
      );
    ",
  );

  connection.execute(statement).unwrap();
}

// pub fn create(folder: Folder) -> Folder {
//   if !database::table_exists(String::from("folders")) {
//     create_todo_items_folder();
//   }

//   let connection = sqlite::open("./database.db").unwrap();
//   let mut statement = connection
//     .prepare(
//       "
//         insert into folders (
//           id,
//           name
//         ) values (
//           ?,
//           ?
//         )
//       ",
//     )
//     .unwrap();

//   statement.bind(1, &*folder.id).unwrap();
//   statement.bind(2, &*folder.name).unwrap();

//   statement.next().unwrap();

//   println!("Creating folder");
//   println!("  - id: {}", folder.id);
//   println!("  - name: {}", folder.name);

//   return folder;
// }

// pub fn delete(id: String) {
//   if !database::table_exists(String::from("folders")) {
//     create_todo_items_folder();
//   }

//   let connection = sqlite::open("./database.db").unwrap();

//   let mut delete_folder_notes_statement = connection
//     .prepare(
//       "
//       delete from notes where folderId = ?
//     ",
//     )
//     .unwrap();

//   delete_folder_notes_statement.bind(1, &*id).unwrap();

//   delete_folder_notes_statement.next().unwrap();

//   let mut delete_folder_statement = connection
//     .prepare(
//       "
//         delete from folders where id = ?
//       ",
//     )
//     .unwrap();

//   delete_folder_statement.bind(1, &*id).unwrap();

//   delete_folder_statement.next().unwrap();

//   println!("Deleting folder");
//   println!("  - id: {}", id);
// }

pub fn get_all(date_completed: String) -> Vec<TodoItem> {
  let connection = sqlite::open("./database.db").unwrap();

  if !database::table_exists(String::from("todoItems")) {
    create_todo_items_folder();
  }

  let mut todo_items = Vec::new();

  let mut statement = connection
    .prepare(
      "
        select
          id,
          title,
          description,
          notes,
          isCompleted,
          dateCompleted,
          timeCompleted,
          timezoneCompleted,
          dateCreated,
          timeCreated,
          timezoneCreated
        from todoItems
        where
          dateCompleted = ? or dateCompleted is null
      ",
    )
    .unwrap();

  statement.bind(1, &*date_completed).unwrap();

  while let State::Row = statement.next().unwrap() {
    let todo_item = TodoItem {
      id: statement.read::<String>(0).unwrap(),
      title: statement.read::<String>(1).unwrap(),
      description: statement
        .read::<Option<String>>(2)
        .unwrap_or_else(|_error| -> Option<String> { None }),
      notes: statement
        .read::<Option<String>>(3)
        .unwrap_or_else(|_error| -> Option<String> { None }),
      is_completed: statement.read::<String>(4).unwrap() == "true",
      date_completed: statement
        .read::<Option<String>>(5)
        .unwrap_or_else(|_error| -> Option<String> { None }),
      time_completed: statement
        .read::<Option<String>>(6)
        .unwrap_or_else(|_error| -> Option<String> { None }),
      timezone_completed: statement
        .read::<Option<String>>(7)
        .unwrap_or_else(|_error| -> Option<String> { None }),
      date_created: statement.read::<String>(8).unwrap(),
      time_created: statement.read::<String>(9).unwrap(),
      timezone_created: statement.read::<String>(10).unwrap(),
    };

    todo_items.push(todo_item)
  }

  return todo_items;
}

pub fn create(
  id: String,
  title: String,
  date_created: String,
  time_created: String,
  timezone_created: String,
) -> TodoItem {
  if !database::table_exists(String::from("todoItems")) {
    create_todo_items_folder();
  }

  let connection = sqlite::open("./database.db").unwrap();
  let mut statement = connection
    .prepare(
      "
        insert into todoItems (
          title,
          isCompleted,
          dateCreated,
          timeCreated,
          timezoneCreated
        ) values (
          ?,
          'false',
          ?,
          ?,
          ?
        )
      ",
    )
    .unwrap();

  statement.bind(1, &*title).unwrap();
  statement.bind(2, &*date_created).unwrap();
  statement.bind(3, &*time_created).unwrap();
  statement.bind(4, &*timezone_created).unwrap();

  statement.next().unwrap();

  println!("Creating todo item");
  println!("  - title: {}", title);
  println!("  - date created: {}", date_created);
  println!("  - time created: {}", time_created);
  println!("  - timezone created: {}", timezone_created);

  let todo_item = TodoItem {
    id: id,
    title: title,
    description: None,
    notes: None,
    is_completed: false,
    date_completed: None,
    time_completed: None,
    timezone_completed: None,
    date_created: date_created,
    time_created: time_created,
    timezone_created: timezone_created,
  };

  todo_item
}

pub fn complete_todo_item(
  id: String,
  date_completed: String,
  time_completed: String,
  timezone_completed: String,
) {
  if !database::table_exists(String::from("todoItems")) {
    create_todo_items_folder();
  }

  let connection = sqlite::open("./database.db").unwrap();
  let mut statement = connection
    .prepare(
      "
        update todoItems
        set
          isCompleted = 'true',
          dateCompleted = ?,
          timeCompleted = ?,
          timezoneCompleted = ?
        where id = ?
      ",
    )
    .unwrap();

  statement.bind(1, &*date_completed).unwrap();
  statement.bind(2, &*time_completed).unwrap();
  statement.bind(3, &*timezone_completed).unwrap();
  statement.bind(4, &*id).unwrap();

  statement.next().unwrap();

  println!("Completing todo item");
  println!("  - id: {}", id);
  println!("  - date completed: {}", date_completed);
  println!("  - time completed: {}", time_completed);
  println!("  - timezone completed: {}", timezone_completed);
}

pub fn uncomplete_todo_item(id: String) {
  if !database::table_exists(String::from("todoItems")) {
    create_todo_items_folder();
  }

  let connection = sqlite::open("./database.db").unwrap();
  let mut statement = connection
    .prepare(
      "
        update todoItems
        set
          isCompleted = 'false',
          dateCompleted = null,
          timeCompleted = null,
          timezoneCompleted = null
        where id = ?
      ",
    )
    .unwrap();

  statement.bind(1, &*id).unwrap();

  statement.next().unwrap();

  println!("Uncompleting todo item");
  println!("  - id: {}", id);
}
