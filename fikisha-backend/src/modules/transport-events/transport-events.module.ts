import { Module } from '@nestjs/common';
import { TransportEventsController } from './transport-events.controller';
import { TransportEventsService } from './transport-events.service';

@Module({
  controllers: [TransportEventsController],
  providers: [TransportEventsService],
  exports: [TransportEventsService],
})
export class TransportEventsModule {}