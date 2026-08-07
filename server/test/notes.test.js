const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");

async function signupAndGetToken(agent, email) {
  const res = await agent
    .post("/api/auth/signup")
    .send({ email, password: "password123" });
  return res.body.accessToken;
}

describe("Notes endpoints", () => {
  describe("POST /api/notes", () => {
    it("creates a note for the authenticated user", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "creator@example.com");

      const res = await agent
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Test note", content: "Some content" });

      expect(res.status).to.equal(201);
      expect(res.body.title).to.equal("Test note");
      expect(res.body.content).to.equal("Some content");
    });

    it("rejects missing content", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "creator2@example.com");

      const res = await agent
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "No content" });

      expect(res.status).to.equal(400);
    });

    it("rejects requests with no token", async () => {
      const res = await request(app)
        .post("/api/notes")
        .send({ title: "x", content: "y" });

      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/notes", () => {
    it("lists only the authenticated user's notes", async () => {
      const agentA = request.agent(app);
      const tokenA = await signupAndGetToken(agentA, "usera@example.com");
      await agentA
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "A1", content: "content" });

      const agentB = request.agent(app);
      const tokenB = await signupAndGetToken(agentB, "userb@example.com");
      await agentB
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "B1", content: "content" });

      const res = await agentA
        .get("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(1);
      expect(res.body[0].title).to.equal("A1");
    });
  });

  describe("GET /api/notes/:id", () => {
    it("returns a note by id", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "getone@example.com");
      const createRes = await agent
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Find me", content: "content" });

      const res = await agent
        .get(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.title).to.equal("Find me");
    });

    it("returns 400 for a malformed id", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "malformed@example.com");

      const res = await agent
        .get("/api/notes/not-a-real-id")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal("Invalid ID format");
    });

    it("returns 404 for a valid but nonexistent id", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "nonexistent@example.com");

      const res = await agent
        .get("/api/notes/000000000000000000000000")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).to.equal(404);
    });
  });

  describe("PATCH /api/notes/:id", () => {
    it("updates only the provided field", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "patcher@example.com");
      const createRes = await agent
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Original", content: "Original content" });

      const res = await agent
        .patch(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" });

      expect(res.status).to.equal(200);
      expect(res.body.title).to.equal("Updated");
      expect(res.body.content).to.equal("Original content");
    });

    it("rejects an empty body", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "emptypatch@example.com");
      const createRes = await agent
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Original", content: "content" });

      const res = await agent
        .patch(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).to.equal(400);
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("deletes a note and it's no longer retrievable", async () => {
      const agent = request.agent(app);
      const token = await signupAndGetToken(agent, "deleter@example.com");
      const createRes = await agent
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "To delete", content: "content" });

      const deleteRes = await agent
        .delete(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRes.status).to.equal(200);

      const getRes = await agent
        .get(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(getRes.status).to.equal(404);
    });
  });

  describe("Ownership scoping across users", () => {
    it("prevents user B from reading user A's note", async () => {
      const agentA = request.agent(app);
      const tokenA = await signupAndGetToken(agentA, "ownera@example.com");
      const createRes = await agentA
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "A's note", content: "private" });

      const agentB = request.agent(app);
      const tokenB = await signupAndGetToken(agentB, "ownerb@example.com");

      const res = await agentB
        .get(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });

    it("prevents user B from updating user A's note", async () => {
      const agentA = request.agent(app);
      const tokenA = await signupAndGetToken(agentA, "ownera2@example.com");
      const createRes = await agentA
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "A's note", content: "private" });

      const agentB = request.agent(app);
      const tokenB = await signupAndGetToken(agentB, "ownerb2@example.com");

      const res = await agentB
        .patch(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "Hacked" });

      expect(res.status).to.equal(404);
    });

    it("prevents user B from deleting user A's note", async () => {
      const agentA = request.agent(app);
      const tokenA = await signupAndGetToken(agentA, "ownera3@example.com");
      const createRes = await agentA
        .post("/api/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "A's note", content: "private" });

      const agentB = request.agent(app);
      const tokenB = await signupAndGetToken(agentB, "ownerb3@example.com");

      const res = await agentB
        .delete(`/api/notes/${createRes.body._id}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).to.equal(404);
    });
  });
});