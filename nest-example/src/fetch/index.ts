import { Module, HttpModule } from '@nestjs/common';
import { IndexService } from './index.service';
import { IndexController } from './index.controller';


@Module({
  imports: [HttpModule],
  controllers: [IndexController],
  providers: [IndexService],
})
export class FetchModule {}