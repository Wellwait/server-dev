import { successResponse } from "../util.js";
import { db } from "../database.js";
import ApiError from "../error/apiError.js";

function getStringBeforeParenthesis(inputString) {
  if (inputString.includes("(")) {
    return inputString.split("(")[0].trim();
  } else {
    return inputString.trim();
  }
}

const generateModelsFromDB = async (req, res, next) => {
  try {
    const query = "SHOW TABLES";

    const [rows] = await db.query(query);

    const tables = rows.map((row) => Object.values(row)[0]);

    const classDefinitions = [];
    for (const tableName of tables) {
      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
      const className = tableName
        .split("_")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("");

      const classProperties = columns
        .map((column) => {
          const propertyName = column.Field.split("_")
            .map((part, index) =>
              index === 0
                ? part.toLowerCase()
                : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join("");
          let propertyType = "";
          let defaultValue = "null";
          var type = getStringBeforeParenthesis(column.Type.toLowerCase());
          switch (type) {
            case "int":
            case "smallint":
            case "mediumint":
            case "bigint":
              propertyType = "int";
              defaultValue = "-1";
              break;
            case "varchar":
            case "char":
            case "text":
            case "mediumtext":
            case "longtext":
              propertyType = "String";
              defaultValue = '"NA"';
              break;
            case "datetime":
            case "date":
            case "timestamp":
              propertyType = "DateTime?";
              defaultValue = "null";
              break;
            case "double":
              propertyType = "double";
              defaultValue = "-1.0";
              break;
            case "tinyint":
              propertyType = "bool";
              defaultValue = "false";
              break;
            default:
              propertyType = "dynamic";
          }
          return `  final ${propertyType} ${propertyName};`;
        })
        .join("\n");

      const constructorDefaults = columns
        .map((column) => {
          const propertyName = column.Field.split("_")
            .map((part, index) =>
              index === 0
                ? part.toLowerCase()
                : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join("");
          let defaultValue = "null";
          if (
            column.Type.toLowerCase() === "datetime" ||
            column.Type.toLowerCase() === "date" ||
            column.Type.toLowerCase() === "timestamp"
          ) {
            defaultValue = "null";
          } else if (column.Type.toLowerCase() === "tinyint") {
            defaultValue = "false";
          } else {
            defaultValue = getDefaultForType(
              column.Type.toLowerCase(),
              column.Type
            );
          }
          return `    this.${propertyName} = ${defaultValue},`;
        })
        .join("\n");

      const fromJsonMethod = columns
        .map((column) => {
          // return `    ${column.Type}: ${column.Field},`;
          const propertyName = column.Field.split("_")
            .map((part, index) =>
              index === 0
                ? part.toLowerCase()
                : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join("");
          if (
            column.Type.toLowerCase() === "datetime" ||
            column.Type.toLowerCase() === "date" ||
            column.Type.toLowerCase() === "timestamp"
          ) {
            return `    ${propertyName}: Util.parseDateTime(json["${column.Field}"]),`;
          } else if (column.Type.toLowerCase() === "tinyint") {
            return `    ${propertyName}: json["${column.Field}"] == 1,`;
          } else {
            return `    ${propertyName}: json["${
              column.Field
            }"] ?? ${getDefaultForType(
              column.Type.toLowerCase(),
              column.Type
            )},`;
          }
        })
        .join("\n");

      const toJsonMethod = columns
        .map((column) => {
          const propertyName = column.Field.split("_")
            .map((part, index) =>
              index === 0
                ? part.toLowerCase()
                : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join("");
          if (
            column.Type.toLowerCase() === "datetime" ||
            column.Type.toLowerCase() === "date" ||
            column.Type.toLowerCase() === "timestamp"
          ) {
            return `    "${column.Field}": ${propertyName}?.toIso8601String(),`;
          } else {
            return `    "${column.Field}": ${propertyName},`;
          }
        })
        .join("\n");

      classDefinitions.push(
        `class ${className}Model {\n${classProperties}\n\n  const ${className}Model({\n${constructorDefaults}\n  });\n\n  factory ${className}Model.fromJson(Map<String, dynamic> json) => ${className}Model(\n${fromJsonMethod}\n  );\n\n  Map<String, dynamic> toJson() => {\n${toJsonMethod}\n  };\n}`
      );
    }

    const generatedModels = classDefinitions.join("\n\n");

    // Respond with generated models
    return res.status(200).send(generatedModels);
  } catch (error) {
    return next(
      ApiError.internalServerError("Failed to generate models from database")
    );
  }
};

function getDefaultForType(type, fullType) {
  type = getStringBeforeParenthesis(type);
  switch (type) {
    case "int":
    case "smallint":
    case "mediumint":
    case "bigint":
      return "-1";
    case "varchar":
    case "char":
    case "text":
    case "mediumtext":
    case "longtext":
      return '"NA"';
    case "datetime":
    case "timestamp":
      return "null";
    case "double":
      return "-1.0";
    case "tinyint":
      return "false";
    default:
      return "null";
  }
}

const generateClassesFromDB = async (req, res, next) => {
  try {
    const query = "SHOW TABLES";

    const [rows] = await db.query(query);

    const tables = rows.map((row) => Object.values(row)[0]);

    const classDefinitions = [];
    for (const tableName of tables) {
      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
      const className = tableName
        .split("_")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("");

      const classProperties = columns
        .map((column) => {
          const propertyName = column.Field.split("_")
            .map((part, index) =>
              index === 0
                ? part.toLowerCase()
                : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join("");
          return `  static String ${propertyName} = "${column.Field}";`;
        })
        .join("\n");

      classDefinitions.push(
        `class ${className}Structre {\n  static String tableName = "${tableName}";\n${classProperties}\n}`
      );
    }

    const generatedClasses = classDefinitions.join("\n\n");

    // Respond with generated classes
    return res.status(200).send(generatedClasses);
  } catch (error) {
    return next(
      ApiError.internalServerError("Failed to generate classes from database")
    );
  }
};

const getTableFields = async (req, res, next) => {
  try {
    const query = "SHOW TABLES";

    const [rows] = await db.query(query);

    const tables = rows.map((row) => Object.values(row)[0]);
    let tableFieldsMap = {};
    let tableFields = [];
    for (const tableName of tables) {
      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
      tableFieldsMap[tableName] = columns.map((column) => column.Field);
      tableFields.push(...columns.map((column) => column.Field));
    }
    tableFields = [...new Set(tableFields)];
    res.send(tableFieldsMap);
  } catch (error) {
    throw new Error(`Error fetching table fields: ${error.message}`);
  }
};

async function getTableFieldNamesArr(req, res, next) {
  try {
    const [tables] = await db.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
    `);

    let tableData = [];
    for (const table of tables) {
      const tableName = table.TABLE_NAME;

      const [fields] = await db.query(
        `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
        [tableName]
      );

      const fieldNames = fields.map((field) => field.COLUMN_NAME);
      tableData = [...tableData, tableName, ...fieldNames];
    }

    res.send(tableData);
  } catch (error) {
    console.error("Error retrieving table and field names:", error);
    throw error; // Re-throw for proper error handling
  }
}

const bulkUpdate = async (req, res, next) => {
  try {
    const query = "SHOW TABLES";

    const [rows] = await db.query(query);

    const tables = rows.map((row) => Object.values(row)[0]);
    for (const tableName of tables) {
      const [existingColumn] = await db.query(
        "SELECT COLUMN_NAME, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = 'ACTIVE_STATE'",
        [tableName]
      );

      // If ACTIVE_STATE column doesn't exist, add it
      if (existingColumn.length === 0) {
        await db.query(
          `ALTER TABLE ${tableName} ADD COLUMN ACTIVE_STATE TINYINT(1) DEFAULT 1`
        );
        console.log(`Added ACTIVE_STATE column to table ${tableName}`);
      } else {
        // Check if default value of ACTIVE_STATE is not 1, then update it
        const defaultValue = existingColumn[0].COLUMN_DEFAULT;
        if (defaultValue !== "1") {
          await db.query(
            `ALTER TABLE ${tableName} MODIFY COLUMN ACTIVE_STATE TINYINT(1) DEFAULT 1`
          );
          console.log(
            `Updated DEFAULT value of ACTIVE_STATE column in table ${tableName}`
          );
        }
      }
    }

    res.send("Finished adding or updating ACTIVE_STATE column in tables.");
  } catch (error) {
    throw new Error(`Error fetching table fields: ${error.message}`);
  }
};

export {
  generateClassesFromDB,
  generateModelsFromDB,
  getTableFields,
  bulkUpdate,
  getTableFieldNamesArr,
};
