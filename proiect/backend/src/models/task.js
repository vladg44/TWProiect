import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "./user.js";

const Task = sequelize.define("Task", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("OPEN","PENDING","COMPLETED","CLOSED"),
        allowNull: false,
        defaultValue: "OPEN",
    }
});

User.hasMany(Task, { foreignKey: "assignedTo" });
Task.belongsTo(User,{as: "executor", foreignKey: "assignedTo"});

export default Task;