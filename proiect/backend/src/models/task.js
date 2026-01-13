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
    type: DataTypes.ENUM("OPEN", "PENDING", "COMPLETED", "CLOSED"),
    allowNull: false,
    defaultValue: "OPEN",
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isNotInPast(value) {
        // Permitem valorile null sau undefined
        if (!value) return;

        // Comparam doar data, ignorand ora
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (new Date(value) < today) {
          throw new Error('Data limita nu poate fi in trecut.');
        }
      }
    }
  },
  creatorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true, // Poate fi null daca un admin creeaza fara sa fie asignat ca manager
    references: {
      model: User,
      key: 'id'
    }
  },
  assignedUserId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
          model: User,
          key: 'id'
      }
  }
});

export default Task;