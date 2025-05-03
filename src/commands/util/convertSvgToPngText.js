const canvas = require("canvas");
const axios = require("axios");
const sharp = require("sharp");

const devEmail = process.env.DEV_EMAIL;

/**
 * Retrieves an SVG image from the specified link and converts it to a PNG image.
 *
 * @param {string} link - The link to the SVG image.
 * @return {promise<Buffer>} - The converted PNG image.
 */
module.exports = async (link) => {
  const response = await axios.get(link, {
    "User-Agent": `DiscordBrainzBot/1.0.0 (${devEmail})`,
  });
  const svg = response.data;

  const image = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()
    .catch((error) => {
      console.error(error);
      return null;
    });

  return image;
};
