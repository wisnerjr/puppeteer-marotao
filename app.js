const Apify = require("apify");
const {
  username,
  password,
  loginUrl,
  courseUrl,
} = require("./credentials.json");
const moduleId = 2;
Apify.main(async () => {
  const browser = await Apify.launchPuppeteer();
  const page = await browser.newPage();
  await page.goto(loginUrl);

  // Login
  await page.type("#pseudonym_session_unique_id", username, { delay: 100 });
  await page.type("#pseudonym_session_password", password, { delay: 100 });
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  await page.waitFor(1500);

  // const cookies = await page.cookies();
  // await page2.setCookie(...cookies);

  let surveyAvailable = false;
  let oldSurveysLength = 9999999;
  let surveyUrl = "";
  while (!surveyAvailable) {
    await page.goto(courseUrl);

    const actualModule = await page.$$(
      "div.item-group-condensed.context_module.has_requirements"
    );

    const surveysUrl = await actualModule[
      moduleId
    ].$$eval("div.content ul li div.ig-row > a", (nodes) =>
      nodes
        .filter((node) => node.textContent.match(/.*Enquete.*/g))
        .map(({ href }) => href)
    );

    surveyAvailable = oldSurveysLength < surveysUrl.length;

    oldSurveysLength = surveysUrl.length - 1;

    if (surveyAvailable) {
      surveyUrl = surveysUrl.pop();
    } else {
      await page.waitFor(
        Math.floor(Math.random() * (240000 - 150000 + 1)) + 150000
      );
      console.log(new Date());
    }
  }

  // console.log(surveyUrl);
  await page.waitFor(5000);
  await page.goto(surveyUrl);
  await page.waitForNavigation();

  await page.click("#take_quiz_link");
  await page.waitForNavigation();

  await page.click('input[type="radio"]');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  await browser.close();
});
