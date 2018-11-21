module.exports = function(sequelize, DataTypes) {
    const fkycedEvidences = sequelize.define('fkycedEvidences', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      required: { type: DataTypes.BOOLEAN, defaultValue: false },
      description: { type: DataTypes.STRING, allowNull: true },
      validDocument: { type: DataTypes.STRING, allowNull: true }
    })
    return fkycedEvidences
};
