const { By, Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let options = new chrome.Options();
options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
let serviceBuilder = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH);
//Below arguments are critical for Heroku deployment
options.addArguments("--headless");
options.addArguments("--disable-gpu");
options.addArguments("--no-sandbox");

const assert = require("assert");
var captcha_url = '';
const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 7000;

var driver;
var username;
var userpass;
var submitButton;
var driver;
global.firstTest = async function() {
    try {

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).setChromeService(serviceBuilder).build();
        await driver.get('https://services.gst.gov.in/services/login');

        let title = await driver.getTitle();
        assert.equal("Goods & Services Tax (GST) | Login", title);

        await driver.manage().setTimeouts({ implicit: 9000 });

         username = await driver.findElement(By.name('user_name'));

         userpass = await driver.findElement(By.id('user_pass'));
         submitButton = await driver.findElement(By.className('btn-primary'));
        await username.sendKeys('Sameer');
        await userpass.sendKeys('Khan');
        await driver.executeScript("arguments[0].click();", submitButton);
        usercaptcha = await driver.findElement(By.id('captcha'));
        let captcha_image = await driver.findElement(By.id('imgCaptcha'));
        captcha_url = await captcha_image.takeScreenshot(true);
    
    } catch (e) {
        console.log(e)
    } finally {
        //await driver.quit();
    }
}


app.get('/catpcha', async(request, response) => {
    await global.firstTest();
    return response.status(200).json({
        data: captcha_url,
    });
});

app.post('/submit', async(req, response) => {
    await username.clear();
    await userpass.clear();
    await username.sendKeys(req.body.username);
    await userpass.sendKeys(req.body.password);
    await usercaptcha.sendKeys(req.body.captcha);
  await driver.executeScript("arguments[0].click();", submitButton);
   setTimeout(async function (){
    //console.log(driver.getCurrentUrl())
    var name= await driver.manage().getCookie('UserName');
    var token = await driver.manage().getCookie('AuthToken');
      return response.status(200).json({
          succes: true,
          token:token,
          name:name
      });
   },3000)
 
});

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});