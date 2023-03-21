const axios = require("axios");
const chai = require("chai");

describe("mailersend-extension", () => {
  it("should not send an email if ", async () => {
    const expected = "Hello World from greet-the-world";

    const httpFunctionUri = "http://localhost:5001/demo-test/us-central1/ext-greet-the-world-greetTheWorld/";
    const res = await axios.get(httpFunctionUri);

    return chai.expect(res.data).to.eql(expected);
  }).timeout(10000);
});
