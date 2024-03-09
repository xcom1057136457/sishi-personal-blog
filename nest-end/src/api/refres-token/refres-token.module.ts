import { Module } from '@nestjs/common';
import { RefresTokenService } from './refres-token.service';
import { RefresTokenController } from './refres-token.controller';

@Module({
  controllers: [RefresTokenController],
  providers: [RefresTokenService],
  exports: [RefresTokenService]
})
export class RefresTokenModule { }
