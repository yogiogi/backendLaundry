var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/laundryService', { useMongoClient: true });
mongoose.set('debug', true);
