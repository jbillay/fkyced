module.exports = function(sequelize, DataTypes) {
    const fkycedFields = sequelize.define('fkycedFields', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      objectId: { type: DataTypes.INTEGER, allowNull: false },
      fieldType : { type: DataTypes.ENUM('Checkbox', 'Currency', 'Date', 'Date/Time', 'Email', 'Number', 'Percent', 'Phone', 'Picklist', 'Picklist Multiple', 'Text', 'Text Area', 'Text Area Rich', 'Time', 'URL', 'Object', 'Formula'), allowNull: false },
      camundaType: { type: DataTypes.ENUM('boolean', 'double', 'date', 'string', 'json'), allowNull: false },
      label: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      helper: { type: DataTypes.TEXT, allowNull: true },
      required: { type: DataTypes.BOOLEAN, defaultValue: false },
      defaultValue: { type: DataTypes.STRING, allowNull: false },
      numLength: { type: DataTypes.INTEGER, allowNull: false },
      numDecimal: { type: DataTypes.INTEGER, allowNull: false },
      valueUnique: { type: DataTypes.BOOLEAN, defaultValue: false },
      listId: { type: DataTypes.INTEGER, allowNull: false },
      listValues: { type: DataTypes.TEXT, allowNull: true },
      displayLine: { type: DataTypes.INTEGER, allowNull: false },
      valueSize: { type: DataTypes.INTEGER, allowNull: false }
    });
    return fkycedFields;
};
