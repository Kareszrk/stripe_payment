require('dotenv').config();
const express = require('express');
const router = express.Router();
const { createPool } = require('mysql');
const pdf = require("pdf-creator-node");
const fs = require("fs");

const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, {priceInCents: 10000, name: 'Learn React Today'}],
  [2, {priceInCents: 20000, name: 'Learn CSS Today'}]
]);

function putleadingzero(data) {
  data = String(data);
  return `0${data}`.slice(-2);
}

router.get('/', (req, res) => {
  res.render('index', {title: 'Document'})
});

router.get('/success', (req, res) => {
  res.send('Success payment');
});

router.get('/cancelled', (req, res) => {
  res.send('Payment has been cancelled');
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      // submit_type: 'donate',
      payment_method_types: ['card'],
      mode: 'payment',
      allow_promotion_codes: true,
      line_items: req.body['items'].map(item => {
        const itemsAvaliable = storeItems.get(item.id)
        return {
          price_data: {
            currency: 'huf',
            product_data: {
              name: itemsAvaliable.name
            },
            unit_amount: itemsAvaliable.priceInCents
          },
          quantity: item.quantity
        }
      }),
      success_url: `${process.env.SERVER_URL}/success`,
      cancel_url: `${process.env.SERVER_URL}/cancelled`
    });
    res.json({url: session.url})
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('*', (req, res) => {
  res.status(404).send('Page not found');
})

module.exports = router;
console.log('Running');