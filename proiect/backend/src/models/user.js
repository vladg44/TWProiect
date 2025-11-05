import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import Team from "./team.js";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    
    autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("admin","manager","executor"),
        allowNull: false,
        defaultValue: "executor",
    },
    managerId: {
        type: DataTypes.INTEGER,
        allowNull: true,},

        teamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    references: {
      model: Team,
      key: 'id',
    }
  }
    });
    //relatii
    Team.hasMany(User, { foreignKey: "teamId" });
    User.belongsTo(Team, { foreignKey: "teamId" });
    
export default User;

