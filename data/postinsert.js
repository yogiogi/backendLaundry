var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/laundryService', { useMongoClient: true });

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function (callback) {
    console.log("Connection succeeded.");
});

var Schema = mongoose.Schema;

var categorySchema = new Schema();
categorySchema.add({
    image_url: String,
    task: String,
    display: String,
    price: String,
    quantity: String,
    category: [categorySchema]
});

var laundrySchema = new Schema({
    image_url: String,
    packet: String,
    category: [categorySchema]
});

var laundry = mongoose.model("laundrylist", laundrySchema);
var laundrySave = new laundry([
    {
        image_url: "",
        packet: 'Daily Kiloan',
        category: [
            {
                image_url: "",
                task: "Cuci Kering Gosok",
                display: "10.000/kg",
                price: 10000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Cuci Kering Lipat",
                display: "7.000/kg",
                price: 7000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Jasa Setrika",
                display: "6.000/kg",
                price: 6000,
                quantity: 0
            },
        ]
    },
    {
        image_url: "",
        packet: 'Beddings',
        category: [
            {
                image_url: "",
                task: "Bed Cover King/Queen",
                display: "30.000/kg",
                price: 30000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Bed Cover Single",
                display: "22.000/kg",
                price: 22000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Selimut",
                display: "12.000/kg",
                price: 12000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Sprei/Bed Sheet Double",
                display: "20.000/kg",
                price: 20000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Sprei/Bed Sheet Single",
                display: "35.000/kg",
                price: 35000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Paket Bedding Single (1 Seprai, 1sb, 1sg, 1bc)",
                display: "35.000/kg",
                price: 35000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Paket Bedding Queen/King (1 Seprai,2sb, 2sg, 1bc)",
                display: "40.000/set",
                price: 40000,
                quantity: 0
            },
        ]
    },
    {
        image_url: "",
        packet: 'Premium Satuan',
        category: [
            {
                image_url: "",
                task: "Kemeja/Shirt Panjang",
                display: "15.000/kg",
                price: 15000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Jaket Sweater/Kaos",
                display: "15.000/kg",
                price: 15000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Celana/Rok Panjang",
                display: "10.000/kg",
                price: 10000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Baju Muslim Selutut",
                display: "20.000/kg",
                price: 20000,
                quantity: 0
            },
        ]
    },
    {
        image_url: "",
        packet: 'Households',
        category: [
            {
                image_url: "",
                task: "Boneka Besar > 30cm",
                display: "25.000/kg",
                price: 25000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Boneka Super Jumbo < 100 cm",
                display: "50.000/kg",
                price: 50000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Handuk Badan Besar",
                display: "16.000/kg",
                price: 16000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Handuk Badan Sedang",
                display: "12.000/kg",
                price: 12000,
                quantity: 0
            },
            {
                image_url: "",
                task: "Gordyn (per meter persegi)",
                display: "12.000/kg",
                price: 12000,
                quantity: 0
            },
        ]
    },
])

laundrySave.save(function (error) {
    console.log("Your data has been saved!");
    if (error) {
        console.error(error);
    }
});