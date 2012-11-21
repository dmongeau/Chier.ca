/*
 *
 * Item schema
 *
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

function uniqueFieldInsensitive ( modelName, field ){
	return function(val, cb){
		if( val && val.length ){ // if string not empty/null
			// only for new docs
			if( this.isNew ){
				mongoose.models[modelName].where(
					field, new RegExp('^'+val+'$', 'i')
				).count(function(err,n){
					// false when validation fails
					cb( n < 1 )
				})
			} else {
				cb( true )
			}
		} else { // raise error of unique if empty // may be confusing, but is rightful
			cb( false )
		}
	}
}

//Schema
var schema = mongoose.Schema({
	'text' : {
		'type' : 'string',
		'required' : true,
		'unique' : true,
		'trim' : true,
		'validate' : [
			{
				'validator' : uniqueFieldInsensitive('item', 'text' ),
				'msg' : "Trouvez autre chose, quelqu'un y a déjà pensé avant vous."
			}
		]
	},
	'date' : {
		'type' : Date,
		'default' : Date.now
	}
});

schema.path('text').validate(function (value) {
  return /^Chier[\ \,\-\.]/.test(value);
}, 'Le texte doit commencer par «Chier».');

schema.path('text').validate(function (value) {
  return value.length < 120;
}, 'Le texte peut contenir un maximum de 120 caractères.');



//Module exports
module.exports = schema;