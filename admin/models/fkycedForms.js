module.exports = function(sequelize, DataTypes) {
    const fkycedForms = sequelize.define('fkycedForms', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      formName: { type: DataTypes.STRING, allowNull: false },
      formId: { type: DataTypes.STRING, allowNull: false },
      formStructure: { type: DataTypes.TEXT },
    });
    return fkycedForms;
};
