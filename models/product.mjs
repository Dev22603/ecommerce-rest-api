// Backend\models\product.mjs
export default (sequelize, DataTypes) => {
	const Product = sequelize.define("Product", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		product_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			validate: {
				len: [2, 255],
			},
		},
		ws_code: {
			type: DataTypes.INTEGER,
			unique: true,
			allowNull: false,
			validate: {
				min: 0,
			},
		},
		sales_price: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1,
			},
		},
		mrp: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1,
			},
		},
		package_size: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1,
			},
		},
		images: {
			type: DataTypes.ARRAY(DataTypes.TEXT),
			defaultValue: [],
		},
		tags: {
			type: DataTypes.ARRAY(DataTypes.TEXT),
			defaultValue: [],
		},
		stock: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			validate: {
				min: 0,
			},
		},
	});

	Product.associate = (models) => {
		Product.belongsTo(models.Category, {
			foreignKey: "category_id",
			onDelete: "CASCADE",
		});
	};

	return Product;
};
