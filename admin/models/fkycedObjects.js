module.exports = function(sequelize, DataTypes) {
    const fkycedObjects = sequelize.define('fkycedObjects', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      label: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true }
    });
    return fkycedObjects;
};
