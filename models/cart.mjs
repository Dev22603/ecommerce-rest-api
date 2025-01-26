// Backend\models\cart.mjs
export default (sequelize, DataTypes) => {
	const Cart = sequelize.define("Cart", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1,
			},
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	});

	Cart.associate = (models) => {
		Cart.belongsTo(models.User, {
			foreignKey: "user_id",
			onDelete: "CASCADE",
		});
		Cart.belongsTo(models.Product, {
			foreignKey: "product_id",
			onDelete: "CASCADE",
		});
	};

	return Cart;
};
