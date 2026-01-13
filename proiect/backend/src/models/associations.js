import User from './user.js';
import Task from './task.js';
import Team from './team.js';

const setupAssociations = () => {
    // Relația User <-> Team (Un manager are o echipă, un utilizator aparține unei echipe)
    Team.hasMany(User, { foreignKey: "teamId" });
    User.belongsTo(Team, { foreignKey: "teamId" });

    // Relațiile User <-> Task 
    // Un utilizator (creator) poate crea mai multe task-uri
    User.hasMany(Task, { 
        as: 'createdTasks', 
        foreignKey: "creatorId" 
    });
    Task.belongsTo(User, { 
        as: "creator", 
        foreignKey: "creatorId" 
    });

    // Un utilizator (executant) poate avea mai multe task-uri asignate
    User.hasMany(Task, { 
        as: 'assignedTasks', 
        foreignKey: "assignedUserId" 
    });
    Task.belongsTo(User, { 
        as: "assignedUser", 
        foreignKey: "assignedUserId" 
    });

    // Relația self-referențială pentru manageri și subordonați
    User.hasMany(User, {
        as: 'subordinates',
        foreignKey: 'managerId'
    });
    User.belongsTo(User, {
        as: 'manager',
        foreignKey: 'managerId',
    });
};

export default setupAssociations;
