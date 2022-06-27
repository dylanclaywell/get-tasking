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
