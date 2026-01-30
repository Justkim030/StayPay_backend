module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Tenancy', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    property_id: { type: DataTypes.INTEGER, allowNull: false },
    tenant_id: { type: DataTypes.INTEGER, allowNull: false },
    house_number: { type: DataTypes.STRING(50), allowNull: false },
    monthly_rent: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('Active', 'Inactive'), allowNull: false, defaultValue: 'Active' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  }, { tableName: 'tenancies', timestamps: false });
};
