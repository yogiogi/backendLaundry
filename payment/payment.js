const express = require('express');
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

var router = express.Router();

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AbErhecQE425FdwmX3LgMTv7KTDQWxJliHw7vLPkpcvTwqj5GDXUIzHGHDio2SHyGzv0anljvY71ZM8v",
    client_secret:
        "EKiXB5bq8Y-wDXBgZj4lOkmnpJ08AYcmMi9Dg9WdRfmonCP0rguSzmjJq-bFSe1epT3J9oOPDfY5zFai"
});

router.get("/", (req, res) => {
    res.render("index");
});

router.get("/paypal", (req, res) => {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "item",
                            sku: "item",
                            price: "1.00",
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "1.00"
                },
                description: "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});

router.get("/success", (req, res) => {
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "1.00"
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
});

router.get("cancel", (req, res) => {
    res.render("cancel");
});

// router.listen(3000, () => {
//     console.log("Server is running");
// });

module.exports = router;