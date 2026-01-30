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
        model: 'users', // This is a reference to another model
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'properties',
    timestamps: true, // Automatically add createdAt and updatedAt fields
  });

  Property.associate = (models) => {
    // A property belongs to one landlord
    Property.belongsTo(models.User, {
      foreignKey: 'landlord_id',
      as: 'landlord',
    });

    // A property can have many tenancies
    Property.hasMany(models.Tenancy, {
      foreignKey: 'property_id',
      as: 'tenancies',
    });
  };

  return Property;
};
