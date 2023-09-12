import puppeteer from "puppeteer";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/generate-pdf", async ({ query, body }, res) => {
  const path = query.filePath;
  const title = body.title;
  console.log(path);
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  const page = await browser.newPage();

  await page.goto(`${path}`, {
    waitUntil: "networkidle2",
  });
  const contentWidth = await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return;
        return new Promise((resolve, reject) => {
          img.addEventListener("load", resolve);
          img.addEventListener("error", reject);
        });
      })
    );
    return document.documentElement.scrollWidth;
  });

  const pdfOptions = {
    width: `${contentWidth}px`,
    printBackground: true,
  };

  const pdf = await page.pdf(pdfOptions);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${title}.pdf`);
  res.send(pdf);
  await browser.close();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PDF Server listens to port ${PORT}`);
});
