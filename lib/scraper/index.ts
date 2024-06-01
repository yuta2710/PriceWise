import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapeAmazonProduct(url: string) {
  if(!url) return; 

  console.log(url)
  const username = String(process.env.BRIGHT_DATA_USERNAME)
  const password = String(process.env.BRIGHT_DATA_PASSWORD)
  const port = 22225
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data)

    // Extract the product title 
    const title = $('#productTitle').text().trim()
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
      $('.a-size-base.a-color-price')

    );
    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );
    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable'
    const images = $('#imgBlkFront').attr('data-a-dynamic-image') || $('#landingImage').attr('data-a-dynamic-image') || '{}'
    const imageUrl = Object.keys(JSON.parse(images))
    const currency = extractCurrency($('.a-price-symbol'))
    const discountRateElement = $('.a-size-base.a-color-price').first(); // Targeting the first element with the class
    const discountRateText = discountRateElement.text().trim();
    const discountRateMatch = discountRateText.match(/\((\d+)%\)/);
    const discountRate = discountRateMatch ? discountRateMatch[1] : '';
    const description = extractDescription($)
    const data = {
      url, 
      currency: currency || '$',
      image: imageUrl[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      average: Number(currentPrice) || Number(originalPrice),
    }
    return data 
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`)    
  }
}