module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenancy_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Successful', 'Failed'), allowNull: false, defaultValue: 'Pending' },
    mpesa_receipt_number: { type: DataTypes.STRING(50), allowNull: true },
    payment_date: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  }, { tableName: 'payments', timestamps: false });
};
