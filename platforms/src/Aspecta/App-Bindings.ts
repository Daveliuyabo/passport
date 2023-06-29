//App-bindings.ts - OAuth
import { PlatformOptions } from "../types";
import { Platform } from "../utils/platform";
export class AspectaPlatform extends Platform {
  platformId = "Aspecta";
  path = "Aspecta";

  constructor(options: PlatformOptions = {}) {
    super();
    this.clientId = options.clientId as string;
    this.redirectUri = options.redirectUri as string;
    this.state = options.state as string;
  }

  async getOAuthUrl(state: string): Promise<string> {
    const AspectaUrl = await Promise.resolve(
      `https://aspecta.id/oauth/v2/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${this.redirectUri}&state=${state}&scope=r_emailaddress%20r_liteprofile`
    );
    // TODO: oauth url需修改
    return AspectaUrl;
  }
}
