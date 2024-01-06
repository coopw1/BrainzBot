const { AttachmentBuilder } = require("discord.js");
const cheerio = require("cheerio");
const axios = require("axios");
const canvas = require("@napi-rs/canvas");

module.exports = async (BASE_URL, interaction) => {
  let svgString = (await axios.get(BASE_URL, { responseType: "text" })).data;

  // Parse the SVG string using cheerio
  const $ = cheerio.load(svgString, { xmlMode: true });

  // Extract width and height from the SVG element
  const svgElement = $("svg");
  const svgWidth = parseFloat(svgElement.attr("width"));
  const svgHeight = parseFloat(svgElement.attr("height"));

  const imageData = [];

  // Iterate over each 'a' element containing the image data
  $("a").each((index, element) => {
    const $element = $(element);

    // Extract data from the 'image' element
    const image = $element.find("image");
    const x = parseFloat(image.attr("x"));
    const y = parseFloat(image.attr("y"));
    const width = parseFloat(image.attr("width"));
    const height = parseFloat(image.attr("height"));
    const href = image.attr("href");

    // Extract data from the 'title' element
    const title = $element.find("title").text().trim();

    // Extract href attribute from 'a' element
    const hrefAttribute = $element.attr("href");

    // Add the extracted data to the array
    imageData.push({
      x,
      y,
      width,
      height,
      href,
      title,
      hrefAttribute,
    });
  });

  const myCanvas = canvas.createCanvas(svgWidth, svgHeight);
  const context = myCanvas.getContext("2d");

  let counter = 0;
  imageData.forEach(async (image, index) => {
    const response = await axios.get(image.href, {
      responseType: "arraybuffer",
    });

    const imageLink = await canvas.loadImage(response.data);

    context.drawImage(imageLink, image.x, image.y, image.width, image.height);

    counter++;
    if (counter === imageData.length) {
      const attachment = new AttachmentBuilder(await myCanvas.encode("png"), {
        name: "chart.png",
      });

      if (interaction.deferred) {
        await interaction.editReply({ files: [attachment] });
      } else {
        await interaction.reply({ files: [attachment] });
      }
    }
  });
};
