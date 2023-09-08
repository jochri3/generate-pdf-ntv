import puppeteer from "puppeteer";
import { writeFileSync } from "node:fs";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const exampleResource = "learn-everything-about-c-in-2-hours/";

app.use(cors());
app.use(express.json());

app.get("/api/generate-pdf", ({ query }, res) => {});

async function generatePDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Naviguez vers votre page ou chargez le contenu HTML directement
  await page.goto(
    "https://64faf2d3c3c30c5ced9de1d9--classy-dragon-eba69c.netlify.app/",
    {
      waitUntil: "networkidle2",
    }
  );

  const contentWidth = await page.evaluate(() => {
    return document.documentElement.scrollWidth;
  });

  const pdfOptions = {
    // format: "A4",
    width: `${contentWidth}px`,
    printBackground: true,
  };

  const pdf = await page.pdf(pdfOptions);

  writeFileSync("nativoprogramme.pdf", pdf);

  await browser.close();
}

generatePDF();
