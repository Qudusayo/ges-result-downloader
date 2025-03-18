require("chromedriver");
const fs = require("fs");
const { Builder, By, Key } = require("selenium-webdriver");

const resultsDirectory = "./results";

// Extract the matric numbers from the matrics.txt file
const matricFileTxtContext = fs.readFileSync("./matrics.txt").toString();

// Converts the numbers to arrays [00000,00001,00002...]
const arrayOfMatricNums = matricFileTxtContext.split(",");

//Check if results directory exist
if (!fs.existsSync(resultsDirectory)) {
  // Create result directory if it doesn't exist
  fs.mkdirSync(resultsDirectory);
}

async function getGESResults() {
  let driver = new Builder().forBrowser("chrome").build();

  try {
    // Navigate to cgs url
    await driver.get("https://cgs.ui.edu.ng/portal/index.php");
    for (let index = 0; index < arrayOfMatricNums.length; index++) {
      try {
        // Enter the matric number  in it's input
        await driver
          .findElement(By.name("matric"))
          .sendKeys(`${arrayOfMatricNums[index]}`);

        // Enter the matric number as password keyboard action "Enter"
        await driver
          .findElement(By.name("passkey"))
          .sendKeys(`${arrayOfMatricNums[index]}`, Key.ENTER);

        // Using CSS Selector (recommended)
        close_button = driver.findElement(By.xpath("//button[@data-dismiss='modal']"))
        close_button.click()

        // Find and click the result link on the side bar
        await driver
          .findElement(By.xpath("//a/span[contains(text(),'Result')]"))
          .click();

        // Scroll the page to the result div
        let resultElement = await driver.findElement(By.className("invoice"));
        await driver.executeScript(
          "arguments[0].scrollIntoView(true);",
          resultElement
        );

        // Take a screenshot of the result div
        let encodedString = await resultElement.takeScreenshot(true);

        // Save the screenshot named with the matric number in results directory
        await fs.writeFileSync(
          `./results/${arrayOfMatricNums[index]}.png`,
          encodedString,
          "base64"
        );

        // Logout the current logged in user
        await driver.findElement(By.className("dropdown-toggle")).click();
        await driver.findElement(By.name("logout")).click();
      } catch (error) {
        // Incase of any error, log the error and continur the process
        console.log(error);
      }
    }
  } finally {
    // If all process are completed, close the driver
    // await driver.quit();
  }
}

getGESResults();
