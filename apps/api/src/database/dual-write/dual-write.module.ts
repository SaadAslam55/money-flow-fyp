import { Global, Module } from '@nestjs/common';
import { DualWriteService } from './dual-write.service';

@Global()
@Module({
  providers: [DualWriteService],
  exports: [DualWriteService],
})
export class DualWriteModule {}
