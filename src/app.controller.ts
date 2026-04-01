import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "./infra/auth/decorators/public.decorator";

@ApiTags("health")
@Controller()
export class AppController {
  @Public()
  @Get("health")
  @ApiOperation({ summary: "Health check" })
  health() {
    return { ok: true };
  }
}
