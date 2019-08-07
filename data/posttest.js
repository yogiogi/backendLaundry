var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/laundryService', { useMongoClient: true });

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("Connection succeeded.");
});

var Schema = mongoose.Schema;

var tesSchema = new Schema();
tesSchema.add({
    image_url: String,
    task: String,
    tes: [tesSchema]
})

var bugSchema = new Schema({
    bugName: String,
    bugColour: String,
    Genus: String,
    tes: [tesSchema]
});

var Bug = mongoose.model("Bug", bugSchema);

var Bee = new Bug([
    {
        bugName: "Scruffy",
        bugColour: "Orange",
        Genus: "Bombus",
        tes: [
            {
                image_url: "tes_url",
                task: "task tes"
            },
            {
                image_url: "tes_url1",
                task: "task tes1"
            }
        ]
    },
    {
        bugName: "Scruffy1",
        bugColour: "Orange1",
        Genus: "Bombus1",
        tes: [
            {
                image_url: "tes_url1",
                task: "task tes1"
            },
            {
                image_url: "tes_url11",
                task: "task tes11"
            }
        ]
    },
]);

Bee.save(function (error) {
    console.log("Your bee has been saved!");
    if (error) {
        console.error(error);
    }
});