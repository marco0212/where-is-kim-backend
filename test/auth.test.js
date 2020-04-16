import supertest from "supertest";
import { expect } from "chai";
const server = supertest.agent("http://localhost:4000");

describe("POST /api/auth/login", () => {
  it("should response token", (done) => {
    const email = "hello@hello";
    const password = "asdf";

    server
      .post("/api/auth/login")
      .expect("Content-Type", /json/)
      .send({ email, password })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.include("token");
        done();
      });
  });
});

describe("POST /api/auth/signup", () => {
  it("should create new user", (done) => {
    const username = "Jeong";
    const email = "sample@google.com";
    const password = "sample";

    server
      .post("/api/auth/signup")
      .send({
        username,
        email,
        password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.result).toBe("ok");
      });
  });
});
