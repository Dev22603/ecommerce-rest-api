// Backend\models\order.mjs
export default (sequelize, DataTypes) => {
	const Order = sequelize.define("Order", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		status: {
			type: DataTypes.ENUM(
				"Pending",
				"Shipped",
				"Completed",
				"Cancelled"
			),
			defaultValue: "Pending",
		},
		total_amount: {
			type: DataTypes.DECIMAL(10, 2),
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	});

	Order.associate = (models) => {
		Order.belongsTo(models.User, {
			foreignKey: "user_id",
			onDelete: "CASCADE",
		});
		Order.hasMany(models.OrderItem, {
			foreignKey: "order_id",
			onDelete: "CASCADE",
		});
	};

	return Order;
};
