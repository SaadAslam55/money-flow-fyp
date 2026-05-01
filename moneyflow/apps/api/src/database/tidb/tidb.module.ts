import { Global, Module } from '@nestjs/common';
import { TiDBDirectService } from './tidb-direct.service';

@Global()
@Module({
  providers: [TiDBDirectService],
  exports: [TiDBDirectService],
})
export class TiDBModule {}
