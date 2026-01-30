module.exports = (sequelize, DataTypes) => {
  return sequelize.define('MpesaTransaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    payment_id: { type: DataTypes.INTEGER, allowNull: false },
    MerchantRequestID: { type: DataTypes.STRING(255), allowNull: true },
    CheckoutRequestID: { type: DataTypes.STRING(255), allowNull: true },
    ResultCode: { type: DataTypes.INTEGER, allowNull: true },
    ResultDesc: { type: DataTypes.TEXT, allowNull: true },
    CallbackMetadata: { type: DataTypes.JSON, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('CURRENT_TIMESTAMP') },
  }, { tableName: 'mpesa_transactions', timestamps: false });
};
