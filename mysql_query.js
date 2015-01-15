// mysql parse
module.exports = {
	dbName: '',
	tableName: '',
	rowName: '',
	get: function() {
		return 'SELECT ' + this.rowName + ' FROM ' + this.tableName;
	},

	getAll: function(){
		return 'SELECT ' + '*' + ' FROM ' + this.tableName;
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