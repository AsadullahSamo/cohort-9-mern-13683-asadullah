const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");

describe("Auth endpoints", () => {
  const credentials = { email: "test@example.com", password: "password123" };

  describe("POST /api/auth/signup", () => {
    it("creates a user and returns an access token", async () => {
      const res = await request(app).post("/api/auth/signup").send(credentials);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("accessToken");
      expect(res.headers["set-cookie"]).to.exist;
    });

    it("rejects a duplicate email", async () => {
      await request(app).post("/api/auth/signup").send(credentials);
      const res = await request(app).post("/api/auth/signup").send(credentials);

      expect(res.status).to.equal(409);
      expect(res.body.error).to.equal("Email already registered");
    });

    it("rejects missing password", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ email: "nopassword@example.com" });

      expect(res.status).to.equal(400);
    });

    it("rejects missing email", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ password: "password123" });

      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send(credentials);
    });

    it("logs in with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send(credentials);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("accessToken");
    });

    it("rejects wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: credentials.email, password: "wrongpassword" });

      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Invalid credentials");
    });

    it("rejects a nonexistent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).to.equal(401);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("issues a new access token given a valid refresh cookie", async () => {
      const agent = request.agent(app);
      await agent.post("/api/auth/signup").send(credentials);

      const res = await agent.post("/api/auth/refresh");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("accessToken");
    });

    it("rejects a request with no refresh cookie", async () => {
      const res = await request(app).post("/api/auth/refresh");

      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("No refresh token");
    });

    it("rejects an invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", "refreshToken=not-a-real-token");

      expect(res.status).to.equal(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("clears the session so a later refresh fails", async () => {
      const agent = request.agent(app);
      await agent.post("/api/auth/signup").send(credentials);

      const logoutRes = await agent.post("/api/auth/logout");
      expect(logoutRes.status).to.equal(200);

      const refreshRes = await agent.post("/api/auth/refresh");
      expect(refreshRes.status).to.equal(401);
    });
  });
});