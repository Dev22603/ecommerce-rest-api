// Backend\models\orderItem.mjs
export default (sequelize, DataTypes) => {
	const OrderItem = sequelize.define("OrderItem", {
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
		price: {
			type: DataTypes.DECIMAL(10, 2),
		},
	});

	OrderItem.associate = (models) => {
		OrderItem.belongsTo(models.Order, {
			foreignKey: "order_id",
			onDelete: "CASCADE",
		});
		OrderItem.belongsTo(models.Product, {
			foreignKey: "product_id",
			onDelete: "CASCADE",
		});
	};

	return OrderItem;
};
