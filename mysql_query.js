// mysql parse
module.exports = {
	dbName: '',
	tableName: '',
	rowName: '',
	/* use id as default */
	idName: 'id',
	id: 0,
	get: function() {
		return 'SELECT ' + this.rowName + ' FROM ' + this.tableName;
	},

	getAll: function(){
		return 'SELECT ' + '*' + ' FROM ' + this.tableName;
	},

	getById: function() {
		return 'SELECT ' + '*' + ' FROM ' + this.tableName + ' where ' + this.idName +' = ' + (this.id).toString();

	},

	print: function() {
		var content = 'dbName: ' + this.dbName + '\n' +
			'tableName: ' + this.tableName + '\n' +
			'rowName: ' + this.rowName;
		console.log( content );
		return content;
	},

	error: {
		connection: 'connection failed at ' + '\n'
	}
}