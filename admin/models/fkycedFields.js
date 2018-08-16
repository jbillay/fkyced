module.exports = function(sequelize, DataTypes) {
    const fkycedFields = sequelize.define('fkycedFields', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      objectId: { type: DataTypes.INTEGER, allowNull: false },
      fieldType : { type: DataTypes.ENUM('checkbox', 'currency', 'date', 'number', 'object', 'phone', 'picklist', 'picklistMulti', 'text', 'textArea'), allowNull: false },
      camundaType: { type: DataTypes.ENUM('boolean', 'integer', 'double', 'date', 'string', 'json'), allowNull: false },
      label: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      helper: { type: DataTypes.TEXT, allowNull: true },
      required: { type: DataTypes.BOOLEAN, defaultValue: false },
      defaultValue: { type: DataTypes.STRING, allowNull: true },
      numLength: { type: DataTypes.INTEGER, allowNull: true },
      numDecimal: { type: DataTypes.INTEGER, allowNull: true },
      valueUnique: { type: DataTypes.BOOLEAN, defaultValue: true },
      listId: { type: DataTypes.INTEGER, allowNull: true },
      listValues: { type: DataTypes.TEXT, allowNull: true },
      displayLine: { type: DataTypes.INTEGER, allowNull: true },
      linkedObjectId: { type: DataTypes.INTEGER, allowNull: true },
      valueSize: { type: DataTypes.INTEGER, allowNull: true }
    });
    return fkycedFields;
};
