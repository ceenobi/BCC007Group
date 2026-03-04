import { describe, it, expect } from "vitest";
import { SignUpSchema, LoginSchema } from "./dataSchema";

describe("Data Schemas", () => {
  describe("SignUpSchema", () => {
    it("should validate a correct sign up data", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
      };
      const result = SignUpSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should trim the name and email", () => {
      const data = {
        name: "  John Doe  ",
        email: "  john@example.com  ",
      };
      const result = SignUpSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should fail if name is too short", () => {
      const data = {
        name: "Jo",
        email: "john@example.com",
      };
      const result = SignUpSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should fail if email is invalid", () => {
      const data = {
        name: "John Doe",
        email: "not-an-email",
      };
      const result = SignUpSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("LoginSchema", () => {
    it("should validate a correct login data", () => {
      const data = {
        email: "john@example.com",
        password: "Password123!",
      };
      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should fail if password does not meet complexity requirements", () => {
      const weakPasswords = [
        "short",
        "alllowercase123!",
        "ALLUPPERCASE123!",
        "NoSpecialChar123",
        "NoNumber!@#",
      ];

      weakPasswords.forEach((password) => {
        const result = LoginSchema.safeParse({
          email: "john@example.com",
          password,
        });
        expect(result.success).toBe(false);
      });
    });
  });
});
