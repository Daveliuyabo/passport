// TODO - remove eslint disable below once type rules are unified
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
// ---- Test subject
import { AspectaProvider } from "../Providers/aspecta";

import { RequestPayload } from "@gitcoin/passport-types";

// ----- Libs
import axios from "axios";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const validAspectaUserResponse = {
  data: {
    user: {
      id: "268473310986240001",
      username: "Aspecta",
      avatar: "f749bb0cbeeb26ef21eca719337d20f1",
      discriminator: "0001",
      public_flags: 131072,
    },
  },
  status: 200,
};

const validCodeResponse = {
  data: {
    access_token: "762165719dhiqudgasyuqwt6235",
  },
  status: 200,
};

const code = "ABC123_ACCESSCODE";

beforeEach(() => {
  jest.clearAllMocks();
  mockedAxios.post.mockImplementation(async (url, data, config) => {
    return validCodeResponse;
  });

  mockedAxios.get.mockImplementation(async (url, config) => {
    return validAspectaUserResponse;
  });
});

describe("Attempt verification", function () {
  it("handles valid verification attempt", async () => {
    const aspecta = new AspectaProvider();
    const aspectaPayload = await aspecta.verify({
      proofs: {
        code,
      },
    } as unknown as RequestPayload);

    // Check the request to get the user
    expect(mockedAxios.get).toBeCalledWith("https://aspecta.com/api/oauth2/@me", {
      headers: { Authorization: "Bearer 762165719dhiqudgasyuqwt6235" },
    });

    expect(aspectaPayload).toEqual({
      valid: true,
      record: {
        id: validAspectaUserResponse.data.user.id,
      },
    });
  });

  it("should return invalid payload when unable to retrieve auth token", async () => {
    const logSpy = jest.spyOn(console, "error").mockImplementation();

    mockedAxios.post.mockImplementation(async (url, data, config) => {
      return {
        status: 500,
      };
    });

    const aspecta = new AspectaProvider();

    const aspectaPayload = await aspecta.verify({
      proofs: {
        code,
      },
    } as unknown as RequestPayload);

    expect(aspectaPayload).toMatchObject({ valid: false });
    expect(logSpy).toHaveBeenCalledWith("Error when verifying aspecta account for user:", undefined);
  });

  it("should return invalid payload when there is no id in verifyAspecta response", async () => {
    mockedAxios.get.mockImplementation(async (url, config) => {
      return {
        data: {
          id: undefined,
          login: "my-login-handle",
          type: "User",
        },
        status: 200,
      };
    });

    const aspecta = new AspectaProvider();

    const aspectaPayload = await aspecta.verify({
      proofs: {
        code,
      },
    } as unknown as RequestPayload);

    expect(aspectaPayload).toMatchObject({ valid: false });
  });

  it("should return invalid payload when a bad status code is returned by aspecta user api", async () => {
    mockedAxios.get.mockImplementation(async (url, config) => {
      return {
        status: 500,
      };
    });

    const aspecta = new AspectaProvider();

    const aspectaPayload = await aspecta.verify({
      proofs: {
        code,
      },
    } as unknown as RequestPayload);

    expect(aspectaPayload).toMatchObject({ valid: false });
  });
});
