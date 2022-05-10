import {Sequelize, DataTypes, Model} from 'sequelize';

export default function (sequelize) {
  class User extends Model {
  }

  User.init({
    uid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    uname: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: true,
    },
    salt: {type: DataTypes.STRING(16), allowNull: false},
    pw: {type: DataTypes.STRING(255), allowNull: false},
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user_t',
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  })
}
