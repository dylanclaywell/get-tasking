use crate::database;
use crate::models::tag;
use serde::{Deserialize, Serialize};
use sqlite::State;
use tauri::AppHandle;
use uuid::Uuid;

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

pub fn get_all(
    app_handle: &AppHandle,
    date_completed: String,
) -> Result<Vec<TodoItem>, sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;

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

    return Ok(todo_items);
}

pub fn create(
    app_handle: &AppHandle,
    id: String,
    title: String,
    date_created: String,
    time_created: String,
    timezone_created: String,
) -> Result<TodoItem, sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;
    let mut statement = connection
        .prepare(
            "
        insert into todoItems (
          id,
          title,
          isCompleted,
          dateCreated,
          timeCreated,
          timezoneCreated
        ) values (
          ?,
          ?,
          'false',
          ?,
          ?,
          ?
        )
      ",
        )
        .unwrap();

    println!("{}", id);

    statement.bind(1, &*id).unwrap();
    statement.bind(2, &*title).unwrap();
    statement.bind(3, &*date_created).unwrap();
    statement.bind(4, &*time_created).unwrap();
    statement.bind(5, &*timezone_created).unwrap();

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

    Ok(todo_item)
}

pub fn complete(
    app_handle: &AppHandle,
    id: String,
    date_completed: String,
    time_completed: String,
    timezone_completed: String,
) -> Result<(), sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;
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

    Ok(())
}

pub fn uncomplete(app_handle: &AppHandle, id: String) -> Result<(), sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;
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

    Ok(())
}

pub fn update(
    app_handle: &AppHandle,
    id: String,
    title: Option<String>,
    description: Option<String>,
    notes: Option<String>,
) -> Result<(), sqlite::Error> {
    let mut conditions: Vec<String> = Vec::new();

    let parameter_mapping = vec![
        (
            String::from("title"),
            title.as_ref().map(|title| String::from(title)),
        ),
        (
            String::from("description"),
            description
                .as_ref()
                .map(|description| String::from(description)),
        ),
        (
            String::from("notes"),
            notes.as_ref().map(|notes| String::from(notes)),
        ),
    ];

    let mut bind_params: Vec<(String, String)> = Vec::new();

    for (key, value) in parameter_mapping {
        if !value.is_none() {
            conditions.push(format!("{} = :{}", key, key));
            bind_params.push((key, value.unwrap()));
        }
    }

    let mut sql = vec![String::from("update todoItems set")];
    sql.push(conditions.join(" "));
    sql.push(String::from("where id = :id"));

    let connection = database::initialize_database(app_handle)?;
    let mut statement = connection.prepare(sql.join(" ")).unwrap();

    statement.bind_by_name(":id", &*id).unwrap();

    for (key, value) in bind_params {
        statement
            .bind_by_name(format!(":{}", &key).as_str(), &*value)
            .unwrap();
    }

    statement.next().unwrap();

    println!("Updating todo item");
    println!("  - id: {}", id);
    println!("  - title: {}", title.unwrap_or(String::from("<none>")));
    println!(
        "  - description: {}",
        description.unwrap_or(String::from("<none>"))
    );
    println!("  - notes: {}", notes.unwrap_or(String::from("<none>")));

    Ok(())
}

pub fn delete(app_handle: &AppHandle, id: String) -> Result<(), sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;
    let mut statement = connection
        .prepare(
            "
        delete from todoItems
        where id = ?
      ",
        )
        .unwrap();

    statement.bind(1, &*id).unwrap();

    statement.next().unwrap();

    println!("Deleting todo item");
    println!("  - id: {}", id);

    Ok(())
}

pub fn add_tag(
    app_handle: &AppHandle,
    todo_item_id: String,
    tag_id: String,
) -> Result<(), sqlite::Error> {
    let todo_item_tag_id = Uuid::new_v4().to_string();
    let connection = database::initialize_database(app_handle)?;
    let mut statement = connection
        .prepare(
            "
        insert into todoItemsTags (
          id,
          todoItemId,
          tagId
        ) values (
          ?,
          ?,
          ?
        )
      ",
        )
        .unwrap();

    statement.bind(1, &*todo_item_tag_id).unwrap();
    statement.bind(2, &*todo_item_id).unwrap();
    statement.bind(3, &*tag_id).unwrap();

    statement.next().unwrap();

    println!("Adding tag to todo item");
    println!("  - id: {}", todo_item_id);
    println!("  - tagId: {}", tag_id);

    Ok(())
}

pub fn remove_tag(
    app_handle: &AppHandle,
    todo_item_id: String,
    tag_id: String,
) -> Result<(), sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;
    let mut statement = connection
        .prepare(
            "
        delete from todoItemsTags
        where
          todoItemId = ?
          and tagId = ?
      ",
        )
        .unwrap();

    statement.bind(1, &*todo_item_id).unwrap();
    statement.bind(2, &*tag_id).unwrap();

    statement.next().unwrap();

    println!("Removing tag from todo item");
    println!("  - id: {}", todo_item_id);
    println!("  - tagId: {}", tag_id);

    Ok(())
}

pub fn get_tags(app_handle: &AppHandle, id: String) -> Result<Vec<tag::Tag>, sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;

    let mut tags: Vec<tag::Tag> = Vec::new();
    let mut tag_ids: Vec<String> = Vec::new();

    let mut statement = connection
        .prepare(
            "
      select
        tagId
      from todoItemsTags
      where
        todoItemId = ?
    ",
        )
        .unwrap();

    statement.bind(1, &*id).unwrap();

    while let State::Row = statement.next().unwrap() {
        tag_ids.push(statement.read::<String>(0).unwrap())
    }

    for tag_id in tag_ids {
        if let Ok(tag) = tag::get(app_handle, tag_id) {
            tags.push(tag);
        }
    }

    return Ok(tags);
}
