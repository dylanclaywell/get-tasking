use crate::database;
use serde::{Deserialize, Serialize};
use sqlite::State;
use tauri::AppHandle;

#[derive(Serialize, Deserialize, Debug)]
pub struct Tag {
    pub id: String,
    pub color: String,
    pub name: String,
}

pub fn get_all(app_handle: &AppHandle) -> Result<Vec<Tag>, sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;

    let mut tags = Vec::new();

    let mut statement = connection
        .prepare(
            "
        select
          id,
          color,
          name
        from tags
      ",
        )
        .unwrap();

    while let State::Row = statement.next().unwrap() {
        let tag = Tag {
            id: statement.read::<String>(0).unwrap(),
            color: statement.read::<String>(1).unwrap(),
            name: statement.read::<String>(2).unwrap(),
        };

        tags.push(tag)
    }

    Ok(tags)
}

pub fn get(app_handle: &AppHandle, id: String) -> Result<Tag, sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;

    let mut statement = connection
        .prepare(
            "
        select
          id,
          color,
          name
        from tags
        where
            id = ?
      ",
        )
        .unwrap();

    statement.bind(1, &*id).unwrap();

    while let Ok(State::Row) = statement.next() {
        return Ok(Tag {
            id: statement.read::<String>(0).unwrap(),
            color: statement.read::<String>(1).unwrap(),
            name: statement.read::<String>(2).unwrap(),
        });
    }

    Err(sqlite::Error {
        code: Some(0001),
        message: Some("Tag not found".to_string()),
    })
}

pub fn create(
    app_handle: &AppHandle,
    id: String,
    name: String,
    color: String,
) -> Result<Tag, sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;

    let mut statement = connection
        .prepare(
            "
        insert into tags (
          id,
          name,
          color
        ) values (
          ?,
          ?,
          ?
        )
      ",
        )
        .unwrap();

    println!("{}", id);

    statement.bind(1, &*id).unwrap();
    statement.bind(2, &*name).unwrap();
    statement.bind(3, &*color).unwrap();

    statement.next().unwrap();

    println!("Creating tag");
    println!("  - id: {}", id);
    println!("  - name: {}", name);
    println!("  - color: {}", color);

    let tag = Tag { id, name, color };

    Ok(tag)
}

pub fn update(
    app_handle: &AppHandle,
    id: String,
    name: Option<String>,
    color: Option<String>,
) -> Result<(), sqlite::Error> {
    let mut conditions: Vec<String> = Vec::new();

    let parameter_mapping = vec![
        (
            String::from("name"),
            name.as_ref().map(|name| String::from(name)),
        ),
        (
            String::from("color"),
            color.as_ref().map(|color| String::from(color)),
        ),
    ];

    let mut bind_params: Vec<(String, String)> = Vec::new();

    for (key, value) in parameter_mapping {
        if !value.is_none() {
            conditions.push(format!("{} = :{}", key, key));
            bind_params.push((key, value.unwrap()));
        }
    }

    let mut sql = vec![String::from("update tags set")];
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

    println!("Updating tag");
    println!("  - id: {}", id);
    println!("  - name: {}", name.unwrap_or(String::from("<none>")));
    println!("  - color: {}", color.unwrap_or(String::from("<none>")));

    Ok(())
}

pub fn delete(app_handle: &AppHandle, id: String) -> Result<(), sqlite::Error> {
    let connection = database::initialize_database(app_handle)?;

    let mut statement = connection
        .prepare(
            "
        delete from tags
        where id = ?
      ",
        )
        .unwrap();

    statement.bind(1, &*id).unwrap();

    statement.next().unwrap();

    println!("Deleting tag");
    println!("  - id: {}", id);

    Ok(())
}
