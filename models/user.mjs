// Backend\models\user.mjs
export default (sequelize, DataTypes) => {
	const User = sequelize.define("User", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			validate: {
				len: [2, 100],
			},
		},
		email: {
			type: DataTypes.STRING(100),
			unique: true,
			allowNull: false,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.STRING(100),
			allowNull: false,
			validate: {
				len: [8, 100],
			},
		},
		role: {
			type: DataTypes.ENUM("admin", "customer"),
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	});

	return User;
};
