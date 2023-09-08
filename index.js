import puppeteer from "puppeteer";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// const exampleResource = "learn-everything-about-c-in-2-hours/";
//http://localhost:3000/api/generate-pdf
app.use(cors());
app.use(express.json());

app.get("/api/generate-pdf", async ({ query }, res) => {
  // const path = query.filePath || exampleResource;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // await page.goto(`${process.env.BASE_URL}/${path}`, {
  //   waitUntil: "networkidle2",
  // });
  await page.goto("https://classy-dragon-eba69c.netlify.app/", {
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
  // res.setHeader("Content-Disposition", `attachment; filename=${path}.pdf`);
  res.setHeader("Content-Disposition", `attachment; filename=plan.pdf`);

  res.send(pdf);

  await browser.close();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PDF Server listens to port ${PORT}`);
});
