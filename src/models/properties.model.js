module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Property', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    landlord_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  }, {
    tableName: 'properties',
    timestamps: false,
  });
};
