module.exports = function(sequelize, DataTypes) {
    const fkycedProcesses = sequelize.define('fkycedProcesses', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      processName: { type: DataTypes.STRING, allowNull: false },
      processKey: { type: DataTypes.STRING, allowNull: false },
      processVersion: { type: DataTypes.STRING, allowNull: false, defaultValue: 'latest' },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
      activeSince: { type: DataTypes.DATE, defaultValue: DataTypes.NOW},
      inactiveSince: DataTypes.DATE
    });
    return fkycedProcesses;
};
