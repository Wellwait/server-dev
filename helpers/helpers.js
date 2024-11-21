import { db } from "../database.js";
import { DateTime, Settings } from "luxon";
import ApiError from "../error/apiError.js";
import { isBoolean } from "./regex.js";
import { formatDate, parseDate, print } from "../util.js";

const getCurrentDate = () => {
  return DateTime.now().toFormat("yyyy/MM/dd");
};

const currentTimeStamp = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  console.log(
    `currentTimeStamp1 ${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
  );

  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  Settings.defaultZone = "IST";
  console.log(
    `currentTimeStamp2 ${DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss")}`
  );
  return `${DateTime.now().toFormat("yyyy-MM-DD HH:mm:ss")}`;
};

const entryExists = async (table, keyName, value) => {
  var [entry] = await db.query(
    `SELECT ${keyName} FROM ${table} WHERE ${keyName} = ?`,
    [value]
  );

  console.log(`SELECT ${keyName} FROM ${table} WHERE ${keyName} = ?`);
  console.log(`entryExists ${entry[0]}`);
  return entry[0] != undefined;
};

const entryExistsAndActive = async (table, keyName, value) => {
  var [entry] = await db.query(
    `SELECT ${keyName}, ACTIVE_STATE FROM ${table} WHERE ${keyName} = ?`,
    [value]
  );

  console.log(`SELECT ${keyName} FROM ${table} WHERE ${keyName} = ?`);
  console.log(
    `entryExistsAndActive ${entry[0] != undefined} ${
      entry[0]?.ACTIVE_STATE == 1
    }`
  );
  return [entry[0] != undefined, entry[0]?.ACTIVE_STATE == 1];
};

const getSingleEntry = async (table, keyName, value) => {
  var [entry] = await db.query(`SELECT * FROM ${table} WHERE ${keyName} = ?`, [
    value,
  ]);

  return entry[0];
};

const searchData = async (
  selectionKeys,
  table,
  searchKey,
  value,
  next,
  { additionalCondition = "" } = {}
) => {
  if (!value && value !== "*") {
    next(ApiError.badRequest("Required fields cannot be empty."));
    return [];
  }

  let query;
  let params = [];

  if (value == "*") {
    query = `SELECT ${selectionKeys} FROM ${table} ${
      additionalCondition && `WHERE ${additionalCondition}`
    }`;
  } else {
    query = `SELECT ${selectionKeys} FROM ${table} WHERE ${searchKey} LIKE "%${value}%" ${
      additionalCondition && `AND ${additionalCondition}`
    }`;
  }

  const [result] = await db.query(query, params);
  console.log(`searchquery ${query}`);

  return result;
};

const getPrimaryColumnOfTable = async (tableName) => {
  try {
    const primaryKeyQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ? 
        AND column_key = 'PRI';
    `;
    const [primaryKeyResult] = await db.query(primaryKeyQuery, [tableName]);

    if (primaryKeyResult.length === 0) {
      throw new Error(`Table does not have a primary key.`);
    }

    return primaryKeyResult[0].column_name;
  } catch (error) {
    throw new Error(
      `Error fetching primary key field for table: ${error.message}`
    );
  }
};

const getTableFields = async (tableName) => {
  try {
    // const query = `SHOW COLUMNS FROM ${tableName}`;
    const query = `
SELECT
    C.COLUMN_NAME,
    CASE 
        WHEN TC.CONSTRAINT_TYPE = 'PRIMARY KEY' THEN 'Primary Key'
        WHEN TC.CONSTRAINT_TYPE = 'FOREIGN KEY' THEN 'Foreign Key'
        WHEN TC.CONSTRAINT_TYPE = 'UNIQUE' THEN 'Unique Key'
        ELSE 'Normal Key'
    END AS KEY_TYPE,
    CONCAT(C.DATA_TYPE,
           IF(C.CHARACTER_MAXIMUM_LENGTH IS NOT NULL, CONCAT('(', C.CHARACTER_MAXIMUM_LENGTH, ')'), '')
    ) AS DATA_TYPE,
    CU.REFERENCED_TABLE_NAME AS REFERENCED_TABLE,
    CU.REFERENCED_COLUMN_NAME AS REFERENCED_COLUMN
FROM
    INFORMATION_SCHEMA.COLUMNS C
LEFT JOIN
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE CU
    ON C.TABLE_SCHEMA = CU.TABLE_SCHEMA
    AND C.TABLE_NAME = CU.TABLE_NAME
    AND C.COLUMN_NAME = CU.COLUMN_NAME
LEFT JOIN
    INFORMATION_SCHEMA.TABLE_CONSTRAINTS TC
    ON C.TABLE_SCHEMA = TC.TABLE_SCHEMA
    AND C.TABLE_NAME = TC.TABLE_NAME
    AND CU.CONSTRAINT_NAME = TC.CONSTRAINT_NAME
WHERE
    C.TABLE_NAME = '${tableName}'`;

    const [fields] = await db.query(query);
    return fields;
  } catch (error) {
    console.error(`Error fetching table fields for ${tableName}:`, error);
    throw error;
  }
};

const getFormattedData = async (tableName, data, removeFK) => {
  const excludedFKForRemoval = ["COMP_CODE", "BU_CODE", "DR_CODE"];
  try {
    const fields = await getTableFields(tableName);
    let tempData = [];
    let isList = false;

    if (Array.isArray(data)) {
      tempData = [...data];
      data = [...data];
      isList = true;
    } else {
      tempData = [data];
      data = [data];
      isList = false;
    }

    for (let i = 0; i < data.length; i++) {
      for (const field of fields) {
        const fieldName = field.COLUMN_NAME;
        const fieldType = field.DATA_TYPE;
        const isFK = field.KEY_TYPE == "FK";
        let value = data[i][fieldName];

        if (fieldType.includes("timestamp") || fieldType.includes("datetime")) {
          value = formatDate(value, { includeTime: true });
          // const date = new Date(value);

          // const year = date.getFullYear();
          // const month = String(date.getMonth() + 1).padStart(2, "0");
          // const day = String(date.getDate()).padStart(2, "0");

          // const hours = String(date.getHours()).padStart(2, "0");
          // const minutes = String(date.getMinutes()).padStart(2, "0");
          // const meridiem = hours >= 12 ? "PM" : "AM";
          // const formattedHours = String(hours % 12 || 12).padStart(2, "0");
          // const formattedMinutes = String(minutes).padStart(2, "0");

          // const formattedDate = `${year}-${month}-${day}`;
          // const formattedTime = `${formattedHours}:${formattedMinutes} ${meridiem}`;
          // value = `${formattedDate} ${formattedTime}`;
        }

        if (removeFK && isFK && !excludedFKForRemoval.includes(fieldName)) {
          print(`tempData[i] ${tempData[i][fieldName]}`);
          delete tempData[i][fieldName];
          print(`tempData[i] ${tempData[i][fieldName]}`);
        } else {
          tempData[i][fieldName] = value;
        }
      }
    }

    return isList ? tempData : tempData[0];
  } catch (error) {
    console.error(`Error fetching table fields for ${tableName}:`, error);
    return data;
  }
};

export {
  entryExists,
  entryExistsAndActive,
  getSingleEntry,
  currentTimeStamp,
  getCurrentDate,
  searchData,
  getPrimaryColumnOfTable,
  getTableFields,
  getFormattedData,
};
