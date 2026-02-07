module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    landlord_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true, // Making address optional
    },
    // --- NEW FIELDS ---
    caretaker_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caretaker_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_rooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'properties',
    timestamps: true,
  });

  Property.associate = (models) => {
    Property.belongsTo(models.User, { foreignKey: 'landlord_id', as: 'landlord' });
    Property.hasMany(models.Tenancy, { foreignKey: 'property_id', as: 'tenancies' });
  };

  return Property;
};
