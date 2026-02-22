import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { VacationService } from './vacation.service';
import { ScheduleVacationDto } from './dto/schedule-vacation.dto';
import { CancelVacationDto } from './dto/cancel-vacation.dto';

@Controller('vacations')
export class VacationController {
  constructor(private readonly vacationService: VacationService) { }

  @Post('schedule')
  schedule(@Body() dto: ScheduleVacationDto) {
    return this.vacationService.schedule(dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: number, @Body() dto: CancelVacationDto) {
    return this.vacationService.cancel(id, dto.reason);
  }

  @Get()
  findAll() {
    return this.vacationService.findAll();
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: number) {
    return this.vacationService.findByEmployee(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.vacationService.findOne(id);
  }
}
