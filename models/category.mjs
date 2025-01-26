// Backend\models\category.mjs
export default (sequelize, DataTypes) => {
	const Category = sequelize.define("Category", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		category_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
		},
	});

	return Category;
};
