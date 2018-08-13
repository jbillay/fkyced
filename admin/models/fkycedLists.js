module.exports = function(sequelize, DataTypes) {
    const fkycedLists = sequelize.define('fkycedLists', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      parentId: { type: DataTypes.INTEGER, allowNull: true },
      valueList: { type: DataTypes.TEXT, allowNull: false },
      sorted: { type: DataTypes.BOOLEAN, defaultValue: false }
    });
    return fkycedLists;
};
