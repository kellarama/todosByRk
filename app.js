const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

initializeDbAndServer();

let printAllTodo = () => {
  let todoQuery = `SELECT * FROM todo;`;
  return todoQuery;
};

//API 1

const checkStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const checkPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const checkStatusAndPriority = (request) => {
  return request.priority !== undefined && request.status !== undefined;
};
const checkSearch = (query) => {
  return query.search_q !== undefined;
};

app.get("/todos/", async (request, response) => {
  let getResQuery = null;
  const { search_q, priority, status } = request.query;
  switch (true) {
    case checkStatus(request.query):
      getResQuery = `SELECT * 
                FROM 
                todo 
                WHERE 
                todo.status = '${status}';`;
      break;
    case checkPriority(request.query):
      getResQuery = `SELECT * 
                FROM 
                todo 
                WHERE 
                todo.priority = '${priority}';`;
      break;
    case checkStatusAndPriority(request.query):
      getResQuery = `SELECT * 
            FROM 
            todo 
            WHERE 
            (todo.priority = '${priority}') AND 
            (todo.status = '${status}');`;
      break;
    case checkSearch(request.query):
      getResQuery = `SELECT * 
            FROM 
            todo 
            WHERE 
            (todo.todo LIKE '%${search_q}%');`;
      break;

    default:
      getResQuery = printAllTodo();
      break;
  }
  const resultQuery = await db.all(getResQuery);
  response.send(resultQuery);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getRes = `SELECT * FROM todo WHERE todo.id = ${todoId};`;

  const res = await db.get(getRes);
  response.send(res);
});

//API 3

app.post("/todos", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const addQuery = `INSERT INTO 
        todo (id,todo,priority,status)
        VALUES(${id},'${todo}','${priority}','${status}');`;
  await db.run(addQuery);
  response.send("Added Successfully");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const data = request.body;
  const { status } = data;

  const updateQuery = `UPDATE 
        todo 
        SET status = '${status}'
        WHERE id = ${todoId};`;

  await db.run(updateQuery);
  response.send("updated");
});

//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteQuery = `DELETE 
        FROM 
        todo 
        WHERE id = ${todoId};`;

  await db.run(deleteQuery);
  response.send("Deleted Successfully");
});
