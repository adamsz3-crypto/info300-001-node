// INFO 300 - Infrastructure Decision Tool
// Part A: Subnet Host Checker
// Part B: Compute Environment Selector

const readline = require("readline-sync");

function askNonEmpty(prompt) {
  while (true) {
    const answer = readline.question(prompt).trim();
    if (answer.length > 0) return answer;
    console.log("Input cannot be empty. Please try again.");
  }
}

function askPositiveInteger(prompt) {
  while (true) {
    const answer = readline.question(prompt).trim();
    const value = Number(answer);

    if (Number.isInteger(value) && value > 0) {
      return value;
    }

    console.log("Please enter a positive whole number (1 or greater).");
  }
}

function askPositiveNumber(prompt) {
  while (true) {
    const answer = readline.question(prompt).trim();
    const value = Number(answer);

    if (Number.isFinite(value) && value > 0) {
      return value;
    }

    console.log("Please enter a valid number greater than 0.");
  }
}

function askCidrPrefix(prompt) {
  while (true) {
    let answer = readline.question(prompt).trim();

    // Accept either "/24" or "24".
    if (answer.startsWith("/")) {
      answer = answer.slice(1);
    }

    const prefix = Number(answer);

    if (Number.isInteger(prefix) && prefix >= 16 && prefix <= 30) {
      return prefix;
    }

    console.log("Invalid CIDR. Enter a prefix from /16 through /30.");
  }
}

function askYesNo(prompt) {
  while (true) {
    const answer = readline.question(prompt).trim().toLowerCase();

    if (["yes", "y"].includes(answer)) return true;
    if (["no", "n"].includes(answer)) return false;

    console.log('Please enter "yes" or "no".');
  }
}

function subnetHostChecker() {
  console.log("\n========== SUBNET HOST CHECKER ==========");

  const vpcPrefix = askCidrPrefix("Enter the VPC CIDR prefix (example: /16): ");
  const subnetPrefix = askCidrPrefix("Enter the Subnet CIDR prefix (example: /24): ");
  const devices = askPositiveInteger("How many devices are required? ");

  console.log("\n---------- RESULTS ----------");

  // A subnet must be at least as specific as its containing VPC.
  if (subnetPrefix < vpcPrefix) {
    console.log("VPC/Subnet consistency: NOT CONSISTENT");
    console.log(
      `A /${subnetPrefix} subnet is larger than a /${vpcPrefix} VPC. ` +
      "The subnet prefix must be equal to or greater than the VPC prefix."
    );
    console.log("Subnet capacity: Not evaluated because the CIDR relationship is invalid.");
    return;
  }

  console.log("VPC/Subnet consistency: CONSISTENT");
  console.log(`The /${subnetPrefix} subnet is within the size allowed by a /${vpcPrefix} VPC.`);

  const totalAddresses = 2 ** (32 - subnetPrefix);

  // AWS reserves 5 IP addresses in every subnet.
  const awsReservedAddresses = 5;
  const usableAddresses = totalAddresses - awsReservedAddresses;

  console.log(`Total IP addresses in subnet: ${totalAddresses}`);
  console.log(`AWS-reserved IP addresses: ${awsReservedAddresses}`);
  console.log(`Usable IP addresses: ${usableAddresses}`);
  console.log(`Devices required: ${devices}`);

  if (usableAddresses >= devices) {
    const unusedAddresses = usableAddresses - devices;
    console.log("Subnet capacity: SUFFICIENT");
    console.log(`Unused usable IP addresses: ${unusedAddresses}`);
  } else {
    const additionalAddressesNeeded = devices - usableAddresses;
    console.log("Subnet capacity: NOT SUFFICIENT");
    console.log(`Additional usable IP addresses needed: ${additionalAddressesNeeded}`);
  }
}

function computeEnvironmentSelector() {
  console.log("\n========== COMPUTE ENVIRONMENT SELECTOR ==========");

  const applicationName = askNonEmpty("Enter the application name: ");
  const monthlyUsers = askPositiveInteger("Enter the number of monthly users: ");
  const monthlyBudget = askPositiveNumber("Enter the monthly budget in dollars: ");
  const highAvailability = askYesNo("Does the application require high availability? (yes/no): ");

  let architecture;
  let requiresMoreThanSingleEC2 = false;
  let requiresAutoScaling = false;

  // Apply the assignment's architecture guidelines.
  if (monthlyUsers > 10000 || highAvailability) {
    architecture = "EC2 + Load Balancer + Auto Scaling";
    requiresMoreThanSingleEC2 = true;
    requiresAutoScaling = true;
  } else if (monthlyUsers >= 1000 && monthlyUsers <= 10000) {
    architecture = "EC2 + Load Balancer";
    requiresMoreThanSingleEC2 = true;
  } else {
    architecture = "Single EC2";
  }

  console.log("\n---------- RECOMMENDATION ----------");
  console.log(`Application: ${applicationName}`);
  console.log(`Monthly users: ${monthlyUsers}`);
  console.log(`Monthly budget: $${monthlyBudget.toFixed(2)}`);
  console.log(`High availability required: ${highAvailability ? "Yes" : "No"}`);
  console.log(`Recommended architecture: ${architecture}`);

  // Display budget warnings according to the assignment.
  if (monthlyBudget < 1000 && requiresMoreThanSingleEC2) {
    console.log(
      "BUDGET WARNING: Your budget is under $1,000, but the recommended " +
      "architecture requires more than a single EC2 instance."
    );
  }

  if (monthlyBudget >= 1000 && monthlyBudget <= 3000 && requiresAutoScaling) {
    console.log(
      "BUDGET WARNING: Your budget is between $1,000 and $3,000, but the " +
      "recommended architecture requires Auto Scaling."
    );
  }

  if (
    !(monthlyBudget < 1000 && requiresMoreThanSingleEC2) &&
    !(monthlyBudget >= 1000 && monthlyBudget <= 3000 && requiresAutoScaling)
  ) {
    console.log("Budget warning: None based on the assignment's guidelines.");
  }
}

function main() {
  console.log("==========================================");
  console.log("       INFRASTRUCTURE DECISION TOOL");
  console.log("==========================================");

  let continueRunning = true;

  while (continueRunning) {
    console.log("\nChoose a tool:");
    console.log("1. Subnet Host Checker");
    console.log("2. Compute Environment Selector");

    const choice = readline.question("Enter 1 or 2: ").trim();

    if (choice === "1") {
      subnetHostChecker();
    } else if (choice === "2") {
      computeEnvironmentSelector();
    } else {
      console.log("Invalid selection. Please enter 1 or 2.");
    }

    continueRunning = askYesNo("\nWould you like to use the program again? (yes/no): ");
  }

  console.log("\nThank you for using the Infrastructure Decision Tool. Goodbye!");
}

main();
