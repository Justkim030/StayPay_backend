module.exports = (sequelize, DataTypes) => {
  const MpesaTransaction = sequelize.define('MpesaTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id',
      },
    },
    MerchantRequestID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CheckoutRequestID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ResultCode: {
      type: DataTypes.INTEGER,
    },
    ResultDesc: {
      type: DataTypes.TEXT,
    },
    CallbackMetadata: {
      type: DataTypes.JSON,
    },
  }, {
    tableName: 'mpesa_transactions',
    timestamps: true,
  });

  MpesaTransaction.associate = (models) => {
    MpesaTransaction.belongsTo(models.Payment, {
      foreignKey: 'payment_id',
      as: 'payment',
    });
  };

  return MpesaTransaction;
};
