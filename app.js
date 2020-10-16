const Apify = require("apify");
const {
  username,
  password,
  loginUrl,
  courseUrl,
} = require("./credentials.json");

const moduleId = 1;
 // 'https://www.youtube.com/watch?v=-0hmmX96QvY&ab_channel=michelbing';
const AYRTON_VITORIA_URL = 'https://www.youtube.com/watch?v=2lT2AhVBnmY&ab_channel=MarcelVasconcelos';
const VAI_PERDER_VAI_GANHAR_GANHOU_PERDEU_URL = 'https://www.youtube.com/watch?v=UXi21HIa7lI&ab_channel=Poder360';
const DELAY = 100;

Apify.main(async () => {
  const browser = await Apify.launchPuppeteer();
  const page = await browser.newPage();
  await page.goto(loginUrl);

  // Login
  await page.type("#pseudonym_session_unique_id", username, { delay: DELAY });
  await page.type("#pseudonym_session_password", password, { delay: DELAY });
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

    oldSurveysLength = surveysUrl.length;

    if (surveyAvailable) {
      surveyUrl = surveysUrl.pop();
      console.log('AYRTON! AYRTON!');
    } else {
      await page.waitFor(
        Math.floor(Math.random() * (240000 - 150000 + 1)) + 150000
      );
    }
  }

  await page.waitFor(5000);
  await page.goto(surveyUrl);
  await page.waitFor(3000);

  try {
    await page.click("#take_quiz_link");
    await page.waitFor(3000);

    await page.click('input[type="radio"]');
    await page.click('button[type="submit"]');
    console.log('É DO BRASILLLLLL!');
    
    await page.waitFor(3000);
    
    await page.goto(AYRTON_VITORIA_URL);
    await page.click("button.ytp-play-button.ytp-button");
    await page.waitFor(90000);
  } catch (e) {
    console.log('DEU RUIM AYRTON!');
    console.log('VAI PERDER! VAI GANHAR! GANHOU! PERDEU!');
    const page2 = await browser.newPage();
    await page2.goto(VAI_PERDER_VAI_GANHAR_GANHOU_PERDEU_URL);
    await page2.click("button.ytp-play-button.ytp-button");
    await page2.waitFor(14000);
    await page2.close();
  }


  await browser.close();
});
