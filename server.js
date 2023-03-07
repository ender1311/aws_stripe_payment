require("dotenv").config()

const storeItemsData = require('./items.json');

const express = require("express")
const app = express()
const cors = require("cors")
app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

//Cors allows certain addresses access to this server

app.use(
  cors({
    origin: 
        [
          "http://localhost:5500",
          "http://localhost:5173",
          "http://ender1311.github.io",
          "http://*.ender1311.github.io",
          "https://ender1311.github.io",
          "https://*.ender1311.github.io"

        ],
  })
)

// running server from index.html is on port: 5500
// running server from npm run devStart for react vite is on 5173
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


const storeItems = new Map();

/* put data into new map object
storeItemsData.forEach(item => {
  storeItems.set(item.id, item);
});

*/

/* 
  put data into new map object
  add price in cents data to each item which is required by stripe api
*/
storeItemsData.forEach(item => {
  const priceInCents = Math.round(item.price * 100);
  storeItems.set(item.id, {...item, priceInCents});
});

module.exports = storeItems;

/* 
using stripe for payment
go to stripe api documentation here
https://stripe.com/docs/api/checkout/sessions/object?lang=node


parameters are here:
https://stripe.com/docs/api/checkout/sessions/create?lang=node

*/

app.post("/checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000)